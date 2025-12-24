import React from 'react';
import { cn } from '@/lib/utils';

interface SilenceCountdownProps {
  seconds: number;
  maxSeconds: number;
  onManualSend?: () => void;
  className?: string;
}

export const SilenceCountdown: React.FC<SilenceCountdownProps> = ({
  seconds,
  maxSeconds,
  onManualSend,
  className
}) => {
  const progress = 1 - (seconds / maxSeconds);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <button
      onClick={onManualSend}
      className={cn(
        'relative w-12 h-12 flex items-center justify-center',
        'hover:scale-105 transition-transform cursor-pointer',
        'group',
        className
      )}
      title="Click pentru a trimite acum"
    >
      {/* Background ring */}
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/30"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-100"
        />
      </svg>

      {/* Center text */}
      <span className={cn(
        'text-xs font-bold',
        seconds <= 1 ? 'text-destructive' : 'text-foreground'
      )}>
        {seconds > 0 ? seconds.toFixed(1) : '→'}
      </span>

      {/* Pulse effect when about to send */}
      {seconds <= 1 && seconds > 0 && (
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      )}
    </button>
  );
};