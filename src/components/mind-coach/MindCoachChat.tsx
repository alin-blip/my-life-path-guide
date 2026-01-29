import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Brain, RotateCcw, ArrowLeft } from 'lucide-react';
import { ExtendedEmotionPicker, MindCoachEmotion, getEmotionInfo } from './ExtendedEmotionPicker';
import { getClusterForEmotion, getClusterOpeningMessage } from '@/lib/mind-coach-clusters';
import { PhaseIndicator } from './PhaseIndicator';
import { BreakthroughCelebration } from './BreakthroughCelebration';
import { useMindCoach } from '@/hooks/useMindCoach';
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
}: MindCoachChatProps) {
  const [step, setStep] = useState<'emotion' | 'intensity' | 'chat'>(
    initialEmotion ? 'intensity' : 'emotion'
  );
  const [selectedEmotion, setSelectedEmotion] = useState<MindCoachEmotion | null>(
    initialEmotion || null
  );
  const [selectedIntensity, setSelectedIntensity] = useState(initialIntensity);
  const [inputValue, setInputValue] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show celebration when complete
  useEffect(() => {
    if (isComplete && breakthroughData) {
      setShowCelebration(true);
    }
  }, [isComplete, breakthroughData]);

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

  // Celebration close
  const handleCelebrationClose = () => {
    setShowCelebration(false);
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

  return (
    <>
      <Card className={cn(
        "flex flex-col h-[600px] border-primary/20",
        embedded && "border-0 shadow-none h-full"
      )}>
        {/* Header with phase indicator */}
        <CardHeader className="pb-2 border-b shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{emotionInfo?.emoji}</span>
              <span className="text-sm font-medium">
                {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn}
              </span>
              <span className="text-xs text-muted-foreground">
                ({selectedIntensity}/10)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <PhaseIndicator currentPhase={currentPhase} language={language} compact />
        </CardHeader>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* Welcome message if no messages yet - cluster-specific opening */}
            {messages.length === 0 && selectedEmotion && (
              <div className="bg-primary/10 rounded-xl p-4 text-sm">
                <p className="font-medium mb-2">
                  {emotionInfo?.emoji} {language === 'ro' ? emotionInfo?.labelRo : emotionInfo?.labelEn} la {selectedIntensity}/10...
                </p>
                <p className="text-muted-foreground">
                  {getClusterOpeningMessage(getClusterForEmotion(selectedEmotion), language)}
                </p>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl p-3 text-sm",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
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
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
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
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
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
    </>
  );
}
