
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
    <div className="w-full max-w-none space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-indigo-400">Stack de Rugăciune Divină</h2>
        <Button 
          onClick={openIdeaModal}
          variant="outline"
          size="sm"
          className="border-indigo-500/30 hover:bg-indigo-800 text-indigo-400 w-full sm:w-auto"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Adaugă idee nouă
        </Button>
      </div>

      {(committedAction || stackCompleted) && (
        <Card className="border-indigo-500/30 bg-indigo-950/10 w-full">
          <CardHeader>
            <CardTitle className="text-center text-indigo-400 text-lg sm:text-xl">
              {showSummary ? "Rugăciune Finalizată" : "Acțiune Angajată"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSummary ? (
              getDivineSummary()
            ) : (
              <div>
                <p className="text-gray-300 text-sm sm:text-base">{committedAction}</p>
                {actionAddedToHotList && (
                  <div className="flex items-center text-green-400 text-xs sm:text-sm mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Această acțiune a fost adăugată la lista ta fierbinte
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="hover:bg-indigo-800 border-indigo-500/30 w-full sm:w-auto"
              onClick={resetStack}
            >
              Începe o nouă rugăciune
            </Button>
            {!actionAddedToHotList && committedAction && (
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                onClick={addToHotList}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Adaugă la lista fierbinte
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {!stackCompleted && (
        <Card className="border-indigo-500/30 bg-indigo-950/10 w-full">
          <CardHeader>
            <CardTitle className="text-center text-indigo-400 text-lg sm:text-xl">
              Stack de Rugăciune - Pasul {step + 1} din 17
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-md">
              <p className="text-gray-100 text-sm sm:text-base">{getCurrentQuestion()}</p>
            </div>
            <Textarea 
              placeholder="Scrie răspunsul tău aici..."
              className="min-h-[120px] sm:min-h-[150px] bg-gray-800/30 border-gray-700 text-sm sm:text-base"
              value={answers[step] || ""}
              onChange={handleInputChange}
              onEnterSubmit={handleNext}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 0}
              className="hover:bg-indigo-800 border-indigo-500/30 w-full sm:w-auto"
            >
              Înapoi
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {step < 16 ? 'Continuă' : 'Finalizează'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </div>
  );
};
