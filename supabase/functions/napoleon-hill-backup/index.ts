import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`📦 Starting Napoleon Hill backup for user: ${user.id}`);

    // Fetch all drafts for this user
    const { data: drafts, error: draftsError } = await supabase
      .from('napoleon_hill_principle_drafts')
      .select('*')
      .eq('user_id', user.id);

    if (draftsError) {
      console.error('Error fetching drafts:', draftsError);
      throw draftsError;
    }

    if (!drafts || drafts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No drafts to backup',
          draftsCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all projects for context
    const { data: projects, error: projectsError } = await supabase
      .from('napoleon_hill_projects')
      .select('*')
      .eq('user_id', user.id);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    // Create backup data structure
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      user_id: user.id,
      drafts: drafts,
      projects: projects || [],
      metadata: {
        total_drafts: drafts.length,
        total_projects: projects?.length || 0,
        backup_type: 'automatic'
      }
    };

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const filename = `${user.id}/backup-${timestamp}.json`;

    // Upload to storage
    const backupJson = JSON.stringify(backupData, null, 2);
    const { error: uploadError } = await supabase.storage
      .from('napoleon-hill-backups')
      .upload(filename, backupJson, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading backup:', uploadError);
      throw uploadError;
    }

    console.log(`✅ Backup completed successfully: ${filename}`);

    // Optionally: Delete old backups (keep last 10)
    const { data: existingBackups } = await supabase.storage
      .from('napoleon-hill-backups')
      .list(user.id, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (existingBackups && existingBackups.length > 10) {
      const toDelete = existingBackups.slice(10).map(file => `${user.id}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from('napoleon-hill-backups')
        .remove(toDelete);

      if (deleteError) {
        console.warn('Error deleting old backups:', deleteError);
      } else {
        console.log(`🗑️ Deleted ${toDelete.length} old backups`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup created successfully',
        filename,
        draftsCount: drafts.length,
        projectsCount: projects?.length || 0,
        timestamp: backupData.timestamp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
