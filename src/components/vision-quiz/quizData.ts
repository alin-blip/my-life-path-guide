export type QuizCategory = 'body' | 'being' | 'balance' | 'business';

export interface QuizOption {
  label: string;
  labelRo: string;
  points: number;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  questionRo: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  // BODY - Sănătate Fizică
  {
    id: 'body_1',
    category: 'body',
    question: 'How do you feel when you wake up in the morning?',
    questionRo: 'Cum te simți când te trezești dimineața?',
    options: [
      { label: 'Energetic and ready to conquer', labelRo: 'Energic și gata de luptă', points: 4 },
      { label: 'Generally OK', labelRo: 'În general OK', points: 3 },
      { label: 'Tired, need coffee', labelRo: 'Obosit, am nevoie de cafea', points: 2 },
      { label: 'Exhausted, dread getting up', labelRo: 'Epuizat, mă tem să mă ridic', points: 1 },
    ],
  },
  {
    id: 'body_2',
    category: 'body',
    question: 'How many days per week do you exercise intentionally?',
    questionRo: 'Câte zile pe săptămână faci mișcare intenționată?',
    options: [
      { label: '6-7 days', labelRo: '6-7 zile', points: 4 },
      { label: '3-5 days', labelRo: '3-5 zile', points: 3 },
      { label: '1-2 days', labelRo: '1-2 zile', points: 2 },
      { label: 'Rarely or never', labelRo: 'Rar sau niciodată', points: 1 },
    ],
  },
  {
    id: 'body_3',
    category: 'body',
    question: 'How would you rate your sleep quality?',
    questionRo: 'Cum ai evalua calitatea somnului tău?',
    options: [
      { label: 'Excellent - deep, restful', labelRo: 'Excelent - profund, odihnitor', points: 4 },
      { label: 'Good - mostly restful', labelRo: 'Bun - în general odihnitor', points: 3 },
      { label: 'Variable - inconsistent', labelRo: 'Variabil - inconsistent', points: 2 },
      { label: 'Poor - often interrupted', labelRo: 'Slab - adesea întrerupt', points: 1 },
    ],
  },
  {
    id: 'body_4',
    category: 'body',
    question: 'How satisfied are you with your energy levels throughout the day?',
    questionRo: 'Cât de mulțumit ești de nivelul tău de energie pe parcursul zilei?',
    options: [
      { label: 'Very satisfied - high energy', labelRo: 'Foarte mulțumit - energie înaltă', points: 4 },
      { label: 'Moderately satisfied', labelRo: 'Moderat mulțumit', points: 3 },
      { label: 'Somewhat dissatisfied', labelRo: 'Puțin nemulțumit', points: 2 },
      { label: 'Not satisfied at all', labelRo: 'Deloc mulțumit', points: 1 },
    ],
  },

