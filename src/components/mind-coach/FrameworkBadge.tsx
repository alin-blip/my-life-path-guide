import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransformationPhase } from './PhaseIndicator';

interface FrameworkBadgeProps {
  phase: TransformationPhase;
  language: 'ro' | 'en';
  className?: string;
}

// Maps each transformation phase to the Ultimate YOU framework being applied
const FRAMEWORKS: Record<TransformationPhase, { ro: string; en: string; day: string }> = {
  1: {
    ro: 'Cele 3 Decizii: Focus / Sens / Acțiune',
    en: 'The 3 Decisions: Focus / Meaning / Action',
    day: 'Ziua 1',
  },
  2: {
    ro: 'Pârghie: Durere vs Plăcere',
    en: 'Leverage: Pain vs Pleasure',
    day: 'Ziua 2',
  },
  3: {
    ro: 'Numește pattern-ul (N.A.C. pasul 1)',
    en: 'Name the pattern (N.A.C. step 1)',
    day: 'Ziua 4',
  },
  4: {
    ro: 'N.A.C.: Pattern Interrupt + Conditioning',
    en: 'N.A.C.: Pattern Interrupt + Conditioning',
    day: 'Ziua 4',
  },
  5: {
    ro: 'Power Question + Acțiune ancorată',
    en: 'Power Question + Anchored Action',
    day: 'Ziua 8',
  },
};

export function FrameworkBadge({ phase, language, className }: FrameworkBadgeProps) {
  const framework = FRAMEWORKS[phase];
  if (!framework) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[10px] text-muted-foreground/80',
        'bg-primary/5 border border-primary/15 rounded-full px-2.5 py-1',
        'animate-fade-in',
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5 text-primary/70" />
      <span className="font-medium">
        {language === 'ro' ? 'Ultimate YOU' : 'Ultimate YOU'} · {framework.day}
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span>{language === 'ro' ? framework.ro : framework.en}</span>
    </div>
  );
}
