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

    const { plan, source } = await req.json();
    if (!plan) throw new Error("Missing plan in request body");
    
    const isEarlyBird = source === 'early-bird';

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let existingCurrency: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
      if (subscriptions.data.length > 0) {
        existingCurrency = subscriptions.data[0].currency;
        console.log(`Customer ${customerId} has existing currency: ${existingCurrency}`);
      }
    }

    let unitAmount = 0;
    let trialDays: number | undefined;
    let interval: "month" | "year" = "month";
    let productName = "CEO Mind OS Pro";
    let paymentMode: "subscription" | "payment" = "subscription";
    let currency = existingCurrency || "eur";
    let tier = "basic";

    switch (plan) {
      case "basic":
        unitAmount = currency === "ron" ? 24900 : 4900;
        productName = isEarlyBird ? "CEO Mind OS Basic (Early Bird)" : "CEO Mind OS Basic (7-Day Trial)";
        tier = "basic";
        trialDays = isEarlyBird ? undefined : 7;
        break;
        
      case "pro":
        unitAmount = currency === "ron" ? 49000 : 9700;
        productName = "CEO Mind OS Pro (Early Bird)";
        tier = "pro";
        trialDays = undefined;
        break;
        
      case "elite":
        unitAmount = currency === "ron" ? 149000 : 29700;
        productName = "CEO Mind OS Elite (5-Day Trial)";
        tier = "elite";
        trialDays = 5;
        break;

      case "pro-challenge-3mo":
        unitAmount = 9700;
        currency = "eur";
        productName = "CEO Mind OS Pro - Cod Warrior88 Aplicat";
        tier = "pro";
        break;

      case "pro-challenge-trial":
        unitAmount = 4900;
        currency = "eur";
        productName = "CEO Mind OS Pro (7-Day Free Trial)";
        tier = "pro";
        trialDays = 7;
        break;

      case "warrior-accelerator-earlybird":
        unitAmount = 99900;
        currency = "eur";
        paymentMode = "payment";
        productName = "CEO Certified Coach - Early Bird";
        tier = "accelerator";
        break;
      
      case "basic-annual":
        unitAmount = currency === "ron" ? 199000 : 39900;
        interval = "year";
        productName = "CEO Mind OS Basic Annual (60% Locked)";
        tier = "basic";
        break;
        
      case "pro-annual":
        unitAmount = currency === "ron" ? 490000 : 97000;
        interval = "year";
        productName = "CEO Mind OS Pro Annual (60% Locked)";
        tier = "pro";
        break;
        
      case "elite-annual":
        unitAmount = currency === "ron" ? 1490000 : 297000;
        interval = "year";
        productName = "CEO Mind OS Elite Annual (60% Locked)";
        tier = "elite";
        break;
      
      case "warrior-accelerator":
        unitAmount = 199900;
        currency = "eur";
        paymentMode = "payment";
        productName = "CEO Certified Coach";
        tier = "accelerator";
        break;
      
      case "trial":
        unitAmount = 19700;
        currency = "ron";
        productName = "Operator Pro Trial (Legacy)";
        trialDays = 3;
        tier = "pro";
        break;
      case "monthly":
        unitAmount = 9700;
        currency = "ron";
        productName = "CEO Mind OS - Lunar (Legacy)";
        tier = "basic";
        break;
      case "annual":
        unitAmount = 99700;
        currency = "ron";
        interval = "year";
        productName = "CEO Mind OS - Anual (Legacy)";
        tier = "basic";
        break;
      case "premium-coach":
        unitAmount = 19700;
        currency = "ron";
        productName = "CEO Mind OS - Premium + Coaching (Legacy)";
        tier = "pro";
        break;
      default:
        throw new Error("Plan invalid");
    }

    const originHeader = req.headers.get("origin");
    const forwardedProto = req.headers.get("x-forwarded-proto") ?? undefined;
    const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? undefined;
    const derivedOrigin = forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : undefined;
    const origin = originHeader ?? derivedOrigin ?? "https://my-life-path-guide.lovable.app";

    if (plan === 'elite' && source === 'challenge-upsell') {
      trialDays = undefined;
      productName = "CEO Mind OS Elite";
    }

    console.log("create-checkout origin:", { originHeader, derivedOrigin, origin, plan, unitAmount, currency, trialDays, tier, source });

    let successUrl: string;
    let cancelUrl: string;

    if (plan === "warrior-accelerator" || plan === "warrior-accelerator-earlybird") {
      successUrl = `${origin}/warrior-accelerator-thank-you?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/warrior-launch-accelerator?canceled=true`;
    } else if (plan === "pro-challenge-trial" || plan === "pro-challenge-3mo") {
      successUrl = `${origin}/challenge-upsell?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/challenge-7-zile?canceled=true`;
    } else if (source === 'warrior-power') {
      successUrl = `${origin}/challenge?checkout=success&plan=${plan}&source=warrior-power`;
      cancelUrl = `${origin}/warrior-power?canceled=true`;
    } else if (source === 'challenge-7-zile' || source === 'life-score') {
      successUrl = `${origin}/challenge?checkout=success&plan=${plan}&source=${source}`;
      cancelUrl = `${origin}/challenge-7-zile?canceled=true`;
    } else {
      successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/pricing?canceled=true`;
    }

    const lineItems = paymentMode === "payment" 
      ? [{ price_data: { currency, product_data: { name: productName }, unit_amount: unitAmount }, quantity: 1 }]
      : [{ price_data: { currency, product_data: { name: productName }, unit_amount: unitAmount, recurring: { interval } }, quantity: 1 }];

    let appliedCouponId: string | undefined;
    if (plan === "pro-challenge-3mo") {
      try {
        await stripe.coupons.retrieve("Warrior88");
      } catch {
        await stripe.coupons.create({ id: "Warrior88", amount_off: 6800, currency: "eur", duration: "repeating", duration_in_months: 3, name: "Cod Warrior88" });
      }
      appliedCouponId = "Warrior88";
    }

    if (source === 'challenge-upsell' && tier === 'elite' && customerId) {
      try {
        const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 });
        const trialingSubs = await stripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 10 });
        const allSubs = [...existingSubs.data, ...trialingSubs.data];
        for (const sub of allSubs) {
          console.log(`Canceling existing subscription ${sub.id} for Elite upgrade`);
          await stripe.subscriptions.cancel(sub.id);
        }
      } catch (cancelErr) {
        console.error("Error canceling existing subs for Elite upgrade:", cancelErr);
      }
    }

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      mode: paymentMode,
      line_items: lineItems,
      metadata: { plan_id: plan, user_id: user.id, tier, coaching_included: tier === "pro" || tier === "elite" ? "true" : "false", has_trial: trialDays ? "true" : "false", source: source || "direct" },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (appliedCouponId) {
      sessionConfig.discounts = [{ coupon: appliedCouponId }];
    } else {
      sessionConfig.allow_promotion_codes = true;
    }

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
