
export interface AngerStackProps {
  onAddToHitList?: (action: string) => void;
}

export type AngerStackAnswer = Record<number, string>;

export interface AngerStackState {
  step: number;
  answers: AngerStackAnswer;
  isSubmitting: boolean;
  committedAction: string;
  sessionId: string;
  domain: string;
  targetName: string;
  story: string;
  isYesNoQuestion: boolean;
  currentAnswer: string;
  returnToQuestion: number | null;
  stackCompleted: boolean;
  actionAddedToHotList?: boolean;
}

export interface UseAngerStackReturn {
  state: AngerStackState;
  setState: {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    setAnswers: React.Dispatch<React.SetStateAction<AngerStackAnswer>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setCommittedAction: React.Dispatch<React.SetStateAction<string>>;
    setDomain: React.Dispatch<React.SetStateAction<string>>;
    setTargetName: React.Dispatch<React.SetStateAction<string>>;
    setStory: React.Dispatch<React.SetStateAction<string>>;
    setIsYesNoQuestion: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentAnswer: React.Dispatch<React.SetStateAction<string>>;
    setReturnToQuestion: React.Dispatch<React.SetStateAction<number | null>>;
    setStackCompleted: React.Dispatch<React.SetStateAction<boolean>>;
    setActionAddedToHotList?: React.Dispatch<React.SetStateAction<boolean>>;
  };
  handlers: {
    handleAnswer: (value: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleNext: () => void;
    handleBack: () => void;
    completeStack: () => void;
    addToHotList: () => void;
    resetStack: () => void;
  };
  utils: {
    getCurrentQuestion: () => string;
    replacePlaceholders: (question: string) => string;
  };
}
