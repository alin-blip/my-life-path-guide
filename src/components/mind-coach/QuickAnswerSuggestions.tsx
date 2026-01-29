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

// Quick answers mapped to each cluster
const QUICK_ANSWERS: Record<CoachingCluster, { ro: string[]; en: string[] }> = {
  stuck_procrastination: {
    ro: [
      "Nu știu de unde să încep",
      "Mi-e frică să nu eșuez",
      "E prea mult de făcut",
      "Nu mă simt motivat"
    ],
    en: [
      "I don't know where to start",
      "I'm afraid of failing",
      "It's too overwhelming",
      "I don't feel motivated"
    ]
  },
  fear_doubt: {
    ro: [
      "Dar dacă eșuez?",
      "Nu sunt destul de bun",
      "Nu știu ce fac",
      "Mi-e teamă să încerc"
    ],
    en: [
      "What if I fail?",
      "I'm not good enough",
      "I don't know what I'm doing",
      "I'm afraid to try"
    ]
  },
  overwhelm_burnout: {
    ro: [
      "Prea multe de făcut",
      "Sunt epuizat",
      "Nu mai am energie",
      "Nu pot să mă concentrez"
    ],
    en: [
      "Too much to do",
      "I'm exhausted",
      "I have no energy left",
      "I can't focus"
    ]
  },
  frustration_uncertainty: {
    ro: [
      "Ceva mă blochează",
      "Nu știu ce pas să fac",
      "Progresul e prea lent",
      "Mă simt frustrat"
    ],
    en: [
      "Something is blocking me",
      "I don't know the next step",
      "Progress is too slow",
      "I feel frustrated"
    ]
  },
  distraction_focus: {
    ro: [
      "Mă distrag ușor",
      "Fac prea multe odată",
      "Nu am priorități clare",
      "Pierd timpul"
    ],
    en: [
      "I get distracted easily",
      "I'm doing too many things",
      "I lack clear priorities",
      "I'm wasting time"
    ]
  },
  positive: {
    ro: [
      "Mă simt energizat",
      "Am reușit ceva important",
      "Sunt recunoscător",
      "Vreau să mențin asta"
    ],
    en: [
      "I feel energized",
      "I achieved something",
      "I'm grateful",
      "I want to maintain this"
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
