import React, { useState, useEffect } from 'react';
import { useAngerStack } from './anger-stack/useAngerStack';
import { AngerStackQuestion } from './anger-stack/AngerStackQuestion';
import { CompletedStack } from './anger-stack/CompletedStack';
import { AngerStackExplanation } from './anger-stack/AngerStackExplanation';
import { getQuestions } from './anger-stack/questions';
import { AngerStackProps } from './anger-stack/types';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { StackIdeaModal } from "./StackIdeaModal";
import { AiGuidedStack } from "./AiGuidedStack";
import { StackModeSelector } from "./StackModeSelector";
import { StackResetConfirmation } from "./StackResetConfirmation";
import { StackProgressIndicator } from "./StackProgressIndicator";
import { StackDraftSaver } from "./StackDraftSaver";
import { Button } from "@/components/ui/button";
import { Bot, User, AlertTriangle } from "lucide-react";

export const EnhancedAngerStack: React.FC<AngerStackProps> = ({ onAddToHitList }) => {
  const [mode, setMode] = useState<'audio' | 'text' | 'selecting'>('selecting');
  const [hasInitialized, setHasInitialized] = useState(false);
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });
  
  const rawQuestions = getQuestions(document.documentElement.lang === 'en' ? 'en' : 'ro');

  // Always start with 'selecting' to show mode selector
  useEffect(() => {
    if (!hasInitialized) {
      setMode('selecting');
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const handleModeSelection = (selectedMode: 'audio' | 'text') => {
    setMode(selectedMode);
  };

  if (mode === 'selecting') {
    return <StackModeSelector onSelectMode={handleModeSelection} />;
  }
  
  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="anger"
        questions={rawQuestions}
        voiceOnlyMode={mode === 'audio'}
        audioMode={mode === 'audio'}
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};