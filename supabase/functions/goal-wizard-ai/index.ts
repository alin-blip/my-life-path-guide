import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GoalData {
  objective?: string;
  why?: string;
  positiveImpact?: string;
  negativeConsequence?: string;
  milestones?: {
    annual?: string;
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    threeMonths?: string;
    monthly?: string;
    oneMonth?: string;
    weekOne?: string;
  };
}

const STEP_PROMPTS: Record<string, { ro: string; en: string }> = {
  objective: {
    ro: 'Utilizatorul tocmai și-a definit obiectivul principal. Extrage obiectivul din răspuns și întreabă DE CE vrea să realizeze acest lucru. Fii empatic și curioasă despre motivația lor profundă.',
    en: 'The user just defined their main objective. Extract the objective and ask WHY they want to achieve this. Be empathetic and curious about their deep motivation.'
  },
  why: {
    ro: 'Utilizatorul a explicat motivația. Extrage motivul și întreabă: "Imaginează-ți că ai reușit. Cum arată viața ta? Ce se schimbă? Cum afectează celelalte arii din viața ta?"',
    en: 'The user explained their motivation. Extract it and ask: "Imagine you succeeded. How does your life look? What changes? How does it affect other areas of your life?"'
  },
  positive_impact: {
    ro: 'Utilizatorul a descris impactul pozitiv. Extrage-l și întreabă despre cealaltă față: "Și acum, ce se întâmplă dacă nu reușești? Ce pierzi? Ce riști?"',
    en: 'The user described positive impact. Extract it and ask about the flip side: "Now, what happens if you don\'t succeed? What do you lose? What do you risk?"'
  },
  negative_impact: {
    ro: 'Utilizatorul a descris consecințele negative. Extrage-le și spune: "Perfect. Acum să setăm milestone-uri concrete. La finalul celor 3 luni (primul Quartely), unde trebuie să fii? Ce progres măsurabil trebuie să existe?"',
    en: 'The user described negative consequences. Extract them and say: "Perfect. Now let\'s set concrete milestones. By the end of 3 months (first Quarter), where do you need to be? What measurable progress should exist?"'
  },
  milestone_3m: {
    ro: 'Utilizatorul a definit milestone-ul de 3 luni (Q1). Extrage-l și întreabă: "Excelent! Și la finalul primei luni, ce progres trebuie să existe pentru a fi pe drumul cel bun?"',
    en: 'The user defined the 3-month milestone (Q1). Extract it and ask: "Excellent! And by the end of the first month, what progress needs to exist to be on track?"'
  },
  milestone_1m: {
    ro: 'Utilizatorul a definit milestone-ul de 1 lună. Extrage-l și întreabă: "Foarte bine! Și acum, cel mai important: ce acțiune SPECIFICĂ vei face în PRIMA SĂPTĂMÂNĂ? Când exact? Cât timp vei aloca?"',
    en: 'The user defined the 1-month milestone. Extract it and ask: "Great! Now, most importantly: what SPECIFIC action will you take in the FIRST WEEK? When exactly? How much time will you allocate?"'
  },
  week1_action: {
    ro: 'Utilizatorul a definit acțiunea pentru prima săptămână. Extrage-o și creează un rezumat complet al obiectivului, motivației, impactului, și milestone-urilor. Încheie cu: "Ești gata să salvezi acest obiectiv?"',
    en: 'The user defined week 1 action. Extract it and create a complete summary of the objective, motivation, impact, and milestones. End with: "Are you ready to save this goal?"'
  }
};

