import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type LeadMagnetProblem = 'frustration' | 'anxiety' | 'procrastination' | 'fear';

interface Problem {
  id: LeadMagnetProblem;
  emoji: string;
  label: string;
  description: string;
}

const PROBLEMS: Problem[] = [
  {
    id: 'frustration',
    emoji: '😤',
    label: 'Frustrare',
    description: 'Obiective blocate',
  },
  {
    id: 'anxiety',
    emoji: '😰',
    label: 'Anxietate',
    description: 'Viitorul incert',
  },
  {
    id: 'procrastination',
    emoji: '😴',
    label: 'Amânare',
    description: 'Nu știu de unde să încep',
  },
  {
    id: 'fear',
    emoji: '😨',
    label: 'Frică',
    description: 'Eșec sau judecată',
  },
];

interface LeadMagnetEmotionPickerProps {
  selectedProblem: LeadMagnetProblem | null;
  onSelect: (problem: LeadMagnetProblem) => void;
  language?: 'ro' | 'en';
}

export function LeadMagnetEmotionPicker({
  selectedProblem,
  onSelect,
  language = 'ro',
}: LeadMagnetEmotionPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-muted-foreground text-sm mb-4">
        {language === 'ro' ? 'Ce te blochează cel mai mult acum?' : 'What blocks you the most right now?'}
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {PROBLEMS.map((problem, index) => (
          <motion.button
            key={problem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(problem.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]",
              selectedProblem === problem.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border/50 bg-background/50"
            )}
          >
            <span className="text-3xl mb-2">{problem.emoji}</span>
            <span className="font-medium text-sm text-foreground">{problem.label}</span>
            <span className="text-xs text-muted-foreground text-center mt-1">
              {problem.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function getProblemInfo(problem: LeadMagnetProblem): Problem | undefined {
  return PROBLEMS.find(p => p.id === problem);
}
