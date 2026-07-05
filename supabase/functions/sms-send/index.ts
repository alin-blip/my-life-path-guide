// Core SMS sender via Twilio gateway.
// Called internally by other functions (sms-enroll, sms-process-sequences, sms-broadcast).
// Handles suppression check, consent verification, sending, and logging.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

interface SendRequest {
  user_id?: string;
  phone_e164: string;
  message: string;
  enrollment_id?: string;
  sequence_id?: string;
  step_id?: string;
  consent_type?: string; // e.g. 'onboarding_opt_in'; skips check if omitted
  bypass_consent?: boolean; // for transactional
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const twilioKey = Deno.env.get('TWILIO_API_KEY');

    if (!lovableKey || !twilioKey) {
      return json({ error: 'Twilio not configured' }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const body = (await req.json()) as SendRequest;

    if (!body.phone_e164 || !body.message) {
      return json({ error: 'phone_e164 and message required' }, 400);
    }

    // Normalize phone
    const phone = body.phone_e164.trim();
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      return json({ error: 'Invalid E.164 phone' }, 400);
    }

    // Suppression check
    const { data: supp } = await supabase
      .from('sms_suppression')
      .select('phone_e164')
      .eq('phone_e164', phone)
      .maybeSingle();
    if (supp) return json({ skipped: 'suppressed' }, 200);

    // Consent check
    if (body.user_id && !body.bypass_consent) {
      const { data: prefs } = await supabase
        .from('user_sms_preferences')
        .select('*')
        .eq('user_id', body.user_id)
        .maybeSingle();
      if (!prefs?.sms_consent) return json({ skipped: 'no_consent' }, 200);
      if (body.consent_type && !(prefs as any)[body.consent_type]) {
        return json({ skipped: 'consent_type_off' }, 200);
      }
    }

    // From number
    const { data: settings } = await supabase
      .from('sms_settings').select('*').eq('id', 1).maybeSingle();
    const from = settings?.messaging_service_sid || settings?.from_number;
    if (!from) return json({ error: 'from_number not configured' }, 500);

    const params = new URLSearchParams({ To: phone, Body: body.message });
    if (settings?.messaging_service_sid) params.set('MessagingServiceSid', settings.messaging_service_sid);
    else params.set('From', settings!.from_number!);

    // Insert pending log
    const { data: logRow } = await supabase.from('sms_send_log').insert({
      user_id: body.user_id, enrollment_id: body.enrollment_id,
      sequence_id: body.sequence_id, step_id: body.step_id,
      phone_e164: phone, message_body: body.message, status: 'pending',
    }).select().single();

    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'X-Connection-Api-Key': twilioKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    const data = await res.json();

    if (!res.ok) {
      await supabase.from('sms_send_log').update({
        status: 'failed', error_code: String(data.code ?? res.status),
        error_message: data.message ?? 'Twilio error',
      }).eq('id', logRow!.id);
      return json({ error: data.message ?? 'Twilio error', code: data.code }, 502);
    }

    await supabase.from('sms_send_log').update({
      status: 'sent', twilio_message_sid: data.sid, sent_at: new Date().toISOString(),
      cost_usd: data.price ? Math.abs(parseFloat(data.price)) : null,
    }).eq('id', logRow!.id);

    return json({ success: true, sid: data.sid, log_id: logRow!.id }, 200);
  } catch (e) {
    console.error('[sms-send]', e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, status: number) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
