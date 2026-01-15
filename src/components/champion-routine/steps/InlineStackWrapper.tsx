import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Sparkles, ListTodo, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { AiGuidedStack } from '@/components/stack/AiGuidedStack';
import { Emotion } from '@/components/emotional/EmotionPicker';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { toast } from 'sonner';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getWeekKey } from '@/utils/weekUtils';
import { v4 as uuidv4 } from 'uuid';
import { KeyPointsDefinitionFlow } from './KeyPointsDefinitionFlow';

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

// Extract action from AI response
const extractActionFromResponse = (text: string): string | null => {
  // Look for pattern: 🎯 Acțiune pentru Hit List: [action]
  const pattern = /🎯\s*Acțiune pentru Hit List:\s*(.+?)(?:\n|$)/i;
  const match = text.match(pattern);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback: look for any action-like statement
  const fallbackPattern = /acțiune[:\s]+(.+?)(?:\.|!|\n|$)/i;
  const fallbackMatch = text.match(fallbackPattern);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1].trim();
  }
  
  return null;
};

type FlowState = 'stack' | 'export-options' | 'key-points';

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
  const [flowState, setFlowState] = useState<FlowState>('stack');
  const [extractedAction, setExtractedAction] = useState<string | null>(null);
  const [isAddingToHitList, setIsAddingToHitList] = useState(false);

  const isPositive = emotion && POSITIVE_EMOTIONS.includes(emotion);
  const emotionString = emotion || 'neutral';

  // Get system prompt based on stack type
  const getSystemPrompt = useCallback(() => {
    if (stackType === 'adaptive-transform') {
      return getAdaptiveTransformPrompt(emotionString, intensity, !!isPositive);
    }
    return undefined;
  }, [stackType, emotionString, intensity, isPositive]);

  // Get welcome message based on stack type
  const getStackWelcomeMessage = useCallback(() => {
    if (stackType === 'adaptive-transform') {
      return getWelcomeMessage(emotionString, !!isPositive);
    }
    return undefined;
  }, [stackType, emotionString, isPositive]);

  // Handle stack completion - show export options
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
    
    // Show export options instead of completing immediately
    setFlowState('export-options');
  }, [stackType, emotion]);

  // Handle adding to Hit List
  const handleAddToHitList = async () => {
    if (!extractedAction) {
      toast.error('Nu am găsit o acțiune de adăugat');
      return;
    }

    setIsAddingToHitList(true);
    try {
      const weekKey = getWeekKey();
      
      await doorUserTasksService.addIdeaToWeek(weekKey, {
        id: uuidv4(),
        text: extractedAction,
        category: 'hit',
        priority: 'urgent-important'
      });

      toast.success('Acțiune adăugată la Sarcini! ✅');
      onComplete(extractedAction);
    } catch (error) {
      console.error('Error adding to Hit List:', error);
      toast.error('Nu am putut adăuga acțiunea');
    } finally {
      setIsAddingToHitList(false);
    }
  };

  // Handle continue without adding
  const handleContinueWithoutAdding = () => {
    onComplete();
  };

  // Handle key points flow completion
  const handleKeyPointsComplete = () => {
    onComplete(extractedAction || undefined);
  };

  // Capture action from AI response when it's mentioned
  const handleActionExtracted = useCallback((action: string) => {
    if (action && !extractedAction) {
      setExtractedAction(action);
    }
  }, [extractedAction]);

  // Determine the actual stack type to use
  const actualStackType = stackType === 'adaptive-transform' 
    ? 'ai-live'
    : stackType;

  const systemPromptOverride = getSystemPrompt();
  const welcomeMessage = getStackWelcomeMessage();

  // Export Options Screen
  if (flowState === 'export-options') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFlowState('stack')}
            className={cn(
              "gap-1",
              theme === 'dark' ? 'text-white/70 hover:text-white' : ''
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la Stack
          </Button>
        </div>

        <Card className={cn(
          "p-6 border-2 text-center",
          theme === 'dark' 
            ? 'bg-black/40 border-white/10' 
            : 'bg-white/90 border-border'
        )}>
          <div className="space-y-6">
            {/* Success header */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
            </div>
            
            <div>
              <h3 className={cn(
                "text-xl font-semibold mb-1",
                theme === 'dark' ? 'text-white' : ''
              )}>
                Stack Completat! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                Ce vrei să faci cu această energie?
              </p>
            </div>

            {/* Extracted action display */}
            {extractedAction && (
              <div className={cn(
                "p-4 rounded-lg border",
                theme === 'dark' 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-primary/5 border-primary/20'
              )}>
                <p className="text-xs text-muted-foreground mb-1">Acțiune identificată:</p>
                <p className={cn(
                  "font-medium",
                  theme === 'dark' ? 'text-white' : ''
                )}>
                  "{extractedAction}"
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddToHitList}
                variant="outline"
                className="gap-2 w-full justify-center py-6"
                disabled={!extractedAction || isAddingToHitList}
              >
                <ListTodo className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Adaugă la Sarcini</div>
                  <div className="text-xs text-muted-foreground">Salvează în Hit List pentru azi</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => setFlowState('key-points')}
                className="gap-2 w-full justify-center py-6"
              >
                <Target className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Setează ca Domino Door</div>
                  <div className="text-xs opacity-80">+ Definește 4 Chei Măsurabile</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>

            {/* Skip button */}
            <Button 
              variant="ghost" 
              onClick={handleContinueWithoutAdding}
              className="text-muted-foreground w-full"
            >
              Continuă fără să adaugi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Key Points Definition Flow
  if (flowState === 'key-points') {
    return (
      <KeyPointsDefinitionFlow
        dominoTitle={extractedAction || `Obiectiv din ${emotion || 'stack'}`}
        onComplete={handleKeyPointsComplete}
        onBack={() => setFlowState('export-options')}
      />
    );
  }

  // Main Stack View
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
            onAddToHitList={(action) => {
              handleActionExtracted(action);
              onAddToHitList?.(action);
            }}
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
        >
          <Check className="w-4 h-4" />
          Finalizează Stack
        </Button>
      </div>
    </div>
  );
};
