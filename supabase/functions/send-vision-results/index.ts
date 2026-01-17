import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

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

    console.log('Sending vision results email to:', email, 'with visions:', Object.keys(visions), 'images:', Object.keys(images));

    if (!email) {
      throw new Error('Email is required');
    }

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
    const unsubscribeUrl = `https://my-life-path-guide.lovable.app/unsubscribe?email=${encodeURIComponent(email)}&sequence=vision_board`;
    const dashboardUrl = `https://my-life-path-guide.lovable.app/door?tab=annual&utm_source=email&utm_medium=sequence&utm_campaign=vision_board&utm_content=day1`;
    const trialUrl = `https://my-life-path-guide.lovable.app/auth?redirect=/door&plan=trial&utm_source=email&utm_medium=sequence&utm_campaign=vision_board&utm_content=day1`;

    // Build vision cards HTML - simple text format
    const visionCardsHtml = Object.entries(visions)
      .filter(([_, vision]) => vision)
      .map(([category, vision]) => {
        const info = categoryInfo[category as keyof typeof categoryInfo];
        const imageUrl = images[category as keyof typeof images];
        
        return `
        <tr>
          <td style="padding: 20px 0; border-bottom: 1px solid #e5e5e5;">
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
              ${info.emoji} ${info.name.toUpperCase()}
            </p>
            <p style="margin: 0; font-size: 15px; color: #333333; line-height: 1.6; font-style: italic;">
              "${vision}"
            </p>
            ${imageUrl ? `
            <p style="margin: 12px 0 0 0;">
              <img src="${imageUrl}" alt="Vision ${info.name}" style="max-width: 100%; height: auto; border-radius: 8px;" />
            </p>
            ` : ''}
          </td>
        </tr>
        `;
      })
      .join('');

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Vision Board 2026</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1a1a1a; margin: 0; padding: 0; -webkit-text-size-adjust: 100%;">

<!-- Tracking Pixel -->
<img src="${trackingPixel}" width="1" height="1" style="display:none;" alt="" />

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 30px 0; text-align: center; border-bottom: 2px solid #1a1a1a;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px;">VISION BOARD 2026</h1>
          </td>
        </tr>
        
        <!-- Greeting -->
        <tr>
          <td style="padding: 30px 0 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #1a1a1a; line-height: 1.6;">
              Salut ${name},
            </p>
          </td>
        </tr>
        
        <!-- Intro -->
        <tr>
          <td style="padding: 0 0 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.7;">
              Felicitări! Ai finalizat Vision Board-ul tău pentru 2026. Mai jos găsești viziunile tale pentru cele 4 dimensiuni ale vieții.
            </p>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding: 0 0 20px 0;">
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
          </td>
        </tr>
        
        <!-- Section Title -->
        <tr>
          <td style="padding: 0 0 15px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
              Viziunile Tale:
            </p>
          </td>
        </tr>
        
        <!-- Vision Cards -->
        ${visionCardsHtml}
        
        <!-- Divider -->
        <tr>
          <td style="padding: 25px 0 20px 0;">
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
          </td>
        </tr>
        
        <!-- Tips Section -->
        <tr>
          <td style="padding: 0 0 20px 0;">
            <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
              Cum să folosești Vision Board-ul:
            </p>
            <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333; line-height: 1.6;">
              <strong>1. Vizualizare Zilnică</strong> — Privește imaginile dimineața și seara pentru 2 minute.
            </p>
            <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333; line-height: 1.6;">
              <strong>2. Citește-ți Viziunile</strong> — Recitește-ți declarațiile cu voce tare.
            </p>
            <p style="margin: 0; font-size: 15px; color: #333333; line-height: 1.6;">
              <strong>3. Acționează Zilnic</strong> — Fă cel puțin o acțiune mică în direcția fiecărei viziuni.
            </p>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding: 5px 0 25px 0;">
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
          </td>
        </tr>
        
        <!-- CTA Section -->
        <tr>
          <td style="padding: 0 0 25px 0;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
              <strong>Pasul următor:</strong> Transformă viziunea în realitate cu un sistem complet de execuție.
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="background-color: #1a1a1a; border-radius: 6px;">
                  <a href="${trialUrl}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                    Începe Trial 3 Zile GRATUIT →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666;">
              <a href="${dashboardUrl}" style="color: #0066cc; text-decoration: underline;">Sau accesează Dashboard-ul →</a>
            </p>
          </td>
        </tr>
        
        <!-- Divider -->
        <tr>
          <td style="padding: 0 0 20px 0;">
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
          </td>
        </tr>
        
        <!-- Next Email Teaser -->
        <tr>
          <td style="padding: 0 0 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
              📬 <strong>Mâine primești:</strong> Cum să-ți Menții Viziunea Vie - 5 Tehnici de Vizualizare
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 0; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a1a;">
              Mult succes!<br/>
              Echipa Vision Board 2026
            </p>
            <p style="margin: 0; font-size: 12px; color: #999999;">
              <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">Dezabonare</a>
            </p>
          </td>
        </tr>
        
      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Vision Board <noreply@warriorsos.com>',
        to: [email],
        subject: `${name}, Vision Board-ul Tău 2026 Este Gata`,
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
