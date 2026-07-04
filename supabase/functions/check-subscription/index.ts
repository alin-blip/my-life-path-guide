import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service role for writes
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    log("Start");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    
    // Handle expired/invalid session gracefully - return 401 instead of 500
    if (userError) {
      const msg = userError.message || '';
      const isSessionError = msg.includes("Session") || 
                             msg.includes("session") ||
                             msg.includes("JWT") ||
                             msg.includes("sub claim") ||
                             msg.includes("invalid claim") ||
                             msg.includes("expired") ||
                             msg.includes("Invalid token");
      if (isSessionError) {
        log("Session expired or invalid", { message: msg });
        return new Response(JSON.stringify({ 
          subscribed: false, 
          error: "session_expired",
          message: "Session expired, please sign in again"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error(`Auth error: ${msg}`);
    }
    
    const user = userData.user;
    if (!user?.email) throw new Error("No user email");
    log("User", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

  if (customers.data.length === 0) {
    log("No stripe customer");
    
    // Get existing early_bird_expires_at from database BEFORE upsert
    const { data: existingSubscriber } = await supabaseService
      .from("subscribers")
      .select("early_bird_expires_at")
      .eq("email", user.email)
      .single();
    
    const earlyBirdExpiresAt = existingSubscriber?.early_bird_expires_at || null;
    
    await supabaseService.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: null,
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      subscription_status: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });
    
    return new Response(JSON.stringify({ 
      subscribed: false,
      tier: null,
      subscription_end: null,
      early_bird_expires_at: earlyBirdExpiresAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

    const customerId = customers.data[0].id;
    const subsList = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
    const activeOrTrial = subsList.data.find((s: { status: string }) => s.status === "active" || s.status === "trialing");
    const isSubscribed = Boolean(activeOrTrial);

    let tier: string | null = null;
    let endIso: string | null = null;

    if (isSubscribed) {
      const sub = activeOrTrial!;
      const price = sub.items.data[0].price;
      const productName = (price.product as any)?.name || price.nickname || "";
      const amount = price.unit_amount || 0;
      
      if (sub.status === "trialing") {
        endIso = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
        // During trial, determine tier from product name
        if (productName.toLowerCase().includes("elite")) {
          tier = "Elite";
        } else {
          tier = "Pro"; // Free trial leads to Pro
        }
      } else {
        endIso = new Date(sub.current_period_end * 1000).toISOString();
        
        // NEW TIER MAPPING for 3-tier structure
        if (productName.toLowerCase().includes("elite")) {
          tier = "Elite";
        } else if (productName.toLowerCase().includes("pro") || amount >= 4900) {
          tier = "Pro";
        } else if (productName.toLowerCase().includes("free")) {
          tier = "Free";
        } else {
          // Legacy mapping for RON plans
          if (amount <= 9700) tier = "Basic";
          else if (amount <= 19700) tier = "Pro";
          else tier = "Pro";
        }
      }
    }

    // Get subscription status (trialing or active)
    const subscriptionStatus = activeOrTrial?.status || null;

    // Get existing early_bird_expires_at from database
    const { data: existingSubscriber } = await supabaseService
      .from("subscribers")
      .select("early_bird_expires_at")
      .eq("email", user.email)
      .single();

    const earlyBirdExpiresAt = existingSubscriber?.early_bird_expires_at || null;

    await supabaseService.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: isSubscribed,
      subscription_tier: tier,
      subscription_end: endIso,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    return new Response(JSON.stringify({
      subscribed: isSubscribed,
      tier,
      subscription_end: endIso,
      early_bird_expires_at: earlyBirdExpiresAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("Error", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
