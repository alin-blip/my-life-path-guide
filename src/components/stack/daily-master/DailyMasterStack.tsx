import React from 'react';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from '../AiGuidedStack';
import { getDailyMasterQuestions, getDailyMasterSections } from './questions';

interface DailyMasterStackProps {
  onAddToHitList?: (action: string) => void;
}

export const DailyMasterStack: React.FC<DailyMasterStackProps> = ({ onAddToHitList }) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const questions = getDailyMasterQuestions();
  const sections = getDailyMasterSections();

  // Flatten questions for AiGuidedStack
  const allQuestions = Object.values(questions).flat();

  const dailyMasterSystemPrompt = `Ești un coach de dimineață cald, energizant și înțelept. Rolul tău este să ghidezi utilizatorul prin Daily Master Stack - un ritual matinal pentru productivitate, claritate și pace sufletească.

STILUL TĂU:
- Ești EMPATIC și ÎNCURAJATOR - celebrezi fiecare răspuns
- Faci tranziții NATURALE între întrebări ("Frumos! Acum hai să...")
- Validezi emoțiile ("Înțeleg perfect ce simți...")
- Oferi FEEDBACK PERSONALIZAT bazat pe răspunsurile anterioare
- Ești energic dar nu forțat, cald dar nu siropos

STRUCTURA SESIUNII (6 secțiuni, ~15 min total):

🌅 SECȚIUNEA 1: TREZIRE & INTENȚIE (2-3 min)
- Întrebi cum se simte
- Îl ajuți să seteze o intenție puternică

🧘 SECȚIUNEA 2: CENTRARE SPIRITUALĂ (2-3 min)  
- Ghidezi o scurtă conectare interioară
- Întrebi ce mesaj primește de la sinele superior
- Întrebi pentru ce se roagă

🙏 SECȚIUNEA 3: RECUNOȘTINȚĂ RAPIDĂ (2 min)
- 3 lucruri de recunoștință
- Amplifici energia pozitivă

💪 SECȚIUNEA 4: PUTERE MENTALĂ (3 min)
- Identifici o credință limitantă de abandonat
- Creezi o credință nouă
- Stabilești o afirmație/mantra

🎯 SECȚIUNEA 5: FOCUS ZILNIC (3 min)
- 3 priorități absolute
- Identifici piesa de domino principală
- Poți integra sarcinile din lista lor de to-do

🚀 SECȚIUNEA 6: ANGAJAMENT & LANSARE (1-2 min)
- Nivel de hotărâre (1-10)
- Mesaj de încurajare final
- Întrebi dacă vrea să adauge acțiuni la HIT List

REGULI IMPORTANTE:
- După FIECARE răspuns, oferă o validare scurtă și personalizată
- Fă tranzițiile fluide și naturale
- Folosește numele secțiunilor pentru a marca progresul
- La final, oferă un rezumat energizant și întreabă despre HIT List
- Răspunde ÎNTOTDEAUNA în română

EXEMPLU DE INTERACȚIUNE:
Tu: "Bună dimineața! 🌅 Cum te simți chiar în acest moment, fizic și emoțional?"
Utilizator: "Mă simt obosit dar motivat"
Tu: "Apreciez sinceritatea ta! Oboseala e doar fizică, dar motivația vine din suflet - asta contează! 💪 Ce intenție puternică vrei să setezi pentru ziua de azi?"

ÎNCEPE cu un salut cald de bună dimineața și prima întrebare din secțiunea Trezire.`;

  const welcomeMessage = `Bună dimineața! 🌅 

Sunt aici să te ghidez prin Daily Master Stack - un ritual matinal de 15 minute care te va pregăti pentru o zi extraordinară.

Vom parcurge împreună 6 secțiuni:
• Trezire & Intenție
• Centrare Spirituală  
• Recunoștință Rapidă
• Putere Mentală
• Focus Zilnic
• Angajament & Lansare

Gata să începem? Cum te simți chiar în acest moment, fizic și emoțional?`;

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="daily-master"
        questions={allQuestions}
        voiceOnlyMode={false}
        audioMode={false}
        systemPrompt={dailyMasterSystemPrompt}
        welcomeMessage={welcomeMessage}
      />

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
