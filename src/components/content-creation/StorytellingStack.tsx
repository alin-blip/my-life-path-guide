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
  BookOpen
} from 'lucide-react';
import { useStorytellingStack, ContentType } from './useStorytellingStack';
import { getStorytellingLabels } from './storytellingQuestions';
import { cn } from '@/lib/utils';

interface StorytellingStackProps {
  language?: 'en' | 'ro';
  onComplete?: (script: string) => void;
  onBack?: () => void;
}

export function StorytellingStack({ 
  language = 'ro', 
  onComplete,
  onBack 
}: StorytellingStackProps) {
  const labels = getStorytellingLabels(language);
  const [isEditing, setIsEditing] = useState(false);
  const [localScript, setLocalScript] = useState('');
  
  const stack = useStorytellingStack({
    language,
    onScriptGenerated: (script) => setLocalScript(script)
  });

  const handleConfirmScript = () => {
    onComplete?.(localScript || stack.generatedScript);
  };

  const progressPercent = (stack.currentStep / stack.totalSteps) * 100;

  // Script review phase
  if (stack.generatedScript) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            Script Generat
          </h2>
          <p className="text-muted-foreground text-sm">
            Revizuiește și editează scriptul bazat pe storytelling
          </p>
        </div>

        {isEditing ? (
          <Textarea
            value={localScript}
            onChange={(e) => setLocalScript(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        ) : (
          <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-sans">{localScript || stack.generatedScript}</pre>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {isEditing ? labels.viewScript : labels.editScript}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // Re-generate from same answers instead of clearing everything
              stack.generateScript();
            }}
            disabled={stack.isGenerating}
          >
            {stack.isGenerating ? '⏳ Regenerez...' : labels.regenerate}
          </Button>
          <Button 
            onClick={handleConfirmScript}
            className="flex-1 gap-2"
          >
            <Check className="h-4 w-4" />
            {labels.confirmScript}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-2">
          <BookOpen className="h-8 w-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold">{labels.title}</h2>
        <p className="text-muted-foreground text-sm">{labels.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{labels.stepOf.replace('{current}', String(stack.currentStep)).replace('{total}', String(stack.totalSteps))}</span>
          <span>{stack.currentQuestion.element}</span>
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
                  "w-8 h-8 rounded-full text-sm font-medium transition-all",
                  "flex items-center justify-center",
                  isActive && "bg-purple-500 text-white scale-110",
                  !isActive && isCompleted && "bg-purple-500/30 text-purple-200",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {q.emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Type Selector (only on first step) */}
      {stack.currentStep === 1 && (
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'reel' as ContentType, label: labels.reel, emoji: '📱' },
            { value: 'video' as ContentType, label: labels.video, emoji: '🎬' },
            { value: 'post' as ContentType, label: labels.post, emoji: '📝' },
          ]).map((type) => (
            <Button
              key={type.value}
              variant={stack.contentType === type.value ? "default" : "outline"}
              onClick={() => stack.setContentType(type.value)}
              className="flex-col h-auto py-3 text-xs"
              size="sm"
            >
              <span className="text-lg mb-1">{type.emoji}</span>
              <span>{type.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Current Question */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stack.currentQuestion.emoji}</span>
            <h3 className="text-lg font-semibold">{stack.currentQuestion.element}</h3>
          </div>
          <p className="text-foreground font-medium">{stack.currentQuestion.question}</p>
        </div>

        <Textarea
          value={stack.currentAnswer}
          onChange={(e) => stack.setAnswer(stack.currentStep, e.target.value)}
          placeholder={stack.currentQuestion.placeholder}
          className="min-h-[120px] resize-none"
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
            className="flex-1 gap-2"
          >
            {labels.next}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={stack.generateScript}
            disabled={!stack.allAnswered || stack.isGenerating}
            className="flex-1 gap-2"
          >
            {stack.isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {labels.generating}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {labels.generateScript}
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
                    <span>{q.element}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{q.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
