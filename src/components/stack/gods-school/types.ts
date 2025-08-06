export interface GodsSchoolStackProps {
  onAddToHitList?: (actionText: string) => void;
}

export interface GodsSchoolStackState {
  currentStep: number;
  answers: Record<number, string>;
  isComplete: boolean;
  isSubmitting: boolean;
  committedAction: string;
  actionAddedToHotList: boolean;
  showSummary: boolean;
  mode: 'structured' | 'chat';
}

export interface UseGodsSchoolStackProps {
  onAddToHitList?: (actionText: string) => void;
}

export interface GodsSchoolStackData {
  sessionId: string;
  stackType: string;
  step: number;
  answers: Record<string | number, string>;
  timestamp: string;
  isCompleted: boolean;
  committedAction?: string;
  mode?: 'structured' | 'chat';
  draftAnswer?: string;
}