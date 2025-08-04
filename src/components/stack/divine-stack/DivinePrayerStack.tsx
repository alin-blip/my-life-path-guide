
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDivinePrayerStack } from './useDivinePrayerStack';
import { DivinePrayerStackProps } from './types';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { Send, PlusCircle, CheckCircle, Lightbulb } from 'lucide-react';

export const DivinePrayerStack: React.FC<DivinePrayerStackProps> = ({ onAddToHitList }) => {
  const { state, handlers, utils } = useDivinePrayerStack({ onAddToHitList });
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });
  
  const { 
    step, answers, isSubmitting, committedAction, 
    stackCompleted, actionAddedToHotList, showSummary 
  } = state;
  
  const { handleInputChange, handleNext, handleBack, resetStack, addToHotList } = handlers;
  const { getCurrentQuestion, getDivineSummary } = utils;

  return (
    <div className="w-full h-full">
      {(committedAction || stackCompleted) ? (
        <div className="min-h-screen w-full p-2 sm:p-4">
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
        <div className="min-h-screen w-full p-2 sm:p-4">
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
    </div>
  );
};
