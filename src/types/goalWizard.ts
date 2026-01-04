export type GoalCategory = 'body' | 'being' | 'balance' | 'business';

export type GoalWizardStep = 
  | 'project_count'
  | 'project_names'
  | 'objective'
  | 'why'
  | 'positive_impact'
  | 'negative_impact'
  | 'milestone_3m'
  | 'milestone_1m'
  | 'week1_action'
  | 'confirmation';

export interface GoalWizardMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GoalMilestones {
  threeMonths: string;
  oneMonth: string;
  weekOne: string;
}

export interface GoalProject {
  id: string;
  name: string;
  milestones: GoalMilestones;
}

export interface GoalWizardData {
  category: GoalCategory;
  projectCount?: number;
  projects?: GoalProject[];
  currentProjectIndex?: number;
  objective?: string; // Legacy - will be derived from projects
  why: string;
  positiveImpact: string;
  negativeConsequence: string;
  milestones?: GoalMilestones; // Legacy - will be per project
  impactOnOtherAreas?: string[];
}

export interface GoalWizardState {
  step: GoalWizardStep;
  category: GoalCategory;
  messages: GoalWizardMessage[];
  goalData: Partial<GoalWizardData>;
  isProcessing: boolean;
  isComplete: boolean;
}

export const WIZARD_STEPS: { id: GoalWizardStep; label: { en: string; ro: string } }[] = [
  { id: 'project_count', label: { en: 'Projects', ro: 'Proiecte' } },
  { id: 'project_names', label: { en: 'Names', ro: 'Denumiri' } },
  { id: 'why', label: { en: 'Why?', ro: 'De ce?' } },
  { id: 'positive_impact', label: { en: 'Impact+', ro: 'Impact+' } },
  { id: 'negative_impact', label: { en: 'Risk', ro: 'Risc' } },
  { id: 'milestone_3m', label: { en: '3 Months', ro: '3 Luni' } },
  { id: 'milestone_1m', label: { en: '1 Month', ro: '1 Lună' } },
  { id: 'week1_action', label: { en: 'Week 1', ro: 'Săpt. 1' } },
  { id: 'confirmation', label: { en: 'Confirm', ro: 'Confirmare' } },
];

export const CATEGORY_INFO: Record<GoalCategory, {
  label: { en: string; ro: string };
  icon: string;
  color: string;
  bgColor: string;
}> = {
  body: {
    label: { en: 'Body', ro: 'Corp' },
    icon: 'Dumbbell',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  being: {
    label: { en: 'Being', ro: 'Ființă' },
    icon: 'Brain',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  balance: {
    label: { en: 'Balance', ro: 'Echilibru' },
    icon: 'Heart',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  business: {
    label: { en: 'Business', ro: 'Business' },
    icon: 'Briefcase',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
};
