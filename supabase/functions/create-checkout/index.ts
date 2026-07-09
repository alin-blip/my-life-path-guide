import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { plan, source, guest_email, guest_name, language, utm } = await req.json();
    if (!plan) throw new Error("Missing plan in request body");

    const isEarlyBird = source === 'early-bird';

    // Plans that allow guest checkout (account is created later in webhook)
    const GUEST_ALLOWED_PLANS = new Set([
      'ebook-only', 'ebook-bundle', 'ebook-only-en', 'ebook-bundle-en',
      'ebook-accelerator', 'ebook-accelerator-en',
      'challenge-plus-trial', 'challenge-plus-trial-en',
      'basic', // Challenge 7 zile — Stripe collects email, webhook creates account
      'starter', // Warrior onboarding funnel — guest checkout after quiz
    ]);

    // Resolve user (auth optional for guest-allowed plans)
    let user: { id?: string; email?: string } | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData?.user?.email) user = { id: userData.user.id, email: userData.user.email };
    }

    if (!user) {
      if (!GUEST_ALLOWED_PLANS.has(plan)) {
        throw new Error("No authorization header provided");
      }
      // guest_email is optional — if not provided, Stripe Checkout collects it on the payment page
      user = { email: guest_email ? guest_email.trim().toLowerCase() : undefined };
    }

    let customerId: string | undefined;
    let existingCurrency: string | undefined;

    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (subscriptions.data.length > 0) {
          existingCurrency = subscriptions.data[0].currency;
          console.log(`Customer ${customerId} has existing currency: ${existingCurrency}`);
        }
      }
    }

    let unitAmount = 0;
    let trialDays: number | undefined;
    let interval: "month" | "year" = "month";
    let productName = "CEO Mind OS Pro";
    let paymentMode: "subscription" | "payment" = "subscription";
    // Standard currency: EUR for all RO / default plans. EN variants use USD (language-dynamic).
    let currency = existingCurrency || "eur";
    let tier = "basic";

    switch (plan) {
      case "starter": {
        const isEnStarter = language === "en";
        unitAmount = isEnStarter ? 900 : 700; // $9 EN / €7 RO
        currency = isEnStarter ? "usd" : "eur";
        productName = isEnStarter
          ? "Warrior Starter (7-Day Free Trial)"
          : "Warrior Starter (Trial 7 zile)";
        tier = "starter";
        trialDays = 7;
        break;
      }

      case "basic":
        unitAmount = 4900;
        currency = "eur";
        productName = isEarlyBird ? "CEO Mind OS Basic (Early Bird)" : "CEO Mind OS Basic (7-Day Trial)";
        tier = "basic";
        trialDays = isEarlyBird ? undefined : 7;
        break;

      case "pro":
        unitAmount = 9700;
        currency = "eur";
        productName = "CEO Mind OS Pro (Early Bird)";
        tier = "pro";
        trialDays = undefined;
        break;

      case "elite":
        unitAmount = 29700;
        currency = "eur";
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
        unitAmount = 39900;
        currency = "eur";
        interval = "year";
        productName = "CEO Mind OS Basic Annual (60% Locked)";
        tier = "basic";
        break;

      case "pro-annual":
        unitAmount = 97000;
        currency = "eur";
        interval = "year";
        productName = "CEO Mind OS Pro Annual (60% Locked)";
        tier = "pro";
        break;

      case "elite-annual":
        unitAmount = 297000;
        currency = "eur";
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

      case "ebook-accelerator":
        unitAmount = 1900; // €19
        currency = "eur";
        paymentMode = "payment";
        productName = "CEO Mind OS - Pachet Accelerator (Ebook)";
        tier = "accelerator";
        break;

      case "ebook-accelerator-en":
        unitAmount = 2900;
        currency = "usd";
        paymentMode = "payment";
        productName = "CEO Mind OS - Accelerator Package (Ebook EN)";
        tier = "accelerator";
        break;

      // === BURNOUT FUNNEL — Ebook (RO) ===
      case "ebook-only":
        unitAmount = 700; // €7
        currency = "eur";
        paymentMode = "payment";
        productName = "CEO Mind OS - Ebook (PDF)";
        tier = "ebook";
        break;

      case "ebook-bundle":
        unitAmount = 1400; // €7 ebook + €7 audiobook
        currency = "eur";
        paymentMode = "payment";
        productName = "CEO Mind OS - Ebook + Audiobook";
        tier = "ebook";
        break;

      // === BURNOUT FUNNEL — Ebook (EN) ===
      case "ebook-only-en":
        unitAmount = 700; // $7
        currency = "usd";
        paymentMode = "payment";
        productName = "CEO Mind OS - Ebook (PDF)";
        tier = "ebook";
        break;

      case "ebook-bundle-en":
        unitAmount = 1400; // $7 ebook + $7 audiobook
        currency = "usd";
        paymentMode = "payment";
        productName = "CEO Mind OS - Ebook + Audiobook";
        tier = "ebook";
        break;

      // === CHALLENGE UPSELL — combined line items handled below ===
      case "challenge-plus-trial":
        unitAmount = 0;
        currency = "eur";
        productName = "Challenge 7 Zile + Pro (14 zile trial)";
        tier = "pro";
        break;

      case "challenge-plus-trial-en":
        unitAmount = 0;
        currency = "usd";
        productName = "7-Day Challenge + Pro (14-day trial)";
        tier = "pro";
        break;

      case "trial":
        unitAmount = 3900; // €39
        currency = "eur";
        productName = "Operator Pro Trial (Legacy)";
        trialDays = 3;
        tier = "pro";
        break;
      case "monthly":
        unitAmount = 1900; // €19
        currency = "eur";
        productName = "CEO Mind OS - Lunar (Legacy)";
        tier = "basic";
        break;
      case "annual":
        unitAmount = 19900; // €199
        currency = "eur";
        interval = "year";
        productName = "CEO Mind OS - Anual (Legacy)";
        tier = "basic";
        break;
      case "premium-coach":
        unitAmount = 3900; // €39
        currency = "eur";
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
      // Basic guest checkout from /challenge-7-zile — show "check your email" message on the landing
      if (plan === 'basic' && source === 'challenge-7-zile') {
        successUrl = `${origin}/challenge-7-zile?checkout=success&plan=basic`;
      } else {
        successUrl = `${origin}/challenge?checkout=success&plan=${plan}&source=${source}`;
      }
      cancelUrl = `${origin}/challenge-7-zile?canceled=true`;
    } else if (plan === 'ebook-accelerator') {
      successUrl = `${origin}/ebook-plata-reusita?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/ebook-upsell?canceled=true`;
    } else if (plan === 'ebook-accelerator-en') {
      successUrl = `${origin}/ebook-payment-success?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/ebook-upsell-en?canceled=true`;
    } else if (plan === 'ebook-only' || plan === 'ebook-bundle') {
      successUrl = `${origin}/ebook-plata-reusita?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/ebook?canceled=true`;
    } else if (plan === 'ebook-only-en' || plan === 'ebook-bundle-en') {
      successUrl = `${origin}/ebook-payment-success?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/ebook-en?canceled=true`;
    } else if (plan === 'challenge-plus-trial') {
      successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/ebook-upsell?canceled=true`;
    } else if (plan === 'challenge-plus-trial-en') {
      successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/ebook-upsell-en?canceled=true`;
    } else if (plan === 'starter') {
      const enPrefix = language === 'en' ? '/en' : '';
      successUrl = `${origin}${enPrefix}/warrior/welcome?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}${enPrefix}/warrior?canceled=true`;
    } else {
      successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
      cancelUrl = `${origin}/pricing?canceled=true`;
    }

    // Special combined line items for Challenge+Trial: $97 one-time + $49/mo with 14d trial
    let lineItems: any[];
    if (plan === 'challenge-plus-trial' || plan === 'challenge-plus-trial-en') {
      const isEn = plan === 'challenge-plus-trial-en';
      const cur = isEn ? 'usd' : 'eur';
      const challengeAmt = 9700;  // €97 / $97
      const monthlyAmt = 4900;    // €49 / $49
      currency = cur;
      paymentMode = 'subscription';
      lineItems = [
        { price_data: { currency: cur, product_data: { name: isEn ? '7-Day Challenge (one-time)' : 'Challenge 7 Zile (plată unică)' }, unit_amount: challengeAmt }, quantity: 1 },
        { price_data: { currency: cur, product_data: { name: isEn ? 'CEO Mind OS Pro (monthly)' : 'CEO Mind OS Pro (lunar)' }, unit_amount: monthlyAmt, recurring: { interval: 'month' } }, quantity: 1 },
      ];
      trialDays = 14;
    } else {
      lineItems = paymentMode === "payment"
        ? [{ price_data: { currency, product_data: { name: productName }, unit_amount: unitAmount }, quantity: 1 }]
        : [{ price_data: { currency, product_data: { name: productName }, unit_amount: unitAmount, recurring: { interval } }, quantity: 1 }];
    }

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
      // Only set customer_email when we already know it; otherwise Stripe collects it on the checkout page
      customer_email: customerId ? undefined : (user.email || undefined),
      mode: paymentMode,
      line_items: lineItems,
      metadata: {
        plan_id: plan,
        user_id: user.id || "",
        guest_email: user.id ? "" : (user.email || ""),
        guest_name: guest_name || "",
        language: (language === "en" || language === "ro") ? language : (plan.endsWith("-en") ? "en" : "ro"),
        tier,
        coaching_included: tier === "pro" || tier === "elite" ? "true" : "false",
        has_trial: trialDays ? "true" : "false",
        source: source || "direct",
        // UTM attribution (truncated to Stripe's 500-char metadata limit)
        utm_source: (utm?.utm_source || "").toString().slice(0, 500),
        utm_medium: (utm?.utm_medium || "").toString().slice(0, 500),
        utm_campaign: (utm?.utm_campaign || "").toString().slice(0, 500),
        utm_content: (utm?.utm_content || "").toString().slice(0, 500),
        utm_term: (utm?.utm_term || "").toString().slice(0, 500),
        landing_page: (utm?.landing_page || "").toString().slice(0, 500),
        referrer: (utm?.referrer || "").toString().slice(0, 500),
      },
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

    // Server-side telemetry — one row per successful checkout URL creation.
    try {
      const svcSupabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await svcSupabase.from('checkout_events').insert({
        event_type: 'checkout_session_created',
        plan_id: plan,
        source: source || 'direct',
        user_id: user.id || null,
        session_id: session.id,
        metadata: {
          stripe_session_id: session.id,
          tier,
          currency,
          trial_days: trialDays || 0,
          coupon: appliedCouponId || null,
        },
      });
    } catch (logErr) {
      console.warn('checkout_events insert failed:', logErr);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("create-checkout error:", { message, error });
    // Log failure for funnel visibility
    try {
      const svcSupabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await svcSupabase.from('checkout_events').insert({
        event_type: 'checkout_session_failed',
        error_message: message.slice(0, 500),
        source: 'server',
      });
    } catch {}
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
