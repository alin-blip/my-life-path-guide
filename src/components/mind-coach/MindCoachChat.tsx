import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, RotateCcw, ArrowLeft, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo } from './ExtendedEmotionPicker';
import { getClusterForEmotion, getClusterOpeningMessage } from '@/lib/mind-coach-clusters';
import { PhaseIndicator } from './PhaseIndicator';
import { FrameworkBadge } from './FrameworkBadge';
import { BreakthroughCelebration } from './BreakthroughCelebration';
import { ContinueMindsetDialog } from './ContinueMindsetDialog';
import { MindCoachInputBar } from './MindCoachInputBar';
import { PowerBodyAnimation } from './PowerBodyAnimation';
import { useMindCoach } from '@/hooks/useMindCoach';
import { useMindCoachVoice } from '@/hooks/useMindCoachVoice';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
interface MindCoachChatProps {
  initialEmotion?: MindCoachEmotion;
  initialIntensity?: number;
  onComplete?: (breakthrough: any) => void;
  onAddToHitList?: (task: string) => void;
  onAddHabit?: (name: string, category: string) => void;
  onBack?: () => void;
  embedded?: boolean;
  language?: 'ro' | 'en';
  // Navigation buttons for embedded mode (Champion Routine)
  showNavigationButtons?: boolean;
  onContinueRoutine?: () => void;
  onNewSession?: () => void;
}

