// Shared scoring scale used by all "ganduri" quizzes.
// A = always (1pt — unhealthy), B = sometimes (2pt), C = never (3pt — healthy)
import type { QuizOption, BandKey } from "./types";

export const STANDARD_SCORING: Record<BandKey, number> = { A: 1, B: 2, C: 3 };

export const STANDARD_OPTIONS: QuizOption[] = [
  { key: "A", text_ro: "Tot timpul", text_en: "All the time" },
  { key: "B", text_ro: "Uneori", text_en: "Sometimes" },
  { key: "C", text_ro: "Niciodată", text_en: "Never" },
];

export const STANDARD_INSTRUCTIONS_RO =
  "Răspunde sincer, fără să analizezi excesiv. Alege varianta cea mai apropiată de realitatea ta.";
export const STANDARD_INSTRUCTIONS_EN =
  "Answer honestly, without overthinking. Pick the option closest to your reality.";

export const STANDARD_SCALE_RO = "Scala A=Tot timpul · B=Uneori · C=Niciodată";
export const STANDARD_SCALE_EN = "Scale A=All the time · B=Sometimes · C=Never";

/** Helper to build a 10-item question array from RO/EN pairs. */
export function buildQuestions(
  pairs: Array<{ ro: string; en: string }>,
) {
  return pairs.map((p, i) => ({
    n: i + 1,
    text_ro: p.ro,
    text_en: p.en,
    options: STANDARD_OPTIONS,
  }));
}
