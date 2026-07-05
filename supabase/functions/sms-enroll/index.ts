// Enroll a user into an SMS sequence. Called on signup, checkout abandon, or manually.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { user_id, sequence_key, phone_e164, metadata } = await req.json();
    if (!user_id || !sequence_key) return json({ error: 'user_id and sequence_key required' }, 400);

    const { data: seq } = await supabase.from('sms_sequences').select('*').eq('key', sequence_key).eq('is_active', true).maybeSingle();
    if (!seq) return json({ error: 'sequence not found' }, 404);

    const { data: prefs } = await supabase.from('user_sms_preferences').select('*').eq('user_id', user_id).maybeSingle();
    const phone = phone_e164 ?? prefs?.phone_e164;
    if (!phone) return json({ error: 'no phone on file' }, 400);
    if (!prefs?.sms_consent) return json({ skipped: 'no_consent' }, 200);
    if (seq.requires_consent_type && !(prefs as any)[seq.requires_consent_type]) {
      return json({ skipped: 'consent_type_off' }, 200);
    }

    const { data: firstStep } = await supabase.from('sms_sequence_steps')
      .select('*').eq('sequence_id', seq.id).eq('is_active', true)
      .order('step_order').limit(1).maybeSingle();

    const nextSendAt = firstStep
      ? new Date(Date.now() + (firstStep.day_number * 86400000) + (firstStep.delay_hours * 3600000)).toISOString()
      : null;

    const { data: enroll, error } = await supabase.from('sms_sequence_enrollments').upsert({
      user_id, sequence_id: seq.id, phone_e164: phone, status: 'active',
      current_step: 0, next_send_at: nextSendAt, metadata: metadata ?? {},
    }, { onConflict: 'user_id,sequence_id' }).select().single();

    if (error) return json({ error: error.message }, 500);
    return json({ success: true, enrollment_id: enroll.id }, 200);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
function json(b: unknown, status: number) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
