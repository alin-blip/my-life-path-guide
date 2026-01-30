import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Brain, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo } from './ExtendedEmotionPicker';
import { getClusterForEmotion, getClusterOpeningMessage } from '@/lib/mind-coach-clusters';
import { PhaseIndicator } from './PhaseIndicator';
import { useMindCoachDemo } from '@/hooks/useMindCoachDemo';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

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
  });

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
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
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

  return (
    <Card className="flex flex-col h-[500px] bg-gradient-to-br from-background via-background to-primary/5 border-primary/20 shadow-lg shadow-primary/5">
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
      </CardHeader>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome message */}
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
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={language === 'ro' ? 'Scrie aici...' : 'Type here...'}
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={isLoading || isComplete}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || isComplete}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
