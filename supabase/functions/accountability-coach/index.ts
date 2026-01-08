import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool definitions for the AI agent
const tools = [
  {
    type: "function",
    function: {
      name: "add_habit",
      description: "Add a new daily habit for the user",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the habit" },
          category: { type: "string", enum: ["morning", "afternoon", "evening", "anytime"], description: "When the habit should be done" },
          icon: { type: "string", description: "Emoji icon for the habit" }
        },
        required: ["name", "category"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_habit",
      description: "Delete an existing habit",
      parameters: {
        type: "object",
        properties: {
          habit_id: { type: "string", description: "The ID of the habit to delete" },
          habit_name: { type: "string", description: "The name of the habit to delete (if ID not known)" }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_habit",
      description: "Update an existing habit",
      parameters: {
        type: "object",
        properties: {
          habit_id: { type: "string", description: "The ID of the habit to update" },
          habit_name: { type: "string", description: "The name of the habit to update (if ID not known)" },
          new_name: { type: "string", description: "New name for the habit" },
          new_category: { type: "string", enum: ["morning", "afternoon", "evening", "anytime"], description: "New category" },
          is_active: { type: "boolean", description: "Whether the habit is active" }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Add a new task for the user",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The title of the task" },
          list_type: { type: "string", enum: ["hot", "hit", "do", "today"], description: "Which list to add the task to" },
          priority: { type: "number", description: "Priority level 1-3" }
        },
        required: ["title", "list_type"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_task",
      description: "Delete an existing task",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The ID of the task to delete" },
          task_title: { type: "string", description: "The title of the task to delete (if ID not known)" }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update an existing task",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The ID of the task to update" },
          task_title: { type: "string", description: "The title of the task to update (if ID not known)" },
          new_title: { type: "string", description: "New title for the task" },
          completed: { type: "boolean", description: "Mark task as completed or not" },
          list_type: { type: "string", enum: ["hot", "hit", "do", "today"], description: "Move to different list" }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "complete_task",
      description: "Mark a task as completed",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "The ID of the task to complete" },
          task_title: { type: "string", description: "The title of the task to complete (if ID not known)" }
        },
        additionalProperties: false
      }
    }
  }
];

