import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { z } from "npm:zod@3.23.8";
import { AiError, generateVerdict, resultUrl, sendCoupleEmail } from "../_shared/couple-verdict-ai.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  language: z.enum(["ro", "en"]).default("ro"),
  marketingConsent: z.boolean().default(false),
  situation: z.string().trim().min(20).max(3000),
  my_perspective: z.string().trim().min(10).max(3000),
  partner_perspective: z.string().trim().min(10).max(3000),
  utm: z.record(z.string(), z.string().max(500)).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid_input", details: parsed.error.flatten().fieldErrors }, 400);
  const d = parsed.data;

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip))))
    .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin.from("couple_verdict_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= 5) return json({ error: "rate_limited", message: d.language === "ro" ? "Prea multe analize într-o oră. Încearcă mai târziu." : "Too many analyses this hour. Try again later." }, 429);

  let verdict: any;
  try {
    verdict = await generateVerdict({ name: d.name, language: d.language, situation: d.situation, my_perspective: d.my_perspective, partner_perspective: d.partner_perspective });
  } catch (e) {
    const status = e instanceof AiError ? e.status : 500;
    console.error("verdict AI error", status, (e as Error).message);
    const msg = status === 402 || status === 403
      ? (d.language === "ro" ? "Analiza nu este disponibilă momentan. Revino puțin mai târziu." : "Analysis is temporarily unavailable. Please come back later.")
      : status === 429
      ? (d.language === "ro" ? "Sunt multe cereri acum. Încearcă din nou peste un minut." : "Lots of requests right now. Try again in a minute.")
      : (d.language === "ro" ? "Nu am putut genera verdictul. Încearcă din nou." : "Could not generate the verdict. Please try again.");
    return json({ error: "ai_error", message: msg }, status === 402 || status === 403 || status === 429 ? status : 502);
  }

  const { data: row, error } = await admin.from("couple_verdict_leads").insert({
    name: d.name, email: d.email, language: d.language, marketing_consent: d.marketingConsent,
    situation: d.situation, my_perspective: d.my_perspective, partner_perspective: d.partner_perspective,
    verdict, ip_hash: ipHash, utm: d.utm ?? null,
  }).select("id, access_token").single();
  if (error || !row) { console.error("insert error", error); return json({ error: "server_error" }, 500); }

  await sendCoupleEmail(d.email, `couple-verdict-${row.id}`, {
    kind: "verdict", firstName: d.name, language: d.language,
    headline: verdict.headline, summary: verdict.summary, reconnectPhrase: verdict.reconnect_phrase,
    resultUrl: resultUrl(d.language, row.access_token),
  });

  return json({ ok: true, token: row.access_token, verdict });
});