const CATEGORY_NAMES: Record<string, { ro: string; en: string }> = {
  body: { ro: 'Corp', en: 'Body' },
  being: { ro: 'Ființă', en: 'Being' },
  balance: { ro: 'Echilibru', en: 'Balance' },
  business: { ro: 'Business', en: 'Business' }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, step, messages, currentGoalData, language, missionType } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const lang = language as 'en' | 'ro';
    const categoryName = CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]?.[lang] || category;
    const stepPrompt = STEP_PROMPTS[step as keyof typeof STEP_PROMPTS]?.[lang] || '';
    const periodText = missionType === 'annual' 
      ? (lang === 'en' ? '12 months' : '12 luni')
      : (lang === 'en' ? '90 days' : '90 de zile');

    const cascadeInstructions = missionType === 'annual' 
      ? (language === 'en' 
          ? `\n\nIMPORTANT CASCADE STRUCTURE: When the user saves this goal, it will automatically create:
- 1 Annual Goal (12 months)
- 1 Quarterly Goal (Q1 - first 90 days, derived from annual)
- 1 Monthly Goal (Month 1, derived from Q1)
- Weekly Tasks (derived from month 1)

So when extracting milestones, think about this hierarchy:
- annual: The full year objective
- threeMonths/q1: What should be achieved by end of Q1 (90 days)
- oneMonth/monthly: What should be achieved by end of Month 1
- weekOne: Specific action for Week 1`
          : `\n\nIMPORTANT STRUCTURA CASCADĂ: Când utilizatorul salvează acest obiectiv, se vor crea automat:
- 1 Obiectiv Anual (12 luni)
- 1 Obiectiv Trimestrial (Q1 - primele 90 zile, derivat din anual)
- 1 Obiectiv Lunar (Luna 1, derivat din Q1)
- Task-uri Săptămânale (derivate din luna 1)

Când extragi milestone-uri, gândește-te la această ierarhie:
- annual: Obiectivul complet pe un an
- threeMonths/q1: Ce trebuie atins la finalul Q1 (90 zile)
- oneMonth/monthly: Ce trebuie atins la finalul Lunii 1
- weekOne: Acțiune specifică pentru Săptămâna 1`)
      : '';

    const systemPrompt = language === 'en' 
      ? `You are a supportive goal-setting coach helping users define deep, meaningful objectives for their ${categoryName} area over the next ${periodText}.

Your role:
1. Guide the conversation step by step
2. Be empathetic, encouraging, and insightful
3. Ask deep questions that help users clarify their vision
4. Extract structured data from their responses
5. Keep responses concise but warm (2-4 sentences max, unless summarizing)
${cascadeInstructions}

Current step: ${step}
${stepPrompt}

Current goal data collected so far:
${JSON.stringify(currentGoalData, null, 2)}

IMPORTANT: Your response must be in JSON format with these fields:
{
  "message": "Your response to show the user (in ${language === 'en' ? 'English' : 'Romanian'})",
  "nextStep": "the next step ID (objective, why, positive_impact, negative_impact, milestone_3m, milestone_1m, week1_action, or confirmation)",
  "extractedData": { extracted goal data fields },
  "isComplete": false
}

For extractedData, use these field names:
- objective: Main goal statement
- why: Deep motivation
- positiveImpact: What success looks like
- negativeConsequence: What failure costs
- milestones.annual: Full year target (for annual missions)
- milestones.threeMonths: Q1 target (90 days)
- milestones.oneMonth: First month target
- milestones.weekOne: First week specific action`
      : `Ești un coach de stabilire obiective care ajută utilizatorii să definească obiective profunde și semnificative pentru aria ${categoryName} pe următoarele ${periodText}.

Rolul tău:
1. Ghidează conversația pas cu pas
2. Fii empatic, încurajator și perspicace
3. Pune întrebări profunde care îi ajută să-și clarifice viziunea
4. Extrage date structurate din răspunsurile lor
5. Păstrează răspunsurile concise dar calde (2-4 propoziții maxim, cu excepția rezumatelor)
${cascadeInstructions}

Pasul curent: ${step}
${stepPrompt}

Date obiectiv colectate până acum:
${JSON.stringify(currentGoalData, null, 2)}

IMPORTANT: Răspunsul tău trebuie să fie în format JSON cu aceste câmpuri:
{
  "message": "Răspunsul tău către utilizator (în Română)",
  "nextStep": "ID-ul pasului următor (objective, why, positive_impact, negative_impact, milestone_3m, milestone_1m, week1_action, sau confirmation)",
  "extractedData": { câmpurile de date extrase },
  "isComplete": false
}

Pentru extractedData, folosește aceste nume de câmpuri:
- objective: Declarația obiectivului principal
- why: Motivația profundă
- positiveImpact: Cum arată succesul
- negativeConsequence: Costul eșecului
- milestones.annual: Ținta pe un an întreg (pentru misiuni anuale)
- milestones.threeMonths: Ținta Q1 (90 zile)
- milestones.oneMonth: Ținta primei luni
- milestones.weekOne: Acțiunea specifică prima săptămână`;

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
          ...messages
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Fallback response
      parsed = {
        message: content,
        nextStep: step,
        extractedData: {},
        isComplete: false
      };
    }

    // Handle nested milestones in extractedData
    if (parsed.extractedData) {
      const extracted = parsed.extractedData;
      const hasMilestoneFields = extracted['milestones.annual'] || 
                                  extracted['milestones.threeMonths'] || 
                                  extracted['milestones.oneMonth'] || 
                                  extracted['milestones.weekOne'];
      
      if (hasMilestoneFields) {
        extracted.milestones = {
          annual: extracted['milestones.annual'] || currentGoalData?.milestones?.annual || '',
          threeMonths: extracted['milestones.threeMonths'] || currentGoalData?.milestones?.threeMonths || '',
          oneMonth: extracted['milestones.oneMonth'] || currentGoalData?.milestones?.oneMonth || '',
          weekOne: extracted['milestones.weekOne'] || currentGoalData?.milestones?.weekOne || ''
        };
        delete extracted['milestones.annual'];
        delete extracted['milestones.threeMonths'];
        delete extracted['milestones.oneMonth'];
        delete extracted['milestones.weekOne'];
      }
    }

    console.log('Goal wizard response:', parsed);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Goal wizard error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
