import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Zap, MessageCircle } from 'lucide-react';
import { AiGuidedStack } from '@/components/stack/AiGuidedStack';
import { Emotion, getEmotionInfo } from '@/components/emotional/EmotionPicker';
import { EMOTIONAL_TRANSFORM_QUESTIONS } from '@/components/stack/emotional-transform/questions';

interface EmotionalTransformStepProps {
  emotion: Emotion;
  intensity: number;
  onComplete: (transformedEnergy: string) => void;
  onSkip: () => void;
}

export function EmotionalTransformStep({
  emotion,
  intensity,
  onComplete,
  onSkip
}: EmotionalTransformStepProps) {
  const [showStack, setShowStack] = useState(false);
  const [transformedEnergy, setTransformedEnergy] = useState('');
  
  const emotionInfo = getEmotionInfo(emotion);

  const getSystemPrompt = () => {
    return `Ești un coach empatic și puternic care ghidează utilizatorul prin transformarea emoțiilor negative în energie și claritate.

CONTEXTUL ACTUAL:
- Utilizatorul se simte: ${emotionInfo?.labelRo || emotion} ${emotionInfo?.emoji || ''}
- Intensitatea: ${intensity}/10

STILUL TĂU:
- Validezi ÎNTÂI emoția ("Înțeleg perfect ce simți... ${emotionInfo?.labelRo} la intensitate ${intensity} este real și valid")
- Nu judeci niciodată
- Ajuți să identifice FAPTELE vs POVEȘTILE pe care și le spune
- Ghidezi spre ce POATE controla
- Transformi "problema" în "oportunitate de creștere"
- La final, ajuți să aleagă o STARE de putere pentru zi

STRUCTURA CONVERSAȚIEI:
1. VALIDARE - Recunoaște ce simte și oferă empatie (1-2 schimburi)
2. INVESTIGARE - "Ce s-a întâmplat?" "Care e povestea din spatele emoției?" (2-3 schimburi)
3. CLARIFICARE - "E această poveste 100% adevărată?" "Ce îți dorești de fapt?" (2-3 schimburi)  
4. TRANSFORMARE - "Ce poți controla?" "Ce lecție primești din asta?" (2-3 schimburi)
5. ACȚIUNE - "Cu ce energie vrei să începi ziua?" "Ce acțiune concretă faci azi?" (1-2 schimburi)

REGULI IMPORTANTE:
- Răspunsuri SCURTE și la obiect (2-4 propoziții)
- Pune O SINGURĂ întrebare la un moment dat
- Celebrează fiecare progres făcut
- Folosește emoji-uri moderat pentru a crea căldură
- Când utilizatorul a găsit claritatea, întreabă: "Cu ce energie vrei să începi această zi?"
- La final, rezumă transformarea și felicită-l

EXEMPLU DE START:
"${emotionInfo?.emoji || '💭'} ${emotionInfo?.labelRo || emotion} la ${intensity}/10... Înțeleg, și apreciez că ești onest cu tine însuți chiar de dimineață. 

Spune-mi, ce s-a întâmplat care te face să te simți așa?"

Răspunde ÎNTOTDEAUNA în română.`;
  };

  const getWelcomeMessage = () => {
    return `${emotionInfo?.emoji || '💭'} Simt că te simți ${emotionInfo?.labelRo?.toLowerCase() || emotion} în această dimineață, la intensitate ${intensity}/10. Apreciez curajul tău de a fi onest cu tine însuți.

Hai să transformăm această energie împreună. Spune-mi, ce s-a întâmplat care te face să te simți așa?`;
  };

  if (showStack) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStack(false)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
          >
            Treci peste
          </Button>
        </div>
        
        <AiGuidedStack
          stackType="ai-live"
          questions={EMOTIONAL_TRANSFORM_QUESTIONS}
          systemPromptOverride={getSystemPrompt()}
          welcomeMessage={getWelcomeMessage()}
          forceNewSession={true}
          onAddToHitList={(action) => {
            setTransformedEnergy(action);
            onComplete(action);
          }}
        />
      </div>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-6 w-6 text-amber-500" />
          Transformare Emoțională
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Transformă starea de {emotionInfo?.labelRo?.toLowerCase() || emotion} în putere și claritate
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{emotionInfo?.emoji || '💭'}</span>
            <div>
              <p className="font-medium">{emotionInfo?.labelRo || emotion}</p>
              <p className="text-sm text-muted-foreground">Intensitate: {intensity}/10</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Nu există emoții "rele" - fiecare emoție poartă un mesaj și o energie pe care o putem transforma în putere.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Ce vom face:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Vom înțelege ce a declanșat această stare
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Vom separa faptele de poveștile pe care ni le spunem
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Vom găsi lecția și oportunitatea
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Vei alege energia cu care începi ziua
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Treci peste
          </Button>
          <Button
            onClick={() => setShowStack(true)}
            className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <MessageCircle className="h-4 w-4" />
            Începe Conversația
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
