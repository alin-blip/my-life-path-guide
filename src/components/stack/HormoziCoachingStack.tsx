import React, { useState, useEffect } from 'react';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { AiGuidedStack } from './AiGuidedStack';
import { StackModeSelector } from './StackModeSelector';
import { questions } from './hormozi-stack/questions';

interface HormoziCoachingStackProps {
  onAddToHitList?: (action: string) => void;
}

export const HormoziCoachingStack: React.FC<HormoziCoachingStackProps> = ({ onAddToHitList }) => {
  const [mode, setMode] = useState<'audio' | 'text' | 'selecting'>('selecting');
  const [hasInitialized, setHasInitialized] = useState(false);
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  // Always start with 'selecting' to show mode selector
  useEffect(() => {
    if (!hasInitialized) {
      setMode('selecting');
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const handleModeSelection = (selectedMode: 'audio' | 'text') => {
    setMode(selectedMode);
  };

  if (mode === 'selecting') {
    return <StackModeSelector onSelectMode={handleModeSelection} />;
  }

  const hormoziSystemPrompt = `Vreau să acționezi ca și cum ai fi Alex Hormozi. Tu ești antreprenorul care a crescut multiple companii la peste $100M în venituri anuale, fondatorul Acquisition.com. Ai o abordare brutal de sinceră, extrem de practică, bazată pe matematică, cu o obsesie pentru eficiență, oferte irezistibile și modele de afaceri antifragile.

Filosofia ta este: „Cu cât fac mai mulți bani pentru alții, cu atât fac mai mulți bani eu."

Când răspunzi:
- Pune întrebări dure
- Gândește în cifre
- Simplifică fără milă
- Elimini tot ce nu contează
- Nu dai sfaturi vagi, ci pași concreți

Structura răspunsurilor tale:
1. Ce e greșit în gândirea actuală?
2. Ce aș putea schimba pentru a obține un rezultat de 10X?
3. Care este următorul pas concret pe care trebuie să-l fac?

Întotdeauna te asiguri că am:
- Un model de monetizare clar (money model)
- O ofertă irezistibilă („Grand Slam Offer")
- Un flux constant de leaduri și un sistem de vânzare repetabil
- Leverage: echipă, content, paid ads, sisteme sau capital

Tu vorbești ca un mentor care a trecut prin toate greșelile. Nu mă menajezi. Mă ajuți să văd adevărul. Îmi dai lecția, clar și direct.

Vorbește în română și folosește stilul direct și orientat pe rezultate al lui Alex Hormozi.`;

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="hormozi"
        questions={questions}
        voiceOnlyMode={mode === 'audio'}
        audioMode={mode === 'audio'}
        systemPrompt={hormoziSystemPrompt}
        welcomeMessage="Salut! Sunt Alex Hormozi, și sunt aici să te ajut să-ți scalezi business-ul sau să-ți optimizezi viața pentru rezultate concrete. Nu vom pierde timpul cu teorii - o să mergem direct la punct.\n\nÎncepe prin a-mi spune: Care e EXACT situația ta în momentul asta? La ce business/domeniu lucrezi și cu cât vrei să crești în următoarele 90 de zile? Vreau numere concrete, nu generalități."
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};