export interface GratitudeStackAnswer {
  [key: number]: string;
}

export interface GratitudeStackState {
  step: number;
  answers: GratitudeStackAnswer;
  isSubmitting: boolean;
  committedAction: string;
  sessionId: string;
  stackCompleted: boolean;
  actionAddedToHotList: boolean;
  showSummary: boolean;
  saveStatus: string;
}

export interface GratitudeStackProps {
  onAddToHitList?: (action: string) => Promise<void> | void;
  existingData?: any;
  isReadOnly?: boolean;
  stackId?: string | null;
  mode?: 'audio' | 'text';
}

export interface UseGratitudeStackReturn {
  state: GratitudeStackState;
  handlers: {
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleNext: () => void;
    handleBack: () => void;
    resetStack: () => void;
    addToHotList: () => Promise<void>;
    handleDraftRestore: (draftAnswer: string) => void;
    handleAnswer: (step: number, answer: string) => void;
  };
  utils: {
    getCurrentQuestion: () => string;
    getGratitudeSummary: () => JSX.Element;
  };
}
