import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoachingCluster } from '@/lib/mind-coach-clusters';
import type { TransformationPhase } from './PhaseIndicator';

interface QuickAnswerSuggestionsProps {
  cluster: CoachingCluster | null;
  phase?: TransformationPhase;
  language: 'ro' | 'en';
  onSelect: (answer: string) => void;
  isVisible: boolean;
}

// PHASE 1 — Diagnosis: 3 Decisions (Focus / Meaning / Action) per cluster
const PHASE_1_ANSWERS: Record<CoachingCluster, { ro: string[]; en: string[] }> = {
  stuck_procrastination: {
    ro: ["Mă focusez pe ce pot pierde", "Cred că nu sunt pregătit", "Aștept momentul perfect", "Am amânat să nu eșuez"],
    en: ["I focus on what I could lose", "I believe I'm not ready", "I'm waiting for the perfect moment", "I procrastinate to avoid failure"]
  },
  fear_doubt: {
    ro: ["Cred că dacă pierd, nu valorez", "Mă focusez pe ce-ar putea merge prost", "Mi-e frică de judecata altora", "Cred că nu merit succesul"],
    en: ["I believe if I fail, I'm worthless", "I focus on what could go wrong", "I fear others' judgment", "I believe I don't deserve success"]
  },
  overwhelm_burnout: {
    ro: ["Pe TOT deodată", "Pe ce contează cu adevărat", "Pe ce nu am terminat", "Pe presiunea timpului"],
    en: ["On EVERYTHING at once", "On what really matters", "On what I haven't finished", "On time pressure"]
  },
  frustration_uncertainty: {
    ro: ["Cred că efortul meu nu produce", "Mă focusez pe ce nu merge", "Cred că nu sunt apreciat", "Aveam altă așteptare"],
    en: ["I believe my effort doesn't produce", "I focus on what's not working", "I believe I'm not appreciated", "I had a different expectation"]
  },
  distraction_focus: {
    ro: ["Evit ceva ce mă sperie", "Nu am claritate ce contează azi", "Mă focusez pe orice altceva", "Nu vreau să simt presiunea"],
    en: ["I'm avoiding something scary", "I lack clarity on what matters today", "I focus on anything else", "I don't want to feel the pressure"]
  },
  positive: {
    ro: ["M-am focusat pe ce pot crea", "Am dat sens nou unei provocări", "Am acționat în ciuda fricii", "M-am conectat cu viziunea mea"],
    en: ["I focused on what I can create", "I gave new meaning to a challenge", "I acted despite fear", "I connected with my vision"]
  }
};

// PHASE 2 — Pattern confirmation
const PHASE_2_ANSWERS = {
  ro: ["Da, exact așa e", "Cam așa, da", "Nu chiar", "Parțial"],
  en: ["Yes, exactly", "Pretty much", "Not quite", "Partially"]
};

// PHASE 3 — Dickens leverage choice
const PHASE_3_ANSWERS = {
  ro: ["A doua — vreau să schimb", "Nu vreau să mai stau așa", "Trebuie să schimb azi", "Costul e prea mare"],
  en: ["Second one — I want to change", "I can't stay like this", "I must change today", "The cost is too high"]
};

// PHASE 4 — Power Move confirmation
const PHASE_4_ANSWERS = {
  ro: ["Gata, am făcut", "Simt diferența", "Sunt în starea nouă", "Mai puternic acum"],
  en: ["Done, completed it", "I feel the difference", "I'm in the new state", "Stronger now"]
};

// PHASE 5 — Add to HIT List confirmation
const PHASE_5_ANSWERS = {
  ro: ["Da, adaugă în HIT List", "Da, fac azi", "Sigur, să mergem", "Confirm"],
  en: ["Yes, add to HIT List", "Yes, doing it today", "Sure, let's go", "Confirm"]
};

export function QuickAnswerSuggestions({
  cluster,
  phase = 1,
  language,
  onSelect,
  isVisible
}: QuickAnswerSuggestionsProps) {
  if (!isVisible) return null;

  // Pick answers based on current phase
  let answers: string[] = [];
  
  if (phase === 1 && cluster) {
    answers = PHASE_1_ANSWERS[cluster]?.[language] || [];
  } else if (phase === 2) {
    answers = PHASE_2_ANSWERS[language];
  } else if (phase === 3) {
    answers = PHASE_3_ANSWERS[language];
  } else if (phase === 4) {
    answers = PHASE_4_ANSWERS[language];
  } else if (phase === 5) {
    answers = PHASE_5_ANSWERS[language];
  }
  
  if (answers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
      {answers.map((answer, idx) => (
        <Button
          key={`${phase}-${idx}`}
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
