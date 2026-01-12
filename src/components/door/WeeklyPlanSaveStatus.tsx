import React from 'react';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface WeeklyPlanSaveStatusProps {
  status: SaveStatus;
  lastSaveTime?: Date | null;
  className?: string;
}

export const WeeklyPlanSaveStatus: React.FC<WeeklyPlanSaveStatusProps> = ({
  status,
  lastSaveTime,
  className
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Salvare...',
          color: 'text-yellow-500'
        };
      case 'saved':
        return {
          icon: <Check className="w-3 h-3" />,
          text: lastSaveTime ? `Salvat ${lastSaveTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}` : 'Salvat',
          color: 'text-green-500'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Eroare salvare',
          color: 'text-red-500'
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-3 h-3" />,
          text: 'Salvat local',
          color: 'text-amber-500'
        };
      case 'idle':
      default:
        return {
          icon: <Cloud className="w-3 h-3" />,
          text: 'Sincronizat',
          color: 'text-muted-foreground'
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs transition-colors",
      display.color,
      className
    )}>
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
};
