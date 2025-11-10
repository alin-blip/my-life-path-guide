import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { VoiceInputButton } from '@/components/stack/VoiceInputButton';
import { VoiceLanguageToggle } from '@/components/stack/VoiceLanguageToggle';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceEnabledInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

export const VoiceEnabledInput: React.FC<VoiceEnabledInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Tastează sau vorbește... (Enter pentru salvare)",
  autoFocus = false,
  className = "",
  onBlur,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTranscriptRef = useRef<string>('');

  const {
    isConnected,
    isMicOn,
    isUserSpeaking,
    voiceLanguage,
    changeVoiceLanguage,
    toggleMic
  } = useVoiceInput({
    onTranscript: (text) => {
      if (text && text !== lastTranscriptRef.current) {
        lastTranscriptRef.current = text;
        onChange(value ? `${value} ${text}` : text);
      }
    },
    onMicStop: () => {
      // Auto-submit când se oprește microfonul dacă există conținut și onSubmit este definit
      if (value.trim() && onSubmit) {
        setTimeout(() => {
          onSubmit();
        }, 300);
      }
    },
    enabled: !disabled
  });

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        onBlur={onBlur}
        placeholder={isUserSpeaking ? "🎤 Vorbești..." : placeholder}
        disabled={disabled}
        className={`pr-20 ${isUserSpeaking ? 'ring-2 ring-blue-500' : ''} ${className}`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        <VoiceLanguageToggle 
          currentLanguage={voiceLanguage}
          onLanguageChange={changeVoiceLanguage}
          disabled={isConnected}
        />
        <VoiceInputButton 
          isMicOn={isMicOn}
          isConnected={isConnected}
          isAISpeaking={false}
          isUserSpeaking={isUserSpeaking}
          audioLevel={0}
          onToggle={toggleMic}
          variant="compact"
        />
      </div>
    </div>
  );
};
