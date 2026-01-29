import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, SkipForward, Volume2, Mic, Loader2, Send } from 'lucide-react';
import { AudioWaveform } from '@/components/stack/voice/AudioWaveform';
import { SilenceCountdown } from '@/components/stack/voice/SilenceCountdown';
import { cn } from '@/lib/utils';

interface CallModeOverlayProps {
  isActive: boolean;
  isAISpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isTTSLoading?: boolean;
  currentTranscript: string;
  silenceTimer: number;
  audioLevel: number;
  onSkipAI: () => void;
  onManualSend: () => void;
  onEndCall: () => void;
  language?: 'ro' | 'en';
}

export const CallModeOverlay: React.FC<CallModeOverlayProps> = ({
  isActive,
  isAISpeaking,
  isListening,
  isProcessing,
  isTTSLoading = false,
  currentTranscript,
  silenceTimer,
  audioLevel,
  onSkipAI,
  onManualSend,
  onEndCall,
  language = 'ro'
}) => {
  if (!isActive) return null;

  const getStatusText = () => {
    if (isTTSLoading) {
      return language === 'ro' ? 'Se generează răspunsul...' : 'Generating response...';
    }
    if (isAISpeaking) {
      return language === 'ro' ? 'Coach-ul vorbește...' : 'Coach is speaking...';
    }
    if (isProcessing) {
      return language === 'ro' ? 'Se procesează...' : 'Processing...';
    }
    if (isListening) {
      return language === 'ro' ? 'Te ascult...' : 'Listening...';
    }
    return language === 'ro' ? 'Pregătit...' : 'Ready...';
  };

  return (
    <div className="bg-gradient-to-b from-primary/5 to-muted/30 rounded-xl border p-4 space-y-4">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isAISpeaking ? "bg-green-500 animate-pulse" : 
            isListening ? "bg-primary animate-pulse" : 
            isProcessing || isTTSLoading ? "bg-yellow-500 animate-pulse" : 
            "bg-muted"
          )} />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {/* Phone indicator */}
        <div className="flex items-center gap-1 text-primary">
          <Phone className="h-4 w-4" />
          <span className="text-xs">
            {language === 'ro' ? 'În apel' : 'In call'}
          </span>
        </div>
      </div>

      {/* AI Speaking state */}
      {(isAISpeaking || isTTSLoading) && (
        <div className="flex items-center gap-3 bg-green-500/10 rounded-lg p-3">
          <Volume2 className={cn(
            "h-6 w-6 text-green-500",
            isAISpeaking && "animate-pulse"
          )} />
          
          <div className="flex-1">
            <AudioWaveform 
              audioLevel={isAISpeaking ? 0.6 : 0.2}
              isActive={isAISpeaking}
              variant="ai"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipAI}
            className="shrink-0"
            disabled={isTTSLoading}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>
      )}

      {/* Listening state */}
      {isListening && !isAISpeaking && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
            <Mic className="h-6 w-6 text-primary animate-pulse" />
            
            <div className="flex-1">
              <AudioWaveform 
                audioLevel={audioLevel}
                isActive={isListening}
                variant="user"
              />
            </div>
            
            {/* Silence countdown */}
            <SilenceCountdown
              seconds={silenceTimer}
              maxSeconds={3}
              onManualSend={onManualSend}
            />
          </div>

          {/* Live transcript */}
          {currentTranscript && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm italic text-muted-foreground">
                "{currentTranscript}"
              </p>
            </div>
          )}

          {/* Manual send button */}
          {currentTranscript && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onManualSend}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Trimite acum' : 'Send now'}
            </Button>
          )}
        </div>
      )}

      {/* Processing state */}
      {isProcessing && !isAISpeaking && !isListening && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {language === 'ro' ? 'Coach-ul gândește...' : 'Coach is thinking...'}
          </span>
        </div>
      )}

      {/* End call button */}
      <Button
        variant="destructive"
        onClick={onEndCall}
        className="w-full"
      >
        <PhoneOff className="h-4 w-4 mr-2" />
        {language === 'ro' ? 'Închide apelul' : 'End call'}
      </Button>
    </div>
  );
};
