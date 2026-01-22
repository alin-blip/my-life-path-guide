import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const PRICING_KNOWLEDGE = `
PLANURI ȘI PREȚURI:

🔹 BASIC - €49/lună (Early Bird, normal €97)
- Harta Realității - Evaluarea vieții tale
- AI Coaching pentru ofertă și preț
- Champion Routine completă (4 domenii)
- Sistem de planificare săptămânală Door
- Stacks (Furie, Claritate, Focus) pentru reset rapid
- Jurnal de progres și rapoarte săptămânale

🔹 PRO - €97/lună (Cel Mai Popular, normal €197)
- Tot ce include Basic
- Coaching de grup săptămânal LIVE cu Alin Radu
- Comunitate VIP cu membri Pro
- Sesiuni Q&A exclusive
- Sprint de 90 de zile cu KPIs
- Acces prioritar la funcționalități noi
- Support VIP dedicat

🔹 ELITE - €297/lună (Tot Inclus, normal €500)
- Tot ce include Pro
- Warrior Launch Accelerator (€497 valoare)
- 47+ lecții video premium
- Framework de implementare pe 90 de zile
- Acces prioritar la toate cursurile noi
- Coaching 1-on-1 lunar (30 min)

PLANURI ANUALE (60% reducere blocată):
- Basic Anual: €399/an (economisești €765)
- Pro Anual: €970/an (economisești €1394)
- Elite Anual: €2970/an (economisești €3030)
`;

const FAQ_KNOWLEDGE = `
ÎNTREBĂRI FRECVENTE:

1. Cât durează să văd rezultate?
→ Claritate în 48 ore prin Reality Map. Rezultate majore în 2-3 săptămâni cu rutina completă.

2. Funcționează pentru orice tip de business?
→ Da! Sistemul se adaptează pentru freelanceri, agenții, consultanți, coaches, SaaS.

3. Cât timp trebuie să investesc zilnic?
→ 15-20 min dimineața (Champion Routine) + 10 min seara (reflecție). Total ~30 min/zi.

4. Ce garanții oferiți?
→ 7 zile garanție completă - dacă nu ești mulțumit, primești 100% banii înapoi.

5. Cum mă ajută AI Coach-ul?
→ Ghidare 24/7 personalizată: setare oferte, pricing, claritate obiective, depășire blocaje.

6. Funcționează pe mobil?
→ Da, platforma e optimizată pentru toate dispozitivele.

7. Trial gratuit?
→ Da! 7 zile trial complet fără card. Testează tot înainte să te decizi.
`;

const OBJECTION_HANDLERS = `
OBIECȚII ȘI RĂSPUNSURI:

"E prea scump"
→ Un coach uman costă €200+/oră. WarriorOS oferă coaching AI 24/7 + rutine + comunitate pentru €49-97/lună. ROI în primele 2 săptămâni prin claritate și focus.

"Nu am timp"
→ Doar 25-30 min/zi. Cel mai important: îți SALVEZI ore prin eliminarea confuziei și haosului. Timpul investit se întoarce multiplicat.

"Nu știu dacă funcționează pentru mine"
→ De aceea avem 7 zile trial gratuit + garanție banii înapoi. Zero risc pentru tine.

"Am încercat alte aplicații și nu au funcționat"
→ WarriorOS nu e o aplicație - e un SISTEM complet: AI Coaching + Rutine zilnice + Planificare săptămânală + Comunitate. Diferența e integrarea.

"Prefer să lucrez singur"
→ Sistemul te ajută să lucrezi MAI EFICIENT singur. AI-ul și rutinele sunt tool-uri, nu înlocuitori. Tu rămâi la control.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'ro' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = language === 'ro' ? `
Tu ești Consultantul Virtual WarriorOS - ajuți vizitatorii să înțeleagă cum platforma îi poate transforma viața și business-ul.

