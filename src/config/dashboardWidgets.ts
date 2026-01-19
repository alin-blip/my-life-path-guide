import { WidgetDefinition } from '@/types/dashboardWidget';

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  // champion-routine is now displayed separately, not as a configurable widget
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
    id: 'ideas',
    name: { en: 'Ideas', ro: 'Idei' },
    description: { en: 'Capture and manage your ideas', ro: 'Captează și gestionează ideile tale' },
    icon: 'Lightbulb',
    defaultSize: 'medium',
    category: 'productivity'
  },
  {
    id: 'journal',
    name: { en: 'Journal', ro: 'Jurnal' },
    description: { en: 'Quick journal entry for your thoughts', ro: 'Intrare rapidă în jurnal pentru gândurile tale' },
    icon: 'NotebookPen',
    defaultSize: 'medium',
    category: 'mindset'
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
  },
  {
    id: 'napoleon-coach',
    name: { en: 'Success Coach', ro: 'Coach Succes' },
    description: { 
      en: 'AI coaching based on Napoleon Hill\'s 13 success principles', 
      ro: 'Coaching AI bazat pe cele 13 principii ale succesului Napoleon Hill' 
    },
    icon: 'Brain',
    defaultSize: 'medium',
    category: 'mindset'
  },
  {
    id: 'emotional-tracker',
    name: { en: 'Emotional Tracker', ro: 'Tracker Emoțional' },
    description: { 
      en: 'Track your emotions, discover patterns and develop emotional intelligence', 
      ro: 'Urmărește-ți emoțiile, descoperă pattern-uri și dezvoltă-ți inteligența emoțională' 
    },
    icon: 'Heart',
    defaultSize: 'medium',
    category: 'mindset'
  },
  {
    id: 'challenge-progress',
    name: { en: 'Challenge Progress', ro: 'Progres Challenge' },
    description: { 
      en: 'Track your 7-day challenge progress and continue where you left off', 
      ro: 'Urmărește progresul challengeului de 7 zile și continuă de unde ai rămas' 
    },
    icon: 'Trophy',
    defaultSize: 'medium',
    category: 'tracking'
  }
];

// Default to empty widgets for new users - they'll configure via the widget settings
export const DEFAULT_WIDGETS: { id: string; enabled: boolean; order: number; size: 'small' | 'medium' | 'large' }[] = [];

export const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return AVAILABLE_WIDGETS.find(w => w.id === id);
};
