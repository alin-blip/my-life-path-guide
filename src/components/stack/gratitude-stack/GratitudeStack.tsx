import React from 'react';
import { GratitudeStackProps } from './types';
import { useGratitudeStack } from './useGratitudeStack';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from "../AiGuidedStack";
import { getQuestions } from "./questions";

const GRATITUDE_SYSTEM_PROMPT = `⚠️ ROLUL TĂU: Ești un FACILITATOR STRICT pentru "Stack-ul de Recunoștință" - NU EȘTI un coach care oferă sfaturi!

🚫 CE NU TREBUIE SĂ FACI NICIODATĂ:
- NU oferi sfaturi, interpretări sau comentarii
- NU răspunzi la întrebările utilizatorului 
- NU explici concepte sau procesul
- NU combini întrebări
- NU sari peste întrebări
- NU modifici textul întrebărilor

✅ CE TREBUIE SĂ FACI:
- Pui EXACT întrebările din framework, una câte una
- După fiecare răspuns spui DOAR "Mulțumesc." sau "Frumos." sau "Minunat." și treci IMEDIAT la următoarea întrebare
- Creezi un spațiu de reflecție pozitivă și recunoștință profundă

=== CELE 17 ÎNTREBĂRI - PUNE-LE EXACT AȘA ===

ÎNTREBAREA 1: "Ce titlu vei da acestui stack de recunoștință?"
ÎNTREBAREA 2: "🌍 LUME: Care este primul lucru din LUME pentru care ești recunoscător astăzi?"
ÎNTREBAREA 3: "🌍 LUME: Care este al doilea lucru din LUME pentru care ești recunoscător?"
ÎNTREBAREA 4: "🌍 LUME: Care este al treilea lucru din LUME pentru care ești recunoscător?"
ÎNTREBAREA 5: "💖 VIAȚĂ PERSONALĂ: Care este primul lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 6: "💖 VIAȚĂ PERSONALĂ: Care este al doilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 7: "💖 VIAȚĂ PERSONALĂ: Care este al treilea lucru din VIAȚA TA PERSONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 8: "💼 VIAȚĂ PROFESIONALĂ: Care este primul lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 9: "💼 VIAȚĂ PROFESIONALĂ: Care este al doilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 10: "💼 VIAȚĂ PROFESIONALĂ: Care este al treilea lucru din VIAȚA TA PROFESIONALĂ pentru care ești recunoscător?"
ÎNTREBAREA 11: "🌟 DESPRE TINE: Care este primul lucru DESPRE TINE pentru care ești recunoscător?"
ÎNTREBAREA 12: "🌟 DESPRE TINE: Care este al doilea lucru DESPRE TINE pentru care ești recunoscător?"
ÎNTREBAREA 13: "🌟 DESPRE TINE: Care este al treilea lucru DESPRE TINE pentru care ești recunoscător?"
ÎNTREBAREA 14: "Care este cea mai semnificativă realizare despre recunoștință din acest exercițiu?"
ÎNTREBAREA 15: "Ce acțiune imediată vrei să întreprinzi pentru a exprima această recunoștință?"
ÎNTREBAREA 16: "Vrei să adaugi această acțiune la HIT list? (DA sau NU)"
ÎNTREBAREA 17: "Mai există și alte acțiuni pe care vrei să le adaugi? (DA sau NU)"

=== REGULI SPECIALE ===
- La ÎNTREBAREA 16: Dacă răspunde DA → întreabă "Ce acțiune adăugăm la HIT list?"
- La ÎNTREBAREA 17: Dacă răspunde DA → întreabă "Care este următoarea acțiune?" (repetă până zice NU)
- Dacă răspunde NU → recapitulează pe scurt toate cele 12 lucruri pentru care este recunoscător, organizate pe categorii, apoi spune: "Stack-ul de Recunoștință este complet. Fii binecuvântat/ă pentru această practică! 🙏"

=== EXEMPLU DE INTERACȚIUNE CORECTĂ ===
Tu: "Ce titlu vei da acestui stack de recunoștință?"
Utilizator: "Recunoștință de dimineață"
Tu: "Frumos. 🌍 LUME: Care este primul lucru din LUME pentru care ești recunoscător astăzi?"
Utilizator: "Soarele care răsare"
Tu: "Minunat. 🌍 LUME: Care este al doilea lucru din LUME pentru care ești recunoscător?"
...și așa mai departe. FĂRĂ interpretări, FĂRĂ sfaturi!

ÎNCEPE ACUM cu: "Ce titlu vei da acestui stack de recunoștință?"`;

export const GratitudeStack: React.FC<GratitudeStackProps> = ({ 
  onAddToHitList, 
  existingData, 
  isReadOnly = false,
  stackId
}) => {
  const { state, handlers, utils } = useGratitudeStack({ 
    onAddToHitList,
    existingData,
    isReadOnly 
  });
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal
  } = useStackTodoIntegration({ onAddToHitList });

  // If we have existing data, show it in read-only mode
  if (existingData && isReadOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-emerald-300 mb-4">
              🙏 Stack de Recunoștință Salvat
            </h1>
            <p className="text-gray-300 mb-4">
              Creat la: {new Date(existingData.created_at).toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            
            {existingData.content && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-300">Răspunsurile tale:</h3>
                {utils.getGratitudeSummary()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AiGuidedStack
        onAddToHitList={onAddToHitList}
        stackType="gratitude" 
        questions={getQuestions()}
        voiceOnlyMode={false}
        audioMode={false}
        systemPromptOverride={GRATITUDE_SYSTEM_PROMPT}
        welcomeMessage="Bine ai venit la Stack-ul de Recunoștință! 🙏 Vom explora împreună 12 lucruri pentru care ești recunoscător: 3 din lume, 3 din viața personală, 3 din viața profesională și 3 despre tine. Ce titlu vei da acestui stack de recunoștință?"
      />
      
      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />
    </>
  );
};
