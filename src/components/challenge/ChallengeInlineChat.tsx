import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Send, Mic, MicOff, Loader2, User, Bot } from 'lucide-react';
import { useChallengeCoach } from '@/hooks/useChallengeCoach';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ChallengeInlineChatProps {
  currentDay?: number;
  language?: 'ro' | 'en';
}

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const labels = {
  ro: {
    title: 'Întreabă Coach-ul Tău',
    signInTitle: 'Coach-ul Tău e Gata!',
    signInDescription: 'Autentifică-te pentru a discuta cu coach-ul AI și a primi ghidare personalizată.',
    signInButton: 'Autentifică-te pentru a Discuta',
    placeholder: 'Scrie întrebarea ta...',
    readyMessage: 'Coach-ul tău e gata!',
    readySubMessage: 'Pune orice întrebare despre challenge',
    listeningMessage: 'Ascult... Click pentru a opri',
    speakMessage: 'Click pentru a vorbi',
    textTab: 'Text',
    voiceTab: 'Voce',
  },
  en: {
    title: 'Ask Your Challenge Coach',
    signInTitle: 'Your Challenge Coach is Ready!',
    signInDescription: 'Sign in to chat with your AI coach and get personalized guidance through the challenge.',
    signInButton: 'Sign In to Start Chatting',
    placeholder: 'Type your question...',
    readyMessage: 'Your Challenge Coach is ready!',
    readySubMessage: 'Ask any question about the challenge',
    listeningMessage: 'Listening... Click to stop',
    speakMessage: 'Click to start speaking',
    textTab: 'Text',
    voiceTab: 'Voice',
  },
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-amber-500/20'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export const ChallengeInlineChat: React.FC<ChallengeInlineChatProps> = ({
  currentDay = 0,
  language = 'ro',
}) => {
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { messages, isLoading, sendMessage, initializeChat } = useChallengeCoach({
    currentDay,
  });

  const l = labels[language];
  const authRedirect = language === 'en' ? '/challenge-en' : '/challenge';

  // Initialize chat on mount (only if user is authenticated)
  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [initializeChat, user]);

  // Show sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="flex flex-col h-[400px]">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">{l.title}</h3>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Bot className="h-16 w-16 text-amber-500/50 mb-4" />
          <h3 className="font-semibold mb-2">{l.signInTitle}</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            {l.signInDescription}
          </p>
          <Button 
            onClick={() => navigate(`/auth?redirect=${authRedirect}`)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {l.signInButton}
          </Button>
        </div>
      </div>
    );
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice input would be implemented here with Web Speech API
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">{l.title}</h3>
        </div>
        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'text' | 'voice')}>
          <TabsList className="h-8">
            <TabsTrigger value="text" className="text-xs px-3">
              {l.textTab}
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs px-3">
              {l.voiceTab}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 text-amber-500/50" />
            <p className="text-sm">{l.readyMessage}</p>
            <p className="text-xs mt-1">{l.readySubMessage}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-amber-500" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        {activeMode === 'text' ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={l.placeholder}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Button
              onClick={toggleVoice}
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              className={cn(
                'h-14 w-14 rounded-full',
                !isListening && 'bg-amber-500 hover:bg-amber-600'
              )}
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              {isListening ? l.listeningMessage : l.speakMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeInlineChat;
