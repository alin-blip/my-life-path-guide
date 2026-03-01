export type BurnoutCategory = 'body' | 'being' | 'balance' | 'business';

export interface BurnoutOption {
  label: string;
  labelRo: string;
  emoji: string;
  points: number;
}

export interface BurnoutQuestion {
  id: string;
  category: BurnoutCategory;
  question: string;
  questionRo: string;
  options: BurnoutOption[];
}

export const burnoutQuestions: BurnoutQuestion[] = [
  // BODY (5 questions)
  {
    id: 'b1_fatigue',
    category: 'body',
    question: 'How often do you feel physically exhausted at the end of the day?',
    questionRo: 'Cât de des te simți obosit fizic la finalul zilei?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '🔥', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '💪', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😐', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '😓', points: 2 },
      { label: 'Almost always', labelRo: 'Aproape mereu', emoji: '😩', points: 1 },
    ],
  },
  {
    id: 'b2_sleep',
    category: 'body',
    question: 'How well do you sleep at night?',
    questionRo: 'Cum dormi noaptea?',
    options: [
      { label: 'Excellent, deep sleep', labelRo: 'Excelent, somn profund', emoji: '😴', points: 5 },
      { label: 'Good, mostly restful', labelRo: 'Bine, de obicei odihnitor', emoji: '🌙', points: 4 },
      { label: 'Average, could be better', labelRo: 'Mediocru, ar putea fi mai bine', emoji: '😐', points: 3 },
      { label: 'Poor, often restless', labelRo: 'Rău, adesea agitat', emoji: '😖', points: 2 },
      { label: 'Terrible, insomnia', labelRo: 'Foarte rău, insomnie', emoji: '🥴', points: 1 },
    ],
  },
  {
    id: 'b3_exercise',
    category: 'body',
    question: 'How often do you exercise or do sports?',
    questionRo: 'Cât de des faci mișcare/sport?',
    options: [
      { label: 'Daily', labelRo: 'Zilnic', emoji: '🏋️', points: 5 },
      { label: '3-4 times/week', labelRo: 'De 3-4 ori/săptămână', emoji: '🏃', points: 4 },
      { label: '1-2 times/week', labelRo: 'De 1-2 ori/săptămână', emoji: '🚶', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '🛋️', points: 2 },
      { label: 'Never', labelRo: 'Niciodată', emoji: '😔', points: 1 },
    ],
  },
  {
    id: 'b4_nutrition',
    category: 'body',
    question: 'How would you rate your diet overall?',
    questionRo: 'Cum te alimentezi în general?',
    options: [
      { label: 'Excellent, balanced', labelRo: 'Excelent, echilibrat', emoji: '🥗', points: 5 },
      { label: 'Good, mostly healthy', labelRo: 'Bine, în mare parte sănătos', emoji: '🍎', points: 4 },
      { label: 'Average, inconsistent', labelRo: 'Mediocru, inconsistent', emoji: '🍕', points: 3 },
      { label: 'Poor, mostly junk food', labelRo: 'Rău, mai mult fast-food', emoji: '🍔', points: 2 },
      { label: 'Very poor, skip meals', labelRo: 'Foarte rău, sar peste mese', emoji: '😣', points: 1 },
    ],
  },
  {
    id: 'b5_pain',
    category: 'body',
    question: 'How often do you have physical pain (back, headaches, tension)?',
    questionRo: 'Cât de des ai dureri fizice (spate, cap, tensiune)?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '✨', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '👌', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😐', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '😣', points: 2 },
      { label: 'Daily', labelRo: 'Zilnic', emoji: '🤕', points: 1 },
    ],
  },

  // BEING (5 questions)
  {
    id: 'be1_overwhelm',
    category: 'being',
    question: 'How often do you feel overwhelmed by thoughts?',
    questionRo: 'Cât de des te simți copleșit de gânduri?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '🧘', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '😌', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '🌀', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '😰', points: 2 },
      { label: 'Constantly', labelRo: 'Constant', emoji: '🤯', points: 1 },
    ],
  },
  {
    id: 'be2_clarity',
    category: 'being',
    question: 'Do you have moments of peace and mental clarity?',
    questionRo: 'Ai momente de liniște și claritate mentală?',
    options: [
      { label: 'Daily', labelRo: 'Zilnic', emoji: '✨', points: 5 },
      { label: 'Most days', labelRo: 'Cele mai multe zile', emoji: '🌅', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😐', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '😶', points: 2 },
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '😵‍💫', points: 1 },
    ],
  },
  {
    id: 'be3_anxiety',
    category: 'being',
    question: 'How often do you feel anxious or stressed?',
    questionRo: 'Cât de des te simți anxios sau stresat?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '😎', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '🙂', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😬', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '😥', points: 2 },
      { label: 'Constantly', labelRo: 'Constant', emoji: '😱', points: 1 },
    ],
  },
  {
    id: 'be4_purpose',
    category: 'being',
    question: 'Do you have a clear purpose in life?',
    questionRo: 'Ai un scop clar în viață?',
    options: [
      { label: 'Absolutely, crystal clear', labelRo: 'Absolut, cristal clar', emoji: '🎯', points: 5 },
      { label: 'Mostly, with some doubts', labelRo: 'În mare parte, cu unele îndoieli', emoji: '💡', points: 4 },
      { label: 'Somewhat', labelRo: 'Oarecum', emoji: '🤔', points: 3 },
      { label: 'Not really', labelRo: 'Nu prea', emoji: '😕', points: 2 },
      { label: 'Completely lost', labelRo: 'Complet pierdut', emoji: '😶‍🌫️', points: 1 },
    ],
  },
  {
    id: 'be5_gratitude',
    category: 'being',
    question: 'How often do you practice gratitude or meditation?',
    questionRo: 'Cât de des practici recunoștința sau meditația?',
    options: [
      { label: 'Daily', labelRo: 'Zilnic', emoji: '🙏', points: 5 },
      { label: 'Several times/week', labelRo: 'De câteva ori/săptămână', emoji: '☀️', points: 4 },
      { label: 'Occasionally', labelRo: 'Ocazional', emoji: '🌤️', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '🌥️', points: 2 },
      { label: 'Never', labelRo: 'Niciodată', emoji: '🌧️', points: 1 },
    ],
  },

  // BALANCE (5 questions)
  {
    id: 'ba1_family',
    category: 'balance',
    question: 'How connected do you feel with your family?',
    questionRo: 'Cât de conectat te simți cu familia?',
    options: [
      { label: 'Deeply connected', labelRo: 'Profund conectat', emoji: '❤️', points: 5 },
      { label: 'Well connected', labelRo: 'Bine conectat', emoji: '🤝', points: 4 },
      { label: 'Average', labelRo: 'Mediocru', emoji: '😐', points: 3 },
      { label: 'Some distance', labelRo: 'Oarecare distanță', emoji: '😔', points: 2 },
      { label: 'Disconnected', labelRo: 'Deconectat', emoji: '💔', points: 1 },
    ],
  },
  {
    id: 'ba2_quality_time',
    category: 'balance',
    question: 'Do you have quality time with important people?',
    questionRo: 'Ai timp de calitate cu oamenii importanți?',
    options: [
      { label: 'Yes, regularly', labelRo: 'Da, regulat', emoji: '🥰', points: 5 },
      { label: 'Most weeks', labelRo: 'Cele mai multe săptămâni', emoji: '😊', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😐', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '😕', points: 2 },
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '🏝️', points: 1 },
    ],
  },
  {
    id: 'ba3_boundaries',
    category: 'balance',
    question: 'How often do you say "no" when you need to?',
    questionRo: 'Cât de des spui "nu" când trebuie?',
    options: [
      { label: 'Always, clear boundaries', labelRo: 'Mereu, limite clare', emoji: '🛡️', points: 5 },
      { label: 'Most of the time', labelRo: 'De cele mai multe ori', emoji: '✋', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😬', points: 3 },
      { label: 'Rarely, I overcommit', labelRo: 'Rar, mă suprasolicit', emoji: '😤', points: 2 },
      { label: 'Never, I say yes to all', labelRo: 'Niciodată, spun da la tot', emoji: '🫠', points: 1 },
    ],
  },
  {
    id: 'ba4_work_life',
    category: 'balance',
    question: 'How is your work-life balance?',
    questionRo: 'Cum e balanța muncă-viață personală?',
    options: [
      { label: 'Excellent harmony', labelRo: 'Armonie excelentă', emoji: '⚖️', points: 5 },
      { label: 'Good, mostly balanced', labelRo: 'Bine, în general echilibrată', emoji: '👍', points: 4 },
      { label: 'Average', labelRo: 'Mediocru', emoji: '😐', points: 3 },
      { label: 'Work dominates', labelRo: 'Munca domină', emoji: '⚠️', points: 2 },
      { label: 'Completely unbalanced', labelRo: 'Complet dezechilibrată', emoji: '💥', points: 1 },
    ],
  },
  {
    id: 'ba5_support',
    category: 'balance',
    question: 'Do you feel emotionally supported by those around you?',
    questionRo: 'Te simți susținut emoțional de cei din jur?',
    options: [
      { label: 'Absolutely', labelRo: 'Absolut', emoji: '🫂', points: 5 },
      { label: 'Mostly yes', labelRo: 'În mare parte da', emoji: '🤗', points: 4 },
      { label: 'Somewhat', labelRo: 'Oarecum', emoji: '😐', points: 3 },
      { label: 'Not really', labelRo: 'Nu prea', emoji: '😞', points: 2 },
      { label: 'Completely alone', labelRo: 'Complet singur', emoji: '🏚️', points: 1 },
    ],
  },

  // BUSINESS (5 questions)
  {
    id: 'bu1_satisfaction',
    category: 'business',
    question: 'How satisfied are you with your career progress?',
    questionRo: 'Cât de satisfăcut ești de progresul profesional?',
    options: [
      { label: 'Very satisfied', labelRo: 'Foarte satisfăcut', emoji: '🚀', points: 5 },
      { label: 'Satisfied', labelRo: 'Satisfăcut', emoji: '📈', points: 4 },
      { label: 'Neutral', labelRo: 'Neutru', emoji: '😐', points: 3 },
      { label: 'Dissatisfied', labelRo: 'Nemulțumit', emoji: '😤', points: 2 },
      { label: 'Very frustrated', labelRo: 'Foarte frustrat', emoji: '😠', points: 1 },
    ],
  },
  {
    id: 'bu2_overtime',
    category: 'business',
    question: 'How often do you work overtime?',
    questionRo: 'Cât de des lucrezi peste program?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '🎯', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '👌', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '⏰', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '🕐', points: 2 },
      { label: 'Almost always', labelRo: 'Aproape mereu', emoji: '🔥', points: 1 },
    ],
  },
  {
    id: 'bu3_impact',
    category: 'business',
    question: 'Do you feel your work has real impact?',
    questionRo: 'Simți că munca ta are impact real?',
    options: [
      { label: 'Absolutely', labelRo: 'Absolut', emoji: '💎', points: 5 },
      { label: 'Mostly yes', labelRo: 'În mare parte da', emoji: '⭐', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '🤔', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '😕', points: 2 },
      { label: 'Not at all', labelRo: 'Deloc', emoji: '💨', points: 1 },
    ],
  },
  {
    id: 'bu4_priorities',
    category: 'business',
    question: 'How clear are your work priorities?',
    questionRo: 'Cât de clar îți sunt prioritățile la muncă?',
    options: [
      { label: 'Crystal clear', labelRo: 'Cristal clar', emoji: '🎯', points: 5 },
      { label: 'Mostly clear', labelRo: 'În mare parte clare', emoji: '📋', points: 4 },
      { label: 'Somewhat clear', labelRo: 'Oarecum clare', emoji: '🌀', points: 3 },
      { label: 'Confusing', labelRo: 'Confuze', emoji: '😵', points: 2 },
      { label: 'Total chaos', labelRo: 'Haos total', emoji: '🌪️', points: 1 },
    ],
  },
  {
    id: 'bu5_procrastination',
    category: 'business',
    question: 'How often do you procrastinate on important tasks?',
    questionRo: 'Cât de des amâni taskuri importante?',
    options: [
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '⚡', points: 5 },
      { label: 'Rarely', labelRo: 'Rar', emoji: '✅', points: 4 },
      { label: 'Sometimes', labelRo: 'Uneori', emoji: '😬', points: 3 },
      { label: 'Often', labelRo: 'Des', emoji: '📱', points: 2 },
      { label: 'Constantly', labelRo: 'Constant', emoji: '🐌', points: 1 },
    ],
  },
];

