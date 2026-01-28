import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { ideaText, messages } = await req.json();

    if (!ideaText && (!messages || messages.length === 0)) {
      return new Response(JSON.stringify({ error: "ideaText or messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's objectives for context
    const { data: missions } = await supabaseClient
      .from("missions")
      .select("mission_type, category, title, period, measurable_result")
      .eq("user_id", userId)
      .order("mission_type", { ascending: true });

    const { data: weeklyPlan } = await supabaseClient
      .from("weekly_planning")
      .select("domino_title, key_points, week_key, category")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build context about user's objectives
    const annualMissions = missions?.filter(m => m.mission_type === 'annual') || [];
    const quarterlyMissions = missions?.filter(m => m.mission_type === 'quarterly') || [];
    const monthlyMissions = missions?.filter(m => m.mission_type === 'monthly') || [];

    const objectivesContext = `
OBIECTIVELE UTILIZATORULUI:

📅 OBIECTIVE ANUALE:
${annualMissions.map(m => `- [${m.category}] ${m.title}${m.measurable_result ? ` | Rezultat: ${m.measurable_result}` : ''}`).join('\n') || 'Nu sunt setate'}

🎯 OBIECTIVE 90 ZILE:
${quarterlyMissions.map(m => `- [${m.category}] ${m.title}${m.measurable_result ? ` | Rezultat: ${m.measurable_result}` : ''}`).join('\n') || 'Nu sunt setate'}

📆 OBIECTIVE LUNARE:
${monthlyMissions.map(m => `- [${m.category}] ${m.title}${m.measurable_result ? ` | Rezultat: ${m.measurable_result}` : ''}`).join('\n') || 'Nu sunt setate'}

🔥 FOCUS SĂPTĂMÂNAL (Domino Door):
${weeklyPlan?.domino_title || 'Nu este setat'}
${weeklyPlan?.key_points ? `Key Points: ${JSON.stringify(weeklyPlan.key_points)}` : ''}
`;

    const systemPrompt = `Ești un coach strategic care ajută la evaluarea ideilor în raport cu obiectivele utilizatorului.

${objectivesContext}

ROLUL TĂU:
1. Analizează ideea în contextul obiectivelor de mai sus
2. Evaluează dacă ideea este "busy work" (pierdere de timp) sau are impact real
3. Oferă un scor de relevanță (0-100)
4. Fă o recomandare clară: PURSUE (urmărește), DEFER (amână), sau DISCARD (renunță)

CRITERII DE EVALUARE:
- Aliniere cu obiectivele anuale/90z/lunare
- Potențial de impact asupra rezultatelor dorite
- Efort necesar vs. beneficii
- Urgență reală vs. percepută
- Risc de a fi "busy work" (activitate care pare productivă dar nu mișcă acul)

STIL DE COMUNICARE:
- Fii direct și onest
- Folosește română
- Pune întrebări de clarificare dacă e nevoie
- La final, oferă un verdict clar

Când ai suficiente informații pentru a face o analiză completă, răspunde cu un JSON structurat:
{
  "analysis_complete": true,
  "result": {
    "relevance_score": 0-100,
    "is_aligned": true/false,
    "recommendation": "pursue" | "defer" | "discard",
    "reasoning": "Explicație detaliată...",
    "alignment": {
      "annual": { "aligned": true/false, "objective": "..." },
      "quarterly": { "aligned": true/false, "objective": "..." },
      "monthly": { "aligned": true/false, "objective": "..." }
    },
    "estimated_effort": "low" | "medium" | "high",
    "urgency": "low" | "medium" | "high",
    "is_busy_work": true/false
  }
}

Dacă ai nevoie de mai multe informații, răspunde conversațional și pune întrebări.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build messages for AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (messages && messages.length > 0) {
      aiMessages.push(...messages);
    } else {
      aiMessages.push({ role: "user", content: `Analizează această idee: "${ideaText}"` });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-idea error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
