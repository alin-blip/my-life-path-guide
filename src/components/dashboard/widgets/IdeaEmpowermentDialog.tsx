import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Zap, Sparkles, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmpowermentData {
  whyWant: string;
  whyExactly: string;
  essence: string;
  positiveImpact: string;
  feelingAchieved: string;
  negativeImpact: string;
  obstacles: string;
  howOvercome: string;
  otherObstacles: string;
  whoInvolved: string;
}

interface IdeaEmpowermentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  ideaText: string;
  onComplete: (isMassive: boolean) => void;
}

const steps = [
  { 
    key: 'whyWant', 
    question: 'De ce vrei să faci asta?',
    placeholder: 'Descrie motivația ta principală...',
    icon: '🎯'
  },
  { 
    key: 'whyExactly', 
    question: 'Dar de ce mai exact? Care este esența dorinței de a face asta?',
    placeholder: 'Gândește-te mai profund la motivația reală...',
    icon: '💡'
  },
  { 
    key: 'positiveImpact', 
    question: 'Care este impactul POZITIV dacă realizezi asta?',
    placeholder: 'Ce beneficii vei avea? Ce se va îmbunătăți?',
    icon: '✨'
  },
  { 
    key: 'feelingAchieved', 
    question: 'Cum te-ai simți dacă ai realiza asta?',
    placeholder: 'Descrie emoțiile și starea ta...',
    icon: '🌟'
  },
  { 
    key: 'negativeImpact', 
    question: 'Care este impactul NEGATIV dacă NU faci asta?',
    placeholder: 'Ce pierzi dacă nu acționezi? Ce consecințe ar fi?',
    icon: '⚠️'
  },
  { 
    key: 'obstacles', 
    question: 'Ce poate fi în calea realizării? Cum treci peste?',
    placeholder: 'Identifică obstacolele și soluțiile...',
    icon: '🚧'
  },
  { 
    key: 'whoInvolved', 
    question: 'Cine mai este implicat?',
    placeholder: 'Persoane care te pot ajuta sau sunt afectate...',
    icon: '👥'
  }
];

export const IdeaEmpowermentDialog: React.FC<IdeaEmpowermentDialogProps> = ({
  isOpen,
  onClose,
  taskId,
  ideaText,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<EmpowermentData>({
    whyWant: '',
    whyExactly: '',
    essence: '',
    positiveImpact: '',
    feelingAchieved: '',
    negativeImpact: '',
    obstacles: '',
    howOvercome: '',
    otherObstacles: '',
    whoInvolved: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleInputChange = (value: string) => {
    setData(prev => ({
      ...prev,
      [currentStepData.key]: value
    }));
  };

  const saveEmpowerment = async (isMassive: boolean) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('idea_empowerment').insert({
        task_id: taskId,
        user_id: user.id,
        why_want: data.whyWant,
        why_exactly: data.whyExactly,
        essence: data.essence,
        positive_impact: data.positiveImpact,
        feeling_achieved: data.feelingAchieved,
        negative_impact: data.negativeImpact,
        obstacles: data.obstacles,
        how_overcome: data.howOvercome,
        other_obstacles: data.otherObstacles,
        who_involved: data.whoInvolved,
        is_massive: isMassive
      });

      if (error) throw error;

      toast({
        title: isMassive ? 'Obiectiv Masiv Creat!' : 'Idee Împuternicită!',
        description: isMassive 
          ? 'Ideea ta a fost transformată într-un obiectiv masiv.' 
          : 'Clarificările au fost salvate cu succes.',
      });

      onComplete(isMassive);
      handleClose();
    } catch (error) {
      console.error('Error saving empowerment:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut salva datele.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setData({
      whyWant: '',
      whyExactly: '',
      essence: '',
      positiveImpact: '',
      feelingAchieved: '',
      negativeImpact: '',
      obstacles: '',
      howOvercome: '',
      otherObstacles: '',
      whoInvolved: ''
    });
    onClose();
  };

  const currentValue = data[currentStepData.key as keyof EmpowermentData] || '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Împuternicește Ideea
          </DialogTitle>
        </DialogHeader>

        {/* Idea Title */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Ideea ta:</p>
          <p className="font-medium">{ideaText}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pas {currentStep + 1} din {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{currentStepData.icon}</span>
            <h3 className="text-base font-medium leading-relaxed">
              {currentStepData.question}
            </h3>
          </div>
          
          <Textarea
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentStepData.placeholder}
            className="min-h-[120px] resize-none"
            autoFocus
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Înapoi
          </Button>

          {!isLastStep ? (
            <Button onClick={handleNext} className="gap-1">
              Continuă
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => saveEmpowerment(false)}
                disabled={isSaving}
                className="gap-1"
              >
                <Sparkles className="h-4 w-4" />
                Salvează ca Idee
              </Button>
              <Button
                onClick={() => saveEmpowerment(true)}
                disabled={isSaving}
                className="gap-1 bg-primary"
              >
                <Target className="h-4 w-4" />
                Obiectiv Masiv
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
