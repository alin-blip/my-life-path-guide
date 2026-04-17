import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CoachingCluster } from '@/lib/mind-coach-clusters';
import type { TransformationPhase } from './PhaseIndicator';

interface QuickAnswerSuggestionsProps {
  cluster: CoachingCluster | null;
  phase?: TransformationPhase;
  messageCount?: number;
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

// PHASE 2A — Dickens: ce PIERZI dacă rămâi 1 an
const PHASE_2A_ANSWERS = {
  ro: ["Sănătatea", "Banii", "Oamenii dragi", "Respectul de sine", "Ani din viață"],
  en: ["Health", "Money", "Loved ones", "Self-respect", "Years of life"]
};

// PHASE 2B — Dickens: ce CÂȘTIGI dacă schimbi azi
const PHASE_2B_ANSWERS = {
  ro: ["Cine devin", "Libertate", "Putere", "Bani", "Pace interioară"],
  en: ["Who I become", "Freedom", "Power", "Money", "Inner peace"]
};

// PHASE 2C — Dickens: alegerea
const PHASE_2C_ANSWERS = {
  ro: ["A doua — vreau să schimb", "Nu pot rămâne așa", "Trebuie să schimb azi", "Costul e prea mare"],
  en: ["Second — I want to change", "I can't stay like this", "I must change today", "The cost is too high"]
};

// PHASE 3 — Power Move confirmation
const PHASE_3_ANSWERS = {
  ro: ["Gata, am făcut", "Simt diferența", "Sunt în starea nouă", "Mai puternic acum"],
  en: ["Done, completed it", "I feel the difference", "I'm in the new state", "Stronger now"]
};

// PHASE 4 — Power Question (action)
const PHASE_4_ANSWERS = {
  ro: ["Sun clientul azi", "Trimit propunerea", "Fac primul pas mic", "Termin sarcina amânată"],
  en: ["Call the client today", "Send the proposal", "Take the first small step", "Finish the postponed task"]
};

// PHASE 5 — Add to HIT List confirmation
const PHASE_5_ANSWERS = {
  ro: ["Da, adaugă în HIT List", "Da, fac azi", "Sigur, să mergem", "Confirm"],
  en: ["Yes, add to HIT List", "Yes, doing it today", "Sure, let's go", "Confirm"]
};

export function QuickAnswerSuggestions({
  cluster,
  phase = 1,
  messageCount = 0,
  language,
  onSelect,
  isVisible
}: QuickAnswerSuggestionsProps) {
  if (!isVisible) return null;

  // Pick answers based on current phase
  let answers: string[] = [];
  
  if (phase === 1 && cluster) {
    // Phase 1A (msg 0-1) = diagnostic; Phase 1B (msg 2-3) = pattern confirmation
    if (messageCount <= 1) {
      answers = PHASE_1_ANSWERS[cluster]?.[language] || [];
    } else {
      answers = PHASE_2_ANSWERS[language]; // pattern confirm: "Da, exact așa e"
    }
  } else if (phase === 2) {
    // Phase 2 split into 2A (lose) → 2B (gain) → 2C (choose) by message count
    // Phase 2 starts around msg 4. msg 4=2A, msg 6=2B, msg 8=2C
    if (messageCount <= 5) {
      answers = PHASE_2A_ANSWERS[language];
    } else if (messageCount <= 7) {
      answers = PHASE_2B_ANSWERS[language];
    } else {
      answers = PHASE_2C_ANSWERS[language];
    }
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
