export type LifebookCategory = 'body' | 'being' | 'balance' | 'business';

export type LifebookSubcategory = 
  | 'health_fitness'
  | 'intellectual_life'
  | 'emotional_life'
  | 'character'
  | 'spiritual_life'
  | 'love_relationship'
  | 'parenting'
  | 'social_life'
  | 'financial_life'
  | 'career'
  | 'quality_of_life'
  | 'life_vision';

export type LifebookSection = 'premise' | 'vision' | 'purpose' | 'strategy' | 'notes';

export interface LifebookEntry {
  id: string;
  user_id: string;
  category: LifebookCategory;
  subcategory: LifebookSubcategory;
  section: LifebookSection;
  content: Record<string, any>;
  messages: Message[];
  summary?: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface LifebookDraft {
  id: string;
  user_id: string;
  subcategory: LifebookSubcategory;
  section: LifebookSection;
  messages: Message[];
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

export interface SubcategoryInfo {
  key: LifebookSubcategory;
  name: string;
  nameRo: string;
  icon: string;
}

export interface CategoryInfo {
  key: LifebookCategory;
  name: string;
  nameRo: string;
  icon: string;
  subcategories: SubcategoryInfo[];
}

export const LIFEBOOK_STRUCTURE: CategoryInfo[] = [
  {
    key: 'body',
    name: 'Body',
    nameRo: 'Corp',
    icon: '💪',
    subcategories: [
      { key: 'health_fitness', name: 'Health & Fitness', nameRo: 'Sănătate & Fitness', icon: '🏋️' },
      { key: 'intellectual_life', name: 'Intellectual Life', nameRo: 'Viață Intelectuală', icon: '🧠' }
    ]
  },
  {
    key: 'being',
    name: 'Spirituality',
    nameRo: 'Spiritualitate',
    icon: '🙏',
    subcategories: [
      { key: 'emotional_life', name: 'Emotional Life', nameRo: 'Viață Emoțională', icon: '❤️' },
      { key: 'character', name: 'Character', nameRo: 'Caracter', icon: '🎯' },
      { key: 'spiritual_life', name: 'Spiritual Life', nameRo: 'Viață Spirituală', icon: '✨' }
    ]
  },
  {
    key: 'balance',
    name: 'Relationships',
    nameRo: 'Relații',
    icon: '👥',
    subcategories: [
      { key: 'love_relationship', name: 'Love Relationship', nameRo: 'Relația de Iubire', icon: '💑' },
      { key: 'parenting', name: 'Parenting', nameRo: 'Parenting', icon: '👨‍👩‍👧' },
      { key: 'social_life', name: 'Social Life', nameRo: 'Viață Socială', icon: '🤝' }
    ]
  },
  {
    key: 'business',
    name: 'Business',
    nameRo: 'Business',
    icon: '💼',
    subcategories: [
      { key: 'financial_life', name: 'Financial Life', nameRo: 'Viață Financiară', icon: '💰' },
      { key: 'career', name: 'Career', nameRo: 'Carieră', icon: '🚀' },
      { key: 'quality_of_life', name: 'Quality of Life', nameRo: 'Calitatea Vieții', icon: '⭐' },
      { key: 'life_vision', name: 'Life Vision', nameRo: 'Viziunea Vieții', icon: '🌟' }
    ]
  }
];

export const SECTIONS: { key: LifebookSection; name: string; nameRo: string; icon: string }[] = [
  { key: 'premise', name: 'Premise', nameRo: 'Premise', icon: '🧱' },
  { key: 'vision', name: 'Vision', nameRo: 'Viziune', icon: '👁️' },
  { key: 'purpose', name: 'Purpose', nameRo: 'Scop', icon: '🎯' },
  { key: 'strategy', name: 'Strategy', nameRo: 'Strategie', icon: '📋' },
  { key: 'notes', name: 'Notes', nameRo: 'Note', icon: '📝' }
];

export const getSubcategoryInfo = (subcategoryKey: LifebookSubcategory): SubcategoryInfo | undefined => {
  for (const category of LIFEBOOK_STRUCTURE) {
    const subcategory = category.subcategories.find(s => s.key === subcategoryKey);
    if (subcategory) return subcategory;
  }
  return undefined;
};

export const getCategoryForSubcategory = (subcategoryKey: LifebookSubcategory): CategoryInfo | undefined => {
  return LIFEBOOK_STRUCTURE.find(cat => 
    cat.subcategories.some(sub => sub.key === subcategoryKey)
  );
};
