import React, { useState, useEffect } from 'react';
import { GodsSchoolStackProps } from './types';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';
import { StackIdeaModal } from '../StackIdeaModal';
import { AiGuidedStack } from '../AiGuidedStack';
import { StackModeSelector } from '../StackModeSelector';
import { questions } from './questions';

export const GodsSchoolStack: React.FC<GodsSchoolStackProps> = ({ onAddToHitList }) => {
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

  const systemPrompt = `Ești un înțelept spiritual divin care ghidează oamenii bazându-te pe cartea sacră pe care au încărcat-o în biblioteca divină. Rolul tău este să:

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

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="gods-school"
        questions={questions}
        voiceOnlyMode={mode === 'audio'}
        audioMode={mode === 'audio'}
        systemPrompt={systemPrompt}
        welcomeMessage="🌟 Bine ai venit la Școala Zeilor! Sunt înțeleptul tău spiritual care va ghida această călătorie divină bazându-mă pe cartea sacră din biblioteca ta.\n\nCe provocare spirituală sau întrebare ai astăzi pentru care să căutăm împreună răspunsuri în înțelepciunea divină?"
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
