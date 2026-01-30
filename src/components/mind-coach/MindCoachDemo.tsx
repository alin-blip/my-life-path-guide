import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, RotateCcw, Mic, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { LeadMagnetEmotionPicker, LeadMagnetProblem, getProblemInfo } from './LeadMagnetEmotionPicker';
import { useMindCoachDemo } from '@/hooks/useMindCoachDemo';
import { useDemoTextToSpeech } from '@/hooks/useDemoTextToSpeech';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { BreakthroughOverlay } from './BreakthroughOverlay';

interface MindCoachDemoProps {
  onComplete?: (breakthrough: any) => void;
  language?: 'ro' | 'en';
}

export function MindCoachDemo({
  onComplete,
  language = 'ro',
}: MindCoachDemoProps) {
  const [step, setStep] = useState<'problem' | 'chat'>('problem');
  const [selectedProblem, setSelectedProblem] = useState<LeadMagnetProblem | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [showBreakthrough, setShowBreakthrough] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeakHeld, setIsSpeakHeld] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isComplete,
    breakthroughData,
    startSession,
    sendMessage,
    resetSession,
  } = useMindCoachDemo({
    onComplete: (data) => {
      setShowBreakthrough(true);
      onComplete?.(data);
    },
    onAIResponse: (text) => {
      setLastAIResponse(text);
    },
  });

  // Demo TTS (no auth required)
  const tts = useDemoTextToSpeech({
    onSpeakingStart: () => console.log('🎵 TTS started'),
    onSpeakingEnd: () => console.log('🎵 TTS ended'),
    initialPlaybackRate: 1.15,
  });

  // Voice input for speak mode
  const accumulatedTextRef = useRef('');
  const voiceInput = useVoiceInput({
    onTranscript: (text) => {
      accumulatedTextRef.current += ' ' + text;
    },
    onMicStop: () => {
      const finalText = accumulatedTextRef.current.trim();
      if (finalText) {
        sendMessage(finalText);
        accumulatedTextRef.current = '';
      }
    },
    voiceLanguage: language === 'ro' ? 'ro-RO' : 'en-US',
    enabled: true,
  });

  // Speak AI response when voice mode is on
  useEffect(() => {
    if (lastAIResponse && isVoiceMode && !isLoading) {
      tts.speak(lastAIResponse);
    }
  }, [lastAIResponse, isVoiceMode, isLoading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show breakthrough overlay when complete
  useEffect(() => {
    if (isComplete && breakthroughData) {
      setShowBreakthrough(true);
    }
  }, [isComplete, breakthroughData]);

  // Handle problem selection
  const handleProblemSelect = (problem: LeadMagnetProblem) => {
    setSelectedProblem(problem);
    // Start session immediately with fixed intensity of 7
    startSession(problem as any, 7);
    setStep('chat');
  };

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isLoading, sendMessage]);

  // Handle speak button press/release
  const handleSpeakStart = useCallback(() => {
    setIsSpeakHeld(true);
    accumulatedTextRef.current = '';
    voiceInput.startVoice();
  }, [voiceInput]);

  const handleSpeakStop = useCallback(() => {
    setIsSpeakHeld(false);
    voiceInput.stopVoice();
  }, [voiceInput]);

  // Toggle voice mode (auto-speak AI responses)
  const toggleVoiceMode = useCallback(() => {
    if (isVoiceMode) {
      tts.stop();
    }
    setIsVoiceMode(!isVoiceMode);
  }, [isVoiceMode, tts]);

  // Handle restart
  const handleRestart = () => {
    resetSession();
    tts.stop();
    setStep('problem');
    setSelectedProblem(null);
    setIsVoiceMode(false);
    setShowBreakthrough(false);
  };

  // Handle breakthrough continue (navigate to signup)
  const handleBreakthroughContinue = () => {
    // Navigate to challenge signup
    window.location.href = '/challenge-7-zile';
  };

  // Render problem selection step
  if (step === 'problem') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl justify-center">
            <Brain className="h-6 w-6 text-primary" />
            Mind Coach
          </CardTitle>
          <p className="text-muted-foreground text-sm text-center mt-2">
            {language === 'ro' ? 'Transformă blocajele în acțiune' : 'Transform blocks into action'}
          </p>
        </CardHeader>
        <CardContent>
          <LeadMagnetEmotionPicker
            selectedProblem={selectedProblem}
            onSelect={handleProblemSelect}
            language={language}
          />
        </CardContent>
      </Card>
    );
  }

  // Render chat step
  const problemInfo = selectedProblem ? getProblemInfo(selectedProblem) : null;

  // Opening messages for each problem
  const openingMessages: Record<LeadMagnetProblem, string> = {
    frustration: 'Văd că te simți frustrat. Care e situația concretă care te-a adus în acest punct?',
    anxiety: 'Simt că anxietatea te apasă acum. Care e cel mai mare "dar dacă" care îți trece prin minte?',
    procrastination: 'Observ că amâni lucruri importante. Ce te oprește să începi chiar acum?',
    fear: 'Văd că frica te ține pe loc. De ce ți-e frică cel mai tare acum?',
  };

  return (
    <>
      <Card className="flex flex-col h-[500px] md:h-[550px] bg-gradient-to-br from-background via-background to-primary/5 border-0">
        {/* Header */}
        <CardHeader className="pb-2 border-b border-primary/10 shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{problemInfo?.emoji}</span>
              <span className="text-sm font-medium text-foreground">
                {problemInfo?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice mode toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceMode}
                className={cn(
                  "hover:bg-primary/10",
                  isVoiceMode && "text-primary bg-primary/10"
                )}
              >
                {isVoiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRestart} className="hover:bg-primary/10">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* Welcome message */}
            {messages.length === 0 && selectedProblem && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-sm border border-primary/10 animate-fade-in">
                <p className="text-muted-foreground leading-relaxed">
                  {openingMessages[selectedProblem]}
                </p>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex animate-fade-in",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl p-3 text-sm",
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-muted/80 border border-border/50'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/80 rounded-xl p-3 border border-border/50">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t border-primary/10 shrink-0 bg-gradient-to-t from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            {/* Speak button (push-to-talk) */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "shrink-0 transition-all",
                isSpeakHeld && "bg-red-500/20 border-red-500 text-red-500"
              )}
              onMouseDown={handleSpeakStart}
              onMouseUp={handleSpeakStop}
              onMouseLeave={handleSpeakStop}
              onTouchStart={handleSpeakStart}
              onTouchEnd={handleSpeakStop}
              disabled={isLoading}
            >
              <Mic className={cn("h-4 w-4", isSpeakHeld && "animate-pulse")} />
            </Button>

            {/* Text input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Scrie aici..."
              className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isLoading || isComplete}
            />

            {/* Send button */}
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || isComplete}
              className="shrink-0"
            >
              Trimite
            </Button>
          </div>
        </div>
      </Card>

      {/* Breakthrough overlay */}
      <BreakthroughOverlay
        isVisible={showBreakthrough}
        breakthroughData={breakthroughData ? {
          emotionBefore: problemInfo?.label || breakthroughData.emotionBefore,
          emotionAfter: breakthroughData.emotionAfter || 'Claritate',
          insight: breakthroughData.insight,
          actionCommitted: breakthroughData.actionCommitted,
        } : undefined}
        onContinue={handleBreakthroughContinue}
        language={language}
      />
    </>
  );
}
