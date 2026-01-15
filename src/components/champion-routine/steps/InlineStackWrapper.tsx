import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { AiGuidedStack } from '@/components/stack/AiGuidedStack';
import { Emotion } from '@/components/emotional/EmotionPicker';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { toast } from 'sonner';

// Positive emotions list
const POSITIVE_EMOTIONS = [
  'happy', 'excited', 'calm', 'grateful', 'peaceful', 
  'loved', 'hopeful', 'inspired', 'confident', 'energetic'
];

// System prompts for different stack types
const getAdaptiveTransformPrompt = (emotion: string, intensity: number, isPositive: boolean) => {
  if (isPositive) {
    return `Ești un coach entuziasmant și înțelept care ajută utilizatorul să amplifice și să extindă starea pozitivă în toate ariile vieții.

EMOȚIA CURENTĂ: ${emotion} (intensitate: ${intensity}/10)
ACEASTA ESTE O STARE POZITIVĂ pe care vrem să o amplificăm și să o extindem.

OBIECTIV: Ghidează utilizatorul printr-o conversație scurtă (6-8 schimburi) care:

1. CELEBRARE (1 schimb)
   - Celebrează starea pozitivă: "Ce frumos să simți ${emotion}! Aceasta e o energie prețioasă."

2. ÎNȚELEGERE (1-2 schimburi)
   - "Ce te-a adus în această stare minunată?"
   - "Ce ai făcut bine pentru a te simți așa?"

3. EXPANSIUNE (4 schimburi - câte unul pentru fiecare arie)
   - "Cum poți aduce această energie de ${emotion} în CORPUL tău? (exerciții, respirație, postură, mișcare)"
   - "Cum în SPIRITUALITATE? (rugăciune, meditație, conectare cu ceva mai mare)"
   - "Cum în RELAȚII? (familie, prieteni, colegi - cum poți răspândi această energie?)"
   - "Cum în BUSINESS? (productivitate, creativitate, decizii importante)"

4. ACȚIUNE CONCRETĂ (1 schimb)
   - "Ce faci CONCRET astăzi pentru a manifesta și ancora această energie în viața ta?"
   - "Ce REZULTAT dorești să obții?"

REGULI IMPORTANTE:
- Răspunsuri SCURTE (2-3 propoziții maxim)
- O SINGURĂ întrebare la un moment dat
- Ton CALD, entuziast, încurajator
- Celebrează FIECARE insight
- La FINAL oferă un rezumat al acțiunilor și încheie cu "🎯 Acțiune pentru Hit List: [acțiunea principală]"
- Răspunde ÎNTOTDEAUNA în română`;
  }
  
  return `Ești un coach empatic și înțelept care ajută utilizatorul să proceseze și să transforme emoția curentă în energie constructivă.

EMOȚIA CURENTĂ: ${emotion} (intensitate: ${intensity}/10)
ACEASTA ESTE O STARE care poate fi TRANSFORMATĂ în putere și claritate.

OBIECTIV: Ghidează utilizatorul printr-o conversație scurtă (6-8 schimburi) care:

1. VALIDARE (1 schimb)
   - Validează emoția: "Înțeleg că te simți ${emotion}. E valid să simți asta."

2. ÎNȚELEGERE (1-2 schimburi)
   - "Ce te-a adus în această stare?"
   - "Ce s-a întâmplat care a declanșat această emoție?"

3. RECUNOAȘTERE (1 schimb)
   - "Ce lecție îți oferă această stare?"
   - "Ce încearcă să îți spună această emoție despre ce e important pentru tine?"

4. EXPANSIUNE/TRANSFORMARE (4 schimburi - câte unul pentru fiecare arie)
   - "Cum poți transforma această energie în CORP? (mișcare, respirație, eliberare fizică)"
   - "Cum în SPIRITUALITATE? (ce rugăciune sau meditație te-ar ajuta?)"
   - "Cum în RELAȚII? (ce conversație sau conexiune ar fi necesară?)"
   - "Cum în BUSINESS? (ce decizie sau acțiune ar aduce claritate?)"

5. ACȚIUNE CONCRETĂ (1 schimb)
   - "Ce faci CONCRET astăzi pentru a transforma această energie?"
   - "Ce REZULTAT dorești să obții?"

REGULI IMPORTANTE:
- Răspunsuri SCURTE (2-3 propoziții maxim)
- O SINGURĂ întrebare la un moment dat
- Ton EMPATIC dar PUTERNIC
- Validează fiecare răspuns
- La FINAL oferă un rezumat al acțiunilor și încheie cu "🎯 Acțiune pentru Hit List: [acțiunea principală]"
- Răspunde ÎNTOTDEAUNA în română`;
};

