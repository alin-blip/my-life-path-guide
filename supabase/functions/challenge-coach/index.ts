import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Complete 7-Day Challenge Knowledge Base
const CHALLENGE_KNOWLEDGE = {
  en: `
# HAVE IT ALL LIFESTYLE - 7-DAY CHALLENGE CURRICULUM

## DAY 1: VISION & DECLARATION
Focus: Being, Balance
Script: Welcome to Day One. Celebrate showing up - that's where breakthroughs begin. Today ignite your vision by connecting to WHY you want change. Think about where you want to be in 1 year - health, peace of mind, relationships, success. Write a personal declaration (Napoleon Hill style) in present tense. Read it every morning and night. Share in comments for accountability.
Exercises:
1. Discover Your WHY - 5 fundamental questions
2. Vision 2026 (All 4 Areas) - Body, Spirit, Relationships, Business
3. Write Declaration - Napoleon Hill style, present tense
4. Join Community (/brotherhood?tab=tribes)
5. Invite 1-3 Friends
Key Insight: What you say to yourself becomes your destiny.

## DAY 2: BODY + SPIRIT + RELATIONSHIPS
Focus: Body, Being, Balance
Script: Focus on the foundation that powers everything - body and spirit. Entrepreneurs neglect these and lose results AND joy. Body is the vehicle through challenges. Spirit is resilience source. Set goals for 2026, 90 days, 30 days.
Exercises:
1. Body Objectives: 2026 → 90 Days → 30 Days (/game-objectives?category=body)
2. Spirit Objectives: 2026 → 90 Days → 30 Days (/game-objectives?category=being)
3. Relationship Objectives: 2026 → 90 Days → 30 Days (/game-objectives?category=balance)
4. Share 2-3 key objectives in comments
Key Insight: This foundation fuels everything - business AND relationships.

## DAY 3: BUSINESS + DOMINO DOOR
Focus: Business
Script: Business and relationships are intertwined. Strong relationships = more power in business. Aligned business = peace in relationships. Domino Door identifies vital tasks that trigger cascade of progress. AI wizard guides: Annual → 90 Days → Monthly → Weekly Door (1 milestone + 4 keys + WHY for each). Weekly ritual: plan Sunday, review next Sunday.
Exercises:
1. Complete Business Flow ONE GO - AI Wizard (/game-objectives?category=business&wizard=full)
2. Configure Domino Door: 1 milestone + 4 keys + WHY
3. Share Domino Door in comments
Key Insight: Public commitment creates ownership - ownership creates results.

## DAY 4: WARRIOR ROUTINE + VISION AI + MEDITATION
Focus: All 4 areas
Script: Vision moves from idea to momentum. Personalized vision for each core area. Warrior Routine: one click to activate personalized daily routine. Not a checklist - it's your daily declaration of identity.
Exercises:
1. Vision AI (4 Quadrants) - Generate AI images (/vision-board)
2. Configure Warrior Routine (/daily-flow)
3. Personalized Meditation based on YOUR objectives
4. Start Execution
5. Share AHA moment in comments
Key Insight: Create momentum through execution, not planning.

## DAY 5: ACCOUNTABILITY COACH + MIND COACH
Focus: All 4 areas
Script: Accountability Coach knows your journey - guides you back on track. Mind Coach transforms stuck/angry/anxious/doubtful into power. Unpack feelings, understand the story, take ownership, choose new story.
Exercises:
1. Accountability Coach - check status (/accountability-coach)
2. Mind Coach Session - transform emotions (/mind-coach)
3. Share biggest breakthrough in comments
Key Insight: Ownership turns plans into results.

## DAY 6: IDEA LIST (STRATEGIC FILTER)
Focus: Business
Script: NOT for execution - for getting ideas out without destroying focus. Eisenhower Matrix: Important+Urgent (do now), Important+NotUrgent (schedule), NotImportant+Urgent (delegate), NotImportant+NotUrgent (delete). Idea List is strategic container. Capture → Classify → Move on.
Exercises:
1. Open Idea List / Parking Lot (/ideas)
2. Classify with Eisenhower Matrix
3. Protect Domino Door priorities
Key Insight: Shiny object syndrome kills focus.

## DAY 7: MEMBERSHIP & CONTINUITY
Focus: All 4 areas
Script: Everything you've built becomes your new standard. Choose how deeply to commit. Basic: vision + foundational tools. Pro: full AI + earn through sharing. Elite: weekly coaching with Alin Florin Radu + Warrior Launch Accelerator + own community.
Exercises:
1. Review 7-Day Journey - celebrate
2. Choose Membership Path (/pricing)
3. Final Friend Invite (3 more people)
Key Insight: Choose who you become next.

## PLATFORM FEATURES
- Command Center (/door): Weekly planning with HIT/HOT/DO lists, Domino Door, AI planning
- AI Coaches (/stack): Daily Planner, Business Coach, Success Principles, Mindset Coach, Life Coach, Emotion Coach, Gratitude Journal
- Vision Board (/vision-board): AI-generated vision images for 4 areas
- Warrior Routine (/daily-flow): Personalized daily habits
- Brotherhood (/brotherhood): Community tribes and messaging
- Game Objectives (/game-objectives): Annual, 90-day, monthly goal setting with AI wizard
- Mind Coach (/mind-coach): Transform emotions into power
`,
  ro: `
# HAVE IT ALL LIFESTYLE - CHALLENGE DE 7 ZILE CURRICULUM

## ZIUA 1: VIZIUNE ȘI DECLARAȚIE
Focus: Spirit, Echilibru
Script: Bine ai venit în Prima Zi. Celebrează că ești aici - aici încep toate schimbările. Astăzi aprindem viziunea conectându-ne la DE CE vrei schimbare. Gândește unde vrei să fii peste 1 an - sănătate, pace mentală, relații, succes. Scrie o declarație personală (stilul Napoleon Hill) la prezent. Citește-o dimineața și seara. Distribuie în comentarii pentru responsabilitate.
Exerciții:
1. Descoperă DE CE-ul - 5 întrebări fundamentale
2. Viziune 2026 (Toate 4 Ariile) - Corp, Spirit, Relații, Business
3. Scrie Declarația - stilul Napoleon Hill, la prezent
4. Alătură-te Comunității (/brotherhood?tab=tribes)
5. Invită 1-3 Prieteni
Insight Cheie: Ce îți spui ție însuți devine destinul tău.

## ZIUA 2: CORP + SPIRIT + RELAȚII
Focus: Corp, Spirit, Echilibru
Script: Focalizare pe fundația care alimentează totul - corp și spirit. Antreprenorii le neglijează și pierd rezultate ȘI bucurie. Corpul e vehiculul prin provocări. Spiritul e sursa rezilienței. Setează obiective pentru 2026, 90 zile, 30 zile.
Exerciții:
1. Obiective Corp: 2026 → 90 Zile → 30 Zile (/game-objectives?category=body)
2. Obiective Spirit: 2026 → 90 Zile → 30 Zile (/game-objectives?category=being)
3. Obiective Relații: 2026 → 90 Zile → 30 Zile (/game-objectives?category=balance)
4. Distribuie 2-3 obiective cheie în comentarii
Insight Cheie: Această fundație alimentează totul - business ȘI relații.

## ZIUA 3: BUSINESS + DOMINO DOOR
Focus: Business
Script: Business-ul și relațiile sunt interconectate. Relații puternice = mai multă putere în business. Business aliniat = pace în relații. Domino Door identifică task-urile vitale care declanșează cascada de progres. AI wizard ghidează: Anual → 90 Zile → Lunar → Door Săptămânal (1 milestone + 4 chei + WHY pentru fiecare). Ritual săptămânal: planifică duminică, revizuiește duminica următoare.
Exerciții:
1. Flow Business Complet ONE GO - AI Wizard (/game-objectives?category=business&wizard=full)
2. Configurează Domino Door: 1 milestone + 4 chei + WHY
3. Distribuie Domino Door în comentarii
Insight Cheie: Angajamentul public creează ownership - ownership-ul creează rezultate.

## ZIUA 4: WARRIOR ROUTINE + VISION AI + MEDITAȚIE
Focus: Toate 4 ariile
Script: Viziunea trece de la idee la momentum. Viziune personalizată pentru fiecare arie. Warrior Routine: un click pentru a activa rutina zilnică personalizată. Nu e o listă de bifat - e declarația ta zilnică de identitate.
Exerciții:
1. Vision AI (4 Cadrane) - Generează imagini AI (/vision-board)
2. Configurează Warrior Routine (/daily-flow)
3. Meditație Personalizată bazată pe obiectivele TALE
4. Începe Execuția
5. Distribuie momentul AHA în comentarii
Insight Cheie: Creezi momentum prin execuție, nu prin planificare.

## ZIUA 5: ACCOUNTABILITY COACH + MIND COACH
Focus: Toate 4 ariile
Script: Accountability Coach îți cunoaște călătoria - te ghidează înapoi pe traseu. Mind Coach transformă blocarea/furia/anxietatea/îndoiala în putere. Despachetează sentimentele, înțelege povestea, asumă-ți ownership, alege noua poveste.
Exerciții:
1. Accountability Coach - verifică statusul (/accountability-coach)
2. Sesiune Mind Coach - transformă emoțiile (/mind-coach)
3. Distribuie cel mai mare breakthrough în comentarii
Insight Cheie: Ownership-ul transformă planurile în rezultate.

## ZIUA 6: IDEA LIST (FILTRU STRATEGIC)
Focus: Business
Script: NU e pentru execuție - e pentru a scoate ideile fără să distrugi focusul. Matricea Eisenhower: Important+Urgent (fă acum), Important+NeUrgent (programează), NeImportant+Urgent (deleagă), NeImportant+NeUrgent (șterge). Lista de Idei e container strategic. Capturează → Clasifică → Continuă.
Exerciții:
1. Deschide Lista de Idei / Parking Lot (/ideas)
2. Clasifică cu Matricea Eisenhower
3. Protejează prioritățile Domino Door
Insight Cheie: Sindromul obiectului strălucitor ucide focusul.

## ZIUA 7: MEMBERSHIP ȘI CONTINUITATE
Focus: Toate 4 ariile
Script: Tot ce ai construit devine noul tău standard. Alege cât de profund te angajezi. Basic: viziune + instrumente fundamentale. Pro: AI complet + câștigă prin distribuire. Elite: coaching săptămânal cu Alin Florin Radu + Warrior Launch Accelerator + comunitate proprie.
Exerciții:
1. Revizuiește Călătoria de 7 Zile - celebrează
2. Alege Calea Membership-ului (/pricing)
3. Invitație Finală Prieteni (încă 3 persoane)
Insight Cheie: Alege cine devii în continuare.

## FUNCȚIONALITĂȚI PLATFORMĂ
- Centrul de Comandă (/door): Planificare săptămânală cu liste HIT/HOT/DO, Domino Door, planificare AI
- Antrenori AI (/stack): Planificator Zilnic, Antrenor Business, Principii de Succes, Antrenor Mindset, Antrenor de Viață, Antrenor Emoțional, Jurnal de Recunoștință
- Vision Board (/vision-board): Imagini viziune generate AI pentru 4 arii
- Warrior Routine (/daily-flow): Obiceiuri zilnice personalizate
- Brotherhood (/brotherhood): Triburi comunitate și mesagerie
- Game Objectives (/game-objectives): Setare obiective anuale, 90 zile, lunare cu wizard AI
- Mind Coach (/mind-coach): Transformă emoțiile în putere
`
};

