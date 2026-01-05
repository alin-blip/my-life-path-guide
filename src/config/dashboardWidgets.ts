import { WidgetDefinition } from '@/types/dashboardWidget';

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: 'champion-routine',
    name: { en: 'Champion Routine', ro: 'Rutina de Campion' },
    description: { en: 'Morning routine with daily habits in 4 quadrants', ro: 'Rutină dimineață cu obiceiuri zilnice în 4 cadrane' },
    icon: 'Sparkles',
    defaultSize: 'large',
    category: 'routine'
  },
  {
    id: 'macros',
    name: { en: 'Macronutrients', ro: 'Macronutrienți' },
    description: { en: 'Track your daily protein, carbs and fats intake', ro: 'Urmărește consumul zilnic de proteine, carbohidrați și grăsimi' },
    icon: 'PieChart',
    defaultSize: 'medium',
    category: 'fitness'
  },
  {
    id: 'workout',
    name: { en: 'Workout', ro: 'Antrenament' },
    description: { en: 'Your daily workout plan and exercise tracking', ro: 'Planul de antrenament zilnic și urmărirea exercițiilor' },
    icon: 'Dumbbell',
    defaultSize: 'large',
    category: 'fitness'
  },
  {
    id: 'calories',
    name: { en: 'Calories', ro: 'Calorii' },
    description: { en: 'Daily calorie goal and progress', ro: 'Obiectivul zilnic de calorii și progresul' },
    icon: 'Flame',
    defaultSize: 'small',
    category: 'fitness'
  },
  {
    id: 'gratitude',
    name: { en: 'Gratitude', ro: 'Recunoștință' },
    description: { en: 'Daily gratitude journaling', ro: 'Jurnal zilnic de recunoștință' },
    icon: 'Heart',
    defaultSize: 'medium',
    category: 'mindset'
  },
  {
    id: 'streak',
    name: { en: 'Streak', ro: 'Serie' },
    description: { en: 'Your current activity streak', ro: 'Seria ta curentă de activitate' },
    icon: 'Zap',
    defaultSize: 'small',
    category: 'tracking'
  },
  {
    id: 'tasks',
    name: { en: 'Today Tasks', ro: 'Task-uri Azi' },
    description: { en: 'Your tasks for today', ro: 'Task-urile tale pentru azi' },
    icon: 'CheckSquare',
    defaultSize: 'medium',
    category: 'productivity'
  },
  {
    id: 'reading',
    name: { en: 'Reading Progress', ro: 'Progres Lectură' },
    description: { en: 'Track your reading progress', ro: 'Urmărește progresul de lectură' },
    icon: 'BookOpen',
    defaultSize: 'small',
    category: 'mindset'
  },
  {
    id: 'water',
    name: { en: 'Water Intake', ro: 'Consum Apă' },
    description: { en: 'Track your daily water intake', ro: 'Urmărește consumul zilnic de apă' },
    icon: 'Droplets',
    defaultSize: 'small',
    category: 'fitness'
  }
];

export const DEFAULT_WIDGETS = [
  { id: 'champion-routine', enabled: true, order: 1, size: 'large' as const },
  { id: 'streak', enabled: true, order: 2, size: 'small' as const },
  { id: 'tasks', enabled: true, order: 3, size: 'medium' as const }
];

export const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return AVAILABLE_WIDGETS.find(w => w.id === id);
};
