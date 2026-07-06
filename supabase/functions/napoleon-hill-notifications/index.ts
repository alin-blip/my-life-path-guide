import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationUser {
  user_id: string;
  email: string;
  project_name: string;
  current_principle: number;
  last_updated: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authFail = await requireCronOrAdmin(req, corsHeaders);
    if (authFail) return authFail;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔔 Starting Napoleon Hill notification check...');

    // Get users with active projects who have notifications enabled
    const { data: notificationPrefs, error: prefsError } = await supabase
      .from('napoleon_hill_notifications')
      .select('user_id, email_notifications, notification_day, notification_time, last_sent_at')
      .eq('email_notifications', true);

    if (prefsError) {
      console.error('Error fetching notification preferences:', prefsError);
      throw prefsError;
    }

    if (!notificationPrefs || notificationPrefs.length === 0) {
      console.log('No users with notifications enabled');
      return new Response(JSON.stringify({ message: 'No notifications to send' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc
    const currentHour = now.getHours();

    let notificationsSent = 0;

    for (const pref of notificationPrefs) {
      // Check if it's the right day
      const notificationDay = pref.notification_day === 0 ? 7 : pref.notification_day; // Convert Sunday from 0 to 7
      const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      if (notificationDay !== adjustedDayOfWeek) {
        console.log(`Skipping user ${pref.user_id} - not their notification day`);
        continue;
      }

      // Check if already sent today
      const lastSent = pref.last_sent_at ? new Date(pref.last_sent_at) : null;
      if (lastSent && lastSent.toDateString() === now.toDateString()) {
        console.log(`Skipping user ${pref.user_id} - already sent today`);
        continue;
      }

      // Get user's active projects
      const { data: projects, error: projectsError } = await supabase
        .from('napoleon_hill_projects')
        .select('id, project_name, current_principle, updated_at')
        .eq('user_id', pref.user_id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (projectsError || !projects || projects.length === 0) {
        console.log(`No active projects for user ${pref.user_id}`);
        continue;
      }

      // Get user email
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id);
      
      if (userError || !userData.user?.email) {
        console.log(`Could not get email for user ${pref.user_id}`);
        continue;
      }

      // Send notification email (placeholder - integrate with your email service)
      const emailContent = generateEmailContent(userData.user.email, projects);
      
      console.log(`📧 Would send notification to ${userData.user.email}`);
      console.log(`Projects: ${projects.map(p => p.project_name).join(', ')}`);

      // Update last_sent_at
      await supabase
        .from('napoleon_hill_notifications')
        .update({ last_sent_at: now.toISOString() })
        .eq('user_id', pref.user_id);

      notificationsSent++;
    }

    console.log(`✅ Sent ${notificationsSent} notifications`);

    return new Response(JSON.stringify({ 
      success: true,
      notifications_sent: notificationsSent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in napoleon-hill-notifications:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(email: string, projects: any[]) {
  const principleNames = [
    "Dorința", "Credința", "Autosuggestia", "Cunoaștere Specializată",
    "Imaginația", "Planificare Organizată", "Decizia", "Perseverența",
    "Master Mind", "Transmutarea Energiei", "Subconștientul",
    "Creierul", "Al Șaselea Simț", "Acțiunea Imediată"
  ];

  let content = `
    Bună ${email}! 👋
    
    Este timpul să continui călătoria ta Napoleon Hill!
    
    Proiectele tale active:
  `;

  projects.forEach(project => {
    const nextPrinciple = principleNames[project.current_principle - 1];
    content += `
    
    📚 ${project.project_name}
    📍 Următorul principiu: ${nextPrinciple} (${project.current_principle}/14)
    `;
  });

  content += `
    
    🎯 Fă următorul pas astăzi și apropie-te de obiectivul tău!
    
    Cu respect,
    Echipa RoWarrior
  `;

  return content;
}
