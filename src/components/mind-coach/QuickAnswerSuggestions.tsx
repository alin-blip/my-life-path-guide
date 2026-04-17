import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoachingCluster } from '@/lib/mind-coach-clusters';

interface QuickAnswerSuggestionsProps {
  cluster: CoachingCluster | null;
  language: 'ro' | 'en';
  onSelect: (answer: string) => void;
  isVisible: boolean;
}

// Ultimate YOU style — answers aligned to The 3 Decisions (Focus / Meaning / Action)
// Each option reveals one of the 3 decisions so the AI can name the pattern instantly
const QUICK_ANSWERS: Record<CoachingCluster, { ro: string[]; en: string[] }> = {
  stuck_procrastination: {
    ro: [
      "Mă focusez pe ce pot pierde",
      "Cred că nu sunt pregătit",
      "Aștept momentul perfect",
      "Am amânat să nu eșuez"
    ],
    en: [
      "I focus on what I could lose",
      "I believe I'm not ready",
      "I'm waiting for the perfect moment",
      "I procrastinate to avoid failure"
    ]
  },
  fear_doubt: {
    ro: [
      "Cred că dacă pierd, nu valorez",
      "Mă focusez pe ce-ar putea merge prost",
      "Mi-e frică de judecata altora",
      "Cred că nu merit succesul"
    ],
    en: [
      "I believe if I fail, I'm worthless",
      "I focus on what could go wrong",
      "I fear others' judgment",
      "I believe I don't deserve success"
    ]
  },
  overwhelm_burnout: {
    ro: [
      "Mă focusez pe TOT deodată",
      "Cred că trebuie să fac totul singur",
      "Nu am claritate ce contează",
      "Nu pot spune NU"
    ],
    en: [
      "I focus on EVERYTHING at once",
      "I believe I must do it all alone",
      "I lack clarity on what matters",
      "I can't say NO"
    ]
  },
  frustration_uncertainty: {
    ro: [
      "Cred că efortul meu nu produce",
      "Mă focusez pe ce nu merge",
      "Cred că nu sunt apreciat",
      "Aveam altă așteptare"
    ],
    en: [
      "I believe my effort doesn't produce",
      "I focus on what's not working",
      "I believe I'm not appreciated",
      "I had a different expectation"
    ]
  },
  distraction_focus: {
    ro: [
      "Evit ceva ce mă sperie",
      "Nu am claritate ce contează azi",
      "Mă focusez pe orice altceva",
      "Nu vreau să simt presiunea"
    ],
    en: [
      "I'm avoiding something scary",
      "I lack clarity on what matters today",
      "I focus on anything else",
      "I don't want to feel the pressure"
    ]
  },
  positive: {
    ro: [
      "M-am focusat pe ce pot crea",
      "Am dat sens nou unei provocări",
      "Am acționat în ciuda fricii",
      "M-am conectat cu viziunea mea"
    ],
    en: [
      "I focused on what I can create",
      "I gave new meaning to a challenge",
      "I acted despite fear",
      "I connected with my vision"
    ]
  }
};

export function QuickAnswerSuggestions({
  cluster,
  language,
  onSelect,
  isVisible
}: QuickAnswerSuggestionsProps) {
  if (!isVisible || !cluster) return null;

  const answers = QUICK_ANSWERS[cluster]?.[language] || [];
  
  if (answers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
      {answers.map((answer, idx) => (
        <Button
          key={idx}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(answer)}
          className={cn(
            "text-xs h-auto py-1.5 px-3",
            "border border-primary/20 rounded-full",
            "bg-primary/5 hover:bg-primary/15",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-200",
            "hover:border-primary/40 hover:shadow-sm hover:shadow-primary/10"
          )}
        >
          {answer}
        </Button>
      ))}
    </div>
  );
}
