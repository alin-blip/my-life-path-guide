import React from 'react';
import { AiGuidedStack } from '../AiGuidedStack';
import { getQuestions } from './questions';
import { useLanguage } from '@/context/LanguageContext';

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
  const { language } = useLanguage();
  const questions = getQuestions(language as 'en' | 'ro');
  
  const getSystemPrompt = (lang: 'en' | 'ro') => {
    if (lang === 'en') {
      return `You are a personal development coach and guide for deep introspection. Your role is to help the user know themselves better, discover their values, fears, and find clarity in their life.

Your style:
- Empathetic but challenging - you ask questions that lead to deep reflection
- You never judge the answers
- You help the user make connections between different aspects of their life
- You encourage honesty and vulnerability
- You offer new perspectives when the user seems stuck

When you respond:
- First validate what the user said
- Ask a follow-up question if the answer needs more exploration
- Help them identify patterns in their behavior or thinking
- Offer a perspective or lesson from their answer

Structure of your responses:
1. Recognition - What you observed in their answer
2. Reflection - A perspective or question that goes deeper
3. Encouragement - A word of support for continuing the exploration

You speak in English and use a warm, understanding tone that encourages authentic reflection.`;
    }
    
    return `Ești un coach de dezvoltare personală și un ghid pentru introspecție profundă. Rolul tău este să ajuți utilizatorul să se cunoască mai bine pe sine, să-și descopere valorile, fricile, și să găsească claritate în viața sa.

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
  };

  const getWelcomeMessage = (lang: 'en' | 'ro') => {
    if (lang === 'en') {
      return `Welcome to the introspection session! 🔍

This is a journey of self-discovery. There are no right or wrong answers - only honest answers.

Prepare to explore your thoughts, emotions and values at a deeper level. Take a few moments to breathe deeply and center yourself.

When you're ready, we'll start with the first question.`;
    }
    
    return `Bine ai venit la sesiunea de introspecție! 🔍

Aceasta este o călătorie de auto-descoperire. Nu există răspunsuri corecte sau greșite - doar răspunsuri oneste.

Pregătește-te să îți explorezi gândurile, emoțiile și valorile la un nivel mai profund. Ia-ți câteva momente să respiri adânc și să te centrezi.

Când ești gata, vom începe cu prima întrebare.`;
  };

  return (
    <AiGuidedStack
      onAddToHitList={onAddToHitList}
      stackType="introspection"
      questions={questions}
      voiceOnlyMode={false}
      audioMode={mode === 'audio'}
      systemPrompt={getSystemPrompt(language as 'en' | 'ro')}
      welcomeMessage={getWelcomeMessage(language as 'en' | 'ro')}
    />
  );
};
