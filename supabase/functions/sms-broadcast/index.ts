// Admin-only broadcast: send an SMS to all opted-in users matching a filter.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('authorization') || '';
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return json({ error: 'unauthorized' }, 401);
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'admin only' }, 403);

    const { message, language, test_phone } = await req.json();
    if (!message || message.length > 1600) return json({ error: 'invalid message' }, 400);

    // Test send
    if (test_phone) {
      const r = await fetch(`${supabaseUrl}/functions/v1/sms-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({ phone_e164: test_phone, message, bypass_consent: true }),
      });
      return json(await r.json(), r.status);
    }

    // Broadcast to marketing_opt_in users
    let q = supabase.from('user_sms_preferences').select('user_id, phone_e164, language')
      .eq('sms_consent', true).eq('marketing_opt_in', true).not('phone_e164', 'is', null);
    if (language) q = q.eq('language', language);
    const { data: recipients } = await q;

    let sent = 0, skipped = 0, failed = 0;
    for (const r of recipients ?? []) {
      const res = await fetch(`${supabaseUrl}/functions/v1/sms-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({
          user_id: r.user_id, phone_e164: r.phone_e164, message,
          consent_type: 'marketing_opt_in',
        }),
      });
      const j = await res.json();
      if (j.success) sent++;
      else if (j.skipped) skipped++;
      else failed++;
    }

    return json({ total: recipients?.length ?? 0, sent, skipped, failed }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
function json(b: unknown, status: number) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
