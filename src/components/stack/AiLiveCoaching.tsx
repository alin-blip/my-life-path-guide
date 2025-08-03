
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { StackTodoWidget } from "./StackTodoWidget";
import { Headphones, Send, PlusCircle, Lightbulb } from "lucide-react";

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
    currentIdea,
    setCurrentIdea,
    openIdeaModal,
    closeIdeaModal,
    submitIdea
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
    
    // In a real implementation, you might save to Supabase here
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul de deblocare a fost finalizat cu succes.",
      });
      
      // Extract the action from the final answer
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-400">Stack de Deblocare</h2>
        <Button 
          onClick={openIdeaModal}
          variant="outline"
          size="sm"
          className="border-green-500/30 hover:bg-green-800 text-green-400"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Adaugă idee nouă
        </Button>
      </div>

      <StackTodoWidget onAddToHitList={onAddToHitList} isMinimized />

      {committedAction ? (
        <Card className="border-green-500/30 bg-green-950/10">
          <CardHeader>
            <CardTitle className="text-center text-green-400">Acțiune Angajată</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{committedAction}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              className="hover:bg-green-800 border-green-500/30"
              onClick={resetStack}
            >
              Începe o nouă sesiune
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={addToHitList}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adaugă la lista HIT
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-green-500/30 bg-green-950/10">
          <CardHeader>
            <CardTitle className="text-center text-green-400">
              Stack de Deblocare - Pasul {step + 1} din {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-md">
              <p className="text-gray-100">{questions[step]}</p>
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
              className="hover:bg-green-800 border-green-500/30"
            >
              Înapoi
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {step < questions.length - 1 ? 'Continuă' : 'Finalizează'}
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
