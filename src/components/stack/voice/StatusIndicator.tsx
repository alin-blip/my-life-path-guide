import React from 'react';
import { cn } from '@/lib/utils';
import { Volume2, Mic, Loader2, Circle } from 'lucide-react';

type Status = 'idle' | 'listening' | 'ai-speaking' | 'processing';

interface StatusIndicatorProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { icon: React.ElementType; label: string; color: string; pulse: boolean }> = {
  'idle': {
    icon: Circle,
    label: 'Gata',
    color: 'text-muted-foreground',
    pulse: false
  },
  'listening': {
    icon: Mic,
    label: 'Ascult...',
    color: 'text-destructive',
    pulse: true
  },
  'ai-speaking': {
    icon: Volume2,
    label: 'AI vorbește...',
    color: 'text-green-500',
    pulse: true
  },
  'processing': {
    icon: Loader2,
    label: 'Procesez...',
    color: 'text-yellow-500',
    pulse: false
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full',
      'bg-background/80 backdrop-blur-sm border',
      className
    )}>
      <div className="relative">
        <Icon className={cn(
          'w-4 h-4',
          config.color,
          status === 'processing' && 'animate-spin'
        )} />
        {config.pulse && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            status === 'listening' && 'bg-destructive',
            status === 'ai-speaking' && 'bg-green-500'
          )} />
        )}
      </div>
      <span className={cn('text-xs font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
};