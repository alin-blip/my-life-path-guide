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
    
    // Search for relevant lessons in knowledge base
    // Using simple text search with multiple words
    const searchTerms = question
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .slice(0, 5) // Limit to 5 terms
      .join(' | ');
    
    let relevantLessons: any[] = [];
    
    if (searchTerms) {
      const { data, error } = await supabase
        .from('warriors_way_lesson_content')
        .select('module_id, title, summary, full_script, section_id, order_number, key_concepts, action_prompts')
        .textSearch('searchable_content', searchTerms)
        .limit(3);
      
      if (!error && data) {
        relevantLessons = data;
      }
    }
    
    // If no results from text search, try a broader approach
    if (relevantLessons.length === 0) {
      const { data } = await supabase
        .from('warriors_way_lesson_content')
        .select('module_id, title, summary, full_script, section_id, order_number, key_concepts, action_prompts')
        .limit(5);
      
      if (data) {
        relevantLessons = data;
      }
    }
    
    // Build knowledge context from relevant lessons
    const knowledgeContext = relevantLessons.map(lesson => {
      const concepts = Array.isArray(lesson.key_concepts) ? lesson.key_concepts.join(', ') : '';
      const actions = Array.isArray(lesson.action_prompts) ? lesson.action_prompts.join('; ') : '';
      const scriptPreview = lesson.full_script?.substring(0, 2000) || '';
      
      return `
═══════════════════════════════════════════════
📚 LECȚIA ${lesson.order_number}: ${lesson.title}
📍 Secțiune: ${lesson.section_id?.toUpperCase() || 'INTRO'}
🔗 Link: /warriors-way (modul ${lesson.module_id})
═══════════════════════════════════════════════

📝 REZUMAT:
${lesson.summary || 'Nu există rezumat'}

💡 CONCEPTE CHEIE:
${concepts || 'Nu există concepte'}

🎯 ACȚIUNI RECOMANDATE:
${actions || 'Nu există acțiuni'}

📖 CONȚINUT DETALIAT:
${scriptPreview}${lesson.full_script?.length > 2000 ? '...' : ''}
`;
    }).join('\n\n');

    const systemPrompt = `Ești Mentorul Warrior - un ghid înțelept și empatic în Calea Războinicului, sistemul creat de Alin F. Radu.

🎓 CUNOȘTINȚELE TALE (din lecțiile cursului Warriors Way):
${knowledgeContext || 'Nu am găsit lecții relevante în baza de cunoștințe.'}

═══════════════════════════════════════════════
📋 INSTRUCȚIUNI STRICTE:
═══════════════════════════════════════════════

1. RĂSPUNDE DOAR bazându-te pe informațiile din lecțiile de mai sus
2. Dacă întrebarea se leagă de o lecție specifică, MENȚIONEAZ-O și oferă contextul relevant
3. FOLOSEȘTE CITATE DIRECTE din scripturi când e relevant - pune-le între ghilimele
4. Dacă nu găsești informația exactă, SUGEREAZĂ lecția cea mai apropiată tematic
5. La final, RECOMANDĂ 1-2 lecții pentru aprofundare

📌 FORMAT RĂSPUNS:
- Răspuns clar și empatic la întrebare
- Citat relevant din lecție (dacă există) - marcat cu "📖"
- 🎓 **Lecții recomandate:** [lista cu titluri și numere]

⚠️ IMPORTANT:
- Răspunde în română, empatic dar direct
- Nu inventa informații care nu sunt în lecții
- Dacă nu știi ceva, spune "Această temă ar putea fi acoperită în lecțiile despre [sugestie]"
- Fii încurajator și motivant, ca un mentor adevărat
- Folosește emoji-uri moderat pentru a face răspunsul mai cald`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
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
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Nu am putut genera un răspuns. Te rog să încerci din nou.';

    return new Response(JSON.stringify({ 
      response: aiResponse,
      relevantLessons: relevantLessons.map(l => ({
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
