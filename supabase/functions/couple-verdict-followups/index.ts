import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";
import { resultUrl, sendCoupleEmail } from "../_shared/couple-verdict-ai.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const denied = await requireCronOrAdmin(req, cors);
  if (denied) return denied;

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const now = Date.now();
  const { data: leads } = await admin.from("couple_verdict_leads")
    .select("id, email, name, language, access_token, followup_sent, created_at")
    .eq("paid", false)
    .gte("created_at", new Date(now - 6 * 86400_000).toISOString())
    .lte("created_at", new Date(now - 86400_000).toISOString())
    .limit(200);

  let sent = 0;
  for (const l of leads ?? []) {
    const age = now - new Date(l.created_at).getTime();
    const f = (l.followup_sent || {}) as Record<string, string>;
    const kind = age >= 3 * 86400_000 && !f.followup3 ? "followup3" : !f.followup1 ? "followup1" : null;
    if (!kind) continue;
    const ok = await sendCoupleEmail(l.email, `couple-${kind}-${l.id}`, { kind, firstName: l.name, language: l.language, resultUrl: resultUrl(l.language, l.access_token) });
    if (ok) {
      await admin.from("couple_verdict_leads").update({ followup_sent: { ...f, [kind]: new Date().toISOString(), ...(kind === "followup3" && !f.followup1 ? { followup1: "skipped" } : {}) } }).eq("id", l.id);
      sent++;
    }
  }
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { ...cors, "Content-Type": "application/json" } });
});