export function MindCoachChat({
  initialEmotion,
  initialIntensity = 5,
  onComplete,
  onAddToHitList,
  onAddHabit,
  onBack,
  embedded = false,
  language = 'ro',
  showNavigationButtons = false,
  onContinueRoutine,
  onNewSession,
}: MindCoachChatProps) {
  const [step, setStep] = useState<'emotion' | 'intensity' | 'chat'>(
    initialEmotion ? 'intensity' : 'emotion'
  );
  const [selectedEmotion, setSelectedEmotion] = useState<MindCoachEmotion | null>(
    initialEmotion || null
  );
  const [selectedIntensity, setSelectedIntensity] = useState(initialIntensity);
  const [inputValue, setInputValue] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [showChatContent, setShowChatContent] = useState(true);
  
  // Determine current cluster for quick answers
  const currentCluster = selectedEmotion ? getClusterForEmotion(selectedEmotion) : null;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice integration - needs to be declared before useMindCoach to use speakAIResponse
  const voiceRef = useRef<{ speakAIResponse: (text: string) => void } | null>(null);

  const handleAIResponse = useCallback((text: string) => {
    // Speak AI response if in call mode
    if (voiceRef.current) {
      voiceRef.current.speakAIResponse(text);
    }
  }, []);

  const {
    messages,
    isLoading,
    currentPhase,
    isComplete,
    breakthroughData,
    startSession,
    sendMessage,
    resetSession,
  } = useMindCoach({
    onAddToHitList,
    onAddHabit,
    onComplete,
    onAIResponse: handleAIResponse,
  });

  // Voice hook for Speak and Call modes
  const voice = useMindCoachVoice({
    onUserMessage: (text) => {
      if (text.trim()) {
        sendMessage(text.trim());
      }
    },
    language,
  });

  // Update voice ref for AI responses
  useEffect(() => {
    voiceRef.current = {
      speakAIResponse: voice.speakAIResponse
    };
  }, [voice.speakAIResponse]);

  // Handle call toggle - speak first message when starting call
  const handleCallToggle = useCallback(() => {
    if (voice.isInCall) {
      voice.endCall();
    } else {
      // Get the opening message to speak when starting call
      const cluster = selectedEmotion ? getClusterForEmotion(selectedEmotion) : null;
      const openingMessage = cluster ? getClusterOpeningMessage(cluster, language) : undefined;
      voice.startCall(openingMessage);
    }
  }, [voice, selectedEmotion, language]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show celebration when complete, then show continue prompt
  useEffect(() => {
    if (isComplete && breakthroughData) {
      setShowCelebration(true);
      // Hide chat content after completion in embedded mode
      if (embedded) {
        setShowChatContent(false);
      }
    }
  }, [isComplete, breakthroughData, embedded]);

  // After hit list action is added, show continue prompt
  const handleHitListAdded = useCallback(() => {
    // Wait a moment, then show the continue prompt
    setTimeout(() => {
      setShowContinuePrompt(true);
    }, 1500);
  }, []);

  // Handle continue with mindset work
  const handleContinueMindset = useCallback(() => {
    setShowContinuePrompt(false);
    resetSession();
    setStep('emotion');
    setSelectedEmotion(null);
    setSelectedIntensity(5);
  }, [resetSession]);

  // Handle decline continue
  const handleDeclineContinue = useCallback(() => {
    setShowContinuePrompt(false);
  }, []);

  // Handle emotion selection — skip intensity, go direct to chat
  const handleEmotionSelect = (emotion: MindCoachEmotion) => {
    setSelectedEmotion(emotion);
    // Auto-start session with default intensity, skip intensity step
    startSession(emotion, 5);
    setStep('chat');
  };

  // Handle start chat
  const handleStartChat = () => {
    if (!selectedEmotion) return;
    startSession(selectedEmotion, selectedIntensity);
    setStep('chat');
  };

  // Handle send message
  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle restart
  const handleRestart = () => {
    resetSession();
    setStep('emotion');
    setSelectedEmotion(null);
    setSelectedIntensity(5);
  };

  // Celebration close - show continue prompt after
  const handleCelebrationClose = () => {
    setShowCelebration(false);
    // Show continue prompt after celebration
    setShowContinuePrompt(true);
    if (onComplete && breakthroughData) {
      onComplete(breakthroughData);
    }
  };

  // Render emotion selection step
  if (step === 'emotion') {
    return (
      <Card className={cn(
        "border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5",
        embedded && "border-0 shadow-none bg-transparent"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {language === 'ro' ? 'Înapoi' : 'Back'}
              </Button>
            )}
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-6 w-6 text-primary" />
              Mind Coach
            </CardTitle>
            <div className="w-16" /> {/* Spacer for alignment */}
          </div>
          <p className="text-muted-foreground text-sm text-center mt-2">
            {language === 'ro' 
              ? 'Cum te simți în acest moment?' 
              : 'How are you feeling right now?'}
          </p>
        </CardHeader>
        <CardContent>
          <ExtendedEmotionPicker
            selectedEmotion={selectedEmotion}
            onSelect={handleEmotionSelect}
            language={language}
          />
        </CardContent>
      </Card>
    );
  }

  // Render intensity selection step
  if (step === 'intensity') {
    const emotionInfo = selectedEmotion ? getEmotionInfo(selectedEmotion) : null;
    
    return (
      <Card className={cn(
        "border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5",
        embedded && "border-0 shadow-none bg-transparent"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep('emotion')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {language === 'ro' ? 'Înapoi' : 'Back'}
            </Button>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{emotionInfo?.emoji}</span>
              {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn}
            </CardTitle>
            <div className="w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              {language === 'ro' 
                ? 'Cât de intens simți asta?' 
                : 'How intense is this feeling?'}
            </p>
            
            <div className="px-4">
              <Slider
                value={[selectedIntensity]}
                onValueChange={(v) => setSelectedIntensity(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>1 - {language === 'ro' ? 'Ușor' : 'Mild'}</span>
                <span className="text-2xl font-bold text-primary">{selectedIntensity}</span>
                <span>10 - {language === 'ro' ? 'Intens' : 'Intense'}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            {language === 'ro' ? 'Începe Transformarea' : 'Start Transformation'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render chat step
  const emotionInfo = selectedEmotion ? getEmotionInfo(selectedEmotion) : null;
  
  // Show quick answers when AI has asked a question (last message is from assistant)
  const lastMessage = messages[messages.length - 1];
  const showQuickAnswers = !isLoading && 
    !isComplete && 
    messages.length > 0 && 
    lastMessage?.role === 'assistant' &&
    !inputValue.trim();

  return (
    <>
      <Card className={cn(
        "flex flex-col h-[600px]",
        "bg-gradient-to-br from-background via-background to-primary/5",
        "border-primary/20 shadow-lg shadow-primary/5",
        embedded && "border-0 shadow-none h-full"
      )}>
        {/* Header with phase indicator */}
        <CardHeader className="pb-2 border-b border-primary/10 shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{emotionInfo?.emoji}</span>
              <span className="text-sm font-medium text-foreground">
                {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn}
              </span>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                {selectedIntensity}/10
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRestart} className="hover:bg-primary/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <PhaseIndicator currentPhase={currentPhase} language={language} compact />
          <div className="mt-2 flex justify-center">
            <FrameworkBadge phase={currentPhase} language={language} />
          </div>
        </CardHeader>

        {/* Messages area - hide when complete in embedded mode */}
        {showChatContent ? (
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* Welcome message if no messages yet - cluster-specific opening */}
              {messages.length === 0 && selectedEmotion && (
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-sm border border-primary/10 animate-fade-in">
                  <p className="font-medium mb-2 text-foreground">
                    {emotionInfo?.emoji} {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn} la {selectedIntensity}/10...
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {getClusterOpeningMessage(getClusterForEmotion(selectedEmotion), language)}
                  </p>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg, idx) => {
                const isPowerMove = msg.role === 'assistant' && msg.content.includes('[POWER_MOVE]');
                const cleanContent = msg.content.replace('[POWER_MOVE]', '').trim();
                
                return (
                  <React.Fragment key={idx}>
                    {isPowerMove && <PowerBodyAnimation />}
                    <div
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
                            <ReactMarkdown>{cleanContent}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

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
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {language === 'ro' ? 'Transformare Completă!' : 'Transformation Complete!'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {breakthroughData?.emotionBefore} → {breakthroughData?.emotionAfter}
              </p>
            </div>
          </div>
        )}

        {/* Input area with voice controls */}
        <div className="p-4 border-t border-primary/10 shrink-0 bg-gradient-to-t from-primary/5 to-transparent">
          <MindCoachInputBar
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder={language === 'ro' ? 'Scrie aici...' : 'Type here...'}
            isLoading={isLoading}
            isComplete={isComplete}
            isSpeaking={voice.isSpeaking}
            onSpeakStart={voice.handleSpeakStart}
            onSpeakStop={voice.handleSpeakStop}
            isInCall={voice.isInCall}
            isAISpeaking={voice.isAISpeaking}
            isListening={voice.isListening}
            isProcessing={voice.isProcessing}
            isTTSLoading={voice.isTTSLoading}
            currentTranscript={voice.currentTranscript}
            silenceTimer={voice.silenceTimer}
            audioLevel={voice.audioLevel}
            onCallToggle={handleCallToggle}
            onSkipAI={voice.skipAISpeaking}
            onManualSend={voice.manualSendInCall}
            cluster={currentCluster}
            phase={currentPhase}
            messageCount={messages.length}
            showQuickAnswers={showQuickAnswers}
            language={language}
          />
        </div>

        {/* Navigation buttons for embedded mode (Champion Routine) */}
        {embedded && showNavigationButtons && (
          <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-primary/10 to-transparent">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  // Stop any ongoing TTS
                  if (voice.isInCall) voice.endCall();
                  voice.skipAISpeaking();
                  onNewSession?.();
                }}
              >
                <RefreshCw className="h-4 w-4" />
                {language === 'ro' ? 'Altă Sesiune' : 'New Session'}
              </Button>
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                onClick={() => {
                  // Stop TTS and continue routine
                  if (voice.isInCall) voice.endCall();
                  voice.skipAISpeaking();
                  onContinueRoutine?.();
                }}
              >
                {language === 'ro' ? 'Continuă Rutina' : 'Continue Routine'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Breakthrough celebration */}
      <BreakthroughCelebration
        isVisible={showCelebration}
        emotionBefore={breakthroughData?.emotionBefore || ''}
        emotionAfter={breakthroughData?.emotionAfter || ''}
        insight={breakthroughData?.insight}
        actionCommitted={breakthroughData?.actionCommitted}
        onClose={handleCelebrationClose}
        onAddToHitList={onAddToHitList}
      />

      {/* Continue mindset dialog - after celebration or hit list add */}
      <ContinueMindsetDialog
        isOpen={showContinuePrompt}
        onContinue={handleContinueMindset}
        onClose={handleDeclineContinue}
        language={language}
      />
    </>
  );
}
