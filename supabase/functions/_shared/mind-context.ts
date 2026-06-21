// Shared Minte (Mind) context builder for AI coaches.
//
// Loads the user's brain map axis scores, latest mind-quiz responses,
// belief-matrix progress and PSA reconstruction progress, then formats
// it into a compact text block plus a list of priority recommendations
// that the coaches MUST surface.
//
// The "Minte" category is the foundation of CEO Mind OS, so every coach
// must read this and prioritize Mind work over anything else when scores
// are low / missing.

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface MindAxisRow {
  axis: string;
  score_healthy: number;
  contributing_quizzes: number | null;
  status: string | null;
}

export interface MindQuizResponseRow {
  quiz_slug: string;
  band: string | null;
  score_healthy: number | null;
  completed_at: string | null;
}

export interface MintePriorityRecommendation {
  /** Stable id so callers can pick one to surface. */
  key: string;
  /** Severity: critical = must surface now, suggested = nice to bring up. */
  severity: "critical" | "suggested";
  /** Human reason in RO. */
  reason: string;
  /** Concrete CTA (route + label). */
  cta: { label: string; route: string };
}

export interface MinteContext {
  /** Text block to append to the coach's system prompt. */
  promptBlock: string;
  /** Prioritized recommendations the coach should surface when relevant. */
  recommendations: MintePriorityRecommendation[];
  /** Raw data, in case a coach wants to render it differently. */
  raw: {
    axes: MindAxisRow[];
    recentResponses: MindQuizResponseRow[];
    beliefMatrixCount: number;
    psaCount: number;
    totalQuizzesAvailable: number;
    completedQuizSlugs: string[];
  };
}

/** Total mind quizzes shipped today (kept in sync with src/data/mind-quizzes). */
const TOTAL_MIND_QUIZZES = 28;

const AXIS_RO: Record<string, string> = {
  cognitiva: "Cognitivă",
  emotionala: "Emoțională",
  afectiva: "Afectivă",
  volitiva: "Volitivă",
  comportamentala: "Comportamentală",
  profesionala: "Profesională",
};

const BAND_RO: Record<string, string> = {
  A: "verde (sănătos)",
  B: "galben (mediu)",
  C: "roșu (de lucrat)",
};

