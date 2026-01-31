import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Check,
  Route,
  Mountain
} from 'lucide-react';
import { usePathToSuccessStack } from './usePathToSuccessStack';
import { getPathToSuccessLabels } from './pathToSuccessQuestions';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface PathToSuccessStackProps {
  onComplete?: (plan: string) => void;
  onBack?: () => void;
  onAddToHitList?: (action: string) => void;
}

export function PathToSuccessStack({ 
  onComplete,
  onBack,
  onAddToHitList
}: PathToSuccessStackProps) {
  const { language } = useLanguage();
  const labels = getPathToSuccessLabels(language as 'en' | 'ro');
  const [isEditing, setIsEditing] = useState(false);
  const [localPlan, setLocalPlan] = useState('');
  
  const stack = usePathToSuccessStack({
    language: language as 'en' | 'ro',
    onPlanGenerated: (plan) => setLocalPlan(plan)
  });

  const handleConfirmPlan = () => {
    const finalPlan = localPlan || stack.generatedPlan;
    onComplete?.(finalPlan);
    
    // Extract first actionable item from Step 3 (M.A.P.) for Hit List
    if (onAddToHitList && stack.answers[3]) {
      const firstAction = stack.answers[3].split('\n')[0].trim();
      if (firstAction) {
        onAddToHitList(firstAction);
      }
    }
  };

  const progressPercent = (stack.currentStep / stack.totalSteps) * 100;

  // Plan review phase
  if (stack.generatedPlan) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6 space-y-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-2">
            <Mountain className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">{labels.planTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {language === 'en' 
              ? 'Your personalized transformation roadmap' 
              : 'Harta ta personalizată de transformare'}
          </p>
        </div>

        {isEditing ? (
          <Textarea
            value={localPlan}
            onChange={(e) => setLocalPlan(e.target.value)}
            className="min-h-[450px] font-mono text-sm"
          />
        ) : (
          <div className="bg-muted/30 rounded-lg p-4 max-h-[450px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{localPlan || stack.generatedPlan}</pre>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? labels.viewPlan : labels.editPlan}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              stack.setGeneratedPlan('');
              setLocalPlan('');
            }}
          >
            {labels.regenerate}
          </Button>
          <Button 
            onClick={handleConfirmPlan}
            className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Check className="h-4 w-4" />
            {labels.confirmPlan}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto p-6 space-y-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-2">
          <Route className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold">{labels.title}</h2>
        <p className="text-muted-foreground text-sm">{labels.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{labels.stepOf.replace('{current}', String(stack.currentStep)).replace('{total}', String(stack.totalSteps))}</span>
          <span>{stack.currentQuestion.title}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        
        {/* Step indicators */}
        <div className="flex justify-between px-1 mt-3">
          {stack.questions.map((q, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === stack.currentStep;
            const isCompleted = stack.answers[stepNum]?.trim();
            
            return (
              <button
                key={stepNum}
                onClick={() => stack.goToStep(stepNum)}
                className={cn(
                  "w-10 h-10 rounded-full text-lg transition-all",
                  "flex items-center justify-center",
                  isActive && "bg-amber-500 text-white scale-110 shadow-lg",
                  !isActive && isCompleted && "bg-amber-500/30 text-amber-200",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
                title={q.title}
              >
                {q.emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stack.currentQuestion.emoji}</span>
            <div>
              <h3 className="text-xl font-bold">{stack.currentQuestion.title}</h3>
              <p className="text-sm text-muted-foreground">{stack.currentQuestion.titleEn}</p>
            </div>
          </div>
          <p className="text-foreground font-medium mt-3">{stack.currentQuestion.question}</p>
          
          {/* Sub-questions */}
          {stack.currentQuestion.subQuestions && (
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 mt-2">
              {stack.currentQuestion.subQuestions.map((sq, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{sq}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Textarea
          value={stack.currentAnswer}
          onChange={(e) => stack.setAnswer(stack.currentStep, e.target.value)}
          placeholder={stack.currentQuestion.placeholder}
          className="min-h-[150px] resize-none"
        />

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          💡 {stack.currentQuestion.hint}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!stack.isFirstStep ? (
          <Button variant="outline" onClick={stack.goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Button>
        ) : onBack ? (
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Button>
        ) : null}

        {!stack.isLastStep ? (
          <Button 
            onClick={stack.goNext} 
            disabled={!stack.currentAnswer.trim()}
            className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
          >
            {labels.next}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={stack.generatePlan}
            disabled={!stack.allAnswered || stack.isGenerating}
            className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
          >
            {stack.isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {labels.generating}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {labels.generatePlan}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Previous Answers Accordion */}
      {stack.currentStep > 1 && (
        <div className="border-t pt-4">
          <button
            onClick={() => stack.setShowPreviousAnswers(!stack.showPreviousAnswers)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {stack.showPreviousAnswers ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {stack.showPreviousAnswers ? labels.hideAnswers : labels.showAnswers}
          </button>
          
          {stack.showPreviousAnswers && (
            <div className="mt-3 space-y-2">
              {stack.getAnsweredQuestions().slice(0, stack.currentStep - 1).map((q) => (
                <div 
                  key={q.step}
                  className="p-3 rounded-lg bg-muted/30 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <span>{q.emoji}</span>
                    <span>{q.title}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-3">{q.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
