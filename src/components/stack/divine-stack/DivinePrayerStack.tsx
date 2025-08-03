
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDivinePrayerStack } from './useDivinePrayerStack';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { StackTodoWidget } from "../StackTodoWidget";
import { BookOpen, Save, Send, CheckCircle, PlusCircle, Lightbulb } from 'lucide-react';

interface DivinePrayerStackProps {
  onAddToHitList?: (action: string) => void;
}

export const DivinePrayerStack: React.FC<DivinePrayerStackProps> = ({ onAddToHitList }) => {
  const { state, handlers, utils } = useDivinePrayerStack({ onAddToHitList });
  const { 
    step, 
    answers, 
    isSubmitting, 
    committedAction, 
    stackCompleted, 
    actionAddedToHotList,
    showSummary 
  } = state;

  const {
    isIdeaModalOpen,
    currentIdea,
    setCurrentIdea,
    openIdeaModal,
    closeIdeaModal,
    submitIdea
  } = useStackTodoIntegration({ onAddToHitList });
  
  const { 
    handleInputChange, 
    handleNext, 
    handleBack, 
    resetStack, 
    addToHotList
  } = handlers;
  
  const { getCurrentQuestion, getDivineSummary } = utils;

  console.log("DivinePrayerStack rendering with onAddToHitList:", !!onAddToHitList);
  console.log("stackCompleted:", stackCompleted, "committedAction:", committedAction, "actionAddedToHotList:", actionAddedToHotList);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-400">Stack de Rugăciune</h2>
        <Button 
          onClick={openIdeaModal}
          variant="outline"
          size="sm"
          className="border-purple-500/30 hover:bg-purple-800 text-purple-400"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Adaugă idee nouă
        </Button>
      </div>

      <StackTodoWidget onAddToHitList={onAddToHitList} isMinimized />

      {stackCompleted ? (
        <Card className="border-purple-500/30 bg-purple-950/10">
          <CardHeader>
            <CardTitle className="text-center text-purple-400">Stack de Rugăciune Finalizat</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {showSummary && getDivineSummary()}
              
              {committedAction && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-purple-300 mb-2">Acțiune Angajată:</h3>
                  <p className="text-gray-300">{committedAction}</p>
                  {actionAddedToHotList && (
                    <div className="flex items-center text-green-400 text-sm mt-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Această acțiune a fost adăugată la lista ta fierbinte
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="hover:bg-purple-800 border-purple-500/30"
              onClick={resetStack}
            >
              Începe un nou stack
            </Button>
            {committedAction && !actionAddedToHotList && (
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={addToHotList}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Adaugă la lista fierbinte
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-purple-500/30 bg-purple-950/10">
          <CardHeader>
            <CardTitle className="text-center text-purple-400 flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5" />
              Stack de Rugăciune - Pasul {step + 1} din {19}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-md">
              <p className="text-gray-100">{getCurrentQuestion()}</p>
            </div>
            <Textarea 
              placeholder="Scrie răspunsul tău aici..."
              className="min-h-[150px] bg-gray-800/30 border-gray-700"
              value={answers[step] || ""}
              onChange={handleInputChange}
              onEnterSubmit={handleNext}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 0}
              className="hover:bg-purple-800 border-purple-500/30"
            >
              Înapoi
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {step < 18 ? 'Continuă' : 'Finalizează'}
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
