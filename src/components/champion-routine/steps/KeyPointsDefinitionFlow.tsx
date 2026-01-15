import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { getWeekKey } from '@/utils/weekUtils';
import { toast } from 'sonner';
import { PlanningResult } from '@/types/door';

interface KeyPointsDefinitionFlowProps {
  dominoTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

const KEY_POINT_QUESTIONS = [
  {
    label: 'Prima Cheie',
    prompt: 'Ce acțiune concretă și măsurabilă duce cel mai direct spre obiectiv?',
    icon: '🔑'
  },
  {
    label: 'A Doua Cheie', 
    prompt: 'Ce altă acțiune importantă trebuie făcută pentru succes?',
    icon: '🗝️'
  },
  {
    label: 'A Treia Cheie',
    prompt: 'Ce ar putea debloca sau accelera celelalte acțiuni?',
    icon: '🔐'
  },
  {
    label: 'A Patra Cheie',
    prompt: 'Ce acțiune finală ar confirma că ai reușit?',
    icon: '✨'
  }
];

export const KeyPointsDefinitionFlow: React.FC<KeyPointsDefinitionFlowProps> = ({
  dominoTitle,
  onComplete,
  onBack
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [keyPoints, setKeyPoints] = useState<string[]>(['', '', '', '']);
  const [isSaving, setIsSaving] = useState(false);

  const handleKeyPointChange = (value: string) => {
    const updated = [...keyPoints];
    updated[currentIndex] = value;
    setKeyPoints(updated);
  };

  const handleNext = () => {
    if (currentIndex < 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = async () => {
    // Validate all key points are filled
    const filledPoints = keyPoints.filter(kp => kp.trim().length > 0);
    if (filledPoints.length < 4) {
      toast.error('Te rog completează toate cele 4 chei');
      return;
    }

    setIsSaving(true);
    
    try {
      const weekKey = getWeekKey();
      
      const formattedKeyPoints: PlanningResult['keyPoints'] = keyPoints.map((kp, index) => ({
        id: index + 1,
        title: kp.trim(),
        objective: '',
        why: '',
        positiveImpact: '',
        negativeImpact: '',
        steps: [],
        responsible: '',
        deadline: '',
        completed: false
      }));

      await weeklyPlanningService.savePlan({
        weekKey,
        dominoTitle,
        weekGoal: dominoTitle,
        keyPoints: formattedKeyPoints
      });

      // Emit event to sync /door immediately
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'weekly-plan', weekKey } }));

      toast.success('Domino Door setat cu cele 4 chei! 🎯');
      onComplete();
    } catch (error) {
      console.error('Error saving Domino Door:', error);
      toast.error('Nu am putut salva. Încearcă din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentQuestion = KEY_POINT_QUESTIONS[currentIndex];
  const isLastStep = currentIndex === 3;
  const canProceed = keyPoints[currentIndex].trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className={cn(
            "gap-1",
            theme === 'dark' ? 'text-white/70 hover:text-white' : ''
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </Button>
        
        <div className="flex items-center gap-2">
          <Target className={cn(
            "w-5 h-5",
            theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
          )} />
          <span className={cn(
            "text-sm font-medium",
            theme === 'dark' ? 'text-white/80' : 'text-foreground'
          )}>
            Definește 4 Chei Măsurabile
          </span>
        </div>
      </div>

      {/* Domino Title Display */}
      <Card className={cn(
        "p-4 border-2",
        theme === 'dark' 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : 'bg-amber-50 border-amber-200'
      )}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Domino Door pentru săptămâna asta:</p>
            <p className="font-semibold">{dominoTitle}</p>
          </div>
        </div>
      </Card>

      {/* Progress indicator */}
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              idx === currentIndex 
                ? 'bg-primary scale-125' 
                : idx < currentIndex 
                  ? 'bg-primary/60' 
                  : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Current Key Point Input */}
      <Card className={cn(
        "p-6 border-2",
        theme === 'dark' 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/90 border-border'
      )}>
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-3xl mb-2 block">{currentQuestion.icon}</span>
            <h3 className={cn(
              "text-lg font-semibold",
              theme === 'dark' ? 'text-white' : ''
            )}>
              {currentQuestion.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {currentQuestion.prompt}
            </p>
          </div>

          <Input
            value={keyPoints[currentIndex]}
            onChange={(e) => handleKeyPointChange(e.target.value)}
            placeholder="Scrie acțiunea concretă..."
            className={cn(
              "text-center text-lg py-6",
              theme === 'dark' ? 'bg-black/30 border-white/20' : ''
            )}
            autoFocus
          />

          {/* Previous key points summary */}
          {currentIndex > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Cheile definite:</p>
              <div className="space-y-1">
                {keyPoints.slice(0, currentIndex).map((kp, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-muted-foreground truncate">{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSave}
            disabled={!canProceed || isSaving}
            className="gap-2 flex-1"
          >
            {isSaving ? (
              'Se salvează...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Salvează Domino Door
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-1 flex-1"
          >
            Următoarea Cheie
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