  // BEING - Mindset & Spirit
  {
    id: 'being_1',
    category: 'being',
    question: 'How much time do you dedicate daily to mental clarity (meditation, journaling)?',
    questionRo: 'Cât timp dedici zilnic pentru claritate mentală (meditație, jurnal)?',
    options: [
      { label: '30+ minutes', labelRo: '30+ minute', points: 4 },
      { label: '15-30 minutes', labelRo: '15-30 minute', points: 3 },
      { label: '5-15 minutes', labelRo: '5-15 minute', points: 2 },
      { label: 'No time dedicated', labelRo: 'Nu dedic timp', points: 1 },
    ],
  },
  {
    id: 'being_2',
    category: 'being',
    question: 'How do you handle stress and anxiety?',
    questionRo: 'Cum gestionezi stresul și anxietatea?',
    options: [
      { label: 'Very well - have systems', labelRo: 'Foarte bine - am sisteme', points: 4 },
      { label: 'OK - manage most times', labelRo: 'OK - gestionez de cele mai multe ori', points: 3 },
      { label: 'With difficulty', labelRo: 'Cu dificultate', points: 2 },
      { label: "Don't manage it well", labelRo: 'Nu gestionez bine', points: 1 },
    ],
  },
  {
    id: 'being_3',
    category: 'being',
    question: 'Do you have a gratitude or reflection practice?',
    questionRo: 'Ai o practică de recunoștință sau reflecție?',
    options: [
      { label: 'Daily practice', labelRo: 'Practică zilnică', points: 4 },
      { label: 'Weekly practice', labelRo: 'Practică săptămânală', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', points: 2 },
      { label: 'Never', labelRo: 'Niciodată', points: 1 },
    ],
  },
  {
    id: 'being_4',
    category: 'being',
    question: 'How connected do you feel to your life purpose?',
    questionRo: 'Cât de conectat te simți cu scopul tău în viață?',
    options: [
      { label: 'Very connected - crystal clear', labelRo: 'Foarte conectat - clar ca cristalul', points: 4 },
      { label: 'Moderately connected', labelRo: 'Moderat conectat', points: 3 },
      { label: 'Somewhat disconnected', labelRo: 'Puțin deconectat', points: 2 },
      { label: 'Lost - no clarity', labelRo: 'Pierdut - fără claritate', points: 1 },
    ],
  },

  // BALANCE - Relații
  {
    id: 'balance_1',
    category: 'balance',
    question: 'How would you rate your relationship with your partner/family?',
    questionRo: 'Cum evaluezi relația cu partenerul/familia?',
    options: [
      { label: 'Excellent - deep connection', labelRo: 'Excelentă - conexiune profundă', points: 4 },
      { label: 'Good - mostly positive', labelRo: 'Bună - în general pozitivă', points: 3 },
      { label: 'Tense - needs work', labelRo: 'Tensionată - necesită lucru', points: 2 },
      { label: 'Distant or problematic', labelRo: 'Distantă sau problematică', points: 1 },
    ],
  },
  {
    id: 'balance_2',
    category: 'balance',
    question: 'How much quality time do you spend with loved ones?',
    questionRo: 'Cât timp de calitate petreci cu cei dragi?',
    options: [
      { label: 'A lot - priority', labelRo: 'Mult - e prioritate', points: 4 },
      { label: 'Enough - satisfied', labelRo: 'Suficient - sunt mulțumit', points: 3 },
      { label: 'Little - want more', labelRo: 'Puțin - vreau mai mult', points: 2 },
      { label: 'Almost none', labelRo: 'Aproape deloc', points: 1 },
    ],
  },
  {
    id: 'balance_3',
    category: 'balance',
    question: 'Do you have a strong support network and close friends?',
    questionRo: 'Ai o rețea solidă de suport și prieteni apropiați?',
    options: [
      { label: 'Solid - multiple close friends', labelRo: 'Solidă - mai mulți prieteni apropiați', points: 4 },
      { label: 'OK - a few close ones', labelRo: 'OK - câțiva apropiați', points: 3 },
      { label: 'Weak - few connections', labelRo: 'Slabă - puține conexiuni', points: 2 },
      { label: 'Non-existent - isolated', labelRo: 'Inexistentă - izolat', points: 1 },
    ],
  },
  {
    id: 'balance_4',
    category: 'balance',
    question: 'Do you feel you give back to your community?',
    questionRo: 'Simți că dai înapoi comunității?',
    options: [
      { label: 'Regularly - part of my life', labelRo: 'Regulat - parte din viața mea', points: 4 },
      { label: 'Occasionally', labelRo: 'Ocazional', points: 3 },
      { label: 'Rarely', labelRo: 'Rar', points: 2 },
      { label: 'Never', labelRo: 'Niciodată', points: 1 },
    ],
  },

  // BUSINESS - Financiar & Carieră
  {
    id: 'business_1',
    category: 'business',
    question: 'How do you rate your current income vs. your goals?',
    questionRo: 'Cum evaluezi veniturile actuale vs. obiectivele tale?',
    options: [
      { label: 'Exceeding goals', labelRo: 'Depășesc obiectivele', points: 4 },
      { label: 'On target', labelRo: 'La țintă', points: 3 },
      { label: 'Below target', labelRo: 'Sub țintă', points: 2 },
      { label: 'Far below target', labelRo: 'Mult sub țintă', points: 1 },
    ],
  },
  {
    id: 'business_2',
    category: 'business',
    question: 'Do you have a clear productivity system?',
    questionRo: 'Ai un sistem clar de productivitate?',
    options: [
      { label: 'Robust - well optimized', labelRo: 'Robust - bine optimizat', points: 4 },
      { label: 'Basic - getting by', labelRo: 'Basic - mă descurc', points: 3 },
      { label: 'Chaotic - inconsistent', labelRo: 'Haotic - inconsistent', points: 2 },
      { label: 'Non-existent', labelRo: 'Inexistent', points: 1 },
    ],
  },
  {
    id: 'business_3',
    category: 'business',
    question: 'How many hours do you work vs. how many you want to work?',
    questionRo: 'Câte ore lucrezi vs. câte vrei să lucrezi?',
    options: [
      { label: 'Perfect balance', labelRo: 'Echilibru perfect', points: 4 },
      { label: 'Close - minor adjustments needed', labelRo: 'Aproape - ajustări minore', points: 3 },
      { label: 'Too much - overworking', labelRo: 'Prea mult - suprasolicitat', points: 2 },
      { label: 'Way too much - burnout risk', labelRo: 'Mult prea mult - risc de burnout', points: 1 },
    ],
  },
  {
    id: 'business_4',
    category: 'business',
    question: 'Do you feel your business/career is growing in the right direction?',
    questionRo: 'Simți că afacerea/cariera crește în direcția corectă?',
    options: [
      { label: 'Absolutely - clear trajectory', labelRo: 'Absolut - traiectorie clară', points: 4 },
      { label: 'Probably - mostly confident', labelRo: 'Probabil - destul de încrezător', points: 3 },
      { label: 'Uncertain - some doubts', labelRo: 'Nesigur - am îndoieli', points: 2 },
      { label: 'No - feels stuck or wrong', labelRo: 'Nu - simt că stagnez', points: 1 },
    ],
  },
];

export const categoryLabels: Record<QuizCategory, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Spirituality', ro: 'Spiritualitate' },
  balance: { en: 'Relationships', ro: 'Relații' },
  business: { en: 'Business', ro: 'Business' },
};

