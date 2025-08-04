import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { Send, PlusCircle, Lightbulb } from "lucide-react";

interface AiLiveCoachingProps {
  onAddToHitList?: (action: string) => void;
}

export const AiLiveCoaching: React.FC<AiLiveCoachingProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedAction, setCommittedAction] = useState("");
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  // Questions for the Stack de Deblocare
  const questions = [
    "Care este provocarea majoră cu care te confrunți în prezent?",
    "Ce soluții ai încercat deja pentru această provocare?",
    "Ce resurse ai la dispoziție pentru a face față acestei provocări?",
    "Care ar fi rezultatul ideal al acestei situații?",
    "Ce te împiedică să obții acest rezultat ideal?",
    "Care este prima acțiune concretă pe care o poți face pentru a rezolva această provocare?"
  ];

  const handleNext = () => {
    if (!answers[step]) {
      toast({
        title: "Răspuns necesar",
        description: "Te rugăm să completezi un răspuns înainte de a continua.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul de deblocare a fost finalizat cu succes.",
      });
      
      if (answers[questions.length - 1]) {
        setCommittedAction(answers[questions.length - 1]);
      }
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers({ ...answers, [step]: e.target.value });
  };

  const addToHitList = () => {
    if (onAddToHitList && committedAction) {
      onAddToHitList(committedAction);
      setCommittedAction("");
    }
  };

  const resetStack = () => {
    setStep(0);
    setAnswers({});
    setCommittedAction("");
  };

  return (
    <div className="w-full h-full">
      {committedAction ? (
        <div className="min-h-screen w-full p-2 sm:p-4">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">
              Acțiune Angajată
            </h1>
            
            <div className="p-3 bg-background/50 rounded border-l-4 border-green-500 mb-4">
              <p className="text-sm sm:text-base text-foreground">{committedAction}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={resetStack}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Începe o nouă sesiune
            </Button>
            <Button 
              onClick={addToHitList}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Adaugă la lista HIT
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full p-2 sm:p-4">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-green-400 mb-1">
              Stack de Deblocare
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pasul {step + 1} din {questions.length}
            </p>
          </div>

          <div className="mb-4 p-3 bg-background/50 rounded border-l-4 border-green-500">
            <p className="text-sm sm:text-base text-foreground">{questions[step]}</p>
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
              {step < questions.length - 1 ? 'Continuă' : 'Finalizează'}
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
