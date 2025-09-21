
import React, { useState } from 'react';
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
import { getQuestions } from "./questions";
import { Send, PlusCircle, CheckCircle, Bot, User, Lightbulb, Save } from 'lucide-react';

export const DivinePrayerStack: React.FC<DivinePrayerStackProps> = ({ 
  onAddToHitList, 
  existingData, 
  isReadOnly = false,
  stackId 
}) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
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

  if (mode === 'ai') {
    return (
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="divine-prayer"
        questions={getQuestions()}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {(committedAction || stackCompleted) ? (
        <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-indigo-400 mb-2">
              {showSummary ? "Rugăciune Finalizată" : "Acțiune Angajată"}
            </h1>
            
            <div className="p-3 bg-background/50 rounded border-l-4 border-indigo-500 mb-4">
              {showSummary ? (
                getDivineSummary()
              ) : (
                <div>
                  <p className="text-sm sm:text-base text-foreground">{committedAction}</p>
                  {actionAddedToHotList && (
                    <div className="flex items-center text-green-400 text-xs sm:text-sm mt-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Această acțiune a fost adăugată la lista ta fierbinte
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={resetStack}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Începe o nouă rugăciune
            </Button>
            {!actionAddedToHotList && committedAction && (
              <Button 
                onClick={addToHotList}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Adaugă la lista fierbinte
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
          <div className="mb-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                onClick={() => setMode('manual')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Manual
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode('ai')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                AI Ghidat
              </Button>
            </div>
            <DivinePrayerExplanation />
          </div>
          
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-indigo-400 mb-1">
              Stack de Rugăciune
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pasul {step + 1} din 17
            </p>
          </div>

          <div className="mb-4 p-3 bg-background/50 rounded border-l-4 border-indigo-500">
            <p className="text-sm sm:text-base text-foreground">{getCurrentQuestion()}</p>
          </div>
          
          <div className="mb-4">
            <Textarea 
              placeholder="Scrie răspunsul tău aici..."
              className="min-h-[100px] sm:min-h-[120px] w-full text-sm"
              value={answers[step] || ""}
              onChange={handleInputChange}
              onEnterSubmit={handleNext}
            />
            
            {/* Save status indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Save className="w-3 h-3" />
              <span>{saveStatus}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 0}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Înapoi
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isSubmitting}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {step < 16 ? 'Continuă' : 'Finalizează'}
            </Button>
          </div>
        </div>
      )}

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
      
      {/* Draft auto-saver for emergency saves */}
      <StackDraftSaver
        stackType="divine-prayer"
        sessionId={sessionId}
        currentStep={step}
        currentAnswer={answers[step] || ""}
        onDraftRestore={handleDraftRestore}
      />
    </div>
  );
};