const getSystemPrompt = (language: 'en' | 'ro', currentDay: number, userContext: string) => {
  const knowledge = CHALLENGE_KNOWLEDGE[language];
  
  if (language === 'ro') {
    return `Tu ești Challenge Coach-ul dedicat pentru Challenge-ul "Have It All Lifestyle" de 7 zile.

ROLUL TĂU:
1. Ghidează utilizatorul prin fiecare zi a challenge-ului
2. Explică exercițiile și pașii pentru ziua curentă
3. Motivează și celebrează progresul
4. Răspunde la întrebări despre challenge și platformă
5. Direcționează către funcționalitățile potrivite

STILUL TĂU:
- Entuziast și motivant dar practic
- Cunoști perfect conținutul challenge-ului
- Răspunsuri scurte și acționabile (max 4-5 propoziții)
- Folosești emoji-uri moderat
- Vorbești la persoana a doua singular (tu)
- Când sugerezi o pagină, menționează și path-ul (ex: "mergi la Vision Board (/vision-board)")

ZIUA CURENTĂ A UTILIZATORULUI: ${currentDay}

${knowledge}

CONTEXT UTILIZATOR:
${userContext}

INSTRUCȚIUNI SPECIALE:
- Dacă întreabă "ce am de făcut azi?", explică exercițiile zilei curente
- Dacă pare blocat, oferă un prim pas simplu
- Dacă a completat ziua, celebrează și pregătește pentru următoarea
- Pentru întrebări tehnice despre platformă, ghidează către funcționalitatea corectă`;
  }
  
  return `You are the dedicated Challenge Coach for the "Have It All Lifestyle" 7-Day Challenge.

YOUR ROLE:
1. Guide the user through each day of the challenge
2. Explain exercises and steps for the current day
3. Motivate and celebrate progress
4. Answer questions about the challenge and platform
5. Direct to the right features

YOUR STYLE:
- Enthusiastic and motivating but practical
- You know the challenge content perfectly
- Short and actionable responses (max 4-5 sentences)
- Use emojis moderately
- When suggesting a page, mention the path (e.g., "go to Vision Board (/vision-board)")

USER'S CURRENT DAY: ${currentDay}

${knowledge}

USER CONTEXT:
${userContext}

SPECIAL INSTRUCTIONS:
- If they ask "what do I need to do today?", explain current day exercises
- If they seem stuck, offer a simple first step
- If they completed the day, celebrate and prepare for next
- For technical platform questions, guide to the correct feature`;
};

