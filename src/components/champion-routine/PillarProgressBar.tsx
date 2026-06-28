import React from 'react';
import { Brain, Sparkles, Dumbbell, Heart, Briefcase, Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { RoutineStepId } from './ChampionRoutineFlow';
import { ChampionLog } from '@/hooks/useChampionRoutine';

export type PillarKey = 'mentalitate' | 'spiritualitate' | 'corp' | 'familie' | 'business';

const PILLAR_STEPS: Record<PillarKey, RoutineStepId[]> = {
  mentalitate: ['mindShifting', 'mindTest', 'journaling', 'learn'],
  spiritualitate: [
    'meditation', 'gratitude', 'powerDeclaration',
    'visualization', 'autosuggestion', 'visionDeclaration', 'reading', 'breathing',
  ],
  corp: ['bodyActivation', 'exercise', 'mealPlanning', 'hydration', 'lightExposure'],
  familie: ['relationships'],
  business: ['apply', 'contentCreation', 'dailyTasks', 'todaysTasks'],
};

const PILLAR_META: Record<PillarKey, { label: string; icon: LucideIcon; accent: string }> = {
  mentalitate:    { label: 'Mentalitate',    icon: Brain,     accent: '210 95% 65%' },  // ice blue
  spiritualitate: { label: 'Spiritualitate', icon: Sparkles,  accent: '270 70% 70%' },  // indigo
  corp:           { label: 'Corp',           icon: Dumbbell,  accent: '0 75% 60%' },    // crimson
  familie:        { label: 'Familie',        icon: Heart,     accent: '340 75% 65%' },  // rose
  business:       { label: 'Business',       icon: Briefcase, accent: '200 90% 55%' },  // sky
};

const PILLAR_ORDER: PillarKey[] = ['mentalitate', 'spiritualitate', 'corp', 'familie', 'business'];

export function getPillarOfStep(stepId: RoutineStepId): PillarKey | null {
  for (const k of PILLAR_ORDER) {
    if (PILLAR_STEPS[k].includes(stepId)) return k;
  }
  return null;
}

interface PillarProgressBarProps {
  steps: RoutineStepId[];
  currentStepIndex: number;
  todayLog: ChampionLog | null;
  isStepCompleted: (stepId: RoutineStepId, log: ChampionLog | null) => boolean;
  onPillarClick: (firstIncompleteIndex: number) => void;
}

export function PillarProgressBar({
  steps,
  currentStepIndex,
  todayLog,
  isStepCompleted,
  onPillarClick,
}: PillarProgressBarProps) {
  const currentStepId = steps[currentStepIndex];
  const activePillar = currentStepId ? getPillarOfStep(currentStepId) : null;

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full">
      {PILLAR_ORDER.map((key) => {
        const meta = PILLAR_META[key];
        const Icon = meta.icon;
        const stepIds = PILLAR_STEPS[key].filter((id) => steps.includes(id));
        const total = stepIds.length;
        const done = stepIds.filter((id) => isStepCompleted(id, todayLog)).length;
        const ratio = total > 0 ? done / total : 0;
        const isComplete = total > 0 && done === total;
        const isActive = activePillar === key;
        const disabled = total === 0;

        const handleClick = () => {
          if (disabled) return;
          const firstIncompleteId = stepIds.find((id) => !isStepCompleted(id, todayLog)) || stepIds[0];
          const idx = steps.indexOf(firstIncompleteId);
          if (idx !== -1) onPillarClick(idx);
        };

        return (
          <motion.button
            key={key}
            type="button"
            onClick={handleClick}
            disabled={disabled}
            whileHover={!disabled ? { y: -2 } : undefined}
            whileTap={!disabled ? { y: 0, scale: 0.98 } : undefined}
            style={{ ['--p-accent' as any]: `hsl(${meta.accent})` }}
            className={cn(
              'group relative overflow-hidden rounded-xl p-2 sm:p-2.5 text-left transition-all',
              'border backdrop-blur-sm',
              'bg-gradient-to-b from-[hsl(220_45%_12%)] to-[hsl(222_50%_8%)]',
              isActive
                ? 'border-[hsl(var(--primary)/0.55)] shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_8px_24px_-12px_hsl(var(--primary)/0.45)]'
                : isComplete
                ? 'border-[hsl(var(--primary)/0.4)]'
                : 'border-white/10 hover:border-[hsl(var(--primary)/0.35)]',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {/* top hairline highlight */}
            <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {/* completion gold halo */}
            {isComplete && (
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[hsl(var(--primary)/0.45)]" />
            )}

            <div className="flex items-center gap-2">
              {/* icon tile */}
              <div
                className={cn(
                  'relative shrink-0 grid place-items-center rounded-lg',
                  'w-8 h-8 sm:w-9 sm:h-9',
                  'border border-white/10',
                )}
                style={{
                  background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, var(--p-accent) 35%, transparent), hsl(222 50% 10%) 75%)`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)',
                }}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 text-[hsl(var(--primary))]" strokeWidth={2.5} />
                ) : (
                  <Icon className="h-4 w-4" style={{ color: 'var(--p-accent)' }} strokeWidth={2.2} />
                )}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-lg ring-2"
                    style={{ borderColor: 'hsl(var(--primary))' } as any}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 hidden sm:block">
                <div className="text-[11px] font-semibold tracking-wide text-white/90 truncate">
                  {meta.label}
                </div>
                <div className="text-[10px] text-white/50 font-mono">
                  {done}/{total}
                </div>
              </div>
            </div>

            {/* gold progress bar */}
            <div className="mt-2 h-[3px] rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))',
                  boxShadow: '0 0 8px hsl(var(--primary)/0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* mobile label */}
            <div className="sm:hidden mt-1 text-[9px] font-medium text-white/80 text-center truncate">
              {meta.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
