import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { cn } from '@/lib/utils';

interface VoiceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  language?: 'en' | 'ro';
  autoSubmit?: boolean;
  onAutoSubmit?: () => void;
}

export const VoiceTextarea: React.FC<VoiceTextareaProps> = ({
  value,
  onChange,
  language = 'ro',
  autoSubmit = false,
  onAutoSubmit,
  className,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  const {
    isListening,
    transcript,
    toggleListening,
    resetTranscript,
    isSupported
  } = useVoiceToText({
    language,
    autoSubmit,
    onAutoSubmit,
    onTranscript: (text) => {
      const newValue = localValue ? localValue + ' ' + text : text;
      setLocalValue(newValue);
      
      // Trigger onChange event
      const syntheticEvent = {
        target: { value: newValue },
        currentTarget: { value: newValue }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
    }
  });

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChange(e);
  };

  const handleMicClick = () => {
    if (isListening) {
      toggleListening();
    } else {
      resetTranscript();
      toggleListening();
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Textarea
        {...props}
        value={localValue}
        onChange={handleTextChange}
        className={cn("flex-1", className)}
      />
      {isSupported && (
        <Button
          type="button"
          variant={isListening ? "default" : "outline"}
          size="icon"
          onClick={handleMicClick}
          className={cn(
            "h-10 w-10 shrink-0",
            isListening && "animate-pulse bg-red-500 hover:bg-red-600"
          )}
          title={isListening ? "Stop Recording" : "Start Voice Input"}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
