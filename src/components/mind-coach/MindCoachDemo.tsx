import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, RotateCcw, ArrowLeft } from 'lucide-react';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo } from './ExtendedEmotionPicker';
import { getClusterForEmotion, getClusterOpeningMessage } from '@/lib/mind-coach-clusters';
import { PhaseIndicator } from './PhaseIndicator';
import { useMindCoachDemo } from '@/hooks/useMindCoachDemo';
import { useMindCoachVoice } from '@/hooks/useMindCoachVoice';
import { MindCoachInputBar } from './MindCoachInputBar';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MindCoachDemoProps {
  initialEmotion?: MindCoachEmotion;
  initialIntensity?: number;
  onComplete?: (breakthrough: any) => void;
  language?: 'ro' | 'en';
}

export function MindCoachDemo({
  initialEmotion,
  initialIntensity = 5,
  onComplete,
  language = 'ro',
}: MindCoachDemoProps) {
  const [step, setStep] = useState<'emotion' | 'intensity' | 'chat'>(
    initialEmotion ? 'intensity' : 'emotion'
  );
  const [selectedEmotion, setSelectedEmotion] = useState<MindCoachEmotion | null>(
    initialEmotion || null
  );
  const [selectedIntensity, setSelectedIntensity] = useState(initialIntensity);
  const [inputValue, setInputValue] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    currentPhase,
    isComplete,
    breakthroughData,
    startSession,
    sendMessage,
    resetSession,
  } = useMindCoachDemo({
    onComplete,
    onAIResponse: (text) => {
      setLastAIResponse(text);
    },
  });

  // Get current cluster for quick answers
  const currentCluster = selectedEmotion ? getClusterForEmotion(selectedEmotion) : null;

  // Voice integration
  const voice = useMindCoachVoice({
    onUserMessage: (text) => {
      sendMessage(text);
    },
    onAIResponse: (text) => {
      // Voice will speak AI responses in call mode
    },
    language,
    silenceThreshold: 3000,
    playbackRate: 1.15,
  });

  // Speak AI response when in call mode
  useEffect(() => {
    if (lastAIResponse && voice.isInCall && !isLoading) {
      voice.speakAIResponse(lastAIResponse);
    }
  }, [lastAIResponse, voice.isInCall, isLoading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle emotion selection
  const handleEmotionSelect = (emotion: MindCoachEmotion) => {
    setSelectedEmotion(emotion);
    setStep('intensity');
  };

  // Handle start chat
  const handleStartChat = () => {
    if (!selectedEmotion) return;
    startSession(selectedEmotion, selectedIntensity);
    setStep('chat');
  };

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isLoading, sendMessage]);

  // Handle call toggle
  const handleCallToggle = useCallback(() => {
    if (voice.isInCall) {
      voice.endCall();
    } else {
      // Get opening message for call mode
      const openingMessage = selectedEmotion 
        ? getClusterOpeningMessage(getClusterForEmotion(selectedEmotion), language)
        : language === 'ro' 
          ? 'Bun venit la Mind Coach. Cum te simți acum?' 
          : 'Welcome to Mind Coach. How are you feeling now?';
      
      voice.startCall(openingMessage);
    }
  }, [voice, selectedEmotion, language]);

  // Handle restart
  const handleRestart = () => {
    resetSession();
    voice.endCall();
    setStep('emotion');
    setSelectedEmotion(null);
    setSelectedIntensity(5);
  };

  // Render emotion selection step
  if (step === 'emotion') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl justify-center">
            <Brain className="h-6 w-6 text-primary" />
            Mind Coach
          </CardTitle>
          <p className="text-muted-foreground text-sm text-center mt-2">
            Cum te simți în acest moment?
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
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep('emotion')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Înapoi
            </Button>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">{emotionInfo?.emoji}</span>
              {emotionInfo?.labelRo}
            </CardTitle>
            <div className="w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Cât de intens simți asta?
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
                <span>1 - Ușor</span>
                <span className="text-2xl font-bold text-primary">{selectedIntensity}</span>
                <span>10 - Intens</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            Începe Transformarea
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render chat step
  const emotionInfo = selectedEmotion ? getEmotionInfo(selectedEmotion) : null;

  return (
    <Card className="flex flex-col h-[600px] bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-lg shadow-primary/5">
      {/* Header with phase indicator */}
      <CardHeader className="pb-2 border-b border-primary/10 shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emotionInfo?.emoji}</span>
            <span className="text-sm font-medium text-foreground">
              {emotionInfo?.labelRo}
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
      </CardHeader>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && selectedEmotion && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-sm border border-primary/10 animate-fade-in">
              <p className="font-medium mb-2 text-foreground">
                {emotionInfo?.emoji} {emotionInfo?.labelRo} la {selectedIntensity}/10...
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {getClusterOpeningMessage(getClusterForEmotion(selectedEmotion), language)}
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

      {/* Input area with voice buttons */}
      <div className="p-4 border-t border-primary/10 shrink-0 bg-gradient-to-t from-primary/5 to-transparent">
        <MindCoachInputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="Scrie aici..."
          isLoading={isLoading}
          isComplete={isComplete}
          // Speak mode props
          isSpeaking={voice.isSpeaking}
          onSpeakStart={voice.handleSpeakStart}
          onSpeakStop={voice.handleSpeakStop}
          // Call mode props
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
          // Quick answers
          cluster={currentCluster}
          showQuickAnswers={messages.length > 0 && !isComplete}
          language={language}
        />
      </div>
    </Card>
  );
}
