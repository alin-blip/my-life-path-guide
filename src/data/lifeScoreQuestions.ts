// ============= Full file contents =============

export type LifeScoreCategory = 'body' | 'being' | 'balance' | 'business' | 'overall';

export interface LifeScoreOption {
  label: string;
  labelRo: string;
  emoji: string;
  points: number;
}

export interface LifeScoreQuestion {
  id: string;
  category: LifeScoreCategory;
  question: string;
  questionRo: string;
  options: LifeScoreOption[];
}

/** A localized (single-language) version of a question, used by the quiz UI. */
export interface LifeScoreQuestionLocalized {
  id: string;
  category: LifeScoreCategory;
  question: string;
  options: Array<{ label: string; emoji: string; points: number }>;
}

export const lifeScoreQuestions: LifeScoreQuestion[] = [
  {
    id: 'quick_body',
    category: 'body',
    question: 'How would you rate your physical energy right now?',
    questionRo: 'Cum ți-ai evalua energia fizică în acest moment?',
    options: [
      { label: 'On fire! I feel unstoppable', labelRo: 'Foc! Mă simt de neoprit', emoji: '🔥', points: 4 },
      { label: 'Pretty good, no complaints', labelRo: 'Destul de bine, fără plângeri', emoji: '👍', points: 3 },
      { label: 'Could be better, often tired', labelRo: 'Ar putea fi mai bine, adesea obosit', emoji: '😐', points: 2 },
      { label: 'Running on empty', labelRo: 'Rulează pe gol', emoji: '😩', points: 1 },
    ],
  },
  {
    id: 'quick_being',
    category: 'being',
    question: 'How often do you feel inner peace and mental clarity?',
    questionRo: 'Cât de des simți pace interioară și claritate mentală?',
    options: [
      { label: 'Daily - I have rituals', labelRo: 'Zilnic - am ritualuri', emoji: '🧘', points: 4 },
      { label: 'Most days', labelRo: 'Cele mai multe zile', emoji: '✨', points: 3 },
      { label: 'Rarely - too much chaos', labelRo: 'Rar - prea mult haos', emoji: '🌀', points: 2 },
      { label: 'Almost never', labelRo: 'Aproape niciodată', emoji: '😶‍🌫️', points: 1 },
    ],
  },
  {
    id: 'quick_balance',
    category: 'balance',
    question: 'How connected do you feel to the important people in your life?',
    questionRo: 'Cât de conectat te simți cu oamenii importanți din viața ta?',
    options: [
      { label: 'Deeply connected', labelRo: 'Profund conectat', emoji: '❤️', points: 4 },
      { label: 'Mostly good relationships', labelRo: 'În general relații bune', emoji: '🤝', points: 3 },
      { label: 'Some distance lately', labelRo: 'Puțină distanță în ultima vreme', emoji: '😔', points: 2 },
      { label: 'Isolated or struggling', labelRo: 'Izolat sau cu dificultăți', emoji: '🏝️', points: 1 },
    ],
  },
  {
    id: 'quick_business',
    category: 'business',
    question: 'How satisfied are you with your career/business progress?',
    questionRo: 'Cât de mulțumit ești de progresul în carieră/afacere?',
    options: [
      { label: 'Crushing it! Exceeding goals', labelRo: 'O zdrobesc! Depășesc obiectivele', emoji: '🚀', points: 4 },
      { label: 'On track, growing steadily', labelRo: 'Pe drumul cel bun, cresc constant', emoji: '📈', points: 3 },
      { label: 'Stuck, need a breakthrough', labelRo: 'Blocat, am nevoie de o schimbare', emoji: '🤔', points: 2 },
      { label: 'Frustrated, losing ground', labelRo: 'Frustrat, pierd teren', emoji: '😤', points: 1 },
    ],
  },
  {
    id: 'quick_overall',
    category: 'overall',
    question: 'Overall, how would you rate your life satisfaction right now?',
    questionRo: 'În general, cum ți-ai evalua satisfacția în viață acum?',
    options: [
      { label: 'Living my best life!', labelRo: 'Trăiesc cea mai bună viață!', emoji: '🌟', points: 4 },
      { label: 'Good, but room to grow', labelRo: 'Bine, dar loc de creștere', emoji: '💪', points: 3 },
      { label: 'Surviving, not thriving', labelRo: 'Supraviețuiesc, nu înfloresc', emoji: '😬', points: 2 },
      { label: 'Urgently need a change', labelRo: 'Am nevoie urgentă de schimbare', emoji: '🆘', points: 1 },
    ],
  },
];

/**
 * Returns the quiz questions with all user-facing strings resolved to the
 * requested language. Use this in quiz UI components instead of accessing
 * `lifeScoreQuestions` directly.
 */
export const getLifeScoreQuestions = (language: 'en' | 'ro'): LifeScoreQuestionLocalized[] =>
  lifeScoreQuestions.map(q => ({
    id: q.id,
    category: q.category,
    question: language === 'en' ? q.question : q.questionRo,
    options: q.options.map(o => ({
      label: language === 'en' ? o.label : o.labelRo,
      emoji: o.emoji,
      points: o.points,
    })),
  }));

export const categoryLabels: Record<LifeScoreCategory, { en: string; ro: string; color: string; emoji: string }> = {
  body: { en: 'Body', ro: 'Corp', color: '#22c55e', emoji: '💪' },
  being: { en: 'Being', ro: 'Ființă', color: '#8b5cf6', emoji: '🧘' },
  balance: { en: 'Balance', ro: 'Echilibru', color: '#ec4899', emoji: '❤️' },
  business: { en: 'Business', ro: 'Business', color: '#3b82f6', emoji: '🚀' },
  overall: { en: 'Overall', ro: 'General', color: '#f59e0b', emoji: '⭐' },
};

export const getLifeScoreLevel = (score: number, maxScore: number = 20): { 
  level: string; 
  levelRo: string; 
  color: string;
  emoji: string;
  description: string;
  descriptionRo: string;
} => {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) {
    return { 
      level: 'Thriving', 
      levelRo: 'Înfloritoare', 
      color: '#22c55e', 
      emoji: '🌟',
      description: 'You\'re crushing it! Keep the momentum going.',
      descriptionRo: 'O zdrobești! Menține ritmul.'
    };
  }
  if (percentage >= 60) {
    return { 
      level: 'Growing', 
      levelRo: 'În Creștere', 
      color: '#3b82f6', 
      emoji: '📈',
      description: 'Good foundation! Small tweaks can unlock the next level.',
      descriptionRo: 'Fundație bună! Mici ajustări pot debloca următorul nivel.'
    };
  }
  if (percentage >= 40) {
    return { 
      level: 'Developing', 
      levelRo: 'În Dezvoltare', 
      color: '#f59e0b', 
      emoji: '🔧',
      description: 'Time for focused improvement. The full quiz will show you where.',
      descriptionRo: 'E timpul pentru îmbunătățire focusată. Quiz-ul complet îți va arăta unde.'
    };
  }
  return { 
    level: 'Needs Attention', 
    levelRo: 'Necesită Atenție', 
    color: '#ef4444', 
    emoji: '🚨',
    description: 'Your life is calling for urgent changes. Let\'s find out where to start.',
    descriptionRo: 'Viața ta cere schimbări urgente. Hai să aflăm de unde să începem.'
  };
};