export async function loadMinteContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<MinteContext> {
  const [axesRes, respRes, beliefRes, psaRes] = await Promise.all([
    supabase
      .from("mind_axis_scores")
      .select("axis, score_healthy, contributing_quizzes, status")
      .eq("user_id", userId),
    supabase
      .from("mind_quiz_responses")
      .select("quiz_slug, band, score_healthy, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(50),
    supabase
      .from("mind_belief_matrix")
      .select("belief_key", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("mind_psa_reconstruction")
      .select("belief_key, progress_percent", { count: "exact" })
      .eq("user_id", userId),
  ]);

  const axes = ((axesRes.data ?? []) as MindAxisRow[]) || [];
  const allResponses = (respRes.data ?? []) as MindQuizResponseRow[];

  // Latest response per quiz_slug (responses already ordered desc).
  const latestPerSlug = new Map<string, MindQuizResponseRow>();
  for (const r of allResponses) {
    if (!latestPerSlug.has(r.quiz_slug)) latestPerSlug.set(r.quiz_slug, r);
  }
  const recentResponses = Array.from(latestPerSlug.values()).slice(0, 10);
  const completedQuizSlugs = Array.from(latestPerSlug.keys());

  const beliefMatrixCount = beliefRes.count ?? 0;
  const psaCount = psaRes.count ?? 0;

  const recommendations: MintePriorityRecommendation[] = [];

  // ---------- RECOMMENDATION ENGINE ----------

  // A. Never assessed → critical onboarding push.
  if (completedQuizSlugs.length === 0) {
    recommendations.push({
      key: "no-tests-yet",
      severity: "critical",
      reason:
        "Userul NU a făcut niciun test de Minte. Mind este FUNDAȚIA aplicației — totul derivă de aici. " +
        "Trebuie să facă primul test ÎNAINTE de orice altă recomandare.",
      cta: { label: "Fă primul test de Minte", route: "/minte/teste" },
    });
  }

  // B. Quizzes in band C (red) — surface up to 3.
  const redResponses = recentResponses.filter((r) => r.band === "C").slice(0, 3);
  for (const r of redResponses) {
    recommendations.push({
      key: `red-band:${r.quiz_slug}`,
      severity: "critical",
      reason: `Testul «${r.quiz_slug}» e în banda roșie (scor ${Math.round(
        r.score_healthy ?? 0,
      )}/100). Pattern toxic activ — recomandă PSA Reconstrucție.`,
      cta: {
        label: "Deschide PSA Reconstrucție",
        route: "/minte/psa",
      },
    });
  }

  // C. Weak brain-map axes (< 50/100) — bring up Belief Matrix work.
  const weakAxes = axes
    .filter((a) => a.score_healthy < 50)
    .sort((a, b) => a.score_healthy - b.score_healthy)
    .slice(0, 2);
  for (const a of weakAxes) {
    recommendations.push({
      key: `weak-axis:${a.axis}`,
      severity: "suggested",
      reason: `Axa ${AXIS_RO[a.axis] ?? a.axis} e la ${Math.round(
        a.score_healthy,
      )}/100. Recomandă Matricea Credințelor (credințele care întăresc această axă).`,
      cta: {
        label: "Deschide Matricea Credințelor",
        route: "/minte/credinte",
      },
    });
  }

  // D. Many uncompleted quizzes — nudge to keep building Brain Map.
  if (
    completedQuizSlugs.length > 0 &&
    completedQuizSlugs.length < TOTAL_MIND_QUIZZES / 2
  ) {
    recommendations.push({
      key: "brain-map-incomplete",
      severity: "suggested",
      reason: `Brain Map-ul are doar ${completedQuizSlugs.length}/${TOTAL_MIND_QUIZZES} teste. Sugerează unul nou pentru a completa harta.`,
      cta: { label: "Continuă cu următorul test", route: "/minte/teste" },
    });
  }

  // E. No belief matrix work yet.
  if (beliefMatrixCount === 0 && completedQuizSlugs.length > 0) {
    recommendations.push({
      key: "no-belief-matrix",
      severity: "suggested",
      reason:
        "Userul are scoruri, dar nu a început Matricea Credințelor CEO. Sugerează să instaleze credințele care îi întăresc axele slabe.",
      cta: {
        label: "Începe Matricea Credințelor",
        route: "/minte/credinte",
      },
    });
  }

  // ---------- BUILD PROMPT BLOCK ----------

  const lines: string[] = [];
  lines.push("");
  lines.push("═══════════════════════════════════");
  lines.push("🧠 CATEGORIA MINTE — FUNDAȚIA APLICAȚIEI");
  lines.push("═══════════════════════════════════");
  lines.push(
    "CEO Mind OS = «Founder Operating System». MINTEA e fundația; orice progres pe Body/Being/Balance/Business e plafonat de mind set. " +
      "PRIORITIZEAZĂ tot ce ține de Minte (Brain Map, Teste, Matricea Credințelor, PSA Reconstrucție) ÎN FAȚA oricărui alt sfat.",
  );
  lines.push("");
  lines.push("📍 INFRASTRUCTURĂ DISPONIBILĂ (poți trimite userul aici):");
  lines.push("• /minte                 — Brain Map (6 axe) + overview");
  lines.push("• /minte/teste           — 28 teste bilingve (gânduri, caracter, percepție, PRP, anti-CEO)");
  lines.push("• /minte/teste/{slug}    — testul individual");
  lines.push("• /minte/credinte        — Matricea Credințelor CEO (10 credințe × 10 câmpuri)");
  lines.push(
    "• /minte/psa             — PSA Reconstrucție (8 tipare toxice CEO: perfecționism, impostor, scarcitate, control, hustle/burnout, people-pleasing, procrastinare, frica de succes)",
  );
  lines.push("");
  lines.push("📊 STAREA ACTUALĂ A UTILIZATORULUI:");

  if (axes.length === 0) {
    lines.push("• Brain Map: NEEVALUAT (0/6 axe)");
  } else {
    lines.push("• Brain Map (0–100, mai mare = mai sănătos):");
    for (const a of axes) {
      const status = a.status ? ` [${a.status}]` : "";
      lines.push(
        `  - ${AXIS_RO[a.axis] ?? a.axis}: ${Math.round(a.score_healthy)}/100${status}`,
      );
    }
    const missingAxes = Object.keys(AXIS_RO).filter(
      (k) => !axes.find((a) => a.axis === k),
    );
    if (missingAxes.length > 0) {
      lines.push(
        `  - Neevaluate: ${missingAxes.map((k) => AXIS_RO[k]).join(", ")}`,
      );
    }
  }

  lines.push(
    `• Teste completate: ${completedQuizSlugs.length}/${TOTAL_MIND_QUIZZES}`,
  );

  if (recentResponses.length > 0) {
    lines.push("• Ultimele rezultate (cele mai recente 5):");
    for (const r of recentResponses.slice(0, 5)) {
      const band = r.band ? BAND_RO[r.band] ?? r.band : "—";
      lines.push(
        `  - ${r.quiz_slug}: ${Math.round(r.score_healthy ?? 0)}/100, bandă ${band}`,
      );
    }
  }

  lines.push(`• Matricea Credințelor: ${beliefMatrixCount}/10 credințe începute`);
  lines.push(`• PSA Reconstrucție: ${psaCount}/8 tipare începute`);

  // ---------- ACTION DIRECTIVES ----------

  if (recommendations.length > 0) {
    lines.push("");
    lines.push("🎯 PRIORITĂȚI DE COACHING (CRITIC → ÎNCEPE DE AICI):");
    let i = 1;
    for (const rec of recommendations) {
      const tag = rec.severity === "critical" ? "[CRITIC]" : "[sugerat]";
      lines.push(`${i}. ${tag} ${rec.reason}`);
      lines.push(`   → CTA: ${rec.cta.label} (${rec.cta.route})`);
      i++;
    }
  }

  lines.push("");
  lines.push("🔑 REGULI DE PRIORITIZARE PENTRU TINE (coach):");
  lines.push(
    "1. Dacă userul nu a făcut niciun test de Minte → PRIMA TA recomandare e să facă unul. Nu sări peste asta.",
  );
  lines.push(
    "2. Dacă există teste în BANDA ROȘIE → recomandă PSA Reconstrucție pentru tiparul corespunzător înainte de orice tactică de business/body.",
  );
  lines.push(
    "3. Dacă axele sunt slabe (<50) → leagă orice obiectiv de o credință din Matrice care întărește axa respectivă.",
  );
  lines.push(
    "4. Trimite userul către rute concrete (/minte, /minte/teste, /minte/credinte, /minte/psa) când recomanzi ceva pe Minte.",
  );
  lines.push(
    "5. NU inventa teste sau axe care nu sunt listate mai sus. Foloseste DOAR numele de aici.",
  );

  return {
    promptBlock: lines.join("\n"),
    recommendations,
    raw: {
      axes,
      recentResponses,
      beliefMatrixCount,
      psaCount,
      totalQuizzesAvailable: TOTAL_MIND_QUIZZES,
      completedQuizSlugs,
    },
  };
}
