import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check admin
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { content, postId, authorId } = await req.json();
    console.log(`[notify-community-post] Sending email notifications for post ${postId}`);

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resend = new Resend(resendApiKey);

    // Get all users' emails (from auth.users via service role)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) {
      console.error('Error listing users:', usersError);
      return new Response(JSON.stringify({ error: 'Failed to list users' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const emails = users.users
      .filter(u => u.id !== authorId && u.email)
      .map(u => u.email!);

    console.log(`[notify-community-post] Sending to ${emails.length} recipients`);

    const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;

    // Send in batches of 50
    let sent = 0;
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      try {
        await resend.emails.send({
          from: 'CEO Mind OS <noreply@ceomindos.com>',
          to: batch,
          subject: '📢 Postare nouă în comunitate',
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #f59e0b;">🚀 CEO Mind OS Community</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">${preview}</p>
              <a href="https://my-life-path-guide.lovable.app/programs?tab=community" 
                 style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Vezi postarea →
              </a>
              <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
                Primești acest email deoarece ești membru al comunității CEO Mind OS.
              </p>
            </div>
          `,
        });
        sent += batch.length;
      } catch (emailErr) {
        console.error(`Error sending batch ${i}:`, emailErr);
      }
    }

    console.log(`[notify-community-post] Successfully sent ${sent} emails`);

    return new Response(
      JSON.stringify({ success: true, sent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[notify-community-post] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
