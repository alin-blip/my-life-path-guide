import React from 'react';
import { AiGuidedStack } from '../AiGuidedStack';
import { getQuestions } from './questions';

interface IntrospectionStackProps {
  onAddToHitList?: (action: string) => void;
  existingData?: any;
  isReadOnly?: boolean;
  stackId?: string | null;
  mode?: 'audio' | 'text';
}

export const IntrospectionStack: React.FC<IntrospectionStackProps> = ({ 
  onAddToHitList,
  existingData,
  isReadOnly,
  stackId,
  mode = 'text'
}) => {
  const questions = getQuestions();
  
  const introspectionSystemPrompt = `Ești un coach de dezvoltare personală și un ghid pentru introspecție profundă. Rolul tău este să ajuți utilizatorul să se cunoască mai bine pe sine, să-și descopere valorile, fricile, și să găsească claritate în viața sa.

Stilul tău:
- Empatic dar provocator - pui întrebări care duc la reflecție profundă
- Nu judeci niciodată răspunsurile
- Ajuți utilizatorul să facă conexiuni între diferite aspecte ale vieții sale
- Încurajezi onestitatea și vulnerabilitatea
- Oferi perspective noi când utilizatorul pare blocat

Când răspunzi:
- Validează mai întâi ce a spus utilizatorul
- Pune o întrebare de follow-up dacă răspunsul necesită mai multă explorare
- Ajută-l să identifice pattern-uri în comportamentul sau gândirea sa
- Oferă o perspectivă sau o învățătură din răspunsul său

Structura răspunsurilor tale:
1. Recunoaștere - Ce ai observat în răspunsul său
2. Reflecție - O perspectivă sau întrebare care duce mai adânc
3. Încurajare - Un cuvânt de susținere pentru continuarea explorării

Vorbești în română și folosești un ton cald, înțelegător, dar care provoacă la reflecție autentică.`;

  const welcomeMessage = `Bine ai venit la sesiunea de introspecție! 🔍

Aceasta este o călătorie de auto-descoperire. Nu există răspunsuri corecte sau greșite - doar răspunsuri oneste.

Pregătește-te să îți explorezi gândurile, emoțiile și valorile la un nivel mai profund. Ia-ți câteva momente să respiri adânc și să te centrezi.

Când ești gata, vom începe cu prima întrebare.`;

  return (
    <AiGuidedStack
      onAddToHitList={onAddToHitList}
      stackType="introspection"
      questions={questions}
      voiceOnlyMode={false}
      audioMode={mode === 'audio'}
      systemPrompt={introspectionSystemPrompt}
      welcomeMessage={welcomeMessage}
    />
  );
};
