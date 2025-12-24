import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic2, User, UserRound } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VoiceSelectorProps {
  currentVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'feminine' | 'masculine';
  description?: string;
}

const AVAILABLE_VOICES: VoiceOption[] = [
  // Feminine voices
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'feminine', description: 'Caldă și prietenoasă' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'feminine', description: 'Blândă și calmă' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'feminine', description: 'Profesională' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'feminine', description: 'Energică' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'feminine', description: 'Tânără și dinamică' },
  
  // Masculine voices
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'masculine', description: 'Autoritar și clar' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'masculine', description: 'Cald și prietenos' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'masculine', description: 'Calm și relaxat' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'masculine', description: 'Profesional' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'masculine', description: 'Tânăr și energic' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  currentVoice,
  onVoiceChange,
  disabled = false,
  compact = false
}) => {
  const currentVoiceData = AVAILABLE_VOICES.find(v => v.id === currentVoice) || AVAILABLE_VOICES[0];
  const feminineVoices = AVAILABLE_VOICES.filter(v => v.gender === 'feminine');
  const masculineVoices = AVAILABLE_VOICES.filter(v => v.gender === 'masculine');

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
                className={cn(
                  "gap-1.5",
                  compact ? "h-7 px-2 min-w-[70px]" : "h-8 min-w-[90px]"
                )}
              >
                {currentVoiceData.gender === 'feminine' ? (
                  <User className="h-3.5 w-3.5 text-pink-500" />
                ) : (
                  <UserRound className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span className={cn(
                  "font-medium",
                  compact ? "text-[10px]" : "text-xs"
                )}>
                  {currentVoiceData.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Mic2 className="h-4 w-4" />
              Selectează Vocea AI
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Feminine Voices */}
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-pink-500">
              <User className="h-3 w-3" />
              Voci Feminine
            </DropdownMenuLabel>
            {feminineVoices.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onVoiceChange(voice.id)}
                className={cn(
                  "flex justify-between cursor-pointer",
                  currentVoice === voice.id && 'bg-accent'
                )}
              >
                <span>{voice.name}</span>
                <span className="text-xs text-muted-foreground">{voice.description}</span>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {/* Masculine Voices */}
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-blue-500">
              <UserRound className="h-3 w-3" />
              Voci Masculine
            </DropdownMenuLabel>
            {masculineVoices.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onVoiceChange(voice.id)}
                className={cn(
                  "flex justify-between cursor-pointer",
                  currentVoice === voice.id && 'bg-accent'
                )}
              >
                <span>{voice.name}</span>
                <span className="text-xs text-muted-foreground">{voice.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <TooltipContent>
          <p className="text-xs font-medium">Voce: {currentVoiceData.name}</p>
          <p className="text-xs text-muted-foreground">{currentVoiceData.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Export default voice for convenience
export const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah
