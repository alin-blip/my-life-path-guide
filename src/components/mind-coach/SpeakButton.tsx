import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
  isRecording: boolean;
  isProcessing?: boolean;
  disabled?: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  language?: 'ro' | 'en';
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  isRecording,
  isProcessing = false,
  disabled = false,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
  language = 'ro',
  className
}) => {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent mouse events from also firing
    onTouchStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onTouchEnd();
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="lg"
      disabled={disabled || isProcessing}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative flex items-center gap-2 transition-all select-none",
        isRecording && "bg-destructive hover:bg-destructive animate-pulse ring-2 ring-destructive/50",
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <Mic className="h-5 w-5" />
      ) : (
        <MicOff className="h-5 w-5" />
      )}
      
      <span className="hidden sm:inline">
        {isRecording 
          ? (language === 'ro' ? 'Vorbesc...' : 'Speaking...')
          : (language === 'ro' ? 'Apasă și vorbește' : 'Hold to speak')
        }
      </span>
      <span className="sm:hidden">
        {language === 'ro' ? 'Voce' : 'Voice'}
      </span>

      {/* Recording indicator */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
        </span>
      )}
    </Button>
  );
};
