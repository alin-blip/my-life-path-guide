import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Radio } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceInputButtonProps {
  isConnected: boolean;
  isMicOn: boolean;
  isAISpeaking: boolean;
  onToggle: () => void;
  variant?: 'compact' | 'full';
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isConnected,
  isMicOn,
  isAISpeaking,
  onToggle,
  variant = 'compact',
  disabled = false
}) => {
  const getTooltipText = () => {
    if (!isConnected) return 'Start voice input';
    if (isAISpeaking) return 'AI is speaking...';
    if (isMicOn) return 'Stop voice input';
    return 'Voice connected';
  };

  const getButtonClasses = () => {
    if (isAISpeaking) {
      return 'bg-green-500 hover:bg-green-600 animate-pulse';
    }
    if (isMicOn) {
      return 'bg-red-500 hover:bg-red-600';
    }
    if (isConnected) {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    return 'bg-primary hover:bg-primary/90';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onToggle}
            disabled={disabled}
            className={`${variant === 'compact' ? 'h-12 w-12 p-0' : 'h-10'} ${getButtonClasses()} transition-all`}
            type="button"
          >
            {isAISpeaking ? (
              <Radio className="w-5 h-5 text-white" />
            ) : isMicOn ? (
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
            {variant === 'full' && (
              <span className="ml-2 text-white">
                {!isConnected ? 'Voice' : isAISpeaking ? 'AI Speaking' : isMicOn ? 'Listening' : 'Connected'}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
