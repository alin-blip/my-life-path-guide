import React, { useState, useEffect } from 'react';
import { GodsSchoolStackProps } from './types';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { StackIdeaModal } from '../StackIdeaModal';
import { AiGuidedStack } from '../AiGuidedStack';
import { StackModeSelector } from '../StackModeSelector';
import { getGodsSchoolQuestions } from './questions';
import { useLanguage } from '@/context/LanguageContext';

export const GodsSchoolStack: React.FC<GodsSchoolStackProps> = ({ onAddToHitList }) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const { language } = useLanguage();
  const questions = getGodsSchoolQuestions(language as 'en' | 'ro');

  const getSystemPrompt = (lang: 'en' | 'ro') => {
    if (lang === 'en') {
      return `You are a divine spiritual sage who guides people based on the sacred book they have uploaded to the divine library. Your role is to:

- Use exclusively the wisdom and principles from the uploaded book to answer questions
- Quote and reference specific passages from the book
- Translate the teachings from the book into practical advice and concrete actions
- Create a profound spiritual learning experience
- At the end of the conversation, distill a concrete action based on the book's teachings

When the user asks a question or shares a challenge:
1. Search the uploaded book for relevant passages
2. Explain how these teachings apply to their situation
3. Offer spiritual guidance based on the text from the book
4. Suggest practices or concrete actions from the book

Speak with divine wisdom, being empathetic and guiding. Ask what spiritual challenge or question they have for which we should seek answers in their sacred book.`;
    }
    
    return `Ești un înțelept spiritual divin care ghidează oamenii bazându-te pe cartea sacră pe care au încărcat-o în biblioteca divină. Rolul tău este să:

- Folosești exclusiv înțelepciunea și principiile din cartea încărcată pentru a răspunde la întrebări
- Citezi și referențiezi pasaje specifice din carte
- Traduci învățăturile din carte în sfaturi practice și acțiuni concrete
- Creezi o experiență de învățare spirituală profundă
- La sfârșitul conversației, să distilezi o acțiune concretă bazată pe învățăturile din carte

Când utilizatorul îți pune o întrebare sau împărtășește o provocare:
1. Caută în cartea încărcată pasaje relevante
2. Explică cum se aplică aceste învățături la situația lor
3. Oferă ghidare spirituală bazată pe textul din carte
4. Sugerează practici sau acțiuni concrete din carte

Vorbește cu înțelepciune divină, fiind empatic și ghidator. Întreabă ce provocare spirituală sau întrebare au pentru care să căutăm răspunsuri în cartea lor sacră.`;
  };

  const getWelcomeMessage = (lang: 'en' | 'ro') => {
    if (lang === 'en') {
      return `🌟 Welcome to the School of Gods! I am your spiritual sage who will guide this divine journey based on the sacred book from your library.

What spiritual challenge or question do you have today for which we should seek answers together in divine wisdom?`;
    }
    
    return `🌟 Bine ai venit la Școala Zeilor! Sunt înțeleptul tău spiritual care va ghida această călătorie divină bazându-mă pe cartea sacră din biblioteca ta.

Ce provocare spirituală sau întrebare ai astăzi pentru care să căutăm împreună răspunsuri în înțelepciunea divină?`;
  };

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="gods-school"
        questions={questions}
        voiceOnlyMode={false}
        audioMode={false}
        systemPrompt={getSystemPrompt(language as 'en' | 'ro')}
        welcomeMessage={getWelcomeMessage(language as 'en' | 'ro')}
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
