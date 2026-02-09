import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { PersonalPowerDay } from '@/data/personalPowerContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Sparkles, Phone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useMindCoachVoice } from '@/hooks/useMindCoachVoice';
import { SpeakButton } from '@/components/mind-coach/SpeakButton';
import { CallModeOverlay } from '@/components/mind-coach/CallModeOverlay';
import { AISpeakingIndicator } from '@/components/stack/AISpeakingIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PersonalPowerCoachProps {
  dayData: PersonalPowerDay;
  exerciseResponses: Record<string, string>;
  onComplete: () => void;
  completed: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personal-power-coach`;

export const PersonalPowerCoach: React.FC<PersonalPowerCoachProps> = ({
  dayData,
  exerciseResponses,
  onComplete,
  completed,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'choose' | 'text' | 'call'>('choose');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<string>('');
  const voiceRef = useRef<any>(null);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice hook - declared BEFORE sendMessage to avoid circular reference
  const voice = useMindCoachVoice({
    onUserMessage: (text) => sendMessageRef.current(text),
    language: language as 'ro' | 'en',
  });
  voiceRef.current = voice;

  const sendMessageRef = useRef<(text: string) => void>(() => {});

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    lastAssistantRef.current = '';

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          dayNumber: dayData.day,
          exerciseResponses,
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }

      // Store final assistant text for TTS in call mode
      lastAssistantRef.current = assistantSoFar;

      // If in call mode, speak the response
      if (voiceRef.current?.isInCall && assistantSoFar) {
        voiceRef.current.speakAIResponse(assistantSoFar);
      }
    } catch (err) {
      console.error('Coach error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: language === 'ro' ? 'A apărut o eroare. Încearcă din nou.' : 'An error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, dayData.day, exerciseResponses, language]);

  // Keep sendMessageRef in sync
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Auto-start coaching conversation when mode is chosen
  useEffect(() => {
    if (mode === 'choose' || autoStartedRef.current || messages.length > 0 || isLoading) return;
    autoStartedRef.current = true;
    const autoMsg = language === 'ro'
      ? 'Am terminat lecția și exercițiile de azi. Vreau să discutăm despre ce am învățat și să mă ajuți să aplic în practică.'
      : 'I\'ve finished today\'s lesson and exercises. I want to discuss what I learned and get help applying it.';
    
    if (mode === 'call') {
      // Start call and send initial message
      setTimeout(() => {
        sendMessageRef.current(autoMsg);
        voice.startCall();
      }, 500);
    } else {
      setTimeout(() => sendMessageRef.current(autoMsg), 500);
    }
  }, [mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">AI Coach</h3>
          <Badge variant="secondary" className="text-xs">
            {language === 'ro' ? `Ziua ${dayData.day}` : `Day ${dayData.day}`}
          </Badge>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            {language === 'ro' ? 'Ce vom lucra împreună:' : 'What we\'ll work through together:'}
          </p>
          <ul className="space-y-1">
            {dayData.aiCoachingPoints.map((point, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setMode('text')}
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <Send className="h-6 w-6" />
            <span className="font-medium">{language === 'ro' ? 'Începe Text' : 'Start Text'}</span>
          </Button>
          <Button
            onClick={() => setMode('call')}
            variant="outline"
            className="h-24 flex flex-col gap-2 border-primary/50"
          >
            <Phone className="h-6 w-6 text-primary" />
            <span className="font-medium">{language === 'ro' ? 'Începe Call' : 'Start Call'}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">AI Coach</h3>
        <Badge variant="secondary" className="text-xs">
          {language === 'ro' ? `Ziua ${dayData.day}` : `Day ${dayData.day}`}
        </Badge>
      </div>

      {/* Coaching points */}
      <div className="bg-muted/50 border border-border rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2">
          {language === 'ro' ? 'Ce vom lucra împreună:' : 'What we\'ll work through together:'}
        </p>
        <ul className="space-y-1">
          {dayData.aiCoachingPoints.map((point, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* AI Speaking indicator (outside call mode) */}
      {!voice.isInCall && (
        <AISpeakingIndicator
          isAISpeaking={voice.isAISpeaking}
          message={language === 'ro' ? 'AI vorbește, te rog așteaptă...' : 'AI is speaking, please wait...'}
        />
      )}

      {/* Chat messages */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {language === 'ro'
                ? 'Se încarcă sesiunea de coaching...'
                : 'Loading coaching session...'}
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted text-muted-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Call mode overlay */}
        {voice.isInCall && (
          <div className="border-t border-border p-3">
            <CallModeOverlay
              isActive={voice.isInCall}
              isAISpeaking={voice.isAISpeaking}
              isListening={voice.isListening}
              isProcessing={voice.isProcessing}
              isTTSLoading={voice.isTTSLoading}
              currentTranscript={voice.currentTranscript}
              silenceTimer={voice.silenceTimer}
              audioLevel={voice.audioLevel}
              onSkipAI={voice.skipAISpeaking}
              onManualSend={voice.manualSendInCall}
              onEndCall={voice.endCall}
              language={language as 'ro' | 'en'}
            />
          </div>
        )}

        {/* Input area (hidden during call) */}
        {!voice.isInCall && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder={language === 'ro' ? 'Scrie un mesaj...' : 'Type a message...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[44px] max-h-[100px] resize-none"
                rows={1}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice buttons */}
            <div className="flex items-center gap-2">
              <SpeakButton
                isRecording={voice.isSpeaking}
                isProcessing={isLoading}
                disabled={isLoading}
                onMouseDown={voice.handleSpeakStart}
                onMouseUp={voice.handleSpeakStop}
                onTouchStart={voice.handleSpeakStart}
                onTouchEnd={voice.handleSpeakStop}
                language={language as 'ro' | 'en'}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="lg"
                onClick={() => voice.startCall()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                <span className="hidden sm:inline">
                  {language === 'ro' ? 'Apel' : 'Call'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mark complete & go to Breakthrough */}
      {!completed && messages.length >= 4 && (
        <Button onClick={onComplete} className="w-full gap-2">
          🚀 {language === 'ro' ? 'Am terminat — Mergi la Breakthrough' : 'Done — Go to Breakthrough'}
        </Button>
      )}
    </div>
  );
};
