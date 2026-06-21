// Mind Quiz registry — central import for all quizzes in the "Minte" category.
import type { MindQuiz, BandKey } from "./types";
import { THOUGHT_QUIZZES } from "./thoughts";
import { CHARACTER_QUIZZES } from "./character";
import { PRP_QUIZZES } from "./prp";
import { PERCEPTION_QUIZZES } from "./perception";
import { CEO_QUIZZES } from "./ceo";

export const ALL_MIND_QUIZZES: MindQuiz[] = [
  ...THOUGHT_QUIZZES,
  ...CHARACTER_QUIZZES,
  ...PRP_QUIZZES,
  ...PERCEPTION_QUIZZES,
  ...CEO_QUIZZES,
];

export const QUIZ_BY_SLUG: Record<string, MindQuiz> = ALL_MIND_QUIZZES.reduce(
  (acc, q) => {
    acc[q.slug] = q;
    return acc;
  },
  {} as Record<string, MindQuiz>,
);

export function getMindQuiz(slug: string): MindQuiz | undefined {
  return QUIZ_BY_SLUG[slug];
}

export interface QuizScoreResult {
  raw: number;
  max: number;
  scoreHealthy: number; // 0-100
  band: BandKey;
  axesDistribution: Record<string, number>; // axis -> healthy 0-100 contribution
}

/**
 * Compute score from a record of answers: { "1": "A", "2": "C", ... }
 * Higher healthy = more C answers (never).
 */
export function scoreMindQuiz(
  quiz: MindQuiz,
  answers: Record<string, BandKey>,
): QuizScoreResult {
  let raw = 0;
  const max = quiz.questions.length * Math.max(...Object.values(quiz.scoring));
  const min = quiz.questions.length * Math.min(...Object.values(quiz.scoring));

  for (const q of quiz.questions) {
    const ans = answers[String(q.n)];
    if (ans && quiz.scoring[ans] != null) {
      raw += quiz.scoring[ans];
    }
  }

  const scoreHealthy = ((raw - min) / (max - min)) * 100;

  // Band thresholds: 0-40 = A (unhealthy), 40-70 = B (mid), 70-100 = C (healthy)
  let band: BandKey = "B";
  if (scoreHealthy < 40) band = "A";
  else if (scoreHealthy >= 70) band = "C";

  // Axis distribution: each axis contribution = scoreHealthy * weight
  const axesDistribution: Record<string, number> = {};
  for (const a of quiz.axes) {
    axesDistribution[a.axis] = Math.round(scoreHealthy * a.weight);
  }

  return {
    raw,
    max,
    scoreHealthy: Math.round(scoreHealthy),
    band,
    axesDistribution,
  };
}
