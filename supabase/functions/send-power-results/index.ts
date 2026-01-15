import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PowerResultsRequest {
  email: string;
  name: string;
  scores: {
    body_fitness: number;
    body_nutrition: number;
    being_connection: number;
    being_certainty: number;
    balance_relationship: number;
    balance_family: number;
    business_mechanics: number;
    business_money: number;
  };
}

function getLevelName(score: number): string {
  if (score <= 3) return 'Adormit';
  if (score <= 6) return 'Treaz';
  if (score <= 9) return 'Activ';
  return 'Accelerat';
}

function getLevelColor(score: number): string {
  if (score <= 3) return '#ef4444';
  if (score <= 6) return '#eab308';
  if (score <= 9) return '#3b82f6';
  return '#22c55e';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, scores }: PowerResultsRequest = await req.json();

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / 96) * 100);
    const overallLevel = getLevelName(Math.round(totalScore / 8));

    const dimensionScores = {
      body: scores.body_fitness + scores.body_nutrition,
      being: scores.being_connection + scores.being_certainty,
      balance: scores.balance_relationship + scores.balance_family,
      business: scores.business_mechanics + scores.business_money
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Warrior Power <onboarding@resend.dev>",
        to: [email],
        subject: `${name}, Rezultatele Tale Warrior Power Assessment`,
        html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f0f; color: #ffffff; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
<h1 style="margin: 0; font-size: 28px; color: #ffffff;">⚔️ WARRIOR POWER ASSESSMENT</h1>
<p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9);">Rezultatele Tale, ${name}!</p>
</div>
<div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
<div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, ${getLevelColor(Math.round(totalScore / 8))}33, ${getLevelColor(Math.round(totalScore / 8))}11); border: 4px solid ${getLevelColor(Math.round(totalScore / 8))}; line-height: 112px; font-size: 48px; font-weight: bold; color: ${getLevelColor(Math.round(totalScore / 8))};">
${totalScore}
</div>
<p style="margin: 15px 0 5px 0; color: #888;">din 96 puncte posibile</p>
<p style="margin: 0; font-size: 20px; font-weight: bold; color: ${getLevelColor(Math.round(totalScore / 8))};">
Nivel General: ${overallLevel.toUpperCase()}
</p>
<p style="margin: 10px 0 0 0; color: #888;">${percentage}% din potențialul tău</p>
</div>
<div style="padding: 30px;">
<h2 style="margin: 0 0 20px 0; font-size: 18px; color: #ffffff;">📊 Scoruri pe Dimensiuni</h2>
<div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-weight: bold;">💪 CORPUL: ${dimensionScores.body}/24</p>
<p style="font-size: 12px; color: #888;">Fitness: ${scores.body_fitness}/12 • Alimentație: ${scores.body_nutrition}/12</p>
</div>
<div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-weight: bold;">🧘 FIINȚA: ${dimensionScores.being}/24</p>
<p style="font-size: 12px; color: #888;">Conexiune: ${scores.being_connection}/12 • Certitudine: ${scores.being_certainty}/12</p>
</div>
<div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-weight: bold;">⚖️ ECHILIBRU: ${dimensionScores.balance}/24</p>
<p style="font-size: 12px; color: #888;">Relații: ${scores.balance_relationship}/12 • Familie: ${scores.balance_family}/12</p>
</div>
<div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px;">
<p style="font-weight: bold;">💼 BUSINESS: ${dimensionScores.business}/24</p>
<p style="font-size: 12px; color: #888;">Mecanică: ${scores.business_mechanics}/12 • Bani: ${scores.business_money}/12</p>
</div>
</div>
<div style="padding: 30px; text-align: center; background: rgba(102, 126, 234, 0.1);">
<h3 style="margin: 0 0 15px 0; color: #ffffff;">Ești Gata să Îți Transformi Viața?</h3>
<p style="margin: 0 0 20px 0; color: #888; font-size: 14px;">Acum că știi exact unde te afli, este timpul să acționezi.</p>
<a href="https://my-life-path-guide.lovable.app/pricing" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Setează-ți Obiectivele Anuale →</a>
</div>
<div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
<p style="margin: 0;">© 2025 Warrior Power. Toate drepturile rezervate.</p>
</div>
</div>
</body>
</html>`,
      }),
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-power-results function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