🎯 OBIECTIVUL TĂU:
1. Răspunde SCURT și RELEVANT la orice întrebare
2. Conectează nevoile vizitatorului cu beneficii concrete
3. Ghidează natural spre trial sau abonament
4. Depășește obiecții cu empatie și dovezi

${PRICING_KNOWLEDGE}

${FAQ_KNOWLEDGE}

${OBJECTION_HANDLERS}

📋 REGULI STRICTE:
- Răspunsuri SCURTE: max 2-3 propoziții + 1 CTA
- ÎNTOTDEAUNA include un link la final
- Link-uri disponibile:
  • /auth - pentru signup/trial
  • /pricing - pentru prețuri detaliate  
  • /support - pentru contact/întrebări complexe
  • /challenge - pentru Challenge gratuit 7 zile
- Ton: prietenos, consultativ, nu agresiv
- Folosește emoji-uri moderat pentru engagement
- Dacă nu știi ceva, ghidează spre /support

💡 EXEMPLE DE RĂSPUNSURI BUNE:

Întrebare: "Cât costă?"
Răspuns: "Avem 3 planuri: Basic (€49), Pro (€97 - cel mai popular cu coaching LIVE), și Elite (€297 cu totul inclus). Toate au 7 zile trial gratuit! 🎯 Vezi detaliile pe [/pricing](/pricing)"

Întrebare: "Pentru cine e potrivit?"
Răspuns: "Pentru antreprenori ocupați care vor claritate fără să sacrifice familia sau sănătatea. Freelanceri, consultanți, coaches - oricine vrea un sistem care funcționează. 💪 Încearcă gratuit pe [/auth](/auth)"

Întrebare: "Cum începi?"
Răspuns: "Super simplu: creezi cont în 30 secunde, completezi Reality Map (5 min), și primești planul tău personalizat. Trial 7 zile, fără card! 🚀 Start pe [/auth](/auth)"
` : `
You are the WarriorOS Virtual Consultant - you help visitors understand how the platform can transform their life and business.

🎯 YOUR OBJECTIVE:
1. Answer SHORT and RELEVANT to any question
2. Connect visitor needs with concrete benefits
3. Naturally guide toward trial or subscription
4. Overcome objections with empathy and proof

${PRICING_KNOWLEDGE}

${FAQ_KNOWLEDGE}

${OBJECTION_HANDLERS}

📋 STRICT RULES:
- SHORT answers: max 2-3 sentences + 1 CTA
- ALWAYS include a link at the end
- Available links:
  • /auth - for signup/trial
  • /pricing - for detailed pricing
  • /support - for contact/complex questions
  • /challenge - for free 7-day Challenge
- Tone: friendly, consultative, not aggressive
- Use emojis moderately for engagement
- If unsure, guide to /support

💡 GOOD RESPONSE EXAMPLES:

Question: "How much does it cost?"
Answer: "We have 3 plans: Basic (€49), Pro (€97 - most popular with LIVE coaching), and Elite (€297 all-inclusive). All have 7-day free trial! 🎯 See details at [/pricing](/pricing)"

Question: "Who is it for?"
Answer: "For busy entrepreneurs who want clarity without sacrificing family or health. Freelancers, consultants, coaches - anyone who wants a system that works. 💪 Try free at [/auth](/auth)"
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6) // Keep last 6 messages for context
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'rate_limit',
          response: language === 'ro' 
            ? 'Momentan sunt foarte ocupat. Te rog încearcă din nou în câteva secunde! 🙏'
            : 'Currently very busy. Please try again in a few seconds! 🙏'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'payment_required',
          response: language === 'ro'
            ? 'Serviciul AI nu este disponibil momentan. Contactează-ne pe [/support](/support)!'
            : 'AI service is currently unavailable. Contact us at [/support](/support)!'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 
      (language === 'ro' 
        ? 'Îmi pare rău, am întâmpinat o problemă. Te rog încearcă din nou!'
        : 'Sorry, I encountered an issue. Please try again!');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sales coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: 'Îmi pare rău, am întâmpinat o problemă. Contactează-ne pe /support pentru ajutor!'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
