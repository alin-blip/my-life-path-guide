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
  // Estimate phase based on conversation length
  // Phase 1: messages 0-2
  // Phase 2: messages 3-5
  // Phase 3: messages 6-8
  // Phase 4: messages 9-10
  // Phase 5: messages 11+
  if (messageCount <= 2) return 1;
  if (messageCount <= 5) return 2;
  if (messageCount <= 8) return 3;
  if (messageCount <= 10) return 4;
  return 5;
}
