// Cron-triggered: processes active enrollments and sends the next due message.
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
    const cronSecret = Deno.env.get('CRON_SECRET');

    // Auth: either cron secret header or admin JWT
    const authHeader = req.headers.get('authorization') || '';
    const provided = req.headers.get('x-cron-secret');
    if (cronSecret && provided !== cronSecret) {
      const supa = createClient(supabaseUrl, serviceKey);
      const { data: { user } } = await supa.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) return json({ error: 'unauthorized' }, 401);
      const { data: isAdmin } = await supa.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!isAdmin) return json({ error: 'admin only' }, 403);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const now = new Date().toISOString();

    // Fetch due enrollments (batch 200)
    const { data: due } = await supabase
      .from('sms_sequence_enrollments')
      .select('*, sms_sequences!inner(*)')
      .eq('status', 'active')
      .lte('next_send_at', now)
      .limit(200);

    let sent = 0, skipped = 0, failed = 0;
    for (const enroll of due ?? []) {
      const seq = (enroll as any).sms_sequences;
      // Fetch next step
      const nextOrder = (enroll.current_step ?? 0) + 1;
      const { data: step } = await supabase.from('sms_sequence_steps')
        .select('*').eq('sequence_id', enroll.sequence_id)
        .eq('step_order', nextOrder).eq('is_active', true).maybeSingle();

      if (!step) {
        await supabase.from('sms_sequence_enrollments').update({
          status: 'completed', completed_at: now, next_send_at: null,
        }).eq('id', enroll.id);
        continue;
      }

      const { data: prefs } = await supabase.from('user_sms_preferences').select('language').eq('user_id', enroll.user_id).maybeSingle();
      const lang = prefs?.language ?? seq.language ?? 'ro';
      const msg = (lang === 'en' && step.message_en) ? step.message_en : step.message_ro;

      // Send via sms-send function
      const res = await fetch(`${supabaseUrl}/functions/v1/sms-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({
          user_id: enroll.user_id, phone_e164: enroll.phone_e164, message: msg,
          enrollment_id: enroll.id, sequence_id: enroll.sequence_id, step_id: step.id,
          consent_type: seq.requires_consent_type,
        }),
      });
      const data = await res.json();

      if (data.success) sent++;
      else if (data.skipped) skipped++;
      else failed++;

      // Peek next step for scheduling
      const { data: peek } = await supabase.from('sms_sequence_steps')
        .select('day_number, delay_hours').eq('sequence_id', enroll.sequence_id)
        .eq('step_order', nextOrder + 1).eq('is_active', true).maybeSingle();

      const nextAt = peek
        ? new Date(Date.now() + (peek.day_number * 86400000) + (peek.delay_hours * 3600000)).toISOString()
        : null;

      await supabase.from('sms_sequence_enrollments').update({
        current_step: nextOrder,
        last_sent_at: now,
        next_send_at: nextAt,
        status: peek ? 'active' : 'completed',
        completed_at: peek ? null : now,
      }).eq('id', enroll.id);
    }

    return json({ processed: due?.length ?? 0, sent, skipped, failed }, 200);
  } catch (e) {
    console.error('[sms-process-sequences]', e);
    return json({ error: (e as Error).message }, 500);
  }
});
function json(b: unknown, status: number) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
