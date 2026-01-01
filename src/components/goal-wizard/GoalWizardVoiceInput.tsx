import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send, Keyboard, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface GoalWizardVoiceInputProps {
  onSend: (text: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  transcript: string;
  disabled?: boolean;
  voiceLanguage: 'ro-RO' | 'en-US';
  onChangeLanguage: (lang: 'ro-RO' | 'en-US') => void;
}

export const GoalWizardVoiceInput: React.FC<GoalWizardVoiceInputProps> = ({
  onSend,
  isListening,
  onToggleMic,
  transcript,
  disabled,
  voiceLanguage,
  onChangeLanguage
}) => {
  const { language } = useLanguage();
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');

  const handleSendText = () => {
    if (textInput.trim()) {
      onSend(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant={inputMode === 'voice' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('voice')}
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          {language === 'en' ? 'Voice' : 'Voce'}
        </Button>
        <Button
          variant={inputMode === 'text' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('text')}
          className="gap-2"
        >
          <Keyboard className="w-4 h-4" />
          {language === 'en' ? 'Text' : 'Text'}
        </Button>
      </div>

      {inputMode === 'voice' ? (
        <div className="flex flex-col items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={voiceLanguage === 'ro-RO' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onChangeLanguage('ro-RO')}
            >
              🇷🇴 RO
            </Button>
            <Button
              variant={voiceLanguage === 'en-US' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onChangeLanguage('en-US')}
            >
              🇺🇸 EN
            </Button>
          </div>

          {/* Microphone Button */}
          <button
            onClick={onToggleMic}
            disabled={disabled}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all",
              "focus:outline-none focus:ring-4 focus:ring-primary/30",
              isListening 
                ? "bg-destructive text-destructive-foreground animate-pulse" 
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {isListening ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>

          <p className="text-sm text-muted-foreground text-center">
            {isListening 
              ? (language === 'en' ? 'Listening... Tap to stop' : 'Ascult... Apasă pentru a opri')
              : (language === 'en' ? 'Tap to speak' : 'Apasă pentru a vorbi')
            }
          </p>

          {/* Show transcript */}
          {transcript && (
            <div className="w-full p-3 bg-muted rounded-lg">
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'en' ? 'Type your answer...' : 'Scrie răspunsul tău...'}
            className="resize-none"
            rows={2}
            disabled={disabled}
          />
          <Button
            size="icon"
            onClick={handleSendText}
            disabled={disabled || !textInput.trim()}
            className="h-auto aspect-square"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
