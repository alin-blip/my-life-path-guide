import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // Check if coach profile exists
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: coachProfile, error: profileError } = await supabaseService
      .from("coach_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw new Error(`Error fetching coach profile: ${profileError.message}`);
    }

    // If coach already has a connected account, return the dashboard link
    if (coachProfile?.stripe_connect_id && coachProfile?.stripe_onboarding_complete) {
      const loginLink = await stripe.accounts.createLoginLink(coachProfile.stripe_connect_id);
      return new Response(JSON.stringify({ 
        url: loginLink.url,
        type: "dashboard"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If has account but onboarding incomplete, continue onboarding
    if (coachProfile?.stripe_connect_id) {
      const accountLink = await stripe.accountLinks.create({
        account: coachProfile.stripe_connect_id,
        refresh_url: `${req.headers.get("origin")}/coach?onboarding=refresh`,
        return_url: `${req.headers.get("origin")}/coach?onboarding=complete`,
        type: "account_onboarding",
      });
      return new Response(JSON.stringify({ 
        url: accountLink.url,
        type: "onboarding"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: user.id,
      },
    });

    console.log("[COACH-CONNECT] Created Stripe account:", account.id);

    // Create or update coach profile with Stripe account
    const { error: upsertError } = await supabaseService
      .from("coach_profiles")
      .upsert({
        user_id: user.id,
        display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Coach",
        stripe_connect_id: account.id,
        stripe_onboarding_complete: false,
        commission_rate: 0.50, // 50% commission
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("[COACH-CONNECT] Error upserting coach profile:", upsertError);
      throw new Error(`Error creating coach profile: ${upsertError.message}`);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get("origin")}/coach?onboarding=refresh`,
      return_url: `${req.headers.get("origin")}/coach?onboarding=complete`,
      type: "account_onboarding",
    });

    console.log("[COACH-CONNECT] Created account link for onboarding");

    return new Response(JSON.stringify({ 
      url: accountLink.url,
      type: "onboarding",
      accountId: account.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[COACH-CONNECT] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
