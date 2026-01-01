export type GoalCategory = 'body' | 'being' | 'balance' | 'business';

export type GoalWizardStep = 
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

export interface GoalWizardData {
  category: GoalCategory;
  objective: string;
  why: string;
  positiveImpact: string;
  negativeConsequence: string;
  milestones: GoalMilestones;
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
  { id: 'objective', label: { en: 'Objective', ro: 'Obiectiv' } },
  { id: 'why', label: { en: 'Why?', ro: 'De ce?' } },
  { id: 'positive_impact', label: { en: 'Positive Impact', ro: 'Impact Pozitiv' } },
  { id: 'negative_impact', label: { en: 'Negative Risk', ro: 'Risc Negativ' } },
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
