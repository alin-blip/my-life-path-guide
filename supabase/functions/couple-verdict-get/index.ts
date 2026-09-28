import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "npm:stripe@14.21.0";
import { z } from "npm:zod@3.23.8";
import { AiError, generatePlan, resultUrl, sendCoupleEmail } from "../_shared/couple-verdict-ai.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const Body = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/), session_id: z.string().max(200).optional() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid_input" }, 400);
  const { token, session_id } = parsed.data;

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: lead } = await admin.from("couple_verdict_leads").select("*").eq("access_token", token).maybeSingle();
  if (!lead) return json({ error: "not_found" }, 404);

  // Verify payment on return from checkout
  if (!lead.paid && session_id) {
    try {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
      const s = await stripe.checkout.sessions.retrieve(session_id);
      const ok = s.metadata?.lead_token === token && (s.payment_status === "paid" || s.status === "complete");
      if (ok) {
        await admin.from("couple_verdict_leads").update({ paid: true, paid_plan: s.metadata?.plan_id ?? null, paid_at: new Date().toISOString(), stripe_session_id: s.id }).eq("id", lead.id);
        lead.paid = true;
        lead.paid_plan = s.metadata?.plan_id ?? null;
      }
    } catch (e) { console.error("stripe verify error", e); }
  }

  let planError: string | null = null;
  if (lead.paid && !lead.plan) {
    try {
      const plan = await generatePlan({ name: lead.name, language: lead.language, situation: lead.situation, my_perspective: lead.my_perspective, partner_perspective: lead.partner_perspective }, lead.verdict);
      await admin.from("couple_verdict_leads").update({ plan }).eq("id", lead.id);
      lead.plan = plan;
      await sendCoupleEmail(lead.email, `couple-plan-${lead.id}`, { kind: "plan", firstName: lead.name, language: lead.language, resultUrl: resultUrl(lead.language, token) });
    } catch (e) {
      console.error("plan AI error", e instanceof AiError ? e.status : "", (e as Error).message);
      planError = lead.language === "ro" ? "Planul se generează. Reîncarcă pagina peste un minut." : "Your plan is being generated. Reload in a minute.";
    }
  }

  return json({
    name: lead.name, language: lead.language, verdict: lead.verdict,
    paid: lead.paid, paid_plan: lead.paid_plan, plan: lead.plan, plan_error: planError,
  });
});
