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
    const { plan, source } = await req.json();
    if (!plan) throw new Error("Missing plan in request body");

    // Ensure Stripe customer exists and get their currency
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let existingCurrency: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Check if customer has existing subscriptions/invoices to detect currency
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
      if (subscriptions.data.length > 0) {
        existingCurrency = subscriptions.data[0].currency;
        console.log(`Customer ${customerId} has existing currency: ${existingCurrency}`);
      }
    }

    // Map plan -> pricing
    // HORMOZI 3-TIER STRUCTURE (Updated Jan 2025):
    // - Basic: €49/mo Early Bird (normally €97) - 3-day trial
    // - Pro: €97/mo Early Bird (normally €197) - 7-day trial + LIVE coaching
    // - Elite: €297/mo Early Bird (normally €500) - 7-day trial + All Pro + Accelerator + 1-on-1
    let unitAmount = 0;
    let trialDays: number | undefined;
    let interval: "month" | "year" = "month";
    let productName = "WarriorOS Pro";
    let paymentMode: "subscription" | "payment" = "subscription";
    let currency = existingCurrency || "eur"; // Use existing currency or default to EUR
    let tier = "basic";

    switch (plan) {
      // === NEW 3-TIER HORMOZI STRUCTURE - ALL WITH 5-DAY TRIAL ===
      case "basic":
        // Basic plan - €49/month Early Bird (normally €97) - 5-DAY TRIAL
        unitAmount = currency === "ron" ? 24900 : 4900; // 249 RON or €49
        productName = "WarriorOS Basic (5-Day Trial)";
        tier = "basic";
        trialDays = 5;
        break;
        
      case "pro":
        // Pro plan - €97/month Early Bird (normally €197) - 5-DAY TRIAL
        unitAmount = currency === "ron" ? 49000 : 9700; // 490 RON or €97
        productName = "WarriorOS Pro (5-Day Trial)";
        tier = "pro";
        trialDays = 5;
        break;
        
      case "elite":
        // Elite plan - €297/month Early Bird (normally €500) - 5-DAY TRIAL
        // Includes: Pro + Warrior Accelerator + Monthly 1-on-1 coaching
        unitAmount = currency === "ron" ? 149000 : 29700; // 1490 RON or €297
        productName = "WarriorOS Elite (5-Day Trial)";
        tier = "elite";
        trialDays = 5;
        break;
      
      // === ANNUAL PLANS - 60% DISCOUNT LOCKED ===
      case "basic-annual":
        unitAmount = currency === "ron" ? 199000 : 39900; // 1990 RON or €399
        interval = "year";
        productName = "WarriorOS Basic Annual (60% Locked)";
        tier = "basic";
        break;
        
      case "pro-annual":
        unitAmount = currency === "ron" ? 490000 : 97000; // 4900 RON or €970
        interval = "year";
        productName = "WarriorOS Pro Annual (60% Locked)";
        tier = "pro";
        break;
        
      case "elite-annual":
        unitAmount = currency === "ron" ? 1490000 : 297000; // 14900 RON or €2970
        interval = "year";
        productName = "WarriorOS Elite Annual (60% Locked)";
        tier = "elite";
        break;
      
      // === ONE-TIME PURCHASES ===
      case "warrior-accelerator":
        // Standalone purchase: €497 one-time (reduced from €970)
        unitAmount = 49700; // 497 EUR în cenți
        currency = "eur";
        paymentMode = "payment";
        productName = "Warrior Launch Accelerator";
        tier = "accelerator";
        break;
      
      // === LEGACY PLANS (for existing subscribers - backwards compatibility) ===
      case "trial":
        unitAmount = 19700;
        currency = "ron";
        productName = "Operator Pro Trial (Legacy)";
        trialDays = 3;
        tier = "pro";
        break;
      case "monthly":
        unitAmount = 9700; // 97 LEI
        currency = "ron";
        productName = "Jump to Freedom - Lunar (Legacy)";
        tier = "basic";
        break;
      case "annual":
        unitAmount = 99700; // 997 LEI
        currency = "ron";
        interval = "year";
        productName = "Jump to Freedom - Anual (Legacy)";
        tier = "basic";
        break;
      case "premium-coach":
        unitAmount = 19700; // 197 LEI
        currency = "ron";
        productName = "Jump to Freedom - Premium + Coaching (Legacy)";
        tier = "pro";
        break;
      default:
        throw new Error("Plan invalid");
    }

    // Determine success and cancel URLs based on the real site origin
    const originHeader = req.headers.get("origin");
    const forwardedProto = req.headers.get("x-forwarded-proto") ?? undefined;
    const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? undefined;

    const derivedOrigin =
      forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;

    const origin = originHeader ?? derivedOrigin ?? "https://my-life-path-guide.lovable.app";

    console.log("create-checkout origin:", {
      originHeader,
      derivedOrigin,
      origin,
      plan,
      unitAmount,
      currency,
      trialDays,
      tier,
      source,
    });

    let successUrl: string;
    let cancelUrl: string;

    if (plan === "warrior-accelerator") {
      successUrl = `${origin}/warrior-accelerator-thank-you?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/warrior-launch-accelerator?canceled=true`;
    } else if (source === 'warrior-power') {
      // From Warrior Power flow -> redirect to Challenge page
      successUrl = `${origin}/challenge?checkout=success&plan=${plan}&source=warrior-power`;
      cancelUrl = `${origin}/warrior-power?canceled=true`;
    } else if (source === 'challenge-7-zile' || source === 'life-score') {
      // From Challenge 7 Zile or Life Score flow -> redirect to Challenge page
      successUrl = `${origin}/challenge?checkout=success&plan=${plan}&source=${source}`;
      cancelUrl = `${origin}/challenge-7-zile?canceled=true`;
    } else {
      successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/pricing?canceled=true`;
    }

    // Build line items based on payment mode
    const lineItems = paymentMode === "payment" 
      ? [{
          price_data: {
            currency,
            product_data: { name: productName },
            unit_amount: unitAmount,
          },
          quantity: 1,
        }]
      : [{
          price_data: {
            currency,
            product_data: { name: productName },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        }];

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: paymentMode,
      line_items: lineItems,
      metadata: {
        plan_id: plan,
        user_id: user.id,
        tier: tier,
        coaching_included: tier === "pro" || tier === "elite" ? "true" : "false",
        has_trial: trialDays ? "true" : "false",
        source: source || "direct",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    };

    // Add subscription data only for subscriptions
    if (paymentMode === "subscription" && trialDays) {
      sessionConfig.subscription_data = { trial_period_days: trialDays };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("create-checkout error:", { message, error });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
