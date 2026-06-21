// Mind Quiz types — shared schema for all "Minte" category quizzes.
// Bilingual: each text field has _ro and _en variants.

export type MindAxisId =
  | "cognitiva"
  | "emotionala"
  | "afectiva"
  | "volitiva"
  | "comportamentala"
  | "profesionala";

export type BandKey = "A" | "B" | "C";

export interface QuizOption {
  key: BandKey;
  text_ro: string;
  text_en: string;
}

export interface QuizQuestion {
  n: number;
  text_ro: string;
  text_en: string;
  options: QuizOption[];
}

export interface QuizBandInterpretation {
  key: BandKey;
  label_ro: string;
  label_en: string;
  summary_ro: string;
  summary_en: string;
  actions_ro: string[];
  actions_en: string[];
}

export interface MindQuiz {
  slug: string;
  category: "thoughts" | "character" | "perception" | "prp" | "ceo";
  title_ro: string;
  title_en: string;
  description_ro: string;
  description_en: string;
  instructions_ro: string;
  instructions_en: string;
  scaleLabel_ro: string;
  scaleLabel_en: string;
  /** Map BandKey -> points awarded for that answer. Higher = healthier. */
  scoring: Record<BandKey, number>;
  /** Which brain axes this quiz feeds and with what weight (0..1). */
  axes: { axis: MindAxisId; weight: number }[];
  questions: QuizQuestion[];
  bands: QuizBandInterpretation[];
}
