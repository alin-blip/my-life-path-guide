export interface HormoziStackProps {
  onAddToHitList?: (actionText: string) => void;
}

export interface HormoziStackState {
  currentStep: number;
  answers: Record<number, string>;
  isComplete: boolean;
  isSubmitting: boolean;
  committedAction: string;
  actionAddedToHotList: boolean;
  showSummary: boolean;
  mode: 'structured' | 'chat';
}

export interface UseHormoziStackProps {
  onAddToHitList?: (actionText: string) => void;
}

export interface HormoziStackData {
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