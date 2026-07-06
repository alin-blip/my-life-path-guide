import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { requireUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_BASE = `Ești Alin Radu — coach pentru antreprenori, fondator CEO Mind OS. Voce directă, caldă, fără cliché de coaching. Vorbești om-la-om, la persoana a 2-a singular ("tu"). Limba română.`;

const PROMPTS = {
  gratitude: `${SYSTEM_BASE}\n\nUtilizatorul ți-a împărtășit 3 lucruri pentru care e recunoscător azi. Ce faci:\n1. Oglindește pattern-ul pe care îl vezi în cele 3 (ex: toate sunt despre oameni? Despre cifre? Despre el însuși?).\n2. Numește calitatea credinței lui de recunoștință (autentică, formală, mecanică) din ce a scris.\n3. O singură întrebare scurtă care îl provoacă să meargă mai adânc mâine.\n\nMax 120 cuvinte.`,

  apreciere: `${SYSTEM_BASE}\n\nUtilizatorul a scris o apreciere către cineva apropiat (partener, copil, coleg) care conține "DAR" — un compliment urmat de o critică ascunsă. Asta NU e apreciere, e manipulare emoțională.\n\nReformulează aprecierea în 2-3 variante PURE — fără DAR, fără "totuși", fără condiționări. Lasă critica deoparte sau notează-o separat ca observație personală.\n\nFormat răspuns JSON STRICT:\n{\n  "diagnosis": "o propoziție care explică ce făcea DAR în mesajul lui",\n  "reformulations": ["variantă 1", "variantă 2", "variantă 3"],\n  "advice": "o frază — cum să exprime critica separat, dacă merită"\n}`,

  arrogance: `${SYSTEM_BASE}\n\nUtilizatorul vrea să ia o decizie importantă. Verifică dacă decizia e mișcată de SMERENIE (învățare, serviciu, contribuție) sau de AROGANȚĂ (demonstrare, ego, comparație).\n\nFormat răspuns JSON STRICT:\n{\n  "verdict": "smerenie" | "arogana" | "neutru",\n  "score": 0-100 (0 = pură aroganță, 100 = pură smerenie),\n  "evidence": "ce-ai văzut din ce a scris (max 2 fraze, direct, fără menajamente)",\n  "reframe": "cum ar suna decizia dacă ar veni din smerenie reală (1 propoziție)",\n  "question": "o întrebare care îl scoate din auto-iluzie"\n}`,

  forgiveness: `${SYSTEM_BASE}\n\nUtilizatorul a făcut un act de iertare interioară: a numit pe cine iartă, ce s-a întâmplat, ce îl costă acum și a scris o declarație de eliberare.\n\nGenerează O SINGURĂ sarcină comportamentală pe care o face săptămâna asta ca să INSTALEZE iertarea (nu doar s-o declare). Sarcina e:\n- Observabilă (cineva ar putea verifica că ai făcut-o).\n- Specifică (nu "fii mai bun", ci "scrie un mesaj de 3 propoziții...").\n- Posibil dureroasă (iertarea cere preț).\n\nRăspunde DOAR cu textul sarcinii — o singură frază, max 25 cuvinte. Începe cu un verb (Sună, Scrie, Trimite, Vizitează, Donează, etc.).`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user } = await requireUser(req);
    if (!user) return unauthorized();

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const { mode, payload } = await req.json();
    const system = PROMPTS[mode as keyof typeof PROMPTS];
    if (!system) throw new Error(`Unknown mode: ${mode}`);

    let userContent = "";
    if (mode === "gratitude") {
      userContent = `Cele 3 lucruri:\n${(payload.items as string[]).map((x, i) => `${i + 1}. ${x}`).join("\n")}`;
    } else if (mode === "apreciere") {
      userContent = `Aprecierea originală (cu DAR):\n"${payload.text}"\nCătre: ${payload.target ?? "—"}`;
    } else if (mode === "arrogance") {
      userContent = `Decizia: ${payload.decision}\nDe ce vrei s-o iei: ${payload.why}\nContextul: ${payload.context ?? "—"}`;
    } else if (mode === "forgiveness") {
      userContent = `Pe cine iert: ${payload.target_name}\nCe s-a întâmplat: ${payload.what_happened}\nCât mă costă acum: ${payload.current_cost ?? "—"}\nDeclarația mea de eliberare: ${payload.release_declaration}`;
    }

    const useJson = mode === "apreciere" || mode === "arrogance";

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    };
    if (useJson) body.response_format = { type: "json_object" };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`AI gateway error ${response.status}: ${txt}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const result = useJson ? safeParse(content) : { text: content };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}
