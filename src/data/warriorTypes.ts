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
  question_en?: string;
  options: {
    label: string;
    label_en?: string;
    /** Score deltas per warrior type (higher = closer match). */
    scores: Partial<Record<WarriorType, number>>;
  }[];
}

/** Resolve question + option labels for a given language. Falls back to RO. */
export function localizeQuestions(
  questions: QuizQuestion[],
  language: 'ro' | 'en',
): QuizQuestion[] {
  if (language !== 'en') return questions;
  return questions.map((q) => ({
    ...q,
    question: q.question_en || q.question,
    options: q.options.map((o) => ({ ...o, label: o.label_en || o.label })),
  }));
}


export interface WarriorTypeMeta {
  id: WarriorType;
  name: string;
  name_en?: string;
  tagline: string;
  tagline_en?: string;
  description: string;
  description_en?: string;
  strengths: string;
  strengths_en?: string;
  challenges: string;
  challenges_en?: string;
  routineFocus: string;
  routineFocus_en?: string;
  color: string;
  emoji: string;
  audiencePercent: number;
}

export function getWarriorMeta(meta: WarriorTypeMeta, language: 'ro' | 'en'): WarriorTypeMeta {
  if (language !== 'en') return meta;
  return {
    ...meta,
    name: meta.name_en || meta.name,
    tagline: meta.tagline_en || meta.tagline,
    description: meta.description_en || meta.description,
    strengths: meta.strengths_en || meta.strengths,
    challenges: meta.challenges_en || meta.challenges,
    routineFocus: meta.routineFocus_en || meta.routineFocus,
  };
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
    question_en: 'What does your morning look like right now?',
    options: [
      { label: 'Mă trezesc la alarmă, verific telefonul, mă simt reactiv toată ziua', label_en: 'I wake to the alarm, check my phone, feel reactive all day', scores: { reactor: 3 } },
      { label: 'Am o rutină clară pe care o urmez zilnic', label_en: 'I have a clear routine I follow every day', scores: { disciplined: 3 } },
      { label: 'Încerc lucruri noi, dar nu mă țin de nimic mai mult de 2 săptămâni', label_en: 'I try new things but never stick with anything for more than 2 weeks', scores: { experimenter: 3 } },
      { label: 'Am o rutină aliniată la viziunea mea pe 90 de zile', label_en: 'My routine is aligned to my 90-day vision', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q2_meditation',
    question: 'Ce simți despre meditație?',
    question_en: 'How do you feel about meditation?',
    options: [
      { label: 'Nu am timp / mi se pare plictisitoare', label_en: 'I don\'t have time / I find it boring', scores: { reactor: 3 } },
      { label: 'Fac 10 minute în fiecare zi, standard', label_en: 'I do 10 minutes every day, standard', scores: { disciplined: 3 } },
      { label: 'Testez tehnici diferite — binaural, Wim Hof, breath work', label_en: 'I test different techniques — binaural, Wim Hof, breath work', scores: { experimenter: 3 } },
      { label: 'Fac 15+ minute profund, e non-negociabil', label_en: 'I do 15+ deep minutes, non-negotiable', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q3_workout',
    question: 'Cum abordezi mișcarea/antrenamentul?',
    question_en: 'How do you approach movement / training?',
    options: [
      { label: 'Aș vrea, dar nu găsesc timp', label_en: 'I\'d like to, but I can\'t find the time', scores: { reactor: 3 } },
      { label: 'Am un program clar, 4-5 zile/săptămână', label_en: 'I have a clear program, 4–5 days/week', scores: { disciplined: 3 } },
      { label: 'Alternez între diverse discipline — gym, yoga, alergat', label_en: 'I rotate disciplines — gym, yoga, running', scores: { experimenter: 3 } },
      { label: 'Antrenament greu 5-6 zile, planificat pe cicluri', label_en: 'Heavy training 5–6 days, planned in cycles', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q4_reading',
    question: 'Câte cărți citești pe an?',
    question_en: 'How many books do you read per year?',
    options: [
      { label: '0-2 cărți', label_en: '0–2 books', scores: { reactor: 3 } },
      { label: '10-15 cărți, consistent', label_en: '10–15 books, consistently', scores: { disciplined: 3 } },
      { label: '20+ cărți, mix de genuri', label_en: '20+ books, mix of genres', scores: { experimenter: 3 } },
      { label: '20+ cărți plus podcasturi + articole strategice', label_en: '20+ books plus podcasts + strategic articles', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q5_priorities',
    question: 'Cum îți alegi prioritățile zilei?',
    question_en: 'How do you choose your daily priorities?',
    options: [
      { label: 'Reactiv — ce apare în inbox / mesaje', label_en: 'Reactive — whatever appears in inbox / messages', scores: { reactor: 3 } },
      { label: 'To-do list clar, îl bifez metodic', label_en: 'Clear to-do list, ticked methodically', scores: { disciplined: 3 } },
      { label: 'Îmi place să experimentez cu sisteme diferite (Eisenhower, ABCDE, etc.)', label_en: 'I like experimenting with different systems (Eisenhower, ABCDE, etc.)', scores: { experimenter: 3 } },
      { label: 'Un HIT strategic care mișcă viziunea pe 90 de zile', label_en: 'One strategic HIT that moves the 90-day vision', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q6_energy',
    question: 'Când ai cea mai multă energie mentală?',
    question_en: 'When do you have the most mental energy?',
    options: [
      { label: 'Habar n-am, oricând nu sunt obosit', label_en: 'No idea — whenever I\'m not tired', scores: { reactor: 3 } },
      { label: 'Dimineața, între 8-11', label_en: 'Morning, 8–11 am', scores: { disciplined: 2, warrior: 2 } },
      { label: 'Depinde de zi, e imprevizibil', label_en: 'Depends on the day, unpredictable', scores: { experimenter: 3 } },
      { label: 'Dimineața devreme, 5-8, deep work', label_en: 'Early morning, 5–8 am, deep work', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q7_stack',
    question: 'Cum reacționezi când ești blocat emoțional (frică/mânie/rușine)?',
    question_en: 'How do you react when you\'re emotionally stuck (fear / anger / shame)?',
    options: [
      { label: 'Rămân blocat, ziua e pierdută', label_en: 'I stay stuck, the day is lost', scores: { reactor: 3 } },
      { label: 'Trec peste, mă concentrez pe task-uri', label_en: 'I push through, focus on tasks', scores: { disciplined: 2 } },
      { label: 'Încerc tehnici diferite până găsesc ce merge', label_en: 'I try different techniques until something works', scores: { experimenter: 3 } },
      { label: 'Fac un stack (breath work + reframe + acțiune) — 15 min și trec', label_en: 'I run a stack (breath work + reframe + action) — 15 min and it\'s gone', scores: { warrior: 3 } },
    ],
  },
  {
    id: 'q8_vision',
    question: 'Ai o viziune clară pe 90 de zile / 12 luni?',
    question_en: 'Do you have a clear 90-day / 12-month vision?',
    options: [
      { label: 'Nu, trăiesc de pe o zi pe alta', label_en: 'No, I live day to day', scores: { reactor: 3 } },
      { label: 'Am obiective SMART clare', label_en: 'I have clear SMART goals', scores: { disciplined: 3 } },
      { label: 'Da, dar o schimb des pe măsură ce învăț', label_en: 'Yes, but I change it often as I learn', scores: { experimenter: 2 } },
      { label: 'Da — viziune 12 luni + HIT-uri 90 zile + rutină aliniată', label_en: 'Yes — 12-month vision + 90-day HITs + aligned routine', scores: { warrior: 3 } },
    ],
  },
];


// ---------- Warrior Type Metadata ----------

export const WARRIOR_TYPES: Record<WarriorType, WarriorTypeMeta> = {
  reactor: {
    id: 'reactor',
    name: 'Reactor',
    name_en: 'Reactor',
    tagline: 'Trăiești reactiv. Rutina te va aduce în control.',
    tagline_en: 'You live reactive. The routine puts you back in control.',
    description:
      'Ești în modul de supraviețuire — reacționezi la ce apare în jur. Nu e vina ta, dar te costă. Rutina Warrior te scoate din reactive-mode cu pași scurți, non-intimidanți, care construiesc momentum în 7 zile.',
    description_en:
      'You\'re in survival mode — reacting to whatever shows up. Not your fault, but it\'s costing you. The Warrior Routine pulls you out of reactive mode with short, non-intimidating steps that build momentum in 7 days.',
    strengths: 'Adaptabilitate, empatie, rezistență la haos',
    strengths_en: 'Adaptability, empathy, resilience under chaos',
    challenges: 'Ziua ta e dictată de urgențe, nu de priorități',
    challenges_en: 'Your day is dictated by urgencies, not priorities',
    routineFocus: 'Ritual scurt de tranziție dimineața (15-20 min) — micro-wins care schimbă starea rapid',
    routineFocus_en: 'Short morning transition ritual (15–20 min) — micro-wins that shift your state fast',
    color: 'from-orange-500 to-red-500',
    emoji: '⚡',
    audiencePercent: 40,
  },
  disciplined: {
    id: 'disciplined',
    name: 'Disciplined',
    name_en: 'Disciplined',
    tagline: 'Ești disciplinat. Rutina îți va da sens strategic.',
    tagline_en: 'You\'re disciplined. The routine gives you strategic meaning.',
    description:
      'Ai deja obiceiuri solide și te ții de ele. Dar bifezi task-uri fără să simți că avansezi. Rutina Warrior aliniază disciplina ta la o viziune clară pe 90 zile — nu mai bifezi, ci construiești.',
    description_en:
      'You already have solid habits and stick to them. But you tick off tasks without feeling like you\'re moving. The Warrior Routine aligns your discipline to a clear 90-day vision — you stop ticking, you start building.',
    strengths: 'Consistență, execuție, focus',
    strengths_en: 'Consistency, execution, focus',
    challenges: 'Bifezi task-uri fără sens, uneori burn-out ascuns',
    challenges_en: 'You tick off tasks without meaning — sometimes hidden burnout',
    routineFocus: 'Rutină completă (30-40 min) cu focus pe sens și aliniere strategică',
    routineFocus_en: 'Full routine (30–40 min) focused on meaning and strategic alignment',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🎯',
    audiencePercent: 25,
  },
  experimenter: {
    id: 'experimenter',
    name: 'Experimenter',
    name_en: 'Experimenter',
    tagline: 'Ești explorator. Rutina îți va da angajament.',
    tagline_en: 'You\'re an explorer. The routine gives you commitment.',
    description:
      'Testezi tot — cărți, sisteme, tehnici. Dar sari de la una la alta și nu vezi rezultate compuse. Rutina Warrior îți dă un cadru fix pentru 30 zile ca să vezi ce funcționează cu adevărat pentru tine.',
    description_en:
      'You test everything — books, systems, techniques. But you jump from one to the next and never see compounding results. The Warrior Routine gives you a fixed 30-day frame so you finally see what actually works for you.',
    strengths: 'Curiozitate, învățare rapidă, creativitate',
    strengths_en: 'Curiosity, fast learning, creativity',
    challenges: 'Sari între sisteme, nu vezi rezultate compuse',
    challenges_en: 'You jump between systems, no compounding results',
    routineFocus: 'Cadru fix 30 zile cu varietate în conținut (nu în structură)',
    routineFocus_en: 'Fixed 30-day frame with variety in content (not in structure)',
    color: 'from-purple-500 to-pink-500',
    emoji: '🔬',
    audiencePercent: 25,
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    name_en: 'Warrior',
    tagline: 'Ești deja Warrior. Îți dăm sistemul complet.',
    tagline_en: 'You\'re already a Warrior. We give you the full system.',
    description:
      'Ai deja o rutină serioasă și o viziune clară. Rutina Warrior CEO Mind OS îți dă infrastructura completă (XP, streak, achievements, Mind Coach, Brotherhood) ca să scalezi ce deja funcționează.',
    description_en:
      'You already have a serious routine and a clear vision. The Warrior Routine gives you the full infrastructure (XP, streaks, achievements, Mind Coach, Brotherhood) to scale what already works.',
    strengths: 'Viziune clară, execuție profundă, aliniere',
    strengths_en: 'Clear vision, deep execution, alignment',
    challenges: 'Uneori intensitate excesivă, risc de over-optimization',
    challenges_en: 'Occasional over-intensity, risk of over-optimization',
    routineFocus: 'Rutină deep (45-60 min) cu toate integrările — meditation, workout, learn, HIT strategic',
    routineFocus_en: 'Deep routine (45–60 min) with full integrations — meditation, workout, learn, strategic HIT',
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
