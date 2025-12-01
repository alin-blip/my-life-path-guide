export interface NapoleonHillQuestion {
  id: string;
  principle: string;
  question: string;
  subQuestions?: string[];
}

export interface NapoleonHillAnswer {
  questionId: string;
  answer: string;
}

export interface NapoleonHillStackProps {
  onAddToHitList?: (action: string) => void;
  existingData?: any;
  isReadOnly?: boolean;
  stackId?: string;
}

export interface NapoleonHillState {
  currentStep: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  stackCompleted: boolean;
  finalAction?: string;
}
