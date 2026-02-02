import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "WarriorOS <noreply@warriorsos.com>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send email: ${await res.text()}`);
  }
  return res.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Recovery email templates per day
const recoveryTemplates: Record<number, { subject: string; html: (name: string, day: number) => string }> = {
  1: {
    subject: "🔥 Ziua 1 te așteaptă - Nu renunța încă!",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a;">Salut ${name || 'Warrior'}!</h1>
        <p>Ai început Challenge-ul de 7 Zile dar nu ai completat încă Ziua 1.</p>
        <p>Înțeleg - primul pas e mereu cel mai greu. Dar știi ce? <strong>Durează doar 10 minute.</strong></p>
        <div style="background: linear-gradient(135deg, #7c3aed, #a78bfa); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px;">Ziua 1: Creează-ți Viziunea</h2>
          <p style="margin: 0;">Răspunde la 5 întrebări simple și descoperă ce vrei cu adevărat.</p>
        </div>
        <p>De ce să începi acum:</p>
        <ul>
          <li>92% din oamenii care completează Ziua 1 ajung la Ziua 7</li>
          <li>Primești claritate imediată asupra direcției tale</li>
          <li>AI Coach-ul te ghidează pas cu pas</li>
        </ul>
        <a href="https://warriorsos.com/challenge/1" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold;">
          Începe Ziua 1 Acum →
        </a>
        <p style="margin-top: 30px; color: #666;">
          Cu încredere în tine,<br>
          Echipa MyLifePathGuide
        </p>
      </div>
    `
  },
  2: {
    subject: "⚡ Ești la jumătate de drum! Completează Ziua 2",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, ești în progres!</h1>
        <p>Ai completat Ziua 1 și ai făcut primul pas important. Dar ai rămas blocat la Ziua 2.</p>
        <p><strong>Ziua 2: Definește-ți Identitatea</strong></p>
        <p>Aceasta este ziua în care decizi cine vrei să devii.</p>
        <a href="https://warriorsos.com/challenge/2" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
          Continuă Ziua 2 →
        </a>
      </div>
    `
  },
  3: {
    subject: "💪 Nu lăsa obstacolele să te oprească - Ziua 3",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, continuă!</h1>
        <p>Ziua 3 este despre identificarea obstacolelor. Ironic, nu? Poate că viața ta de zi cu zi a devenit un obstacol pentru challenge.</p>
        <p>Dar tocmai de asta ai nevoie de acest exercițiu.</p>
        <a href="https://warriorsos.com/challenge/3" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
          Completează Ziua 3 →
        </a>
      </div>
    `
  },
  4: {
    subject: "📋 Planul tău de acțiune te așteaptă - Ziua 4",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, ești aproape!</h1>
        <p>Ai trecut prin cele mai grele zile. Ziua 4 este despre a crea planul concret.</p>
        <p>Mai sunt doar 4 zile până la transformare.</p>
        <a href="https://warriorsos.com/challenge/4" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
          Creează Planul - Ziua 4 →
        </a>
      </div>
    `
  },
  5: {
    subject: "🚀 Metoda STACK - Secretul Zilei 5",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, Ziua 5 e specială!</h1>
        <p>În Ziua 5 înveți metoda STACK - sistemul nostru secret pentru transformare rapidă.</p>
        <p>Nu rata asta.</p>
        <a href="https://warriorsos.com/challenge/5" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
          Descoperă Metoda STACK →
        </a>
      </div>
    `
  },
  6: {
    subject: "🤝 O zi distanță de final - Ziua 6",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, mai e o singură zi!</h1>
        <p>Ziua 6 este despre accountability - găsirea suportului de care ai nevoie.</p>
        <p>Mâine e Ziua 7 - accelerarea finală.</p>
        <a href="https://warriorsos.com/challenge/6" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
          Completează Ziua 6 →
        </a>
      </div>
    `
  },
  7: {
    subject: "🏆 ULTIMA ZI! Finalizează Challenge-ul",
    html: (name: string, day: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>${name || 'Warrior'}, E ZIUA CEA MARE!</h1>
        <p>Ai ajuns la Ziua 7 - Accelerarea. Aceasta e ziua în care totul se leagă.</p>
        <p>Nu renunța când ești atât de aproape!</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>🎁 Bonus:</strong> Cei care completează toate 7 zile primesc acces la resurse exclusive!</p>
        </div>
        <a href="https://warriorsos.com/challenge/7" 
           style="display: inline-block; background: #eab308; color: #1a1a1a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Finalizează Challenge-ul →
        </a>
      </div>
    `
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting challenge recovery email send...");

    // Get users who have started but not completed
    const { data: challengeProgress, error: progressError } = await supabase
      .from("challenge_progress")
      .select("user_id, day_number, completed, created_at");

    if (progressError) {
      console.error("Error fetching challenge progress:", progressError);
      throw progressError;
    }

    // Group by user and find stuck users
    const userProgress = new Map<string, { maxDay: number; lastIncomplete: number; createdAt: string }>();
    
    challengeProgress?.forEach(p => {
      const existing = userProgress.get(p.user_id);
      if (!existing) {
        userProgress.set(p.user_id, {
          maxDay: p.day_number,
          lastIncomplete: p.completed ? 0 : p.day_number,
          createdAt: p.created_at
        });
      } else {
        if (p.day_number > existing.maxDay) {
          existing.maxDay = p.day_number;
        }
        if (!p.completed && p.day_number > existing.lastIncomplete) {
          existing.lastIncomplete = p.day_number;
        }
      }
    });

    // Get auth users for emails
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userEmailMap = new Map(
      authUsers?.users?.map(u => [u.id, { email: u.email, name: u.user_metadata?.name || '' }]) || []
    );

    // Also check email_leads for challenge signups without account
    const { data: challengeLeads } = await supabase
      .from("email_leads")
      .select("email, name, created_at")
      .eq("lead_magnet", "challenge_7_zile");

    // Check which recovery emails have already been sent today
    const today = new Date().toISOString().split('T')[0];
    const { data: sentToday } = await supabase
      .from("challenge_recovery_emails")
      .select("email, stuck_on_day")
      .gte("sent_at", today);

    const sentTodaySet = new Set(
      sentToday?.map(s => `${s.email}-${s.stuck_on_day}`) || []
    );

    const results: { email: string; day: number; success: boolean; error?: string }[] = [];

    // Send recovery emails to stuck users
    for (const [userId, progress] of userProgress) {
      if (progress.lastIncomplete === 0) continue; // User completed all attempted days
      
      const userData = userEmailMap.get(userId);
      if (!userData?.email) continue;

      const key = `${userData.email}-${progress.lastIncomplete}`;
      if (sentTodaySet.has(key)) continue; // Already sent today

      const template = recoveryTemplates[progress.lastIncomplete];
      if (!template) continue;

      try {
        await sendEmail(
          userData.email,
          template.subject,
          template.html(userData.name, progress.lastIncomplete)
        );

        // Log the recovery email
        await supabase.from("challenge_recovery_emails").insert({
          user_id: userId,
          email: userData.email,
          stuck_on_day: progress.lastIncomplete,
          sent_at: new Date().toISOString()
        });

        results.push({ email: userData.email, day: progress.lastIncomplete, success: true });
        console.log(`Sent recovery email for day ${progress.lastIncomplete} to ${userData.email}`);
      } catch (emailError) {
        console.error(`Error sending recovery to ${userData.email}:`, emailError);
        results.push({
          email: userData.email,
          day: progress.lastIncomplete,
          success: false,
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    }

    // Also check challenge leads who haven't started at all
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    for (const lead of challengeLeads || []) {
      // Check if they have any challenge progress
      const hasProgress = [...userProgress.values()].some(p => 
        userEmailMap.get(p.createdAt)?.email === lead.email
      );
      
      if (hasProgress) continue;
      
      // Check if lead is at least 2 days old
      const leadDate = new Date(lead.created_at);
      if (leadDate > twoDaysAgo) continue;

      const key = `${lead.email}-1`;
      if (sentTodaySet.has(key)) continue;

      const template = recoveryTemplates[1];

      try {
        await sendEmail(
          lead.email,
          template.subject,
          template.html(lead.name || '', 1)
        );

        await supabase.from("challenge_recovery_emails").insert({
          email: lead.email,
          stuck_on_day: 1,
          sent_at: new Date().toISOString()
        });

        results.push({ email: lead.email, day: 1, success: true });
        console.log(`Sent recovery email for day 1 to lead ${lead.email}`);
      } catch (emailError) {
        console.error(`Error sending recovery to lead ${lead.email}:`, emailError);
        results.push({
          email: lead.email,
          day: 1,
          success: false,
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Challenge recovery complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent, 
        failed,
        results 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in send-challenge-recovery:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
