import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimeEntry {
  category: string;
  activity: string;
  duration_minutes: number;
  energy_before: number;
  energy_after: number;
  satisfaction: number;
  was_planned: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entries, weeklyHours } = await req.json();

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ 
          burnoutRisk: 0,
          summary: "Încă nu ai suficiente date pentru analiză. Loghează mai multe activități!",
          recommendations: ["Începe să loghezi activitățile zilnice pentru a primi insight-uri personalizate."]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate burnout risk score
    let burnoutScore = 0;
    
    // Factor 1: Overwork (>50 hours/week)
    if (weeklyHours > 50) burnoutScore += 20;
    else if (weeklyHours > 45) burnoutScore += 10;

    // Factor 2: Average energy after activities
    const avgEnergyAfter = entries.reduce((sum: number, e: TimeEntry) => sum + (e.energy_after || 5), 0) / entries.length;
    if (avgEnergyAfter < 4) burnoutScore += 20;
    else if (avgEnergyAfter < 5) burnoutScore += 10;

    // Factor 3: Energy trend (negative delta)
    const avgEnergyDelta = entries.reduce((sum: number, e: TimeEntry) => 
      sum + ((e.energy_after || 5) - (e.energy_before || 5)), 0) / entries.length;
    if (avgEnergyDelta < -1) burnoutScore += 15;
    else if (avgEnergyDelta < 0) burnoutScore += 8;

    // Factor 4: Low satisfaction
    const avgSatisfaction = entries.reduce((sum: number, e: TimeEntry) => sum + (e.satisfaction || 5), 0) / entries.length;
    if (avgSatisfaction < 4) burnoutScore += 15;
    else if (avgSatisfaction < 5) burnoutScore += 8;

    // Factor 5: Category imbalance
    const categoryTimes: Record<string, number> = {};
    entries.forEach((e: TimeEntry) => {
      categoryTimes[e.category] = (categoryTimes[e.category] || 0) + e.duration_minutes;
    });
    const totalTime = Object.values(categoryTimes).reduce((a, b) => a + b, 0);
    const workPercentage = ((categoryTimes['work'] || 0) / totalTime) * 100;
    if (workPercentage > 80) burnoutScore += 15;
    else if (workPercentage > 70) burnoutScore += 8;

    // Factor 6: No recovery time
    const recoveryTime = (categoryTimes['personal'] || 0) + (categoryTimes['spirituality'] || 0);
    const recoveryHours = recoveryTime / 60;
    if (recoveryHours < 3) burnoutScore += 15;
    else if (recoveryHours < 5) burnoutScore += 8;

    // Find energy vampires and boosters
    const activitiesWithDelta = entries
      .filter((e: TimeEntry) => e.energy_before && e.energy_after)
      .map((e: TimeEntry) => ({
        ...e,
        energyDelta: e.energy_after - e.energy_before
      }));

    const vampires = activitiesWithDelta
      .filter((a: any) => a.energyDelta < 0)
      .sort((a: any, b: any) => a.energyDelta - b.energyDelta)
      .slice(0, 3);

    const boosters = activitiesWithDelta
      .filter((a: any) => a.energyDelta > 0)
      .sort((a: any, b: any) => b.energyDelta - a.energyDelta)
      .slice(0, 3);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (weeklyHours > 50) {
      recommendations.push("Reduce orele de muncă sub 50/săptămână. Productivitatea scade după 50 de ore.");
    }
    
    if (avgEnergyAfter < 5) {
      recommendations.push("Energia ta medie este scăzută. Adaugă pauze de 5-10 minute între activități.");
    }
    
    if (vampires.length > 0) {
      recommendations.push(`Activitatea "${vampires[0].activity}" îți drenează energia. Consideră să o elimini sau să o faci mai rar.`);
    }
    
    if (boosters.length > 0) {
      recommendations.push(`"${boosters[0].activity}" îți încarcă bateriile. Fă mai mult din asta!`);
    }
    
    if (recoveryHours < 5) {
      recommendations.push("Ai nevoie de mai mult timp pentru recuperare. Blochează cel puțin 5h/săptămână pentru activități personale.");
    }
    
    if (workPercentage > 70) {
      recommendations.push("Dezechilibru: prea mult timp pe muncă. Investește în relații și sănătate pentru o viață sustenabilă.");
    }

    // Generate summary
    let summary = "";
    if (burnoutScore >= 60) {
      summary = "⚠️ ATENȚIE: Risc ridicat de burnout! Ai nevoie urgent de schimbări în modul în care îți aloci timpul.";
    } else if (burnoutScore >= 40) {
      summary = "🟡 Risc moderat de burnout. Implementează câteva ajustări pentru a preveni epuizarea.";
    } else if (burnoutScore >= 20) {
      summary = "🟢 Situație stabilă, dar există loc de îmbunătățire în gestionarea energiei.";
    } else {
      summary = "✅ Excelent! Îți gestionezi bine timpul și energia. Continuă așa!";
    }

    // Determine alerts to create
    const alerts: any[] = [];
    
    if (weeklyHours > 55) {
      alerts.push({
        alert_type: 'overwork',
        severity: weeklyHours > 60 ? 'critical' : 'high',
        description: `Ai lucrat ${weeklyHours.toFixed(1)} ore săptămâna asta. Asta e nesustenabil.`,
        metric_value: weeklyHours,
        recommendations: ["Blochează timp pentru pauze", "Delegă sau amână sarcini non-urgente"]
      });
    }
    
    if (avgEnergyAfter < 4) {
      alerts.push({
        alert_type: 'energy_drain',
        severity: avgEnergyAfter < 3 ? 'high' : 'medium',
        description: `Energia ta medie după activități e ${avgEnergyAfter.toFixed(1)}/10. Te epuizezi.`,
        metric_value: avgEnergyAfter,
        recommendations: ["Identifică activitățile care te drenează", "Adaugă pauze de recuperare"]
      });
    }
    
    if (workPercentage > 80) {
      alerts.push({
        alert_type: 'imbalance',
        severity: 'medium',
        description: `${workPercentage.toFixed(0)}% din timp pe muncă. Viața ta e dezechilibrată.`,
        metric_value: workPercentage,
        recommendations: ["Blochează timp pentru sănătate și relații", "Setează limite clare pentru muncă"]
      });
    }

    return new Response(
      JSON.stringify({
        burnoutRisk: Math.min(100, burnoutScore),
        summary,
        recommendations,
        alerts,
        energyVampires: vampires.map((v: any) => v.activity),
        energyBoosters: boosters.map((b: any) => b.activity),
        categoryBreakdown: categoryTimes,
        avgEnergy: avgEnergyAfter,
        avgSatisfaction
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in time-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
