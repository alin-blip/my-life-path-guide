import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Phone, Paperclip, X } from 'lucide-react';
import { SpeakButton } from './SpeakButton';
import { CallModeOverlay } from './CallModeOverlay';
import { QuickAnswerSuggestions } from './QuickAnswerSuggestions';
import { CoachingCluster } from '@/lib/mind-coach-clusters';
import type { TransformationPhase } from './PhaseIndicator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MindCoachInputBarProps {
  // Text input
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  
  // Loading states
  isLoading: boolean;
  isComplete: boolean;
  
  // Speak mode (push-to-talk)
  isSpeaking: boolean;
  onSpeakStart: () => void;
  onSpeakStop: () => void;
  
  // Call mode
  isInCall: boolean;
  isAISpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isTTSLoading?: boolean;
  currentTranscript: string;
  silenceTimer: number;
  audioLevel: number;
  onCallToggle: () => void;
  onSkipAI: () => void;
  onManualSend: () => void;
  
  // Quick answers
  cluster?: CoachingCluster | null;
  phase?: TransformationPhase;
  messageCount?: number;
  showQuickAnswers?: boolean;
  
  // Language
  language?: 'ro' | 'en';
}

export const MindCoachInputBar: React.FC<MindCoachInputBarProps> = ({
  value,
  onChange,
  onSend,
  placeholder,
  isLoading,
  isComplete,
  isSpeaking,
  onSpeakStart,
  onSpeakStop,
  isInCall,
  isAISpeaking,
  isListening,
  isProcessing,
  isTTSLoading = false,
  currentTranscript,
  silenceTimer,
  audioLevel,
  onCallToggle,
  onSkipAI,
  onManualSend,
  cluster,
  phase = 1,
  messageCount = 0,
  showQuickAnswers = false,
  language = 'ro'
}) => {
  // Handle quick answer selection
  const handleQuickAnswer = (answer: string) => {
    onChange(answer);
    // Auto-send after a short delay
    setTimeout(() => {
      onSend();
    }, 100);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const isDisabled = isLoading || isComplete || isInCall;

  return (
    <div className="space-y-3">
      {/* Call mode overlay - replaces normal input when in call */}
      {isInCall && (
        <CallModeOverlay
          isActive={isInCall}
          isAISpeaking={isAISpeaking}
          isListening={isListening}
          isProcessing={isProcessing}
          isTTSLoading={isTTSLoading}
          currentTranscript={currentTranscript}
          silenceTimer={silenceTimer}
          audioLevel={audioLevel}
          onSkipAI={onSkipAI}
          onManualSend={onManualSend}
          onEndCall={onCallToggle}
          language={language}
        />
      )}

      {/* Normal input mode */}
      {!isInCall && (
        <>
          {/* Quick answer suggestions — phase-aware */}
          <QuickAnswerSuggestions
            cluster={cluster || null}
            phase={phase}
            messageCount={messageCount}
            language={language}
            onSelect={handleQuickAnswer}
            isVisible={showQuickAnswers && !value.trim() && !isLoading}
          />
          
          {/* Text input row */}
          <div className="flex gap-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || (language === 'ro' ? 'Scrie aici...' : 'Type here...')}
              className="min-h-[44px] max-h-[120px] resize-none"
              disabled={isDisabled}
            />
            <Button
              onClick={onSend}
              disabled={!value.trim() || isLoading || isComplete}
              size="icon"
              className="shrink-0 h-[44px] w-[44px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Voice buttons row */}
          <div className="flex gap-2">
            <SpeakButton
              isRecording={isSpeaking}
              disabled={isDisabled}
              onMouseDown={onSpeakStart}
              onMouseUp={onSpeakStop}
              onTouchStart={onSpeakStart}
              onTouchEnd={onSpeakStop}
              language={language}
              className="flex-1"
            />
            
            <Button
              variant="outline"
              size="lg"
              onClick={onCallToggle}
              disabled={isComplete}
              className={cn(
                "flex-1 flex items-center gap-2",
                isInCall && "bg-primary text-primary-foreground"
              )}
            >
              <Phone className="h-5 w-5" />
              <span className="hidden sm:inline">
                {language === 'ro' ? 'Conversație vocală' : 'Voice call'}
              </span>
              <span className="sm:hidden">
                {language === 'ro' ? 'Apel' : 'Call'}
              </span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
