import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mirror of src/data/warriorTypes.ts — meta + template summaries.
// Kept lean; the FE has the full copy. Server only needs display data.
type WarriorType = 'reactor' | 'disciplined' | 'experimenter' | 'warrior';

const META: Record<WarriorType, {
  name: string;
  tagline: string;
  description: string;
  strengths: string;
  challenges: string;
  routineFocus: string;
}> = {
  reactor: {
    name: 'Reactor',
    tagline: 'Trăiești în modul reactiv — răspunzi la focuri.',
    description: 'Îți începi ziua fără un plan clar; alarma, telefonul și inbox-ul îți dictează prioritățile. Ai potențial mare, dar energia se pierde în urgențe.',
    strengths: 'Adaptabil, rezilient, poți muta munți când te decizi.',
    challenges: 'Fără sistem, pierzi timp în distrageri și te simți epuizat seara.',
    routineFocus: 'Fundamentele: 3 pași simpli, non-negociabili, ca să câștigi înapoi controlul dimineții.',
  },
  disciplined: {
    name: 'Disciplinat',
    tagline: 'Ai o rutină și o urmezi — dar poate a devenit un ritual gol.',
    description: 'Rutina ta funcționează, dar riscul e să devină automată fără intenție. Ai nevoie de adâncire, nu de mai multe elemente.',
    strengths: 'Consecvență, disciplină, execuție zilnică fără drame.',
    challenges: 'Rigiditate, blocaj în confort, lipsa provocării noi.',
    routineFocus: 'Ridici standardul: 12 pași aliniați la viziunea 90 zile.',
  },
  experimenter: {
    name: 'Experimentator',
    tagline: 'Testezi mereu ceva nou — dar nu apuci să vezi rezultatele.',
    description: 'Ești curios, deschis, mereu în căutare. Provocarea e că sari de la o tehnică la alta fără să dai unei metode timp să lucreze.',
    strengths: 'Creativitate, deschidere, capacitate mare de învățare.',
    challenges: 'Lipsă de aprofundare — nimic nu prinde rădăcini.',
    routineFocus: 'Structură flexibilă: 10 pași care permit variație în cadrul unui sistem.',
  },
  warrior: {
    name: 'Warrior',
    tagline: 'Rutina ta e aliniată la viziune — ești deja la nivelul superior.',
    description: 'Ai construit un sistem care mișcă acul. Acum e vorba de optimizare și scalare.',
    strengths: 'Claritate, execuție strategică, aliniere internă.',
    challenges: 'Overperformance, autocritică excesivă, uitarea recuperării.',
    routineFocus: 'Rafinare: 16 pași integrați cu recuperare și reflecție.',
  },
};

const TEMPLATES: Record<WarriorType, { activeSteps: string[]; meditationMinutes: number; workoutDays: number; readingPages: number }> = {
  reactor: { activeSteps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'exercise', 'mealPlanning', 'relationships'], meditationMinutes: 3, workoutDays: 3, readingPages: 5 },
  disciplined: { activeSteps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'exercise', 'mealPlanning', 'reading', 'learn', 'apply', 'relationships', 'dailyTasks'], meditationMinutes: 10, workoutDays: 4, readingPages: 10 },
  experimenter: { activeSteps: ['hydration', 'breathing', 'mindShifting', 'meditation', 'gratitude', 'exercise', 'mealPlanning', 'learn', 'contentCreation', 'relationships'], meditationMinutes: 5, workoutDays: 4, readingPages: 15 },
  warrior: { activeSteps: ['hydration', 'lightExposure', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'autosuggestion', 'exercise', 'mealPlanning', 'reading', 'journaling', 'learn', 'apply', 'contentCreation', 'relationships', 'dailyTasks'], meditationMinutes: 15, workoutDays: 5, readingPages: 20 },
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const warriorType = body.warrior_type as WarriorType;
    const resultId = body.result_id ? String(body.result_id) : null;
    const language = body.language === "en" ? "en" : "ro";
    const utm = body.utm || {};

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!warriorType || !META[warriorType]) {
      return new Response(JSON.stringify({ error: "Invalid warrior_type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Upsert-ish: find any existing lead for this email+type and update, otherwise insert.
    const { data: existing } = await supabase
      .from("warrior_funnel_leads")
      .select("id")
      .eq("email", email)
      .eq("warrior_type", warriorType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let leadId = existing?.id as string | undefined;
    if (!leadId) {
      const { data: inserted, error: insErr } = await supabase
        .from("warrior_funnel_leads")
        .insert({ email, warrior_type: warriorType, quiz_result_id: resultId, language, utm, status: "lead" })
        .select("id")
        .single();
      if (insErr) throw insErr;
      leadId = inserted.id;
    }

    const meta = META[warriorType];
    const tmpl = TEMPLATES[warriorType];

    // Build checkout URL — anchored on the funnel origin.
    const origin = req.headers.get("origin") || `https://${req.headers.get("host") || "warriorsos.com"}`;
    const checkoutUrl = `${origin}/quiz-rutina/result?email=${encodeURIComponent(email)}&type=${warriorType}&lead=${leadId}`;

    // Fire the report via existing send-transactional-email
    const idempotencyKey = `warrior-report-${leadId}`;
    const { error: emailErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "warrior-report",
        recipientEmail: email,
        idempotencyKey,
        templateData: {
          warriorName: meta.name,
          warriorType,
          tagline: meta.tagline,
          description: meta.description,
          strengths: meta.strengths,
          challenges: meta.challenges,
          routineFocus: meta.routineFocus,
          activeSteps: tmpl.activeSteps,
          meditationMinutes: tmpl.meditationMinutes,
          workoutDays: tmpl.workoutDays,
          readingPages: tmpl.readingPages,
          checkoutUrl,
          language,
        },
      },
    });

    if (emailErr) {
      console.error("send-transactional-email failed:", emailErr);
      // don't hard-fail — the lead is captured and UI can still show CTA
    } else {
      await supabase
        .from("warrior_funnel_leads")
        .update({ report_sent_at: new Date().toISOString() })
        .eq("id", leadId);
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: leadId, checkout_url: checkoutUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("send-warrior-report error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
