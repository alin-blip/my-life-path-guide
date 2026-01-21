import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  type?: 'check-all' | 'send-single';
  userId?: string;
  email?: string;
  name?: string;
  hoursRemaining?: number;
  expiresAt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const body: ReminderRequest = await req.json().catch(() => ({}));
    
    // If type is check-all, scan for users who need reminders
    if (body.type === 'check-all') {
      return await checkAllUsers(supabase);
    }
    
    // Otherwise, send a single reminder
    if (body.email && body.hoursRemaining !== undefined) {
      return await sendReminderEmail(body);
    }

    return new Response(
      JSON.stringify({ error: "Invalid request parameters" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-early-bird-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function checkAllUsers(supabase: any): Promise<Response> {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Find subscribers whose early_bird_expires_at is between 24-25 hours from now (24h reminder)
  const { data: users24h, error: error24h } = await supabase
    .from('subscribers')
    .select('user_id, email, early_bird_expires_at')
    .gte('early_bird_expires_at', in24Hours.toISOString())
    .lt('early_bird_expires_at', in25Hours.toISOString())
    .is('subscribed', false);

  if (error24h) {
    console.error("Error fetching 24h users:", error24h);
  }

  // Find subscribers whose early_bird_expires_at is between 1-2 hours from now (1h reminder)
  const { data: users1h, error: error1h } = await supabase
    .from('subscribers')
    .select('user_id, email, early_bird_expires_at')
    .gte('early_bird_expires_at', in1Hour.toISOString())
    .lt('early_bird_expires_at', in2Hours.toISOString())
    .is('subscribed', false);

  if (error1h) {
    console.error("Error fetching 1h users:", error1h);
  }

  const sentEmails: string[] = [];
  const errors: string[] = [];

  // Send 24h reminders
  for (const user of users24h || []) {
    const { data: existing } = await supabase
      .from('email_sequence_log')
      .select('id')
      .eq('email', user.email)
      .eq('sequence_type', 'early-bird-reminder-24h')
      .single();

    if (!existing) {
      try {
        await sendReminderEmailInternal({
          email: user.email,
          hoursRemaining: 24,
          expiresAt: user.early_bird_expires_at,
        });
        
        await supabase.from('email_sequence_log').insert({
          email: user.email,
          sequence_type: 'early-bird-reminder-24h',
          day_number: 0,
          sent_at: new Date().toISOString(),
        });
        
        sentEmails.push(`24h: ${user.email}`);
      } catch (err: any) {
        errors.push(`24h ${user.email}: ${err.message}`);
      }
    }
  }

  // Send 1h reminders
  for (const user of users1h || []) {
    const { data: existing } = await supabase
      .from('email_sequence_log')
      .select('id')
      .eq('email', user.email)
      .eq('sequence_type', 'early-bird-reminder-1h')
      .single();

    if (!existing) {
      try {
        await sendReminderEmailInternal({
          email: user.email,
          hoursRemaining: 1,
          expiresAt: user.early_bird_expires_at,
        });
        
        await supabase.from('email_sequence_log').insert({
          email: user.email,
          sequence_type: 'early-bird-reminder-1h',
          day_number: 0,
          sent_at: new Date().toISOString(),
        });
        
        sentEmails.push(`1h: ${user.email}`);
      } catch (err: any) {
        errors.push(`1h ${user.email}: ${err.message}`);
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      sentEmails, 
      errors,
      checked: {
        users24h: users24h?.length || 0,
        users1h: users1h?.length || 0,
      }
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function sendReminderEmailInternal(params: ReminderRequest): Promise<void> {
  const { email, hoursRemaining, expiresAt } = params;
  
  if (!email) {
    throw new Error("Email is required");
  }

  const isUrgent = hoursRemaining !== undefined && hoursRemaining <= 1;
  const timeText = isUrgent ? "1 ORĂ" : "24 ORE";
  const urgencyEmoji = isUrgent ? "🚨" : "⏰";
  
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const formattedExpiry = expiryDate 
    ? expiryDate.toLocaleString('ro-RO', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '';

  const emailHtml = generateEmailHtml(isUrgent, timeText, urgencyEmoji, formattedExpiry);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "WarriorSOS <noreply@warriorsos.com>",
      to: [email],
      subject: isUrgent 
        ? `🚨 ULTIMA ORĂ: Prețul Early Bird expiră în ${timeText}!`
        : `⏰ Reminder: Prețul Early Bird expiră în ${timeText}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
  }

  console.log(`Early Bird reminder sent to ${email}`);
}

async function sendReminderEmail(params: ReminderRequest): Promise<Response> {
  try {
    await sendReminderEmailInternal(params);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

function generateEmailHtml(isUrgent: boolean, timeText: string, urgencyEmoji: string, formattedExpiry: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Early Bird Expiration Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">${urgencyEmoji}</div>
      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0;">
        ${isUrgent ? 'ULTIMA ORĂ!' : 'Mai ai puțin timp!'}
      </h1>
      <p style="color: #fbbf24; font-size: 18px; margin: 0; font-weight: bold;">
        Prețul Early Bird expiră în ${timeText}
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1e1e3f 0%, #2d1f4e 100%); border-radius: 16px; padding: 30px; margin-bottom: 25px; border: 1px solid rgba(251, 191, 36, 0.3);">
      
      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        ${isUrgent 
          ? 'Aceasta este ultima ta șansă de a beneficia de reducerea de 50%!' 
          : 'Ai doar 24 de ore rămase pentru a accesa prețurile speciale Early Bird.'
        }
      </p>

      <!-- Pricing Comparison -->
      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">
          Prețuri care expiră la:
        </p>
        <p style="color: #fbbf24; font-size: 16px; margin: 0 0 20px 0; font-weight: bold;">
          ${formattedExpiry}
        </p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #e2e8f0;">Basic</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
              <span style="color: #ef4444; text-decoration: line-through; margin-right: 10px;">€97</span>
              <span style="color: #22c55e; font-weight: bold; font-size: 18px;">€49</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #e2e8f0;">Pro</span>
              <span style="background: #7c3aed; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">POPULAR</span>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
              <span style="color: #ef4444; text-decoration: line-through; margin-right: 10px;">€197</span>
              <span style="color: #22c55e; font-weight: bold; font-size: 18px;">€97</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <span style="color: #e2e8f0;">Elite</span>
              <span style="background: linear-gradient(90deg, #f59e0b, #ea580c); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">VIP</span>
            </td>
            <td style="padding: 10px 0; text-align: right;">
              <span style="color: #ef4444; text-decoration: line-through; margin-right: 10px;">€500</span>
              <span style="color: #22c55e; font-weight: bold; font-size: 18px;">€297</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://warriorsos.com/pricing" 
           style="display: inline-block; background: linear-gradient(90deg, #f59e0b, #ea580c); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
          ${isUrgent ? '🔥 Asigură-ți Prețul ACUM' : '⚡ Blochează Prețul Early Bird'}
        </a>
      </div>
    </div>

    <!-- Benefits Reminder -->
    <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
      <p style="color: #22c55e; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">
        ✓ Ce primești cu abonamentul:
      </p>
      <ul style="color: #e2e8f0; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Harta Realității - evaluare completă 4B</li>
        <li>Champion Routine - sistem zilnic de succes</li>
        <li>Door - planificare săptămânală cu AI</li>
        <li>Stacks - reset mental rapid</li>
        <li>Jurnal de progres și rapoarte</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        © 2026 WarriorSOS. Toate drepturile rezervate.
      </p>
      <p style="color: #64748b; font-size: 11px; margin: 10px 0 0 0;">
        Primești acest email pentru că ai un cont WarriorSOS cu Early Bird activ.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
