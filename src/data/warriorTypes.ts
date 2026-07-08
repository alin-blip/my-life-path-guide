/**
 * Warrior Routine Quiz — 4 personality types + activation templates.
 *
 * Each template is applied to `champion_routine_settings` when the user
 * clicks "Activează-mi rutina Warrior" on the quiz result page.
 */

export type WarriorType = 'reactor' | 'disciplined' | 'experimenter' | 'warrior';

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    /** Score deltas per warrior type (higher = closer match). */
    scores: Partial<Record<WarriorType, number>>;
  }[];
}

export interface WarriorTypeMeta {
  id: WarriorType;
  name: string;
  tagline: string;
  description: string;
  strengths: string;
  challenges: string;
  routineFocus: string;
  color: string;
  emoji: string;
  audiencePercent: number;
}

export interface WarriorTemplate {
  routine_steps_order: string[];
  active_steps: string[];
  step_configs: Record<string, unknown>;
  meditation_default_duration: number;
  reading_pages_per_day: number;
  workout_goal: 'muscle' | 'fat_loss' | 'endurance' | 'wellness';
  workout_level: 'beginner' | 'intermediate' | 'advanced';
  workout_days_per_week: number;
  learn_task_type: 'book' | 'article' | 'podcast' | 'video';
  learn_task_description: string;
  apply_teach_description: string;
  default_autosuggestion: string;
  journaling_min_words: number;
}

