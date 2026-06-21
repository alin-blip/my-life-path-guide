// PSA Personalization — derives concrete, context-aware Problem/Substitute/Action
// steps from the user's brain map axes and most recent quiz scores.
//
// The base pattern always shows. These personalized steps are extra, contextual
// guidance ("Because you scored X on test Y, here is what to do this week").

import type { MindAxisId, BandKey } from "@/data/mind-quizzes/types";
import type { PsaPattern } from "@/data/mind-psa/toxic-patterns";
import type { MindAxisScoreRow, MindQuizResponseRow } from "@/services/mindQuizService";
import { getMindQuiz } from "@/data/mind-quizzes";

export interface PersonalizedStep {
  /** Localized one-line label. */
  label: string;
  /** Localized concrete next move. */
  action: string;
  /** Why we surface this step right now. */
  reason: string;
}

export interface PersonalizedSteps {
  problemNotes: PersonalizedStep[];
  substituteNotes: PersonalizedStep[];
  actionNotes: PersonalizedStep[];
}

const AXIS_LABEL: Record<MindAxisId, { ro: string; en: string }> = {
  cognitiva: { ro: "Cognitivă", en: "Cognitive" },
  emotionala: { ro: "Emoțională", en: "Emotional" },
  afectiva: { ro: "Afectivă", en: "Affective" },
  volitiva: { ro: "Volitivă", en: "Volitional" },
  comportamentala: { ro: "Comportamentală", en: "Behavioral" },
  profesionala: { ro: "Profesională", en: "Professional" },
};

/** Per-axis tactical playbook used by the personalization engine. */
const AXIS_PLAYBOOK: Record<
  MindAxisId,
  {
    problem_ro: string; problem_en: string;
    substitute_ro: string; substitute_en: string;
    action_ro: string; action_en: string;
  }
> = {
  cognitiva: {
    problem_ro: "Gândul vine pe automat — fără filtru, fără pauză.",
    problem_en: "The thought fires on autopilot — no filter, no pause.",
    substitute_ro: "Pun o întrebare critică între stimul și reacție: «Ce dovadă am că e adevărat?»",
    substitute_en: "I insert a critical question between stimulus and reaction: «What evidence do I have that this is true?»",
    action_ro: "Ține un jurnal de 5 gânduri / zi, 7 zile — notează gândul + 1 contra-dovadă.",
    action_en: "Keep a 5-thoughts-per-day journal for 7 days — write the thought + 1 counter-evidence.",
  },
  emotionala: {
    problem_ro: "Emoția te conduce — decizi din panică, nu din claritate.",
    problem_en: "The emotion drives you — you decide from panic, not clarity.",
    substitute_ro: "Sunt observatorul emoției, nu emoția însăși. Aștept 90 de secunde înainte să reacționez.",
    substitute_en: "I am the observer of the emotion, not the emotion itself. I wait 90 seconds before reacting.",
    action_ro: "Box breathing 4-4-4-4 timp de 3 minute înainte de orice decizie importantă azi.",
    action_en: "Box breathing 4-4-4-4 for 3 minutes before any important decision today.",
  },
  afectiva: {
    problem_ro: "Te conectezi prin frică sau aprobare — nu prin valoare reală.",
    problem_en: "You connect through fear or approval — not from real value.",
    substitute_ro: "Relațiile sănătoase trăiesc din adevăr, nu din confort. Spun ce gândesc cu blândețe.",
    substitute_en: "Healthy relationships live on truth, not comfort. I say what I think, kindly.",
    action_ro: "O conversație onestă săptămâna asta cu cineva la care eviți să spui ce simți.",
    action_en: "One honest conversation this week with someone you avoid telling the truth to.",
  },
  volitiva: {
    problem_ro: "Voința ta e diluată de prea multe opțiuni deschise — nu finalizezi.",
    problem_en: "Your will is diluted by too many open options — you don't finish.",
    substitute_ro: "Aleg unul. Închid celelalte uși până termin ce am început.",
    substitute_en: "I pick one. I close other doors until I finish what I started.",
    action_ro: "Identifică «cel mai important 1 lucru» al săptămânii și blochează 3 ore / zi pentru el.",
    action_en: "Identify «the one most important thing» of the week and block 3 hours / day for it.",
  },
  comportamentala: {
    problem_ro: "Tiparul e instalat în calendar — nu e doar mental, e și operațional.",
    problem_en: "The pattern is wired into your calendar — it's not only mental, it's operational.",
    substitute_ro: "Schimb mediul și ritualul. Comportamentul nou are nevoie de un slot fix în calendar.",
    substitute_en: "I change the environment and the ritual. The new behavior needs a fixed slot in the calendar.",
    action_ro: "Programează în calendar 1 ritual nou de 20 min, la aceeași oră, 7 zile la rând.",
    action_en: "Schedule 1 new ritual, 20 minutes, same time, 7 days in a row.",
  },
  profesionala: {
    problem_ro: "Tiparul îți blochează direct rezultatele de business — nu doar starea.",
    problem_en: "The pattern is blocking your business results — not just your state of mind.",
    substitute_ro: "Conduc business-ul ca un sistem măsurabil. Decid pe baza datelor, nu a fricii.",
    substitute_en: "I run the business as a measurable system. I decide on data, not on fear.",
    action_ro: "Definește 1 KPI care reflectă noua credință și verifică-l săptămânal 30 de zile.",
    action_en: "Define 1 KPI that reflects the new belief and check it weekly for 30 days.",
  },
};

const BAND_LABEL: Record<BandKey, { ro: string; en: string }> = {
  A: { ro: "verde", en: "green" },
  B: { ro: "galben", en: "yellow" },
  C: { ro: "roșu", en: "red" },
};