export const burnoutCategoryLabels: Record<BurnoutCategory, { en: string; ro: string; color: string; emoji: string }> = {
  body: { en: 'Body', ro: 'Corp', color: '#22c55e', emoji: '💪' },
  being: { en: 'Being', ro: 'Minte', color: '#8b5cf6', emoji: '🧘' },
  balance: { en: 'Balance', ro: 'Echilibru', color: '#ec4899', emoji: '❤️' },
  business: { en: 'Business', ro: 'Business', color: '#3b82f6', emoji: '🚀' },
};

export interface BurnoutLevel {
  level: string;
  levelRo: string;
  color: string;
  emoji: string;
  description: string;
  descriptionRo: string;
}

export const getBurnoutLevel = (score: number): BurnoutLevel => {
  if (score >= 80) {
    return {
      level: 'Thriving',
      levelRo: 'Înfloritor',
      color: '#22c55e',
      emoji: '🌟',
      description: 'You\'re in excellent shape! Keep your habits and routines strong.',
      descriptionRo: 'Ești în formă excelentă! Menține-ți obiceiurile și rutinele.',
    };
  }
  if (score >= 60) {
    return {
      level: 'Growing',
      levelRo: 'În Creștere',
      color: '#3b82f6',
      emoji: '📈',
      description: 'Good foundation! Small adjustments can take you to the next level.',
      descriptionRo: 'Fundație bună! Mici ajustări te pot duce la următorul nivel.',
    };
  }
  if (score >= 40) {
    return {
      level: 'Warning',
      levelRo: 'Atenție',
      color: '#f59e0b',
      emoji: '⚠️',
      description: 'Signs of burnout detected. Take action now before it gets worse.',
      descriptionRo: 'Semne de burnout detectate. Acționează acum înainte să se agraveze.',
    };
  }
  if (score >= 20) {
    return {
      level: 'Burnout',
      levelRo: 'Burnout Activ',
      color: '#ef4444',
      emoji: '🔥',
      description: 'Active burnout. You need help and a recovery plan immediately.',
      descriptionRo: 'Burnout activ. Ai nevoie de ajutor și un plan de recuperare imediat.',
    };
  }
  return {
    level: 'Critical',
    levelRo: 'Critic',
    color: '#991b1b',
    emoji: '🆘',
    description: 'Critical situation. Seek professional help and make urgent changes.',
    descriptionRo: 'Situație critică. Caută ajutor profesional și fă schimbări urgente.',
  };
};