// ---------- Quiz Questions (8) ----------

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1_morning',
    question: 'Cum arată dimineața ta acum?',
    options: [
      { label: 'Mă trezesc la alarmă, verific telefonul, mă simt reactiv toată ziua', scores: { reactor: 3 } },
      { label: 'Am o rutină clară pe care o urmez zilnic', scores: { disciplined: 3 } },
      { label: 'Încerc lucruri noi, dar nu mă țin de nimic mai mult de 2 săptămâni', scores: { experimenter: 3 } },
      { label: 'Am o rutină aliniată la viziunea mea pe 90 de zile', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q2_meditation',
    question: 'Ce simți despre meditație?',
    options: [
      { label: 'Nu am timp / mi se pare plictisitoare', scores: { reactor: 3 } },
      { label: 'Fac 10 minute în fiecare zi, standard', scores: { disciplined: 3 } },
      { label: 'Testez tehnici diferite — binaural, Wim Hof, breath work', scores: { experimenter: 3 } },
      { label: 'Fac 15+ minute profund, e non-negociabil', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q3_workout',
    question: 'Cum abordezi mișcarea/antrenamentul?',
    options: [
      { label: 'Aș vrea, dar nu găsesc timp', scores: { reactor: 3 } },
      { label: 'Am un program clar, 4-5 zile/săptămână', scores: { disciplined: 3 } },
      { label: 'Alternez între diverse discipline — gym, yoga, alergat', scores: { experimenter: 3 } },
      { label: 'Antrenament greu 5-6 zile, planificat pe cicluri', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q4_reading',
    question: 'Câte cărți citești pe an?',
    options: [
      { label: '0-2 cărți', scores: { reactor: 3 } },
      { label: '10-15 cărți, consistent', scores: { disciplined: 3 } },
      { label: '20+ cărți, mix de genuri', scores: { experimenter: 3 } },
      { label: '20+ cărți plus podcasturi + articole strategice', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q5_priorities',
    question: 'Cum îți alegi prioritățile zilei?',
    options: [
      { label: 'Reactiv — ce apare în inbox / mesaje', scores: { reactor: 3 } },
      { label: 'To-do list clar, îl bifez metodic', scores: { disciplined: 3 } },
      { label: 'Îmi place să experimentez cu sisteme diferite (Eisenhower, ABCDE, etc.)', scores: { experimenter: 3 } },
      { label: 'Un HIT strategic care mișcă viziunea pe 90 de zile', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q6_energy',
    question: 'Când ai cea mai multă energie mentală?',
    options: [
      { label: 'Habar n-am, oricând nu sunt obosit', scores: { reactor: 3 } },
      { label: 'Dimineața, între 8-11', scores: { disciplined: 2, warrior: 2 } },
      { label: 'Depinde de zi, e imprevizibil', scores: { experimenter: 3 } },
      { label: 'Dimineața devreme, 5-8, deep work', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q7_stack',
    question: 'Cum reacționezi când ești blocat emoțional (frică/mânie/rușine)?',
    options: [
      { label: 'Rămân blocat, ziua e pierdută', scores: { reactor: 3 } },
      { label: 'Trec peste, mă concentrez pe task-uri', scores: { disciplined: 2 } },
      { label: 'Încerc tehnici diferite până găsesc ce merge', scores: { experimenter: 3 } },
      { label: 'Fac un stack (breath work + reframe + acțiune) — 15 min și trec', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q8_vision',
    question: 'Ai o viziune clară pe 90 de zile / 12 luni?',
    options: [
      { label: 'Nu, trăiesc de pe o zi pe alta', scores: { reactor: 3 } },
      { label: 'Am obiective SMART clare', scores: { disciplined: 3 } },
      { label: 'Da, dar o schimb des pe măsură ce învăț', scores: { experimenter: 2 } },
      { label: 'Da — viziune 12 luni + HIT-uri 90 zile + rutină aliniată', scores: { warrior: 3 } },
    ],
  },
];

// ---------- Warrior Type Metadata ----------

export const WARRIOR_TYPES: Record<WarriorType, WarriorTypeMeta> = {
  reactor: {
    id: 'reactor',
    name: 'Reactor',
    tagline: 'Trăiești reactiv. Rutina te va aduce în control.',
    description:
      'Ești în modul de supraviețuire — reacționezi la ce apare în jur. Nu e vina ta, dar te costă. Rutina Warrior te scoate din reactive-mode cu pași scurți, non-intimidanți, care construiesc momentum în 7 zile.',
    strengths: 'Adaptabilitate, empatie, rezistență la haos',
    challenges: 'Ziua ta e dictată de urgențe, nu de priorități',
    routineFocus: 'Ritual scurt de tranziție dimineața (15-20 min) — micro-wins care schimbă starea rapid',
    color: 'from-orange-500 to-red-500',
    emoji: '⚡',
    audiencePercent: 40,
  },
  disciplined: {
    id: 'disciplined',
    name: 'Disciplined',
    tagline: 'Ești disciplinat. Rutina îți va da sens strategic.',
    description:
      'Ai deja obiceiuri solide și te ții de ele. Dar bifezi task-uri fără să simți că avansezi. Rutina Warrior aliniază disciplina ta la o viziune clară pe 90 zile — nu mai bifezi, ci construiești.',
    strengths: 'Consistență, execuție, focus',
    challenges: 'Bifezi task-uri fără sens, uneori burn-out ascuns',
    routineFocus: 'Rutină completă (30-40 min) cu focus pe sens și aliniere strategică',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🎯',
    audiencePercent: 25,
  },
  experimenter: {
    id: 'experimenter',
    name: 'Experimenter',
    tagline: 'Ești explorator. Rutina îți va da angajament.',
    description:
      'Testezi tot — cărți, sisteme, tehnici. Dar sari de la una la alta și nu vezi rezultate compuse. Rutina Warrior îți dă un cadru fix pentru 30 zile ca să vezi ce funcționează cu adevărat pentru tine.',
    strengths: 'Curiozitate, învățare rapidă, creativitate',
    challenges: 'Sari între sisteme, nu vezi rezultate compuse',
    routineFocus: 'Cadru fix 30 zile cu varietate în conținut (nu în structură)',
    color: 'from-purple-500 to-pink-500',
    emoji: '🔬',
    audiencePercent: 25,
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    tagline: 'Ești deja Warrior. Îți dăm sistemul complet.',
    description:
      'Ai deja o rutină serioasă și o viziune clară. Rutina Warrior CEO Mind OS îți dă infrastructura completă (XP, streak, achievements, Mind Coach, Brotherhood) ca să scalezi ce deja funcționează.',
    strengths: 'Viziune clară, execuție profundă, aliniere',
    challenges: 'Uneori intensitate excesivă, risc de over-optimization',
    routineFocus: 'Rutină deep (45-60 min) cu toate integrările — meditation, workout, learn, HIT strategic',
    color: 'from-amber-500 to-yellow-500',
    emoji: '⚔️',
    audiencePercent: 10,
  },
};

// ---------- Activation Templates ----------
// Step IDs must match those in src/components/champion-routine/StepsOrderEditor.tsx

export const WARRIOR_TEMPLATES: Record<WarriorType, WarriorTemplate> = {
  reactor: {
    // Short, non-intimidating: 15-20 min total
    routine_steps_order: [
      'hydration', 'gratitude', 'mindShifting', 'meditation',
      'exercise', 'mealPlanning', 'relationships',
    ],
    active_steps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'exercise', 'mealPlanning', 'relationships'],
    step_configs: {
      meditation: { duration: 3, mode: 'timer' },
      exercise: { type: 'light', duration: 10 },
      gratitude: { count: 1 },
    },
    meditation_default_duration: 3,
    reading_pages_per_day: 5,
    workout_goal: 'wellness',
    workout_level: 'beginner',
    workout_days_per_week: 3,
    learn_task_type: 'article',
    learn_task_description: '1 articol scurt (5 min)',
    apply_teach_description: '1 acțiune din inbox — clar, specific',
    default_autosuggestion: 'În fiecare zi devin mai calm și în control.',
    journaling_min_words: 0,
  },
  disciplined: {
    // Complete, structured: 30-40 min
    routine_steps_order: [
      'hydration', 'gratitude', 'mindShifting', 'meditation', 'visualization',
      'exercise', 'mealPlanning', 'reading', 'learn', 'apply', 'relationships', 'dailyTasks',
    ],
    active_steps: ['hydration', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'exercise', 'mealPlanning', 'reading', 'learn', 'apply', 'relationships', 'dailyTasks'],
    step_configs: {
      meditation: { duration: 10, mode: 'timer', binaural: 'theta' },
      exercise: { type: 'full', duration: 25 },
      reading: { pages: 10 },
    },
    meditation_default_duration: 10,
    reading_pages_per_day: 10,
    workout_goal: 'muscle',
    workout_level: 'intermediate',
    workout_days_per_week: 4,
    learn_task_type: 'book',
    learn_task_description: '10 pagini din cartea curentă',
    apply_teach_description: 'HIT din Master Plan — aliniat la viziune 90 zile',
    default_autosuggestion: 'Fiecare pas mă apropie de viziunea mea.',
    journaling_min_words: 100,
  },
  experimenter: {
    // Varied: 25-35 min
    routine_steps_order: [
      'hydration', 'breathing', 'mindShifting', 'meditation', 'gratitude',
      'exercise', 'mealPlanning', 'learn', 'contentCreation', 'relationships',
    ],
    active_steps: ['hydration', 'breathing', 'mindShifting', 'meditation', 'gratitude', 'exercise', 'mealPlanning', 'learn', 'contentCreation', 'relationships'],
    step_configs: {
      meditation: { duration: 5, mode: 'timer' },
      breathing: { technique: 'box' },
      exercise: { type: 'varied' },
    },
    meditation_default_duration: 5,
    reading_pages_per_day: 15,
    workout_goal: 'endurance',
    workout_level: 'intermediate',
    workout_days_per_week: 4,
    learn_task_type: 'podcast',
    learn_task_description: '1 podcast/TED + note în journal',
    apply_teach_description: '1 experiment nou (testează ceva timp de 7 zile)',
    default_autosuggestion: 'Sunt deschis să învăț și să evoluez zilnic.',
    journaling_min_words: 150,
  },
  warrior: {
    // Deep, complete: 45-60 min
    routine_steps_order: [
      'hydration', 'lightExposure', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'autosuggestion',
      'exercise', 'mealPlanning', 'reading', 'journaling', 'learn', 'apply',
      'contentCreation', 'relationships', 'dailyTasks',
    ],
    active_steps: ['hydration', 'lightExposure', 'gratitude', 'mindShifting', 'meditation', 'visualization', 'autosuggestion', 'exercise', 'mealPlanning', 'reading', 'journaling', 'learn', 'apply', 'contentCreation', 'relationships', 'dailyTasks'],
    step_configs: {
      meditation: { duration: 15, mode: 'timer', binaural: 'theta' },
      exercise: { type: 'heavy', duration: 40 },
      reading: { pages: 20 },
      journaling: { minWords: 300 },
    },
    meditation_default_duration: 15,
    reading_pages_per_day: 20,
    workout_goal: 'muscle',
    workout_level: 'advanced',
    workout_days_per_week: 5,
    learn_task_type: 'book',
    learn_task_description: '20 pagini + note strategice',
    apply_teach_description: 'HIT din viziune 90 zile — strategic, mișcă acul',
    default_autosuggestion: 'Sunt Warrior. Execut cu intenție, aliniat la viziune.',
    journaling_min_words: 300,
  },
};

/**
 * Compute the winning warrior type from a set of answers.
 * Returns the type with the highest total score; ties broken by declared audience order.
 */
export function computeWarriorType(answers: Array<{ questionId: string; optionIndex: number }>): {
  type: WarriorType;
  scores: Record<WarriorType, number>;
} {
  const scores: Record<WarriorType, number> = {
    reactor: 0,
    disciplined: 0,
    experimenter: 0,
    warrior: 0,
  };

  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const option = question.options[answer.optionIndex];
    if (!option) continue;
    for (const [type, value] of Object.entries(option.scores)) {
      scores[type as WarriorType] += value || 0;
    }
  }

  const order: WarriorType[] = ['warrior', 'disciplined', 'experimenter', 'reactor'];
  let winner: WarriorType = 'reactor';
  let maxScore = -1;
  for (const type of order) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      winner = type;
    }
  }

  return { type: winner, scores };
}
