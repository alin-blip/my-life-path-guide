import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "npm:stripe@14.21.0";
import { z } from "npm:zod@3.23.8";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const Body = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/), plan: z.enum(["couple-plan-7d", "couple-monthly"]) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid_input" }, 400);
  const { token, plan } = parsed.data;

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: lead } = await admin.from("couple_verdict_leads").select("id, email, name, language").eq("access_token", token).maybeSingle();
  if (!lead) return json({ error: "not_found" }, 404);

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const isEn = lead.language === "en";
    const currency = isEn ? "usd" : "eur";
    const origin = req.headers.get("origin") || "https://www.ceomindos.com";
    const path = isEn ? "/en/who-is-right" : "/cine-are-dreptate";
    const is7d = plan === "couple-plan-7d";
    const name = is7d
      ? (isEn ? "7-Day De-escalation Plan" : "Plan de de-escaladare 7 zile")
      : (isEn ? "Marriage Stack — monthly access" : "Marriage Stack — acces lunar");
    const price: any = {
      currency,
      product_data: { name },
      unit_amount: is7d ? 500 : 997,
      recurring: { interval: is7d ? "week" : "month" },
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: lead.email,
      line_items: [{ price_data: price, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: {
        plan_id: plan, source: "couple-verdict", lead_token: token, language: lead.language,
        guest_email: lead.email, guest_name: lead.name, tier: monthly ? "starter" : "couple-plan",
      },
      success_url: `${origin}${path}?t=${token}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${path}?t=${token}&canceled=1`,
    });

    await admin.from("checkout_events").insert({ event_type: "checkout_session_created", plan_id: plan, source: "couple-verdict", session_id: session.id, metadata: { currency } }).then(() => {}, () => {});
    return json({ url: session.url });
  } catch (e) {
    console.error("couple checkout error", e);
    return json({ error: "checkout_failed", message: lead.language === "en" ? "Could not open checkout. Please try again." : "Nu am putut deschide plata. Încearcă din nou." }, 500);
  }
});
