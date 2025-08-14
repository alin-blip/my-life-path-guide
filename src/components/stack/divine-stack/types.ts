
import React from 'react';

export interface DivinePrayerStackAnswer {
  [key: number]: string;
}

export interface DivinePrayerStackState {
  step: number;
  answers: DivinePrayerStackAnswer;
  isSubmitting: boolean;
  committedAction: string;
  sessionId: string;
  category: string;
  stackCompleted: boolean;
  actionAddedToHotList: boolean;
  showSummary: boolean;
}

export interface DivinePrayerStackProps {
  onAddToHitList?: (action: string) => Promise<void> | void;
}

export interface UseDivinePrayerStackReturn {
  state: DivinePrayerStackState;
  setState: {
    setStep: React.Dispatch<React.SetStateAction<number>>;
    setAnswers: React.Dispatch<React.SetStateAction<DivinePrayerStackAnswer>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setCommittedAction: React.Dispatch<React.SetStateAction<string>>;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    setStackCompleted: React.Dispatch<React.SetStateAction<boolean>>;
    setActionAddedToHotList: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  };
  handlers: {
    handleAnswer: (value: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleNext: () => void;
    handleBack: () => void;
    completeStack: () => void;
    addToHotList: () => Promise<void>;
    resetStack: () => void;
    addMoreActions: () => void;
  };
  utils: {
    getCurrentQuestion: () => string;
    getDivineSummary: () => JSX.Element;
  };
}
