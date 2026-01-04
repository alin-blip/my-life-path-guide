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

interface GoalProject {
  id: string;
  name: string;
  milestones: {
    threeMonths: string;
    oneMonth: string;
    weekOne: string;
  };
}

interface GoalData {
  projectCount?: number;
  projects?: GoalProject[];
  currentProjectIndex?: number;
  objective?: string;
  why?: string;
  positiveImpact?: string;
  negativeConsequence?: string;
  milestones?: {
    annual?: string;
    q1?: string;
    threeMonths?: string;
    monthly?: string;
    oneMonth?: string;
    weekOne?: string;
  };
}

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
    const periodText = missionType === 'annual' 
      ? (lang === 'en' ? '12 months' : '12 luni')
      : (lang === 'en' ? '90 days' : '90 de zile');

    // Get current project info if in project-specific steps
    const projects = currentGoalData?.projects || [];
    const currentProjectIndex = currentGoalData?.currentProjectIndex || 0;
    const currentProject = projects[currentProjectIndex];
    const totalProjects = currentGoalData?.projectCount || projects.length || 1;

    // Build step-specific instructions
    let stepInstructions = '';
    
    if (step === 'project_count') {
      stepInstructions = lang === 'en'
        ? `Ask the user how many annual objectives/projects they want to set for ${categoryName} (1-5). Be warm and enthusiastic about helping them plan multiple projects.`
        : `Întreabă utilizatorul câte obiective/proiecte anuale vrea să seteze pentru ${categoryName} (1-5). Fii cald și entuziast în a-i ajuta să planifice mai multe proiecte.`;
    } else if (step === 'project_names') {
      const collectedProjects = projects.length;
      if (collectedProjects < totalProjects) {
        const projectNum = collectedProjects + 1;
        stepInstructions = lang === 'en'
          ? `The user wants ${totalProjects} projects. You've collected ${collectedProjects} so far. Ask for project #${projectNum}: "What is your project/objective #${projectNum}?" Extract the project name from their response.`
          : `Utilizatorul vrea ${totalProjects} proiecte. Ai colectat ${collectedProjects} până acum. Întreabă despre proiectul #${projectNum}: "Care este proiectul/obiectivul #${projectNum}?" Extrage numele proiectului din răspuns.`;
      }
    } else if (step === 'why') {
      stepInstructions = lang === 'en'
        ? `The user has defined ${totalProjects} project(s): ${projects.map((p: GoalProject) => `"${p.name}"`).join(', ')}. Ask WHY these projects are important to them. What's their deep motivation?`
        : `Utilizatorul a definit ${totalProjects} proiect(e): ${projects.map((p: GoalProject) => `"${p.name}"`).join(', ')}. Întreabă DE CE sunt aceste proiecte importante pentru ei. Care e motivația lor profundă?`;
    } else if (step === 'positive_impact') {
      stepInstructions = lang === 'en'
        ? `Extract the motivation and ask about positive impact: "Imagine you succeeded with all projects. How does your life look? What changes?"`
        : `Extrage motivația și întreabă despre impactul pozitiv: "Imaginează-ți că ai reușit cu toate proiectele. Cum arată viața ta? Ce se schimbă?"`;
    } else if (step === 'negative_impact') {
      stepInstructions = lang === 'en'
        ? `Extract positive impact and ask about negative consequences: "And what happens if you don't succeed? What do you lose?"`
        : `Extrage impactul pozitiv și întreabă despre consecințele negative: "Și ce se întâmplă dacă nu reușești? Ce pierzi?"`;
    } else if (step === 'milestone_3m') {
      const projectName = currentProject?.name || `Project ${currentProjectIndex + 1}`;
      stepInstructions = lang === 'en'
        ? `Now collect 3-month milestones per project. Current: "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Ask: "For **${projectName}**, where do you need to be at the end of 3 months (Q1)?"`
        : `Acum colectează milestone-urile de 3 luni per proiect. Curent: "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Întreabă: "Pentru **${projectName}**, unde trebuie să fii la finalul celor 3 luni (Q1)?"`;
    } else if (step === 'milestone_1m') {
      const projectName = currentProject?.name || `Project ${currentProjectIndex + 1}`;
      stepInstructions = lang === 'en'
        ? `Collect 1-month milestone for "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Ask: "For **${projectName}**, what progress needs to exist by end of month 1?"`
        : `Colectează milestone-ul de 1 lună pentru "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Întreabă: "Pentru **${projectName}**, ce progres trebuie să existe la finalul lunii 1?"`;
    } else if (step === 'week1_action') {
      const projectName = currentProject?.name || `Project ${currentProjectIndex + 1}`;
      stepInstructions = lang === 'en'
        ? `Collect week 1 action for "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Ask: "For **${projectName}**, what SPECIFIC action will you take in the FIRST WEEK?"`
        : `Colectează acțiunea pentru săptămâna 1 pentru "${projectName}" (${currentProjectIndex + 1}/${totalProjects}). Întreabă: "Pentru **${projectName}**, ce acțiune SPECIFICĂ vei face în PRIMA SĂPTĂMÂNĂ?"`;
    } else if (step === 'confirmation') {
      const projectsSummary = projects.map((p: GoalProject, i: number) => 
        `${i + 1}. ${p.name}\n   - 3 luni: ${p.milestones?.threeMonths || 'N/A'}\n   - 1 lună: ${p.milestones?.oneMonth || 'N/A'}\n   - Săpt. 1: ${p.milestones?.weekOne || 'N/A'}`
      ).join('\n\n');
      
      stepInstructions = lang === 'en'
        ? `Create a complete summary of ALL projects with their milestones. End with: "Are you ready to save these objectives?"\n\nProjects:\n${projectsSummary}`
        : `Creează un rezumat complet al TUTUROR proiectelor cu milestone-urile lor. Încheie cu: "Ești gata să salvezi aceste obiective?"\n\nProiecte:\n${projectsSummary}`;
    }

    const systemPrompt = lang === 'en' 
      ? `You are a supportive goal-setting coach helping users define deep, meaningful objectives for their ${categoryName} area over the next ${periodText}.

Your role:
1. Guide the conversation step by step
2. Be empathetic, encouraging, and insightful
3. Support MULTIPLE projects/objectives (1-5 per category)
4. Ask questions ONE PROJECT AT A TIME for milestones
5. Keep responses concise but warm (2-4 sentences max, unless summarizing)

Current step: ${step}
${stepInstructions}

Current goal data:
${JSON.stringify(currentGoalData, null, 2)}

IMPORTANT: Your response must be in JSON format:
{
  "message": "Your response in ${lang === 'en' ? 'English' : 'Romanian'}",
  "nextStep": "step ID (project_count, project_names, why, positive_impact, negative_impact, milestone_3m, milestone_1m, week1_action, or confirmation)",
  "extractedData": {
    "projectCount": number (if extracting count),
    "newProjectName": "project name" (if extracting a project name),
    "currentProjectIndex": number (for milestone steps),
    "projectMilestone": { "threeMonths": "", "oneMonth": "", "weekOne": "" } (milestone for current project),
    "why": "motivation",
    "positiveImpact": "positive impact",
    "negativeConsequence": "negative consequences"
  },
  "isComplete": false,
  "shouldAdvanceProject": true/false (set true after collecting current project's milestone to move to next project)
}`
      : `Ești un coach de stabilire obiective care ajută utilizatorii să definească obiective profunde și semnificative pentru aria ${categoryName} pe următoarele ${periodText}.

Rolul tău:
1. Ghidează conversația pas cu pas
2. Fii empatic, încurajator și perspicace
3. Suportă MULTIPLE proiecte/obiective (1-5 per categorie)
4. Pune întrebări PENTRU UN SINGUR PROIECT la un moment dat pentru milestone-uri
5. Păstrează răspunsurile concise dar calde (2-4 propoziții maxim, cu excepția rezumatelor)

Pasul curent: ${step}
${stepInstructions}

Date obiectiv colectate:
${JSON.stringify(currentGoalData, null, 2)}

IMPORTANT: Răspunsul tău trebuie să fie în format JSON:
{
  "message": "Răspunsul tău în Română",
  "nextStep": "ID pas (project_count, project_names, why, positive_impact, negative_impact, milestone_3m, milestone_1m, week1_action, sau confirmation)",
  "extractedData": {
    "projectCount": number (dacă extragi numărul),
    "newProjectName": "numele proiectului" (dacă extragi un nume de proiect),
    "currentProjectIndex": number (pentru pașii de milestone),
    "projectMilestone": { "threeMonths": "", "oneMonth": "", "weekOne": "" } (milestone pentru proiectul curent),
    "why": "motivația",
    "positiveImpact": "impactul pozitiv",
    "negativeConsequence": "consecințele negative"
  },
  "isComplete": false,
  "shouldAdvanceProject": true/false (setează true după ce colectezi milestone-ul proiectului curent pentru a trece la următorul)
}`;

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
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Try to extract message from raw content if it looks like JSON
      const messageMatch = content.match(/"message"\s*:\s*"([^"]+(?:\\.[^"]*)*)"/)
      const extractedMessage = messageMatch ? messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : content;
      
      parsed = {
        message: extractedMessage,
        nextStep: step,
        extractedData: {},
        isComplete: false
      };
    }

    // Ensure message is a clean string, not JSON
    if (parsed.message && typeof parsed.message === 'string') {
      // Check if message accidentally contains JSON
      if (parsed.message.startsWith('{') && parsed.message.includes('"message"')) {
        try {
          const innerParsed = JSON.parse(parsed.message);
          if (innerParsed.message) {
            parsed.message = innerParsed.message;
            if (innerParsed.nextStep) parsed.nextStep = innerParsed.nextStep;
            if (innerParsed.extractedData) parsed.extractedData = innerParsed.extractedData;
            if (innerParsed.isComplete !== undefined) parsed.isComplete = innerParsed.isComplete;
            if (innerParsed.shouldAdvanceProject !== undefined) parsed.shouldAdvanceProject = innerParsed.shouldAdvanceProject;
          }
        } catch {
          // Keep original message if inner parse fails
        }
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