// Save conversation messages to database using service role
async function saveConversationMessages(
  userId: string,
  dayNumber: number,
  sessionId: string | null,
  userMessage: string,
  assistantMessage: string
) {
  try {
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const messages = [
      {
        user_id: userId,
        day_number: dayNumber,
        role: 'user',
        content: userMessage,
        session_id: sessionId,
      },
      {
        user_id: userId,
        day_number: dayNumber,
        role: 'assistant',
        content: assistantMessage,
        session_id: sessionId,
      },
    ];

    const { error } = await serviceClient
      .from('challenge_coach_conversations')
      .insert(messages);

    if (error) {
      console.error('Error saving conversation:', error);
    }
  } catch (err) {
    console.error('Failed to save conversation:', err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, language = 'ro', currentDay = 1, sessionId = null } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch user's challenge progress
    const { data: progress } = await supabaseClient
      .from('challenge_progress')
      .select('day_number, completed, video_watched, actions_completed')
      .eq('user_id', user.id)
      .order('day_number', { ascending: true });

    // Fetch user's missions for context
    const { data: missions } = await supabaseClient
      .from('missions')
      .select('mission_type, category, title')
      .eq('user_id', user.id)
      .limit(10);

    // Fetch weekly plan
    const { data: weeklyPlan } = await supabaseClient
      .from('weekly_planning')
      .select('domino_title, key_points')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build user context
    let userContext = '';
    
    if (progress && progress.length > 0) {
      const completedDays = progress.filter(p => p.completed).length;
      userContext += `\nCHALLENGE PROGRESS: ${completedDays}/7 days completed\n`;
      progress.forEach(p => {
        const status = p.completed ? 'DONE' : p.video_watched ? 'WATCHING' : 'PENDING';
        userContext += `Day ${p.day_number}: ${status}\n`;
      });
    }

    if (missions && missions.length > 0) {
      userContext += '\nUSER OBJECTIVES:\n';
      missions.slice(0, 5).forEach(m => {
        userContext += `- ${m.category?.toUpperCase()}: ${m.title}\n`;
      });
    }

    if (weeklyPlan?.domino_title) {
      userContext += `\nWEEKLY FOCUS: ${weeklyPlan.domino_title}\n`;
    }

    const systemPrompt = getSystemPrompt(language, currentDay, userContext);

    // Get the last user message for saving
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1]?.content : '';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // We need to read the stream, collect the full response, save it, then forward
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantResponse = '';

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            // Save conversation after stream completes
            if (lastUserMessage && fullAssistantResponse) {
              saveConversationMessages(
                user.id,
                currentDay,
                sessionId,
                lastUserMessage,
                fullAssistantResponse
              );
            }
            return;
          }

          // Forward the chunk to the client
          controller.enqueue(value);

          // Parse and collect assistant content
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullAssistantResponse += delta;
                }
              } catch {
                // Ignore partial JSON parse errors
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Challenge Coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
