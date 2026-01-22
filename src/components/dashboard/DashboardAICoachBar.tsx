import React, { useState } from 'react';
import { MessageSquare, Trophy, ChevronRight, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useAccountabilityCoach, CoachMessage } from '@/hooks/useAccountabilityCoach';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface DashboardAICoachBarProps {
  className?: string;
}

export const DashboardAICoachBar: React.FC<DashboardAICoachBarProps> = ({ className }) => {
  const { language } = useLanguage();
  const foundationStatus = useFoundationStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const { messages, isLoading, sendMessage, clearMessages } = useAccountabilityCoach({
    currentPage: '/dashboard',
    hasRealityMap: true,
  });

  const pendingCount = foundationStatus.pendingItems?.length || 0;
  const isRomanian = language === 'ro';

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    {
      label: isRomanian ? '🎯 Ce să fac acum?' : '🎯 What should I do now?',
      message: isRomanian ? 'Ce ar trebui să fac acum pentru a progresa?' : 'What should I do now to make progress?',
    },
    {
      label: isRomanian ? '📋 Unde planific?' : '📋 Where do I plan?',
      message: isRomanian ? 'Unde îmi planific săptămâna și task-urile?' : 'Where do I plan my week and tasks?',
    },
    {
      label: isRomanian ? '🧠 Ce antrenori AI există?' : '🧠 What AI coaches exist?',
      message: isRomanian ? 'Ce antrenori AI sunt disponibili în platformă?' : 'What AI coaches are available in the platform?',
    },
  ];

  return (
    <>
      {/* Compact Bar */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-primary/5 via-transparent to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors cursor-pointer group",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                {pendingCount}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isRomanian ? 'AI Coach' : 'AI Coach'}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {isRomanian ? 'Întreabă orice despre platformă' : 'Ask anything about the platform'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 group-hover:bg-primary/10">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{isRomanian ? 'Chat' : 'Chat'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <SheetTitle className="text-base">
                {isRomanian ? 'Accountability Coach' : 'Accountability Coach'}
              </SheetTitle>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearMessages}>
                {isRomanian ? 'Șterge' : 'Clear'}
              </Button>
            )}
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">
                    {isRomanian ? 'Bună! 👋' : 'Hello! 👋'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRomanian 
                      ? 'Sunt coach-ul tău AI. Știu totul despre platformă și te pot ghida.'
                      : 'I\'m your AI coach. I know everything about the platform and can guide you.'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    {isRomanian ? 'Întrebări rapide' : 'Quick questions'}
                  </p>
                  {quickQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => sendMessage(q.message)}
                    >
                      <span className="text-sm">{q.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: CoachMessage) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2",
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
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRomanian ? 'Scrie un mesaj...' : 'Type a message...'}
                className="min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
