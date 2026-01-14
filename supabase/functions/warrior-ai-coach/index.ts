import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LessonContent {
  module_id: string;
  title: string;
  summary: string;
  full_script: string;
  section_id: string;
  order_number: number;
  key_concepts: string[];
  action_prompts: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, conversationHistory = [] } = await req.json();
    
    if (!question || typeof question !== 'string') {
      throw new Error('Question is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all lessons for comprehensive knowledge base
    const { data: allLessons, error: lessonsError } = await supabase
      .from('warriors_way_lesson_content')
      .select('module_id, title, summary, full_script, section_id, order_number, key_concepts, action_prompts')
      .order('order_number');
    
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw new Error('Failed to fetch knowledge base');
    }

    const lessons = allLessons as LessonContent[] || [];
    
    // Build a comprehensive knowledge context with ALL lessons
    const knowledgeContext = lessons.map(lesson => {
      const concepts = Array.isArray(lesson.key_concepts) ? lesson.key_concepts.join(', ') : '';
      const actions = Array.isArray(lesson.action_prompts) ? lesson.action_prompts.join('; ') : '';
      
      return `
═══════════════════════════════════════════════
📚 LECȚIA ${lesson.order_number}: ${lesson.title}
📍 ID Modul: ${lesson.module_id}
📍 Secțiune: ${lesson.section_id?.toUpperCase() || 'INTRO'}
═══════════════════════════════════════════════

📝 REZUMAT:
${lesson.summary || 'Nu există rezumat'}

💡 CONCEPTE CHEIE:
${concepts || 'Nu există concepte'}

🎯 ACȚIUNI RECOMANDATE:
${actions || 'Nu există acțiuni'}

📖 SCRIPTUL COMPLET AL LECȚIEI:
${lesson.full_script || 'Nu există script'}
`;
    }).join('\n\n');

    // Create a structured list of lessons for quick reference
    const lessonsQuickRef = lessons.map(l => 
      `${l.order_number}. ${l.title} (${l.module_id})`
    ).join('\n');

    const systemPrompt = `Ești Mentorul Warrior AI - un ghid înțelept, empatic și motivant în Calea Războinicului, sistemul creat de Alin F. Radu.

═══════════════════════════════════════════════
🎓 STRUCTURA CURSULUI WARRIORS WAY - MODULUL INTRO:
═══════════════════════════════════════════════
${lessonsQuickRef}

═══════════════════════════════════════════════
📚 BAZA TA DE CUNOȘTINȚE COMPLETĂ:
═══════════════════════════════════════════════
${knowledgeContext}

═══════════════════════════════════════════════
📋 INSTRUCȚIUNI PENTRU RĂSPUNSURI:
═══════════════════════════════════════════════

🎯 ROLUL TĂU:
- Ești un mentor care ghidează războinicii în călătoria lor de transformare
- Răspunzi empatic dar direct, ca un antrenor care îți pasă de progresul elevului
- Cunoști în detaliu toate cele 7 lecții din modulul introductiv

📝 REGULI DE RĂSPUNS:
1. RĂSPUNDE MEREU bazându-te pe informațiile din lecțiile de mai sus
2. CITEAZĂ DIRECT din scripturi când e relevant - pune între ghilimele și menționează lecția
3. CONECTEAZĂ răspunsul la conceptele cheie din lecții
4. RECOMANDĂ lecții specifice pentru aprofundare
5. FOLOSEȘTE exemplele și metaforele din scripturi (groapa, regele, războinicul etc.)

📌 FORMAT RĂSPUNS:
- Salută cald și recunoaște întrebarea
- Răspuns clar bazat pe cunoștințele din curs
- 📖 Citat relevant din lecție (dacă există)
- 🎯 Acțiune concretă de implementat
- 📚 Lecții recomandate pentru aprofundare

⚠️ IMPORTANT:
- Răspunde DOAR în română
- Nu inventa informații care nu sunt în lecții
- Dacă întrebarea e în afara cursului, ghidează înapoi la principiile Warriors Way
- Fii încurajator și motivant, dar nu fals pozitiv
- Folosește emoji-uri moderat pentru căldură
- Menționează întotdeauna că pot accesa lecțiile din pagina Warriors Way`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for better context
      { role: 'user', content: question }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          response: 'Prea multe cereri. Te rog așteaptă un moment și încearcă din nou.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required',
          response: 'Serviciul AI necesită credite suplimentare.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Nu am putut genera un răspuns. Te rog să încerci din nou.';

    // Return all lessons as relevant for better navigation suggestions
    return new Response(JSON.stringify({ 
      response: aiResponse,
      relevantLessons: lessons.map(l => ({
        moduleId: l.module_id,
        title: l.title,
        section: l.section_id,
        order: l.order_number
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Warrior AI Coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      response: 'Îmi pare rău, a apărut o eroare. Te rog să încerci din nou.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
