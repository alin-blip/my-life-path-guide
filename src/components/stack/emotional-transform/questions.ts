// Questions for the emotional transformation stack
// These serve as a guide for the AI conversation flow

export interface TransformQuestion {
  id: string;
  phase: 'validation' | 'investigation' | 'clarification' | 'transformation' | 'action';
  question: string;
  followUp?: string;
}

export const EMOTIONAL_TRANSFORM_QUESTIONS: TransformQuestion[] = [
  // PHASE 1: VALIDATION (1-2 exchanges)
  {
    id: 'validate_1',
    phase: 'validation',
    question: 'Ce emoție simți cel mai puternic acum?',
    followUp: 'Înțeleg... e valid ce simți.'
  },
  {
    id: 'validate_2',
    phase: 'validation',
    question: 'Pe o scară de la 1-10, cât de intensă este această emoție?',
    followUp: 'Apreciez că ești onest cu tine însuți.'
  },
  
  // PHASE 2: INVESTIGATION (2-3 exchanges)
  {
    id: 'investigate_1',
    phase: 'investigation',
    question: 'Ce s-a întâmplat care a declanșat această stare?',
    followUp: 'Mulțumesc că împărtășești asta cu mine.'
  },
  {
    id: 'investigate_2',
    phase: 'investigation',
    question: 'Care e povestea pe care ți-o spui despre situație?',
    followUp: 'Interesant... și ce simți când îți spui această poveste?'
  },
  {
    id: 'investigate_3',
    phase: 'investigation',
    question: 'Ce crezi că înseamnă despre tine această situație?'
  },
  
  // PHASE 3: CLARIFICATION (2-3 exchanges)
  {
    id: 'clarify_1',
    phase: 'clarification',
    question: 'Este această poveste 100% adevărată? Poți fi absolut sigur?',
    followUp: 'Ce ar fi posibil dacă această poveste nu ar fi întreaga imagine?'
  },
  {
    id: 'clarify_2',
    phase: 'clarification',
    question: 'Ce îți dorești de fapt să simți în această situație?'
  },
  {
    id: 'clarify_3',
    phase: 'clarification',
    question: 'Ce ar trebui să se întâmple pentru a te simți așa?'
  },
  
  // PHASE 4: TRANSFORMATION (2-3 exchanges)
  {
    id: 'transform_1',
    phase: 'transformation',
    question: 'Ce poți TU controla în această situație?',
    followUp: 'Excelent! Te concentrezi pe ce e în puterea ta.'
  },
  {
    id: 'transform_2',
    phase: 'transformation',
    question: 'Ce lecție îți oferă această emoție? Ce mesaj poartă pentru tine?',
    followUp: 'Ce insight puternic!'
  },
  {
    id: 'transform_3',
    phase: 'transformation',
    question: 'Dacă ai privi această situație ca pe un dar sau o oportunitate, ce ar fi?'
  },
  
  // PHASE 5: ACTION (1-2 exchanges)
  {
    id: 'action_1',
    phase: 'action',
    question: 'Ce acțiune concretă poți lua chiar acum sau astăzi?',
    followUp: 'Asta e putere în acțiune!'
  },
  {
    id: 'action_2',
    phase: 'action',
    question: 'Cu ce energie vrei să începi această zi? Ce stare alegi?',
    followUp: 'Minunat! Ai transformat energia și ești gata pentru o zi extraordinară!'
  }
];

// Get questions by phase
export const getQuestionsByPhase = (phase: TransformQuestion['phase']) => {
  return EMOTIONAL_TRANSFORM_QUESTIONS.filter(q => q.phase === phase);
};

// Phase descriptions for UI
export const PHASE_DESCRIPTIONS = {
  validation: {
    title: 'Validare',
    description: 'Recunoaștem și acceptăm emoția',
    icon: '💭'
  },
  investigation: {
    title: 'Investigare',
    description: 'Înțelegem ce s-a întâmplat',
    icon: '🔍'
  },
  clarification: {
    title: 'Clarificare',
    description: 'Separăm faptele de povești',
    icon: '💡'
  },
  transformation: {
    title: 'Transformare',
    description: 'Găsim lecția și puterea',
    icon: '⚡'
  },
  action: {
    title: 'Acțiune',
    description: 'Alegem energia și acțiunea',
    icon: '🚀'
  }
};
