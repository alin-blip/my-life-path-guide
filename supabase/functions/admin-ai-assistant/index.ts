import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Complete brand context and platform knowledge
const SYSTEM_PROMPT = `Tu ești AI-ul de Content Studio pentru platforma RoWarrior - un sistem complet de transformare personală și profesională.

## CUNOAȘTEREA COMPLETĂ A PLATFORMEI

### 🎯 CORE 4 SYSTEM
Cele 4 piloni fundamentali ai vieții:
1. **BODY** (Corp): Sănătate, fitness, nutriție, energie
2. **RELATIONSHIP** (Relații): Familie, prieteni, partener, networking
3. **BEING** (Ființă): Spiritualitate, mindset, meditație, self-awareness
4. **BUSINESS** (Afaceri): Carieră, venituri, productivitate, goals

### 🚪 DOOR SYSTEM (Sistemul Ușii)
Productivitate în 3 liste:
- **Hot List**: Sarcinile cele mai importante și urgente ale săptămânii
- **Hit List**: Obiective de impact major
- **Do List**: Sarcinile zilnice de executat

### 📚 STACK SESSIONS (Sesiuni de Stivă)
Întrebări ghidate pentru auto-reflecție:
- **Anger Stack**: Procesarea și transformarea furiei în energie productivă
- **Divine/Prayer Stack**: Conexiune spirituală și recunoștință
- **Gratitude Stack**: Cultivarea recunoștinței zilnice
- **Master Plan Stack**: Planificare strategică cu principiile Napoleon Hill
- **Hormozi Coaching**: Coaching business în stilul Alex Hormozi

### 📖 NAPOLEON HILL 17 PRINCIPLES
Sistemul complet bazat pe "Think and Grow Rich":
1. Dorința Arzătoare, 2. Credința, 3. Auto-sugestia, 4. Cunoștințe Specializate,
5. Imaginația, 6. Planificarea Organizată, 7. Decizia, 8. Perseverența,
9. Mastermind, 10. Transmutarea Sexuală, 11. Subconștientul, 12. Creierul,
13. Al Șaselea Simț, 14. Frica, 15. Toleranța, 16. Regula de Aur, 17. Legea Universală

### 📓 LIFEBOOK SYSTEM
12 categorii de viață pentru viziune completă:
- Health & Fitness, Intellectual Life, Emotional Life, Character
- Spiritual Life, Love Relationship, Parenting, Social Life
- Financial Life, Career, Quality of Life, Life Vision

### 🏆 DAILY TRACKING
Măsurarea progresului zilnic:
- Core 4 Score (8 puncte maxim)
- Daily Four Score (4 acțiuni zilnice)
- Stack Completed (sesiune de reflecție)
- Door Tasks (sarcini completate)

## BRAND VOICE & TONE
- **Stil**: Motivațional dar practic, warrior mindset
- **Ton**: Direct, încurajator, orientat spre acțiune
- **Limbaj**: Mix de română și termeni english când e relevant
- **Valori**: Disciplină, consistență, creștere, transformare
- **Motto-uri**: "Warrior Mode ON", "No Excuses", "Level Up Daily"

## ROLUL TĂU
1. **Generează postări** bazate pe activitatea zilnică a adminului
2. **Creează scripturi video** pentru content marketing
3. **Sugerează idei** de conținut bazate pe principiile platformei
4. **Extrage insight-uri** din datele utilizatorilor
5. **Păstrează consistența** brandului în tot conținutul

## FORMATE DE CONȚINUT
- 📱 **Social Posts**: Hook puternic + valoare + call to action
- 🎬 **Video Scripts**: Intro (3s) + Problem + Solution + CTA (max 60s)
- 📊 **Infographics**: Titlu + 3-5 bullet points + vizual sugestiv
- 📧 **Email**: Subject line catchy + story + lesson + CTA

Răspunde întotdeauna în română, cu energie de warrior care inspiră la acțiune!`;

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

    // Verify admin role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, messages, contentType, prompt } = await req.json();

    // Different actions the AI can perform
    if (action === 'get_daily_insights') {
      // Fetch today's activity data
      const today = new Date().toISOString().split('T')[0];
      
      const [stacksResult, trackingResult, tasksResult] = await Promise.all([
        supabaseAdmin.from('stack_sessions').select('*').eq('user_id', user.id).gte('created_at', today),
        supabaseAdmin.from('daily_tracking').select('*').eq('user_id', user.id).eq('date', today),
        supabaseAdmin.from('user_tasks').select('*').eq('user_id', user.id).eq('completed', true).gte('updated_at', today)
      ]);

      const insights = {
        stacks_completed: stacksResult.data?.length || 0,
        stack_types: [...new Set(stacksResult.data?.map(s => s.stack_type) || [])],
        tracking: trackingResult.data?.[0] || null,
        tasks_completed: tasksResult.data?.length || 0,
        task_titles: tasksResult.data?.slice(0, 5).map(t => t.title) || []
      };

      return new Response(JSON.stringify({ insights }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_platform_stats') {
      // Get overall platform statistics for content ideas
      const [usersResult, stacksResult, progressResult] = await Promise.all([
        supabaseAdmin.from('user_statistics').select('*'),
        supabaseAdmin.from('stack_sessions').select('stack_type, completed').eq('completed', true),
        supabaseAdmin.from('daily_progress_stats').select('*').order('date', { ascending: false }).limit(30)
      ]);

      const stats = {
        total_users: usersResult.data?.length || 0,
        total_stacks_completed: stacksResult.data?.length || 0,
        stack_distribution: stacksResult.data?.reduce((acc: Record<string, number>, s) => {
          acc[s.stack_type] = (acc[s.stack_type] || 0) + 1;
          return acc;
        }, {}),
        avg_completion_rate: progressResult.data?.reduce((sum, p) => sum + (p.completion_rate || 0), 0) / (progressResult.data?.length || 1)
      };

      return new Response(JSON.stringify({ stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_image') {
      // Generate image using Lovable AI
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{ role: 'user', content: prompt }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation error:', errorText);
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      const textContent = data.choices?.[0]?.message?.content;

      return new Response(JSON.stringify({ imageUrl, textContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default: Chat with AI
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context based on content type
    let contextPrompt = SYSTEM_PROMPT;
    if (contentType === 'social_post') {
      contextPrompt += `\n\nGENEREAZĂ O POSTARE SOCIAL MEDIA. Format:
🔥 [HOOK PUTERNIC - max 10 cuvinte]

[Corp - 2-3 propoziții de valoare]

💪 [Call to Action]

#RoWarrior #TransformarePersonala #WarriorMindset`;
    } else if (contentType === 'video_script') {
      contextPrompt += `\n\nGENEREAZĂ UN SCRIPT VIDEO (max 60 secunde). Format:
[0-3s] HOOK: [frază care oprește scroll-ul]
[3-15s] PROBLEMA: [ce durere rezolvăm]
[15-45s] SOLUȚIA: [cum RoWarrior ajută]
[45-60s] CTA: [ce să facă viewerul]

Note pentru filmare: [sugestii vizuale]`;
    } else if (contentType === 'diagram') {
      contextPrompt += `\n\nDESCRIE O DIAGRAMĂ/INFOGRAPHIC. Format:
📊 TITLU: [titlu catchy]
SUBTITLU: [context scurt]

ELEMENTE:
1. [Element 1 + descriere scurtă]
2. [Element 2 + descriere scurtă]
3. [Element 3 + descriere scurtă]

CULORI SUGERATE: [paletă în ton cu brandul]
STIL: [minimalist/bold/ilustrativ]`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextPrompt },
          ...messages
        ],
        stream: true
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Admin AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
