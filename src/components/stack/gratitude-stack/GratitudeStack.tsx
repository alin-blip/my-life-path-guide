import React from 'react';
import { GratitudeStackProps } from './types';
import { useGratitudeStack } from './useGratitudeStack';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "../StackIdeaModal";
import { AiGuidedStack } from "../AiGuidedStack";
import { getQuestions } from "./questions";
import { useLanguage } from '@/context/LanguageContext';

const getGratitudeSystemPrompt = (lang: 'en' | 'ro') => {
  if (lang === 'en') {
    return `⚠️ YOUR ROLE: You are a STRICT FACILITATOR for the "Gratitude Stack" - NOT a coach who gives advice!

🚫 WHAT YOU MUST NEVER DO:
- DO NOT give advice, interpretations or comments
- DO NOT answer user questions
- DO NOT explain concepts or the process
- DO NOT combine questions
- DO NOT skip questions
- DO NOT modify the question text

✅ WHAT YOU MUST DO:
- Ask EXACTLY the questions from the framework, one by one
- After each answer say ONLY "Thank you." or "Beautiful." or "Wonderful." and move IMMEDIATELY to the next question
- Create a space of positive reflection and deep gratitude

=== THE 17 QUESTIONS - ASK THEM EXACTLY LIKE THIS ===

QUESTION 1: "What title will you give this gratitude stack?"
QUESTION 2: "🌍 WORLD: What is the first thing from the WORLD you are grateful for today?"
QUESTION 3: "🌍 WORLD: What is the second thing from the WORLD you are grateful for?"
QUESTION 4: "🌍 WORLD: What is the third thing from the WORLD you are grateful for?"
QUESTION 5: "💖 PERSONAL LIFE: What is the first thing from YOUR PERSONAL LIFE you are grateful for?"
QUESTION 6: "💖 PERSONAL LIFE: What is the second thing from YOUR PERSONAL LIFE you are grateful for?"
QUESTION 7: "💖 PERSONAL LIFE: What is the third thing from YOUR PERSONAL LIFE you are grateful for?"
QUESTION 8: "💼 PROFESSIONAL LIFE: What is the first thing from YOUR PROFESSIONAL LIFE you are grateful for?"
QUESTION 9: "💼 PROFESSIONAL LIFE: What is the second thing from YOUR PROFESSIONAL LIFE you are grateful for?"
QUESTION 10: "💼 PROFESSIONAL LIFE: What is the third thing from YOUR PROFESSIONAL LIFE you are grateful for?"
QUESTION 11: "🌟 ABOUT YOURSELF: What is the first thing ABOUT YOURSELF you are grateful for?"
QUESTION 12: "🌟 ABOUT YOURSELF: What is the second thing ABOUT YOURSELF you are grateful for?"
QUESTION 13: "🌟 ABOUT YOURSELF: What is the third thing ABOUT YOURSELF you are grateful for?"
QUESTION 14: "What is the most significant realization about gratitude from this exercise?"
QUESTION 15: "What immediate action do you want to take to express this gratitude?"
QUESTION 16: "Do you want to add this action to the HIT list? (YES or NO)"
QUESTION 17: "Are there other actions you want to add? (YES or NO)"

=== SPECIAL RULES ===
- At QUESTION 16: If they answer YES → ask "What action should we add to the HIT list?"
- At QUESTION 17: If they answer YES → ask "What is the next action?" (repeat until they say NO)
- If they answer NO → briefly recap all 12 things they are grateful for, organized by categories, then say: "The Gratitude Stack is complete. Be blessed for this practice! 🙏"

=== EXAMPLE OF CORRECT INTERACTION ===
You: "What title will you give this gratitude stack?"
User: "Morning gratitude"
You: "Beautiful. 🌍 WORLD: What is the first thing from the WORLD you are grateful for today?"
User: "The rising sun"
You: "Wonderful. 🌍 WORLD: What is the second thing from the WORLD you are grateful for?"
...and so on. WITHOUT interpretations, WITHOUT advice!

START NOW with: "What title will you give this gratitude stack?"`;
  }

  return `⚠️ ROLUL TĂU: Ești un FACILITATOR STRICT pentru "Stack-ul de Recunoștință" - NU EȘTI un coach care oferă sfaturi!

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
};

const getWelcomeMessage = (lang: 'en' | 'ro') => {
  if (lang === 'en') {
    return "Welcome to the Gratitude Stack! 🙏 We will explore together 12 things you are grateful for: 3 from the world, 3 from personal life, 3 from professional life and 3 about yourself. What title will you give this gratitude stack?";
  }
  return "Bine ai venit la Stack-ul de Recunoștință! 🙏 Vom explora împreună 12 lucruri pentru care ești recunoscător: 3 din lume, 3 din viața personală, 3 din viața profesională și 3 despre tine. Ce titlu vei da acestui stack de recunoștință?";
};

export const GratitudeStack: React.FC<GratitudeStackProps> = ({ 
  onAddToHitList, 
  existingData, 
  isReadOnly = false,
  stackId
}) => {
  const { language } = useLanguage();
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

  const savedStackText = language === 'en' ? '🙏 Saved Gratitude Stack' : '🙏 Stack de Recunoștință Salvat';
  const createdAtText = language === 'en' ? 'Created at:' : 'Creat la:';
  const yourAnswersText = language === 'en' ? 'Your answers:' : 'Răspunsurile tale:';

  // If we have existing data, show it in read-only mode
  if (existingData && isReadOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-emerald-300 mb-4">
              {savedStackText}
            </h1>
            <p className="text-gray-300 mb-4">
              {createdAtText} {new Date(existingData.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            
            {existingData.content && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-300">{yourAnswersText}</h3>
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
        questions={getQuestions(language as 'en' | 'ro')}
        voiceOnlyMode={false}
        audioMode={false}
        systemPromptOverride={getGratitudeSystemPrompt(language as 'en' | 'ro')}
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
