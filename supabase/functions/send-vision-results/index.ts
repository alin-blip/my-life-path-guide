import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { authorizeUserOrRecentLead } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VisionResultsRequest {
  email: string;
  name: string;
  visions: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
  images: {
    body?: string;
    being?: string;
    balance?: string;
    business?: string;
  };
}

const categoryInfo = {
  body: { name: 'Corp', emoji: '💪', color: '#ef4444' },
  being: { name: 'Suflet', emoji: '🧘', color: '#8b5cf6' },
  balance: { name: 'Echilibru', emoji: '⚖️', color: '#3b82f6' },
  business: { name: 'Business', emoji: '💼', color: '#22c55e' },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY lipsește din configurația backend.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Config backend incompletă (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    }

    const body = await req.json();
    const email = body?.email;
    const name = body?.name || 'Warrior';
    const visions = body?.visions || {};
    const images = body?.images || {};

    if (!email) {
      throw new Error('Email is required');
    }

    const authError = await authorizeUserOrRecentLead(
      req,
      email,
      ['vision_2026_quiz', 'vision_board_ai', 'vision_board'],
    );
    if (authError) return authError;

    console.log('Sending vision results email to:', email, 'with visions:', Object.keys(visions), 'images:', Object.keys(images));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get or create lead for tracking
    const { data: lead } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('lead_magnet', 'vision_board')
      .maybeSingle();

    // If no lead exists, create one
    if (!lead) {
      await supabase.from('email_leads').insert({
        email,
        name,
        lead_magnet: 'vision_board',
        source: 'vision_board_2026',
      });
    }

    // Create tracking ID
    const trackingId = crypto.randomUUID();

    // Log this as day 1 email for vision board sequence
    const { data: existingLead } = await supabase
      .from('email_leads')
      .select('id')
      .eq('email', email)
      .eq('lead_magnet', 'vision_board')
      .single();

    if (existingLead) {
      await supabase.from('email_sequence_log').upsert(
        {
          lead_id: existingLead.id,
          email: email,
          sequence_type: 'vision_board',
          day_number: 1,
          tracking_id: trackingId,
          sent_at: new Date().toISOString(),
        },
        { onConflict: 'lead_id,sequence_type,day_number' }
      );
    }

     const trackingPixel = `https://exsbnfmaadjyfblperas.supabase.co/functions/v1/track-email-open?t=${trackingId}`;
     const unsubscribeUrl = `https://ceomindos.com/unsubscribe?email=${encodeURIComponent(email)}&sequence=vision_board`;
     const dashboardUrl = `https://ceomindos.com/door?tab=annual&utm_source=email&utm_medium=sequence&utm_campaign=vision_board&utm_content=day1`;
     const trialUrl = `https://ceomindos.com/auth?redirect=/door&plan=trial&utm_source=email&utm_medium=sequence&utm_campaign=vision_board&utm_content=day1`;

    // Build vision cards HTML
    const visionCardsHtml = Object.entries(visions)
      .filter(([_, vision]) => vision)
      .map(([category, vision]) => {
        const info = categoryInfo[category as keyof typeof categoryInfo];
        const imageUrl = images[category as keyof typeof images];
        
        return `
        <div style="margin-bottom: 25px; padding: 25px; background: linear-gradient(135deg, ${info.color}11 0%, transparent 100%); border-radius: 16px; border: 1px solid ${info.color}33;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
            <span style="font-size: 28px;">${info.emoji}</span>
            <h3 style="margin: 0; font-size: 20px; color: ${info.color}; font-weight: 700;">${info.name}</h3>
          </div>
          
          ${imageUrl ? `
          <div style="margin-bottom: 15px; border-radius: 12px; overflow: hidden;">
            <img src="${imageUrl}" alt="Vision ${info.name}" style="width: 100%; height: auto; display: block; border-radius: 12px;" />
          </div>
          ` : ''}
          
          <p style="margin: 0; color: #ddd; font-size: 15px; line-height: 1.7; font-style: italic;">
            "${vision}"
          </p>
        </div>
        `;
      })
      .join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vision Board-ul Tău 2026</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 0;">

<!-- Tracking Pixel -->
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<div style="max-width: 640px; margin: 0 auto; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);">

<!-- Header -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 50px 30px; text-align: center;">
  <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
  <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">VISION BOARD 2026</h1>
  <p style="margin: 15px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.9);">Viziunile Tale pentru Anul Viitor, ${name}!</p>
</div>

<!-- Intro -->
<div style="padding: 40px 30px; text-align: center;">
  <p style="margin: 0; color: #aaa; font-size: 16px; line-height: 1.7;">
    Felicitări! Ai făcut primul pas către transformare. Mai jos găsești viziunile tale pentru cele 4 dimensiuni ale vieții, împreună cu imaginile generate de AI care îți vor ghida anul 2026.
  </p>
</div>

<!-- Vision Cards -->
<div style="padding: 0 20px 30px 20px;">
  <h2 style="text-align: center; font-size: 22px; color: #fff; margin-bottom: 25px;">✨ Viziunile Tale</h2>
  ${visionCardsHtml}
</div>

<!-- Tips Section -->
<div style="padding: 30px; background: rgba(102,126,234,0.1); border-top: 1px solid rgba(102,126,234,0.3);">
  <h2 style="text-align: center; font-size: 20px; color: #fff; margin: 0 0 20px 0;">💡 Cum Să Folosești Vision Board-ul</h2>
  
  <div style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #667eea;">
    <p style="margin: 0; color: #ddd; font-size: 14px; line-height: 1.6;">
      <strong style="color: #fff;">1. Vizualizare Zilnică</strong> — Privește imaginile dimineața și seara pentru 2 minute. Simte cum ar fi să trăiești deja acea realitate.
    </p>
  </div>
  
  <div style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #764ba2;">
    <p style="margin: 0; color: #ddd; font-size: 14px; line-height: 1.6;">
      <strong style="color: #fff;">2. Citește-ți Viziunile</strong> — Recitește-ți declarațiile cu voce tare. Creierul tău le va integra mai profund.
    </p>
  </div>
  
  <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #f093fb;">
    <p style="margin: 0; color: #ddd; font-size: 14px; line-height: 1.6;">
      <strong style="color: #fff;">3. Acționează Zilnic</strong> — Fă cel puțin o acțiune mică în direcția fiecărei viziuni. Progresul se construiește pas cu pas.
    </p>
  </div>
</div>

<!-- CTA Section -->
<div style="padding: 50px 30px; text-align: center; background: linear-gradient(180deg, transparent 0%, rgba(102,126,234,0.15) 100%);">
  <div style="font-size: 40px; margin-bottom: 15px;">🚀</div>
  <h2 style="margin: 0 0 15px 0; font-size: 26px; color: #fff;">Transformă Viziunea în Realitate</h2>
  <p style="margin: 0 0 30px 0; color: #aaa; font-size: 16px; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
    Vizualizarea e doar începutul. Pentru a transforma aceste viziuni în realitate, ai nevoie de un <strong style="color: #fff;">sistem complet de execuție</strong>.
  </p>
  
  <a href="${trialUrl}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(34,197,94,0.4); margin-bottom: 15px;">
    Începe Trial 3 Zile GRATUIT →
  </a>
  
  <p style="margin: 0; color: #666; font-size: 13px;">
    <a href="${dashboardUrl}" style="color: #888; text-decoration: underline;">Sau accesează Dashboard-ul →</a>
  </p>
</div>

<!-- Next Email Teaser -->
<div style="padding: 25px 30px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
  <p style="margin: 0; color: #888; font-size: 14px;">
    📬 <strong style="color: #aaa;">Mâine primești:</strong> Cum să-ți Menții Viziunea Vie - 5 Tehnici de Vizualizare
  </p>
</div>

<!-- Footer -->
<div style="padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
  <p style="margin: 0 0 15px 0; color: #666; font-size: 12px;">
    © 2025 CEO Mind OS. Toate drepturile rezervate.
  </p>
  <p style="margin: 0; font-size: 11px;">
    <a href="${unsubscribeUrl}" style="color: #555; text-decoration: none;">Dezabonare</a>
  </p>
</div>

</div>
</body>
</html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CEO Mind OS <noreply@ceomindos.com>',
        to: [email],
        subject: `🎯 ${name}, Vision Board-ul Tău 2026 Este Gata!`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in send-vision-results:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
