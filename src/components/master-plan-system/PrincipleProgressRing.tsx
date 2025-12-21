import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PrincipleProgressRingProps {
  messageCount: number;
  isCompleted?: boolean;
  size?: number;
}

export const PrincipleProgressRing: React.FC<PrincipleProgressRingProps> = ({
  messageCount,
  isCompleted = false,
  size = 80
}) => {
  // Calculate progress based on message count
  // Optimal conversation: 8+ messages (4+ exchanges) = 100%
  const minMessages = 2; // Minimum to complete
  const optimalMessages = 8; // Ideal conversation depth
  
  const progress = Math.min(100, Math.max(0, 
    ((messageCount - minMessages) / (optimalMessages - minMessages)) * 100
  ));

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (isCompleted) return 'hsl(var(--primary))';
    if (progress >= 75) return 'hsl(142 76% 36%)'; // green
    if (progress >= 50) return 'hsl(47 96% 53%)'; // yellow
    return 'hsl(var(--muted-foreground))'; // gray
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isCompleted ? (
          <CheckCircle2 className="w-8 h-8 text-primary" />
        ) : (
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {messageCount} msg
            </div>
          </div>
        )}
      </div>
    </div>
  );
};