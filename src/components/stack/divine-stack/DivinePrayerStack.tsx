
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDivinePrayerStack } from './useDivinePrayerStack';
import { DivinePrayerStackProps } from './types';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from "../AiGuidedStack";
import { DivinePrayerExplanation } from "./DivinePrayerExplanation";
import { StackDraftSaver } from "../StackDraftSaver";
import { StackModeSelector } from "../StackModeSelector";
import { getQuestions } from "./questions";
import { Send, PlusCircle, CheckCircle, Bot, User, Lightbulb, Save } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '../VoiceInputButton';
import { AISpeakingIndicator } from '../AISpeakingIndicator';

export const DivinePrayerStack: React.FC<DivinePrayerStackProps> = ({ 
  onAddToHitList, 
  existingData, 
  isReadOnly = false,
  stackId
}) => {
  const [mode, setMode] = useState<'audio' | 'text' | 'selecting'>('selecting');

  // Initialize mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('divine-prayer-stack-mode') as 'audio' | 'text' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const handleModeSelection = (selectedMode: 'audio' | 'text') => {
    setMode(selectedMode);
    localStorage.setItem('divine-prayer-stack-mode', selectedMode);
  };

  const { state, handlers, utils } = useDivinePrayerStack({ 
    onAddToHitList,
    existingData,
    isReadOnly 
  });
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });
  
  const { 
    step, answers, isSubmitting, committedAction, 
    stackCompleted, actionAddedToHotList, showSummary, sessionId, saveStatus 
  } = state;
  
  const { handleInputChange, handleNext, handleBack, resetStack, addToHotList, handleDraftRestore } = handlers;
  const { getCurrentQuestion, getDivineSummary } = utils;

  // If we have existing data, show it in read-only mode
  if (existingData && isReadOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-purple-300 mb-4">
              🙏 Stack de Rugăciune Salvat
            </h1>
            <p className="text-gray-300 mb-4">
              Creat la: {new Date(existingData.created_at).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            
            {existingData.content && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-300">Răspunsurile tale:</h3>
                {Object.entries(existingData.content).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">
                      Întrebarea {parseInt(key) + 1}: {getQuestions()[parseInt(key)] || 'Întrebare necunoscută'}
                    </h4>
                    <p className="text-white whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show mode selector if mode is 'selecting'
  if (mode === 'selecting') {
    return <StackModeSelector onSelectMode={handleModeSelection} />;
  }

  // Always use AI-guided mode
  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="divine-prayer"
        questions={getQuestions()}
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
