export interface MasterPlanQuestion {
  id: string;
  principle: string;
  question: string;
  subQuestions?: string[];
}

export interface MasterPlanAnswer {
  questionId: string;
  answer: string;
}

export interface MasterPlanStackProps {
  onAddToHitList?: (action: string) => void;
  existingData?: any;
  isReadOnly?: boolean;
  stackId?: string;
  initialPrinciple?: number | null;
  challengeDay?: number | null;
}

export interface MasterPlanState {
  currentStep: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  stackCompleted: boolean;
  finalAction?: string;
}

// Backwards compatibility aliases
export type NapoleonHillQuestion = MasterPlanQuestion;
export type NapoleonHillAnswer = MasterPlanAnswer;
export type NapoleonHillStackProps = MasterPlanStackProps;
export type NapoleonHillState = MasterPlanState;
