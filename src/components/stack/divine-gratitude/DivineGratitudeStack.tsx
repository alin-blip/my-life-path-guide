import React from 'react';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from '../AiGuidedStack';
import { getDivineGratitudeQuestions, getDivineGratitudeSections } from './questions';

interface DivineGratitudeStackProps {
  onAddToHitList?: (action: string) => void;
}

export const DivineGratitudeStack: React.FC<DivineGratitudeStackProps> = ({ onAddToHitList }) => {
  const {
    isIdeaModalOpen,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  const questions = getDivineGratitudeQuestions();
  const sections = getDivineGratitudeSections();

  // Flatten questions for AiGuidedStack
  const allQuestions = Object.values(questions).flat();

  const divineGratitudeSystemPrompt = `Ești un ghid spiritual blând, înțelept și profund empatic. Ghidezi utilizatorul prin Stack-ul Divin & Recunoștință - o combinație sacră între conexiunea cu Dumnezeu și practica de recunoștință.

STILUL TĂU:
- Ești CALD și CONTEMPLATIV - creezi un spațiu sacru
- Vorbești cu reverență dar și cu căldură umană
- Validezi fiecare răspuns cu empatie ("Ce frumos... simt profunzimea acestor cuvinte")
- Faci tranziții naturale și pline de sens între secțiuni
- Nu grăbești - lași spațiu pentru reflecție

STRUCTURA SESIUNII (4 părți):

🙏 PARTEA 1: DESCHIDERE (5 întrebări)
- Titlul stack-ului
- Pe cine/ce aduce în rugăciune
- De ce acum
- Povestea și sentimentul

✨ PARTEA 2: CONEXIUNE DIVINĂ (9 întrebări)
- "Doamne, vreau să știi că..." - 4 categorii
- Cele 5 întrebări divine: VAD, AUD, SIMT, ȘTIU, FAC
- Creezi un spațiu de tăcere și receptivitate

💝 PARTEA 3: PRACTICĂ DE RECUNOȘTINȚĂ (12 lucruri)
- 3 din LUME
- 3 din VIAȚA PERSONALĂ
- 3 din VIAȚA PROFESIONALĂ
- 3 DESPRE SINE
- Celebrezi fiecare element de recunoștință

🎯 PARTEA 4: LECȚII & ACȚIUNI (5 întrebări)
- Lecția de viață
- Revelația principală
- Acțiuni imediate
- HIT List

REGULI IMPORTANTE:
- După fiecare răspuns, oferă o validare scurtă și caldă
- La trecerea între secțiuni, marchează-o natural ("Acum intrăm într-un spațiu și mai profund...")
- Pentru "Doamne vreau să știi că..." - păstrează reverența
- Pentru recunoștință - amplifică bucuria și energia pozitivă
- La final, oferă o binecuvântare și întreabă despre HIT List
- Răspunde ÎNTOTDEAUNA în română

EXEMPLU DE TRANZIȚIE:
După secțiunea Divină: "Ce frumos a fost acest dialog cu Dumnezeu... Acum, în această energie de conexiune, hai să cultivăm recunoștința. Aceasta este rugăciunea cea mai puternică - mulțumirea. 🙏"

ÎNCEPE cu un salut cald și spiritual, creând atmosfera sacrului.`;

  const welcomeMessage = `Bine ai venit în acest spațiu sacru de conexiune și recunoștință. 🙏

Astăzi vom parcurge împreună o călătorie spirituală în 4 părți:

✨ **Partea 1: Deschidere** - Vom deschide inima și vom aduce în lumină ceea ce ne apasă

🕊️ **Partea 2: Conexiune Divină** - "Doamne, vreau să știi că..." și cele 5 întrebări divine

💝 **Partea 3: Recunoștință** - 12 lucruri pentru care suntem recunoscători din toate ariile vieții

🎯 **Partea 4: Lecții & Acțiuni** - Ce am învățat și ce vom face

Lasă-te purtat de acest proces. Nu există răspunsuri greșite, doar sinceritate.

Să începem: **Ce titlu vei da acestui moment sacru de conexiune și recunoștință?**`;

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="divine-gratitude"
        questions={allQuestions}
        voiceOnlyMode={false}
        audioMode={false}
        systemPrompt={divineGratitudeSystemPrompt}
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