/** Returns up to 2 weakest brain axes from the user's scores. */
export function weakestAxes(rows: MindAxisScoreRow[], count = 2): MindAxisId[] {
  return [...rows]
    .sort((a, b) => a.score_healthy - b.score_healthy)
    .slice(0, count)
    .map((r) => r.axis as MindAxisId);
}

/** Quiz response data we need to render a recommendation reason. */
export interface RecommendationTrigger {
  kind: "quiz" | "axis" | null;
  /** Higher = stronger recommendation. */
  weight: number;
  /** Localized human reason ("Triggered by test X (score Y)"). */
  reason_ro: string;
  reason_en: string;
  /** When kind === "quiz", the matched response. */
  quiz?: {
    slug: string;
    title_ro: string;
    title_en: string;
    score: number;
    band: BandKey;
  };
  /** When kind === "axis", the axis that triggered the recommendation. */
  axis?: { id: MindAxisId; score: number };
}

export function computeTrigger(
  pattern: PsaPattern,
  axisScores: MindAxisScoreRow[],
  responses: Record<string, MindQuizResponseRow>,
): RecommendationTrigger {
  // Strongest signal: a related quiz scored in band C.
  for (const slug of pattern.relatedQuizSlugs) {
    const r = responses[slug];
    if (!r || r.band !== "C") continue;
    const quiz = getMindQuiz(slug);
    const score = Number(r.score_healthy ?? 0);
    return {
      kind: "quiz",
      weight: 2,
      quiz: {
        slug,
        title_ro: quiz?.title_ro ?? slug,
        title_en: quiz?.title_en ?? slug,
        score,
        band: r.band,
      },
      reason_ro: `Test «${quiz?.title_ro ?? slug}» — scor ${score}/100 (bandă ${BAND_LABEL.C.ro})`,
      reason_en: `Test «${quiz?.title_en ?? slug}» — score ${score}/100 (${BAND_LABEL.C.en} band)`,
    };
  }

  // Fallback: pattern targets one of the user's 2 weakest axes.
  const weak = weakestAxes(axisScores, 2);
  const axisHit = pattern.axes.find((a) => weak.includes(a));
  if (axisHit) {
    const row = axisScores.find((r) => r.axis === axisHit);
    const score = Math.round(row?.score_healthy ?? 0);
    return {
      kind: "axis",
      weight: 1,
      axis: { id: axisHit, score },
      reason_ro: `Axă slabă: ${AXIS_LABEL[axisHit].ro} (${score}/100)`,
      reason_en: `Weak axis: ${AXIS_LABEL[axisHit].en} (${score}/100)`,
    };
  }

  return {
    kind: null,
    weight: 0,
    reason_ro: "",
    reason_en: "",
  };
}

/**
 * Build personalized P/S/A notes based on the strongest signal we have for
 * this pattern. Empty arrays when there's no triggering data yet.
 */
export function personalizeSteps(
  pattern: PsaPattern,
  trigger: RecommendationTrigger,
  axisScores: MindAxisScoreRow[],
  lang: "ro" | "en",
): PersonalizedSteps {
  const steps: PersonalizedSteps = {
    problemNotes: [],
    substituteNotes: [],
    actionNotes: [],
  };

  // 1) Add a note for the pattern's own primary axis (always).
  const primaryAxis = pattern.axes[0];
  if (primaryAxis) {
    const pb = AXIS_PLAYBOOK[primaryAxis];
    const axisRow = axisScores.find((r) => r.axis === primaryAxis);
    const axisLabel = AXIS_LABEL[primaryAxis][lang];
    const axisScore = axisRow ? Math.round(axisRow.score_healthy) : null;
    const reason =
      axisScore != null
        ? lang === "en"
          ? `Your ${axisLabel} axis is at ${axisScore}/100`
          : `Axa ta ${axisLabel} e la ${axisScore}/100`
        : lang === "en"
          ? `Targets your ${axisLabel} axis`
          : `Țintește axa ta ${axisLabel}`;

    steps.problemNotes.push({
      label: lang === "en" ? `${axisLabel} axis` : `Axă ${axisLabel}`,
      action: lang === "en" ? pb.problem_en : pb.problem_ro,
      reason,
    });
    steps.substituteNotes.push({
      label: lang === "en" ? `${axisLabel} axis` : `Axă ${axisLabel}`,
      action: lang === "en" ? pb.substitute_en : pb.substitute_ro,
      reason,
    });
    steps.actionNotes.push({
      label: lang === "en" ? `${axisLabel} axis` : `Axă ${axisLabel}`,
      action: lang === "en" ? pb.action_en : pb.action_ro,
      reason,
    });
  }

  // 2) If a quiz triggered the recommendation, add a quiz-specific action.
  if (trigger.kind === "quiz" && trigger.quiz) {
    const q = trigger.quiz;
    const title = lang === "en" ? q.title_en : q.title_ro;
    steps.actionNotes.unshift({
      label: lang === "en" ? `From test "${title}"` : `Din testul «${title}»`,
      action:
        lang === "en"
          ? `Re-take "${title}" in 14 days; target raising it from ${q.score} to at least ${Math.min(100, q.score + 15)}/100.`
          : `Refă «${title}» în 14 zile; țintește să-l urci de la ${q.score} la cel puțin ${Math.min(100, q.score + 15)}/100.`,
      reason:
        lang === "en"
          ? `Your last score put this test in the red band.`
          : `Ultimul tău scor a pus testul în banda roșie.`,
    });
  }

  return steps;
}
