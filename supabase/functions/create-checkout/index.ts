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

  // Supabase client with anon key for user auth context
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get requested plan
    const { plan } = await req.json();
    if (!plan) throw new Error("Missing plan in request body");

    // Ensure Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Map plan -> pricing
    let unitAmount = 0; // in bani (RON)
    let trialDays: number | undefined;
    let interval: "month" | "year" = "month";
    let productName = "Operator Pro";

    switch (plan) {
      case "basic":
        unitAmount = 9700; // 97 LEI
        productName = "Operator Basic";
        break;
      case "pro":
        unitAmount = 19700; // 197 LEI
        productName = "Operator Pro";
        break;
      case "trial":
        unitAmount = 19700; // Pro with trial
        productName = "Operator Pro (Trial)";
        trialDays = 3;
        break;
      case "monthly":
        unitAmount = 9700; // 97 LEI
        productName = "Jump to Freedom - Lunar";
        break;
      case "annual":
        unitAmount = 99700; // 997 LEI
        interval = "year";
        productName = "Jump to Freedom - Anual";
        break;
      case "premium-coach":
        unitAmount = 19700; // 197 LEI
        productName = "Jump to Freedom - Premium + Coaching";
        break;
      default:
        throw new Error("Plan invalid");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: { name: productName },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      subscription_data: trialDays ? { trial_period_days: trialDays } : undefined,
      metadata: {
        plan_id: plan,
        coaching_included: plan === "premium-coach" ? "true" : "false"
      },
      success_url: `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
