import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type TransformationPhase = 1 | 2 | 3 | 4 | 5;

interface PhaseInfo {
  id: TransformationPhase;
  labelRo: string;
  labelEn: string;
  icon: string;
}

const PHASES: PhaseInfo[] = [
  { id: 1, labelRo: 'Identificare', labelEn: 'Identification', icon: '🎯' },
  { id: 2, labelRo: 'Investigare', labelEn: 'Investigation', icon: '🔍' },
  { id: 3, labelRo: 'Clarificare', labelEn: 'Clarification', icon: '💡' },
  { id: 4, labelRo: 'Transformare', labelEn: 'Transformation', icon: '⚡' },
  { id: 5, labelRo: 'Acțiune', labelEn: 'Action', icon: '🚀' },
];

interface PhaseIndicatorProps {
  currentPhase: TransformationPhase;
  language?: 'ro' | 'en';
  compact?: boolean;
}

export function PhaseIndicator({ 
  currentPhase, 
  language = 'ro',
  compact = false
}: PhaseIndicatorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {PHASES.map((phase, index) => (
          <div
            key={phase.id}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              phase.id < currentPhase 
                ? "bg-green-500" 
                : phase.id === currentPhase 
                  ? "bg-primary animate-pulse" 
                  : "bg-muted"
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {language === 'ro' ? PHASES[currentPhase - 1].labelRo : PHASES[currentPhase - 1].labelEn}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => (
          <React.Fragment key={phase.id}>
            {/* Phase circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all text-lg",
                  phase.id < currentPhase 
                    ? "bg-green-500 text-white" 
                    : phase.id === currentPhase 
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                      : "bg-muted text-muted-foreground"
                )}
              >
                {phase.id < currentPhase ? (
                  <Check className="w-5 h-5" />
                ) : (
                  phase.icon
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 text-center max-w-[60px]",
                phase.id === currentPhase ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {language === 'ro' ? phase.labelRo : phase.labelEn}
              </span>
            </div>
            
            {/* Connector line */}
            {index < PHASES.length - 1 && (
              <div 
                className={cn(
                  "flex-1 h-1 mx-1 rounded transition-all",
                  phase.id < currentPhase ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function getPhaseFromMessageCount(messageCount: number): TransformationPhase {
  // 8-message Tony Robbins breakthrough flow (one question per message):
  // msg 0-1: Phase 1A (Diagnoză — diagnostic question)
  // msg 2-3: Phase 1B (Pattern confirmation)
  // msg 4-5: Phase 2A (Leverage: ce PIERZI)
  // msg 6-7: Phase 2B (Leverage: ce CÂȘTIGI)
  // msg 8-9: Phase 2C (Alegerea) + Phase 3 Power Move
  // msg 10-11: Phase 4 Power Question
  // msg 12+: Phase 5 HIT List
  if (messageCount <= 3) return 1;   // 1A + 1B
  if (messageCount <= 9) return 2;   // 2A + 2B + 2C (Leverage)
  if (messageCount <= 11) return 3;  // Power Move
  if (messageCount <= 13) return 4;  // Power Question
  return 5;                           // HIT List action
}
