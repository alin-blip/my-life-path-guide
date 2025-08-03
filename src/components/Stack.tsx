import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronsRight, 
  ThumbsUp, 
  PlusCircle, 
  Send, 
  Share,
  CheckCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { updateDailyProgress } from '@/utils/stackProgress';
import { StackTodoWidget } from './stack/StackTodoWidget';
import { StackIdeaModal } from './stack/StackIdeaModal';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';

interface StackProps {
  onAddToHitList?: (action: string) => void;
}

export const Stack: React.FC<StackProps> = ({ onAddToHitList }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committedAction, setCommittedAction] = useState("");
  const [actionAddedToHotList, setActionAddedToHotList] = useState(false);
  
  // Hook pentru integrarea TODO - acum conectat corect
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const questions = [
    "Ce provocare mentală întâmpini astăzi?",
    "Ce emoții simți în legătură cu această provocare?",
    "Care sunt gândurile tale despre această situație?",
    "Ce adevăr esențial nu recunoști în acest moment?",
    "Cum ai vedea această situație dacă ar fi vorba despre cineva drag?",
    "Care este o acțiune specifică pe care o poți lua pentru a face progres?"
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

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // TODO: Implement proper database insertion with authentication
        // For now, using local storage until authentication is implemented
        const stackSessions = JSON.parse(localStorage.getItem('powerStackSessions') || '[]');
        const newSession = {
          id: crypto.randomUUID(),
          session_id: `session-${Date.now()}`,
          step_number: questions.length,
          question: questions[questions.length - 1],
          answer: answers[questions.length - 1],
          answers: answers,
          user_id: 'temp-user',
          created_at: new Date().toISOString()
        };
        stackSessions.push(newSession);
        localStorage.setItem('powerStackSessions', JSON.stringify(stackSessions));
      }
      
      await updateDailyProgress('stack', { 
        sessionType: 'power-stack', 
        answers 
      });
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul a fost completat cu succes!",
      });
      
      if (answers[questions.length - 1]) {
        setCommittedAction(answers[questions.length - 1]);
        if (answers[questions.length - 1].trim() !== '') {
          addToHotList();
        }
      }
    } catch (error) {
      console.error("Error completing stack:", error);
      
      toast({
        title: "Stack finalizat",
        description: "Stack-ul a fost completat local.",
      });
      
      if (answers[questions.length - 1]) {
        setCommittedAction(answers[questions.length - 1]);
        if (answers[questions.length - 1].trim() !== '') {
          addToHotList();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers({ ...answers, [step]: e.target.value });
  };

  const addToHotList = () => {
    if (committedAction && !actionAddedToHotList) {
      try {
        const savedHotList = localStorage.getItem('door-hot-list') || "[]";
        const hotList = JSON.parse(savedHotList);
        
        const newItem = {
          id: `stack-${Date.now()}`,
          text: committedAction,
          selected: false,
          priority: 'none'
        };
        
        hotList.push(newItem);
        localStorage.setItem('door-hot-list', JSON.stringify(hotList));
        
        setActionAddedToHotList(true);
        
        toast({
          title: "Adăugat la lista fierbinte",
          description: "Acțiunea ta a fost adăugată cu succes la lista fierbinte.",
        });
        
        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      } catch (error) {
        console.error("Error adding to Hot List:", error);
        
        if (onAddToHitList) {
          onAddToHitList(committedAction);
        }
      }
    }
  };

  const resetStack = () => {
    setStep(0);
    setAnswers({});
    setCommittedAction("");
    setActionAddedToHotList(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {committedAction ? (
            <Card className="border-blue-500/30 bg-blue-950/10">
              <CardHeader>
                <CardTitle className="text-center text-blue-400">Acțiune Angajată</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-gray-300">{committedAction}</p>
                  {actionAddedToHotList && (
                    <div className="flex items-center text-green-400 text-sm mt-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Această acțiune a fost adăugată la lista ta fierbinte
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  className="hover:bg-blue-800 border-blue-500/30"
                  onClick={resetStack}
                >
                  Începe un nou stack
                </Button>
                {!actionAddedToHotList && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={addToHotList}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adaugă la lista fierbinte
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-blue-500/30 bg-blue-950/10">
              <CardHeader>
                <CardTitle className="text-center text-blue-400">
                  Power Stack - Pasul {step + 1} din {questions.length}
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
                  className="hover:bg-blue-800 border-blue-500/30"
                >
                  Înapoi
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {step < questions.length - 1 ? 'Continuă' : 'Finalizează'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <StackTodoWidget onAddToHitList={onAddToHitList} />
        </div>
      </div>
      
      {/* Modal pentru adăugarea ideilor - acum conectat corect */}
      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
