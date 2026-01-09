export interface MeditationTemplate {
  id: string;
  title: string;
  description: string;
  category: 'empowerment' | 'productivity' | 'recovery' | 'special';
  icon: string;
  duration: number; // minutes
  dataSources: ('visionBoard' | 'tasks' | 'bigOne' | 'habits' | 'missions' | 'relationships' | 'none')[];
  promptKey: string;
}

export const MEDITATION_CATEGORIES = {
  empowerment: {
    label: 'Empowerment',
    description: 'Vizualizare și manifestare',
    color: 'from-purple-500 to-indigo-600'
  },
  productivity: {
    label: 'Productivitate',
    description: 'Focus și energie',
    color: 'from-amber-500 to-orange-600'
  },
  recovery: {
    label: 'Recuperare',
    description: 'Relaxare și calm',
    color: 'from-emerald-500 to-teal-600'
  },
  special: {
    label: 'Special',
    description: 'Recunoștință și reflecție',
    color: 'from-pink-500 to-rose-600'
  }
} as const;

export const MEDITATION_TEMPLATES: MeditationTemplate[] = [
  // EMPOWERMENT
  {
    id: 'have-it-all',
    title: 'Vizualizare Have It All',
    description: 'Vizualizare completă a succesului în toate 4 arii: Corp, Suflet, Relații, Business',
    category: 'empowerment',
    icon: '🌟',
    duration: 15,
    dataSources: ['visionBoard'],
    promptKey: 'haveItAll'
  },
  {
    id: 'body-power',
    title: 'Corp Puternic & Sănătos',
    description: 'Vizualizare pentru sănătate, energie și vitalitate fizică',
    category: 'empowerment',
    icon: '💪',
    duration: 10,
    dataSources: ['visionBoard', 'missions'],
    promptKey: 'bodyPower'
  },
  {
    id: 'inner-peace',
    title: 'Pace Interioară & Claritate',
    description: 'Creștere spirituală, mindfulness și conexiune cu sinele',
    category: 'empowerment',
    icon: '🙏',
    duration: 12,
    dataSources: ['visionBoard', 'missions'],
    promptKey: 'innerPeace'
  },
  {
    id: 'deep-relationships',
    title: 'Relații Profunde & Împlinite',
    description: 'Vizualizare pentru conexiuni autentice cu cei dragi',
    category: 'empowerment',
    icon: '👥',
    duration: 10,
    dataSources: ['visionBoard', 'relationships'],
    promptKey: 'deepRelationships'
  },
  {
    id: 'success-abundance',
    title: 'Succes & Abundență',
    description: 'Vizualizare pentru succes profesional și prosperitate financiară',
    category: 'empowerment',
    icon: '💼',
    duration: 12,
    dataSources: ['visionBoard', 'missions'],
    promptKey: 'successAbundance'
  },
  
  // PRODUCTIVITY
  {
    id: 'daily-focus',
    title: 'Focus pentru Ziua de Azi',
    description: 'Claritate mentală pentru task-urile importante ale zilei',
    category: 'productivity',
    icon: '🎯',
    duration: 8,
    dataSources: ['bigOne', 'tasks'],
    promptKey: 'dailyFocus'
  },
  {
    id: 'morning-energy',
    title: 'Energie Matinală',
    description: 'Start puternic de zi cu motivație și entuziasm',
    category: 'productivity',
    icon: '⚡',
    duration: 7,
    dataSources: ['tasks', 'habits'],
    promptKey: 'morningEnergy'
  },
  {
    id: 'deep-work',
    title: 'Motivație Deep Work',
    description: 'Pregătire mentală pentru sesiuni de lucru concentrat',
    category: 'productivity',
    icon: '🔥',
    duration: 10,
    dataSources: ['bigOne', 'visionBoard'],
    promptKey: 'deepWork'
  },
  
  // RECOVERY
  {
    id: 'deep-relaxation',
    title: 'Relaxare Profundă',
    description: 'Eliberare completă a stresului și tensiunii',
    category: 'recovery',
    icon: '🌊',
    duration: 15,
    dataSources: ['none'],
    promptKey: 'deepRelaxation'
  },
  {
    id: 'peaceful-sleep',
    title: 'Somn Liniștit',
    description: 'Pregătire pentru un somn odihnitor și regenerator',
    category: 'recovery',
    icon: '🌙',
    duration: 12,
    dataSources: ['none'],
    promptKey: 'peacefulSleep'
  },
  {
    id: 'breath-calm',
    title: 'Respirație & Calm',
    description: 'Tehnici de respirație pentru reducerea anxietății',
    category: 'recovery',
    icon: '🍃',
    duration: 8,
    dataSources: ['none'],
    promptKey: 'breathCalm'
  },
  
  // SPECIAL
  {
    id: 'gratitude',
    title: 'Recunoștință & Apreciere',
    description: 'Cultivare a stării de mulțumire și abundență',
    category: 'special',
    icon: '🙏',
    duration: 10,
    dataSources: ['habits', 'relationships'],
    promptKey: 'gratitude'
  },
  {
    id: 'affirmations',
    title: 'Afirmații Puternice',
    description: 'Reprogramare a convingerilor limitante',
    category: 'special',
    icon: '🎭',
    duration: 10,
    dataSources: ['visionBoard'],
    promptKey: 'affirmations'
  },
  {
    id: 'evening-reflection',
    title: 'Reflecție de Seară',
    description: 'Închiderea zilei cu recunoștință și învățăminte',
    category: 'special',
    icon: '🌅',
    duration: 8,
    dataSources: ['tasks', 'habits'],
    promptKey: 'eveningReflection'
  }
];

export const getTemplatesByCategory = (category: MeditationTemplate['category']) => {
  return MEDITATION_TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return MEDITATION_TEMPLATES.find(t => t.id === id);
};