export const burnoutRecommendations: Record<BurnoutCategory, { en: string[]; ro: string[] }> = {
  body: {
    en: [
      'Start with 10 minutes of movement daily',
      'Prioritize 7-8 hours of quality sleep',
      'Drink more water, eat more whole foods',
    ],
    ro: [
      'Începe cu 10 minute de mișcare zilnic',
      'Prioritizează 7-8 ore de somn de calitate',
      'Bea mai multă apă, mănâncă alimente integrale',
    ],
  },
  being: {
    en: [
      'Practice 5 minutes of meditation daily',
      'Write 3 gratitude items each morning',
      'Disconnect from screens 1 hour before bed',
    ],
    ro: [
      'Practică 5 minute de meditație zilnic',
      'Scrie 3 lucruri de recunoștință dimineața',
      'Deconectează-te de la ecrane cu 1 oră înainte de somn',
    ],
  },
  balance: {
    en: [
      'Schedule quality time with loved ones weekly',
      'Set clear boundaries - learn to say no',
      'Create a work-life separation ritual',
    ],
    ro: [
      'Programează timp de calitate cu cei dragi săptămânal',
      'Setează limite clare - învață să spui nu',
      'Creează un ritual de separare muncă-viață',
    ],
  },
  business: {
    en: [
      'Define your top 3 priorities each morning',
      'Use time-blocking for deep work',
      'Delegate or eliminate low-impact tasks',
    ],
    ro: [
      'Definește cele mai importante 3 priorități dimineața',
      'Folosește time-blocking pentru muncă profundă',
      'Delegă sau elimină taskurile cu impact scăzut',
    ],
  },
};
