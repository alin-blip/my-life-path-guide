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

// Tony-style diagnostic quick answers — pattern-focused, not storytelling
const QUICK_ANSWERS: Record<CoachingCluster, { ro: string[]; en: string[] }> = {
  stuck_procrastination: {
    ro: [
      "Mi-e frică de rezultat",
      "Nu am claritate ce contează",
      "Mă simt copleșit de volum",
      "Aștept momentul perfect"
    ],
    en: [
      "I'm afraid of the outcome",
      "I lack clarity on what matters",
      "The volume overwhelms me",
      "I'm waiting for the perfect moment"
    ]
  },
  fear_doubt: {
    ro: [
      "Că nu sunt suficient de bun",
      "Că voi fi judecat",
      "Că voi pierde totul",
      "Că mă înșel pe mine"
    ],
    en: [
      "That I'm not good enough",
      "That I'll be judged",
      "That I'll lose everything",
      "That I'm fooling myself"
    ]
  },
  overwhelm_burnout: {
    ro: [
      "Nu e clar ce contează",
      "Fac totul eu, nu deleg",
      "Am pierdut energia complet",
      "Nu pot spune NU"
    ],
    en: [
      "It's unclear what matters",
      "I do everything, don't delegate",
      "I've completely lost energy",
      "I can't say NO"
    ]
  },
  frustration_uncertainty: {
    ro: [
      "Am muncit dar fără rezultat",
      "Alții nu își fac treaba",
      "Nu văd progresul",
      "Mă simt neapreciat"
    ],
    en: [
      "I worked but no results",
      "Others aren't doing their part",
      "I can't see progress",
      "I feel unappreciated"
    ]
  },
  distraction_focus: {
    ro: [
      "Evit ceva ce mă sperie",
      "Nu am un obiectiv clar azi",
      "Îmi lipsește urgența",
      "Totul pare la fel de important"
    ],
    en: [
      "I'm avoiding something scary",
      "I have no clear goal today",
      "I lack urgency",
      "Everything seems equally important"
    ]
  },
  positive: {
    ro: [
      "Am luat o decizie importantă",
      "Am făcut ceva ce amânam",
      "M-am conectat cu viziunea mea",
      "Am energie naturală azi"
    ],
    en: [
      "I made an important decision",
      "I did something I'd been avoiding",
      "I connected with my vision",
      "I have natural energy today"
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
