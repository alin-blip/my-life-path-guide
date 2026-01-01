/**
 * Task category detection and filtering utilities
 * Categories: Body, Being, Balance, Business
 */

export type TaskCategory = 'body' | 'being' | 'balance' | 'business' | 'all';

export interface CategoryInfo {
  id: TaskCategory;
  label: string;
  labelRo: string;
  icon: string;
  color: string;
  bgColor: string;
  keywords: string[];
}

export const TASK_CATEGORIES: CategoryInfo[] = [
  {
    id: 'body',
    label: 'Body',
    labelRo: 'Corp',
    icon: '💪',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    keywords: ['mișcare', 'movement', 'somn', 'sleep', 'energie', 'energy', 'sport', 'exercise', 'antrenament', 'training', 'gym', 'sală', 'alergare', 'running', 'fitness', 'health', 'sănătate', 'hidratare', 'water', 'apă', 'nutriție', 'nutrition', 'dietă', 'diet']
  },
  {
    id: 'being',
    label: 'Being',
    labelRo: 'Ființă',
    icon: '🧘',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    keywords: ['meditație', 'meditation', 'respirație', 'breathing', 'recunoștință', 'grateful', 'gratitude', 'journaling', 'mindful', 'spiritual', 'rugăciune', 'prayer', 'reflecție', 'reflection', 'mindfulness', 'calm', 'pace', 'peace', 'introspecție']
  },
  {
    id: 'balance',
    label: 'Balance',
    labelRo: 'Echilibru',
    icon: '⚖️',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    keywords: ['familie', 'family', 'prieten', 'friend', 'quality time', 'digital detox', 'reconectare', 'relații', 'relationship', 'social', 'copii', 'kids', 'children', 'partener', 'partner', 'soț', 'soție', 'hobby', 'vacanță', 'vacation', 'relaxare', 'relax', 'distracție', 'fun']
  },
  {
    id: 'business',
    label: 'Business',
    labelRo: 'Afaceri',
    icon: '💼',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    keywords: ['priorități', 'priorities', 'deep work', 'obiective', 'goals', 'review', 'proiect', 'project', 'client', 'meeting', 'întâlnire', 'email', 'task', 'deadline', 'livrabil', 'deliverable', 'prezentare', 'presentation', 'raport', 'report', 'strategie', 'strategy', 'vânzări', 'sales', 'marketing']
  }
];

/**
 * Detect the category of a task based on its title
 */
export function detectTaskCategory(title: string): TaskCategory {
  const titleLower = title.toLowerCase();
  
  for (const category of TASK_CATEGORIES) {
    if (category.keywords.some(kw => titleLower.includes(kw.toLowerCase()))) {
      return category.id;
    }
  }
  
  // Default to business if no category matched
  return 'business';
}

/**
 * Get category info by ID
 */
export function getCategoryInfo(categoryId: TaskCategory): CategoryInfo | undefined {
  return TASK_CATEGORIES.find(c => c.id === categoryId);
}

/**
 * Filter tasks by category
 */
export function filterByCategory<T extends { text?: string; title?: string }>(
  items: T[],
  category: TaskCategory
): T[] {
  if (category === 'all') return items;
  
  return items.filter(item => {
    const title = item.text || item.title || '';
    return detectTaskCategory(title) === category;
  });
}
