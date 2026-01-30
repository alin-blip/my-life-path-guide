// Questions for the emotional transformation stack
// These serve as a guide for the AI conversation flow

export interface TransformQuestion {
  id: string;
  phase: 'validation' | 'investigation' | 'clarification' | 'transformation' | 'action';
  question: string;
  questionEn: string;
  followUp?: string;
  followUpEn?: string;
}

export const EMOTIONAL_TRANSFORM_QUESTIONS: TransformQuestion[] = [
  // PHASE 1: VALIDATION (1-2 exchanges)
  {
    id: 'validate_1',
    phase: 'validation',
    question: 'Ce emoție simți cel mai puternic acum?',
    questionEn: 'What emotion do you feel most strongly right now?',
    followUp: 'Înțeleg... e valid ce simți.',
    followUpEn: 'I understand... what you feel is valid.'
  },
  {
    id: 'validate_2',
    phase: 'validation',
    question: 'Pe o scară de la 1-10, cât de intensă este această emoție?',
    questionEn: 'On a scale of 1-10, how intense is this emotion?',
    followUp: 'Apreciez că ești onest cu tine însuți.',
    followUpEn: 'I appreciate that you are being honest with yourself.'
  },
  
  // PHASE 2: INVESTIGATION (2-3 exchanges)
  {
    id: 'investigate_1',
    phase: 'investigation',
    question: 'Ce s-a întâmplat care a declanșat această stare?',
    questionEn: 'What happened that triggered this state?',
    followUp: 'Mulțumesc că împărtășești asta cu mine.',
    followUpEn: 'Thank you for sharing this with me.'
  },
  {
    id: 'investigate_2',
    phase: 'investigation',
    question: 'Care e povestea pe care ți-o spui despre situație?',
    questionEn: 'What is the story you tell yourself about this situation?',
    followUp: 'Interesant... și ce simți când îți spui această poveste?',
    followUpEn: 'Interesting... and how do you feel when you tell yourself this story?'
  },
  {
    id: 'investigate_3',
    phase: 'investigation',
    question: 'Ce crezi că înseamnă despre tine această situație?',
    questionEn: 'What do you think this situation means about you?'
  },
  
  // PHASE 3: CLARIFICATION (2-3 exchanges)
  {
    id: 'clarify_1',
    phase: 'clarification',
    question: 'Este această poveste 100% adevărată? Poți fi absolut sigur?',
    questionEn: 'Is this story 100% true? Can you be absolutely certain?',
    followUp: 'Ce ar fi posibil dacă această poveste nu ar fi întreaga imagine?',
    followUpEn: 'What would be possible if this story wasn\'t the whole picture?'
  },
  {
    id: 'clarify_2',
    phase: 'clarification',
    question: 'Ce îți dorești de fapt să simți în această situație?',
    questionEn: 'What do you actually want to feel in this situation?'
  },
  {
    id: 'clarify_3',
    phase: 'clarification',
    question: 'Ce ar trebui să se întâmple pentru a te simți așa?',
    questionEn: 'What would need to happen for you to feel that way?'
  },
  
  // PHASE 4: TRANSFORMATION (2-3 exchanges)
  {
    id: 'transform_1',
    phase: 'transformation',
    question: 'Ce poți TU controla în această situație?',
    questionEn: 'What can YOU control in this situation?',
    followUp: 'Excelent! Te concentrezi pe ce e în puterea ta.',
    followUpEn: 'Excellent! You\'re focusing on what\'s within your power.'
  },
  {
    id: 'transform_2',
    phase: 'transformation',
    question: 'Ce lecție îți oferă această emoție? Ce mesaj poartă pentru tine?',
    questionEn: 'What lesson does this emotion offer you? What message does it carry for you?',
    followUp: 'Ce insight puternic!',
    followUpEn: 'What a powerful insight!'
  },
  {
    id: 'transform_3',
    phase: 'transformation',
    question: 'Dacă ai privi această situație ca pe un dar sau o oportunitate, ce ar fi?',
    questionEn: 'If you looked at this situation as a gift or opportunity, what would it be?'
  },
  
  // PHASE 5: ACTION (1-2 exchanges)
  {
    id: 'action_1',
    phase: 'action',
    question: 'Ce acțiune concretă poți lua chiar acum sau astăzi?',
    questionEn: 'What concrete action can you take right now or today?',
    followUp: 'Asta e putere în acțiune!',
    followUpEn: 'That\'s power in action!'
  },
  {
    id: 'action_2',
    phase: 'action',
    question: 'Cu ce energie vrei să începi această zi? Ce stare alegi?',
    questionEn: 'What energy do you want to start this day with? What state do you choose?',
    followUp: 'Minunat! Ai transformat energia și ești gata pentru o zi extraordinară!',
    followUpEn: 'Wonderful! You\'ve transformed your energy and you\'re ready for an extraordinary day!'
  }
];

// Get questions by phase
export const getQuestionsByPhase = (phase: TransformQuestion['phase']) => {
  return EMOTIONAL_TRANSFORM_QUESTIONS.filter(q => q.phase === phase);
};

// Get question text based on language
export const getQuestionText = (question: TransformQuestion, language: 'en' | 'ro' = 'ro') => {
  return language === 'en' ? question.questionEn : question.question;
};

export const getFollowUpText = (question: TransformQuestion, language: 'en' | 'ro' = 'ro') => {
  if (!question.followUp) return undefined;
  return language === 'en' ? question.followUpEn : question.followUp;
};

// Phase descriptions for UI
export const getPhaseDescriptions = (language: 'en' | 'ro' = 'ro') => {
  if (language === 'en') {
    return {
      validation: {
        title: 'Validation',
        description: 'We recognize and accept the emotion',
        icon: '💭'
      },
      investigation: {
        title: 'Investigation',
        description: 'We understand what happened',
        icon: '🔍'
      },
      clarification: {
        title: 'Clarification',
        description: 'We separate facts from stories',
        icon: '💡'
      },
      transformation: {
        title: 'Transformation',
        description: 'We find the lesson and power',
        icon: '⚡'
      },
      action: {
        title: 'Action',
        description: 'We choose the energy and action',
        icon: '🚀'
      }
    };
  }
  
  return {
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
};

// Legacy export for backwards compatibility
export const PHASE_DESCRIPTIONS = getPhaseDescriptions('ro');
