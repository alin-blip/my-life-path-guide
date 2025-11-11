import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VoiceSelectorProps {
  currentVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
}

const AVAILABLE_VOICES = [
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  currentVoice,
  onVoiceChange,
  disabled = false
}) => {
  const currentVoiceName = AVAILABLE_VOICES.find(v => v.id === currentVoice)?.name || 'Lily';

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="h-8 gap-1.5 min-w-[90px]"
              >
                <Mic2 className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{currentVoiceName}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end">
            {AVAILABLE_VOICES.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onVoiceChange(voice.id)}
                className={currentVoice === voice.id ? 'bg-accent' : ''}
              >
                {voice.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p className="text-xs">Vocea AI: {currentVoiceName}</p>
          <p className="text-xs text-muted-foreground">Click pentru a schimba</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