// Execute tool calls
async function executeTool(supabase: any, userId: string, toolName: string, args: any): Promise<string> {
  try {
    switch (toolName) {
      case "add_habit": {
        const { error } = await supabase
          .from('daily_habits')
          .insert({
            user_id: userId,
            name: args.name,
            category: args.category,
            icon: args.icon || '✅',
            habit_group: 'custom',
            is_active: true
          });
        if (error) throw error;
        return `✅ Am adăugat habit-ul "${args.name}" în categoria ${args.category}.`;
      }

      case "delete_habit": {
        let query = supabase.from('daily_habits').delete().eq('user_id', userId);
        if (args.habit_id) {
          query = query.eq('id', args.habit_id);
        } else if (args.habit_name) {
          query = query.ilike('name', `%${args.habit_name}%`);
        }
        const { error } = await query;
        if (error) throw error;
        return `🗑️ Am șters habit-ul "${args.habit_name || args.habit_id}".`;
      }

      case "update_habit": {
        const updates: any = {};
        if (args.new_name) updates.name = args.new_name;
        if (args.new_category) updates.category = args.new_category;
        if (args.is_active !== undefined) updates.is_active = args.is_active;
        
        let query = supabase.from('daily_habits').update(updates).eq('user_id', userId);
        if (args.habit_id) {
          query = query.eq('id', args.habit_id);
        } else if (args.habit_name) {
          query = query.ilike('name', `%${args.habit_name}%`);
        }
        const { error } = await query;
        if (error) throw error;
        return `✏️ Am actualizat habit-ul.`;
      }

      case "add_task": {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = getWeekKey(new Date());
        
        const { error } = await supabase
          .from('user_tasks')
          .insert({
            user_id: userId,
            title: args.title,
            list_type: args.list_type,
            priority: args.priority || 2,
            completed: false,
            day: today,
            week_key: weekStart
          });
        if (error) throw error;
        return `✅ Am adăugat task-ul "${args.title}" în lista ${args.list_type}.`;
      }

      case "delete_task": {
        let query = supabase.from('user_tasks').delete().eq('user_id', userId);
        if (args.task_id) {
          query = query.eq('id', args.task_id);
        } else if (args.task_title) {
          query = query.ilike('title', `%${args.task_title}%`);
        }
        const { error } = await query;
        if (error) throw error;
        return `🗑️ Am șters task-ul "${args.task_title || args.task_id}".`;
      }

      case "update_task": {
        const updates: any = {};
        if (args.new_title) updates.title = args.new_title;
        if (args.completed !== undefined) updates.completed = args.completed;
        if (args.list_type) updates.list_type = args.list_type;
        
        let query = supabase.from('user_tasks').update(updates).eq('user_id', userId);
        if (args.task_id) {
          query = query.eq('id', args.task_id);
        } else if (args.task_title) {
          query = query.ilike('title', `%${args.task_title}%`);
        }
        const { error } = await query;
        if (error) throw error;
        return `✏️ Am actualizat task-ul.`;
      }

      case "complete_task": {
        let query = supabase.from('user_tasks').update({ completed: true }).eq('user_id', userId);
        if (args.task_id) {
          query = query.eq('id', args.task_id);
        } else if (args.task_title) {
          query = query.ilike('title', `%${args.task_title}%`);
        }
        const { error } = await query;
        if (error) throw error;
        return `🎉 Am marcat task-ul ca finalizat!`;
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error: unknown) {
    console.error(`Tool execution error for ${toolName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return `❌ Eroare la executarea acțiunii: ${errorMessage}`;
  }
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, language, userContext } = await req.json();
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid auth token');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const defaultSystemPrompt = language === 'ro' 
      ? `Tu ești Accountability Coach-ul personal al utilizatorului în platforma LifeOS.

CONTEXT UTILIZATOR:
${userContext || 'Nu am context suplimentar.'}

CAPABILITĂȚI AGENT:
Poți executa următoarele acțiuni pentru utilizator:
- Adăuga, șterge sau modifica habit-uri zilnice
- Adăuga, șterge, modifica sau completa task-uri
- Muta task-uri între liste (hot/hit/do/today)

ROLUL TĂU:
1. Reamintești ce are de făcut - obiective, task-uri, rutina
2. Celebrezi victoriile - task-uri completate, streak-uri, progres
3. Ghidezi spre următorul pas concret
4. Detectezi când are nevoie de suport sau motivație
5. Previi burnout-ul prin observarea pattern-urilor
6. Execuți acțiuni (adăugare/ștergere/modificare) când utilizatorul cere

STILUL TĂU:
- Direct și practic - nu te pierde în detalii
- Empatic dar responsabil - înțelegi, dar împingi înainte
- Orientat spre acțiune - fiecare răspuns să aibă un next step clar
- Celebrezi progresul mic - fiecare pas contează
- Vorbești la persoana a doua singular (tu)

REGULI:
- Răspunsuri scurte și la obiect (max 3-4 propoziții)
- Folosește emoji-uri moderat pentru a face conversația prietenoasă
- Când utilizatorul cere să adaugi/ștergi/modifici ceva, folosește tool-urile disponibile
- Când nu știi ceva, întreabă`
      : `You are the user's personal Accountability Coach in the LifeOS platform.

USER CONTEXT:
${userContext || 'No additional context available.'}

AGENT CAPABILITIES:
You can execute the following actions for the user:
- Add, delete, or modify daily habits
- Add, delete, modify, or complete tasks
- Move tasks between lists (hot/hit/do/today)

YOUR ROLE:
1. Remind what needs to be done - objectives, tasks, routine
2. Celebrate wins - completed tasks, streaks, progress
3. Guide toward the next concrete step
4. Detect when they need support or motivation
5. Prevent burnout by observing patterns
6. Execute actions (add/delete/modify) when the user requests

YOUR STYLE:
- Direct and practical - don't get lost in details
- Empathetic but accountable - understand, but push forward
- Action-oriented - every response should have a clear next step
- Celebrate small progress - every step counts

RULES:
- Short and to-the-point responses (max 3-4 sentences)
- Use emojis moderately to make conversation friendly
- When user asks to add/delete/modify something, use the available tools
- When you don't know something, ask`;

    // First API call with tools
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt || defaultSystemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: 'auto',
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
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;
    
    // Check if there are tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: string[] = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(supabase, user.id, toolName, toolArgs);
        toolResults.push(result);
      }

      // Return tool execution results along with any AI message
      const aiContent = assistantMessage.content || '';
      const combinedResponse = toolResults.join('\n') + (aiContent ? '\n\n' + aiContent : '');
      
      return new Response(JSON.stringify({ 
        response: combinedResponse,
        toolsExecuted: assistantMessage.tool_calls.map((tc: any) => tc.function.name)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = assistantMessage?.content || 'Could not generate response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Accountability Coach error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
