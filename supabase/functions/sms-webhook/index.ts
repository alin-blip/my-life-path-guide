// Twilio inbound webhook: handles STOP/START keywords and delivery status.
// Configure in Twilio console: https://<project>.supabase.co/functions/v1/sms-webhook
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const form = await req.formData();
    const from = String(form.get('From') ?? '').trim();
    const body = String(form.get('Body') ?? '').trim().toUpperCase();
    const messageSid = String(form.get('MessageSid') ?? '');
    const messageStatus = String(form.get('MessageStatus') ?? '');

    // Status callback
    if (messageStatus && messageSid) {
      const patch: any = {};
      if (messageStatus === 'delivered') { patch.status = 'delivered'; patch.delivered_at = new Date().toISOString(); }
      else if (['failed', 'undelivered'].includes(messageStatus)) {
        patch.status = messageStatus;
        patch.error_code = String(form.get('ErrorCode') ?? '');
      }
      if (Object.keys(patch).length) {
        await supabase.from('sms_send_log').update(patch).eq('twilio_message_sid', messageSid);
      }
      return xml('');
    }

    // Inbound STOP / START
    if (from && ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(body)) {
      await supabase.from('sms_suppression').upsert({ phone_e164: from, reason: 'user_stop' });
      // Pause enrollments for this user
      const { data: prefs } = await supabase.from('user_sms_preferences').select('user_id').eq('phone_e164', from).maybeSingle();
      if (prefs?.user_id) {
        await supabase.from('user_sms_preferences').update({ sms_consent: false }).eq('user_id', prefs.user_id);
        await supabase.from('sms_sequence_enrollments').update({ status: 'unsubscribed' }).eq('user_id', prefs.user_id).eq('status', 'active');
      }
      return xml(`<Response><Message>Te-am dezabonat. Nu vei mai primi SMS-uri. Trimite START pentru reactivare.</Message></Response>`);
    }
    if (from && ['START', 'YES', 'UNSTOP'].includes(body)) {
      await supabase.from('sms_suppression').delete().eq('phone_e164', from);
      return xml(`<Response><Message>Bine ai revenit! Ești din nou activ.</Message></Response>`);
    }

    return xml('');
  } catch (e) {
    console.error('[sms-webhook]', e);
    return xml('');
  }
});
function xml(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body || '<Response></Response>'}`, {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
  });
}