const getWelcomeMessage = (emotion: string, isPositive: boolean) => {
  if (isPositive) {
    return `✨ Ce minunat să te simți ${emotion}! Aceasta e o energie valoroasă pe care vrem să o amplificăm și să o extindem în toate ariile vieții tale.

Să începem! Ce te-a adus în această stare pozitivă?`;
  }
  
  return `🌊 Înțeleg că te simți ${emotion}. E valid să simți asta și sunt aici să te ajut să transformi această energie în putere și claritate.

Să începem! Ce te-a adus în această stare? Ce s-a întâmplat?`;
};

interface InlineStackWrapperProps {
  stackType: string;
  emotion: Emotion | null;
  intensity: number;
  onComplete: (summary?: string) => void;
  onBack: () => void;
  onAddToHitList?: (action: string) => void;
}

export const InlineStackWrapper: React.FC<InlineStackWrapperProps> = ({
  stackType,
  emotion,
  intensity,
  onComplete,
  onBack,
  onAddToHitList
}) => {
  const { theme } = useTheme();
  const [isCompleted, setIsCompleted] = useState(false);

  const isPositive = emotion && POSITIVE_EMOTIONS.includes(emotion);
  const emotionString = emotion || 'neutral';

  // Get system prompt based on stack type
  const getSystemPrompt = useCallback(() => {
    if (stackType === 'adaptive-transform') {
      return getAdaptiveTransformPrompt(emotionString, intensity, !!isPositive);
    }
    // For other stacks, return undefined to use their default prompts
    return undefined;
  }, [stackType, emotionString, intensity, isPositive]);

  // Get welcome message based on stack type
  const getStackWelcomeMessage = useCallback(() => {
    if (stackType === 'adaptive-transform') {
      return getWelcomeMessage(emotionString, !!isPositive);
    }
    return undefined;
  }, [stackType, emotionString, isPositive]);

  // Handle completion and save to library
  const handleStackComplete = useCallback(async () => {
    try {
      // Save to stack library
      await saveToStackLibrary(
        stackType as any,
        `${emotion || 'neutral'} - Rutina Dimineții`,
        {},
        []
      );
      
      // Update daily progress
      await updateDailyProgress('stack');
      
      toast.success('Stack salvat în bibliotecă!');
    } catch (error) {
      console.error('Error saving stack:', error);
    }
    
    setIsCompleted(true);
    onComplete();
  }, [stackType, emotion, onComplete]);

  // Determine the actual stack type to use
  const actualStackType = stackType === 'adaptive-transform' 
    ? 'ai-live' // Use ai-live as base for adaptive transform
    : stackType;

  const systemPromptOverride = getSystemPrompt();
  const welcomeMessage = getStackWelcomeMessage();

  return (
    <div className="space-y-4">
      {/* Header with back button */}
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
          <Sparkles className={cn(
            "w-5 h-5",
            theme === 'dark' ? 'text-primary' : 'text-primary'
          )} />
          <span className={cn(
            "text-sm font-medium",
            theme === 'dark' ? 'text-white/80' : 'text-foreground'
          )}>
            {stackType === 'adaptive-transform' 
              ? (isPositive ? 'Stack de Expansiune' : 'Stack de Transformare')
              : stackType === 'divine-prayer' 
                ? 'Mindset Coach'
                : stackType === 'divine-gratitude'
                  ? 'Divine Gratitude'
                  : 'Stack Session'
            }
          </span>
        </div>
      </div>

      {/* Stack content */}
      <Card className={cn(
        "overflow-hidden border-2",
        theme === 'dark' 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/90 border-border'
      )}>
        <div className="max-h-[65vh] overflow-y-auto">
          <AiGuidedStack
            stackType={actualStackType as any}
            questions={[]}
            onAddToHitList={onAddToHitList}
            systemPromptOverride={systemPromptOverride}
            welcomeMessage={welcomeMessage}
            forceNewSession={true}
          />
        </div>
      </Card>

      {/* Complete button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleStackComplete}
          className="gap-2"
          disabled={isCompleted}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4" />
              Completat
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Finalizează și Continuă
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
