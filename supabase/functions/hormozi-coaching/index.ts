import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, systemPrompt, knowledgeBaseFiles = [] } = await req.json();
    
    console.log('Hormozi Coaching request:', { 
      messagesCount: messages.length, 
      systemPrompt: systemPrompt?.substring(0, 100) + '...',
      knowledgeBaseFiles: knowledgeBaseFiles.length 
    });

    // Create Supabase client with user context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process knowledge base context if files are provided
    let knowledgeBaseContext = '';
    if (knowledgeBaseFiles.length > 0) {
      const contextParts = [];
      
      for (const file of knowledgeBaseFiles) {
        try {
          // Verify user owns this file before accessing
          const { data: fileRecord, error: fileCheckError } = await supabase
            .from('knowledge_base_files')
            .select('*')
            .eq('file_path', file.file_path)
            .eq('user_id', user.id)
            .single();

          if (fileCheckError || !fileRecord) {
            console.warn(`User ${user.id} attempted to access unauthorized file: ${file.file_path}`);
            continue; // Skip unauthorized files
          }

          // Download and read file content
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('knowledge-base')
            .download(file.file_path);

          if (!downloadError && fileData) {
            const content = await fileData.text();
            contextParts.push(`--- ${file.file_name} ---\n${content.substring(0, 3000)}\n`);
          }
        } catch (error) {
          console.error(`Error processing file ${file.file_name}:`, error);
        }
      }
      
      if (contextParts.length > 0) {
        knowledgeBaseContext = `\n\nKNOWLEDGE BASE CONTEXT:\n${contextParts.join('\n')}\n\nUse this knowledge base to provide more specific and relevant advice based on the uploaded materials.\n`;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt + knowledgeBaseContext
          },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Hormozi coaching response generated successfully');

    return new Response(JSON.stringify({ 
      message: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in hormozi-coaching function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});