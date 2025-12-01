import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Radio } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VoiceWaveform } from './VoiceWaveform';
import { haptic } from '@/utils/hapticFeedback';

interface VoiceInputButtonProps {
  isConnected: boolean;
  isMicOn: boolean;
  isAISpeaking: boolean;
  isUserSpeaking?: boolean;
  audioLevel?: number;
  onToggle: () => void;
  variant?: 'compact' | 'full';
  disabled?: boolean;
  showWaveform?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isConnected,
  isMicOn,
  isAISpeaking,
  isUserSpeaking = false,
  audioLevel = 0,
  onToggle,
  variant = 'compact',
  disabled = false,
  showWaveform = true
}) => {
  // Haptic feedback when AI starts speaking
  useEffect(() => {
    if (isAISpeaking) {
      haptic.success();
    }
  }, [isAISpeaking]);

  // Haptic feedback when user starts speaking
  useEffect(() => {
    if (isUserSpeaking) {
      haptic.light();
    }
  }, [isUserSpeaking]);

  const handleToggle = () => {
    // Trigger haptic based on action
    if (!isConnected) {
      haptic.medium(); // Starting connection
    } else {
      haptic.light(); // Stopping connection
    }
    
    onToggle();
  };

  const getTooltipText = () => {
    if (!isConnected) return 'Apasă pentru a vorbi (voice input)';
    if (isAISpeaking) return 'AI vorbește...';
    if (isMicOn) return 'Vorbește acum - apasă pentru a opri';
    return 'Microfon conectat';
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
    <div className="flex items-center gap-2">
      {/* Waveform visualization */}
      {showWaveform && isConnected && (
        <VoiceWaveform
          audioLevel={audioLevel}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
          variant="inline"
          width={120}
          height={40}
        />
      )}
      
      {/* Voice button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggle}
              disabled={disabled}
              className={`${variant === 'compact' ? 'h-12 w-12 p-0' : 'h-10'} ${getButtonClasses()} transition-all relative overflow-hidden`}
              type="button"
            >
              {/* Pulsing ring when user is speaking */}
              {isUserSpeaking && (
                <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
              )}
              
              {/* Icon */}
              <div className="relative z-10">
                {isAISpeaking ? (
                  <Radio className="w-5 h-5 text-white" />
                ) : isMicOn ? (
                  <Mic className="w-5 h-5 text-white" />
                ) : (
                  <MicOff className="w-5 h-5 text-white" />
                )}
              </div>
              
              {variant === 'full' && (
                <span className="ml-2 text-white relative z-10">
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
    </div>
  );
};
