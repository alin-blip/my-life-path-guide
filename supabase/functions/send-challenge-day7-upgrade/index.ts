import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  console.log(`[SEND-CHALLENGE-DAY7-UPGRADE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Start");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(resendKey);

    // Check for manual mode (single email)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body - batch mode
    }

    if (body.email) {
      log("Manual mode", { email: body.email });
      
      // Get user info
      const { data: subscriber } = await supabase
        .from("subscribers")
        .select("email, early_bird_expires_at")
        .eq("email", body.email)
        .single();

      const earlyBirdActive = subscriber?.early_bird_expires_at 
        ? new Date(subscriber.early_bird_expires_at).getTime() > Date.now()
        : false;

      const html = generateDay7UpgradeEmail(body.email, earlyBirdActive);
      
      const emailResult = await resend.emails.send({
        from: "WarriorOS <noreply@warriorsos.com>",
        to: [body.email],
        subject: earlyBirdActive 
          ? "🎉 Felicitări! Ai Terminat Challenge-ul - Ofertă Specială Early Bird"
          : "🎉 Felicitări! Ai Terminat Challenge-ul de 7 Zile",
        html,
      });

      log("Manual email sent", { email: body.email, result: emailResult });
      
      return new Response(JSON.stringify({ success: true, sent: 1 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode: Find users who completed Day 7 in the last 24-48 hours and are NOT subscribed
    log("Batch mode - finding Day 7 completers");

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Get users who completed Day 7 recently
    const { data: day7Completers, error: progressError } = await supabase
      .from("challenge_progress")
      .select("user_id, completed_at")
      .eq("day_number", 7)
      .eq("completed", true)
      .gte("completed_at", twoDaysAgo.toISOString())
      .lte("completed_at", yesterday.toISOString());

    if (progressError) {
      log("Error fetching Day 7 completers", { error: progressError });
      throw progressError;
    }

    log("Found Day 7 completers", { count: day7Completers?.length || 0 });

    if (!day7Completers || day7Completers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No Day 7 completers found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = day7Completers.map(c => c.user_id);

    // Get subscriber info for these users (exclude already subscribed)
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email, user_id, subscribed, early_bird_expires_at")
      .in("user_id", userIds)
      .eq("subscribed", false);

    if (subError) {
      log("Error fetching subscribers", { error: subError });
      throw subError;
    }

    log("Non-subscribed Day 7 completers", { count: subscribers?.length || 0 });

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "All Day 7 completers are already subscribed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        const earlyBirdActive = sub.early_bird_expires_at 
          ? new Date(sub.early_bird_expires_at).getTime() > Date.now()
          : false;

        const html = generateDay7UpgradeEmail(sub.email, earlyBirdActive);

        await resend.emails.send({
          from: "WarriorOS <noreply@warriorsos.com>",
          to: [sub.email],
          subject: earlyBirdActive 
            ? "🎉 Felicitări! Ai Terminat Challenge-ul - Ofertă Specială Early Bird"
            : "🎉 Felicitări! Ai Terminat Challenge-ul de 7 Zile",
          html,
        });

        sent++;
        log("Email sent", { email: sub.email, earlyBirdActive });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${sub.email}: ${msg}`);
        log("Email error", { email: sub.email, error: msg });
      }
    }

    log("Batch complete", { sent, errors: errors.length });

    return new Response(JSON.stringify({ success: true, sent, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("Error", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function generateDay7UpgradeEmail(email: string, earlyBirdActive: boolean): string {
  const appUrl = "https://warriorsos.com";
  
  const earlyBirdSection = earlyBirdActive ? `
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="color: white; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">🎁 OFERTĂ EARLY BIRD ACTIVĂ</p>
      <p style="color: white; font-size: 28px; font-weight: bold; margin: 0;">
        <span style="text-decoration: line-through; opacity: 0.7;">€97</span> 
        <span style="font-size: 36px;">€49</span>/lună
      </p>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Prețul se blochează ACUM - nu mai crește niciodată!</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #f59e0b; font-size: 32px; margin: 0;">🎉 FELICITĂRI!</h1>
      <p style="color: #a3a3a3; font-size: 16px; margin-top: 8px;">Ai Terminat Challenge-ul de 7 Zile</p>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%); border-radius: 16px; padding: 32px; border: 1px solid #333;">
      
      <p style="color: #e5e5e5; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
        Ai făcut ceva ce puțini reușesc: <strong style="color: #f59e0b;">ai terminat un program complet de transformare</strong>.
      </p>

      <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        În aceste 7 zile ai descoperit:
      </p>

      <ul style="color: #e5e5e5; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
        <li>Viziunea ta pentru 2026 și cum să o transformi în realitate</li>
        <li>Cum să îți echilibrezi corpul, spiritul și relațiile</li>
        <li>Strategia Domino Door pentru obiective de business</li>
        <li>Warrior Routine - rutina campionilor</li>
        <li>AI Coaching pentru accountability și mindset</li>
        <li>Cum să transformi ideile în acțiuni concrete</li>
      </ul>

      ${earlyBirdSection}

      <!-- Membership Tiers -->
      <h2 style="color: #f59e0b; font-size: 20px; margin: 32px 0 16px 0; text-align: center;">
        Continuă Transformarea cu Membership
      </h2>

      <!-- Basic Tier -->
      <div style="background: #1f1f1f; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="color: #e5e5e5; font-size: 18px; margin: 0;">BASIC</h3>
          <span style="color: #f59e0b; font-size: 20px; font-weight: bold;">${earlyBirdActive ? '€49' : '€97'}/lună</span>
        </div>
        <ul style="color: #a3a3a3; font-size: 14px; line-height: 1.6; padding-left: 16px; margin: 0;">
          <li>Harta Realității & Warrior Routine</li>
          <li>Door - planificare săptămânală</li>
          <li>Stacks pentru reset rapid</li>
          <li>Jurnal de reflecție</li>
        </ul>
      </div>

      <!-- Pro Tier -->
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 2px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="color: #3b82f6; font-size: 18px; margin: 0;">PRO</h3>
            <span style="background: #3b82f6; color: white; font-size: 10px; padding: 2px 8px; border-radius: 4px;">RECOMANDAT</span>
          </div>
          <span style="color: #3b82f6; font-size: 20px; font-weight: bold;">€97/lună</span>
        </div>
        <ul style="color: #a3a3a3; font-size: 14px; line-height: 1.6; padding-left: 16px; margin: 0;">
          <li>Tot din Basic +</li>
          <li><strong style="color: #e5e5e5;">AI Accountability & Mind Coach</strong></li>
          <li>Breakthrough Tools & Cursuri</li>
          <li>Sesiuni Q&A lunare</li>
          <li>50% comision referral (prima lună)</li>
        </ul>
      </div>

      <!-- Elite Tier -->
      <div style="background: linear-gradient(135deg, #2d1f1f 0%, #3d2929 100%); border-radius: 12px; padding: 20px; border: 2px solid #f59e0b;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="color: #f59e0b; font-size: 18px; margin: 0;">ELITE</h3>
            <span style="background: #f59e0b; color: black; font-size: 10px; padding: 2px 8px; border-radius: 4px;">TRANSFORMARE TOTALĂ</span>
          </div>
          <div style="text-align: right;">
            <span style="color: #a3a3a3; text-decoration: line-through; font-size: 14px;">€970</span>
            <span style="color: #f59e0b; font-size: 20px; font-weight: bold; display: block;">€297/lună</span>
          </div>
        </div>
        <ul style="color: #a3a3a3; font-size: 14px; line-height: 1.6; padding-left: 16px; margin: 0;">
          <li>Tot din Pro +</li>
          <li><strong style="color: #e5e5e5;">Warrior Launch Accelerator (€2.497 valoare)</strong></li>
          <li>Coaching LIVE săptămânal (90 min)</li>
          <li>Elite Brotherhood</li>
          <li><strong style="color: #f59e0b;">50% comision LIFETIME</strong></li>
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${appUrl}/pricing" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Alege Planul Tău →
        </a>
      </div>

      <!-- What You Lose Section -->
      <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-top: 24px; border-left: 4px solid #ef4444;">
        <h4 style="color: #ef4444; font-size: 14px; margin: 0 0 12px 0;">⚠️ Fără Membership pierzi acces la:</h4>
        <ul style="color: #a3a3a3; font-size: 14px; line-height: 1.6; padding-left: 16px; margin: 0;">
          <li>AI Coaching care te ține responsabil</li>
          <li>Warrior Routine automatizată</li>
          <li>Door pentru planificare săptămânală</li>
          <li>Stacks pentru gestionarea emoțiilor</li>
          <li>Comunitatea de Warriors</li>
        </ul>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #333;">
      <p style="color: #525252; font-size: 12px; margin: 0;">
        Warriors Membership | MyLifePathGuide
      </p>
      <p style="color: #525252; font-size: 11px; margin-top: 8px;">
        Ai primit acest email pentru că ai completat Challenge-ul de 7 Zile.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}