export const categoryDescriptions: Record<QuizCategory, { en: string; ro: string }> = {
  body: { 
    en: 'Physical health, energy, fitness, and vitality', 
    ro: 'Sănătate fizică, energie, fitness și vitalitate' 
  },
  being: { 
    en: 'Mental clarity, spirituality, and inner peace', 
    ro: 'Claritate mentală, spiritualitate și pace interioară' 
  },
  balance: { 
    en: 'Relationships, family, and meaningful connections', 
    ro: 'Relații, familie și conexiuni semnificative' 
  },
  business: { 
    en: 'Career growth, finances, and professional success', 
    ro: 'Creștere profesională, finanțe și succes în carieră' 
  },
};

export const getScoreLevel = (score: number): { level: string; levelRo: string; color: string } => {
  if (score >= 14) return { level: 'Excellent', levelRo: 'Excelent', color: '#22c55e' };
  if (score >= 10) return { level: 'Good', levelRo: 'Bun', color: '#3b82f6' };
  if (score >= 6) return { level: 'Needs Improvement', levelRo: 'Necesită Îmbunătățire', color: '#f59e0b' };
  return { level: 'Critical', levelRo: 'Critic', color: '#ef4444' };
};

export const getResultsMessage = (
  lowestCategory: QuizCategory,
  language: 'en' | 'ro'
): { title: string; description: string } => {
  const messages: Record<QuizCategory, { en: { title: string; description: string }; ro: { title: string; description: string } }> = {
    body: {
      en: {
        title: 'Your Body Needs Attention',
        description: 'Your physical health is the foundation of everything. Without energy and vitality, all other areas suffer. In 2026, prioritizing your body will unlock exponential growth everywhere else.',
      },
      ro: {
        title: 'Corpul Tău Are Nevoie de Atenție',
        description: 'Sănătatea fizică este fundația a tot. Fără energie și vitalitate, toate celelalte arii suferă. În 2026, prioritizarea corpului tău va debloca creștere exponențială în toate celelalte domenii.',
      },
    },
    being: {
      en: {
        title: 'Your Inner World Needs Clarity',
        description: 'Mental clarity and inner peace are the operating system of your life. Without them, you react instead of respond. In 2026, building your inner foundation will transform your outer reality.',
      },
      ro: {
        title: 'Lumea Ta Interioară Are Nevoie de Claritate',
        description: 'Claritatea mentală și pacea interioară sunt sistemul de operare al vieții tale. Fără ele, reacționezi în loc să răspunzi. În 2026, construirea fundației interioare îți va transforma realitatea exterioară.',
      },
    },
    balance: {
      en: {
        title: 'Your Relationships Need Investment',
        description: 'Success means nothing without people to share it with. Your relationships are the multiplier of joy in your life. In 2026, investing in connections will bring the fulfillment you seek.',
      },
      ro: {
        title: 'Relațiile Tale Au Nevoie de Investiție',
        description: 'Succesul nu înseamnă nimic fără oameni cu care să-l împarți. Relațiile tale sunt multiplicatorul fericirii în viața ta. În 2026, investiția în conexiuni va aduce împlinirea pe care o cauți.',
      },
    },
    business: {
      en: {
        title: 'Your Business/Career Needs a System',
        description: 'Financial freedom gives you options. Without systems, you trade time for money indefinitely. In 2026, building the right systems will create the leverage you need.',
      },
      ro: {
        title: 'Afacerea/Cariera Ta Are Nevoie de Sistem',
        description: 'Libertatea financiară îți oferă opțiuni. Fără sisteme, schimbi timp pe bani la infinit. În 2026, construirea sistemelor potrivite va crea efectul de pârghie de care ai nevoie.',
      },
    },
  };

  return language === 'en' ? messages[lowestCategory].en : messages[lowestCategory].ro;
};
