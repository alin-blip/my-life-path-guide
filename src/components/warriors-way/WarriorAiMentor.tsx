import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  BookOpen,
  RefreshCw,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useWarriorAiCoach } from '@/hooks/useWarriorAiCoach';
import { cn } from '@/lib/utils';

interface WarriorAiMentorProps {
  onNavigateToModule?: (moduleId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const WarriorAiMentor: React.FC<WarriorAiMentorProps> = ({
  onNavigateToModule,
  isOpen,
  onClose
}) => {
  const [question, setQuestion] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    isLoading, 
    relevantLessons,
    askQuestion, 
    resetConversation,
    hasMessages 
  } = useWarriorAiCoach();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    const q = question;
    setQuestion('');
    await askQuestion(q);
  };

  const handleLessonClick = (moduleId: string) => {
    onNavigateToModule?.(moduleId);
    onClose();
  };

  const suggestedQuestions = [
    "Ce este Groapa și cum ies din ea?",
    "Care sunt cele 5 protocoale Warrior?",
    "Cum funcționează Stack-ul?",
    "Ce înseamnă Core 4?",
    "Care sunt cele 5 legi ale Războinicului?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:top-4 md:w-[450px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Mentorul Warrior</h3>
                <p className="text-xs text-muted-foreground">Întreabă orice despre curs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasMessages && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetConversation}
                  title="Conversație nouă"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 h-8 w-8 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                  <p className="text-sm">
                    Bună! 👋 Sunt Mentorul Warrior și sunt aici să te ghidez prin Calea Războinicului. 
                    Pune-mi orice întrebare despre lecții, concepte sau tehnici din curs.
                  </p>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2 mt-6">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Întrebări sugerate:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gradient-to-br from-amber-500 to-orange-600"
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    "rounded-2xl p-4 max-w-[85%] text-sm",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted rounded-tl-none"
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 h-8 w-8 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Caut în lecții...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Relevant Lessons */}
          {relevantLessons.length > 0 && !isLoading && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Lecții relevante:
              </p>
              <div className="space-y-1">
                {relevantLessons.map((lesson) => (
                  <button
                    key={lesson.moduleId}
                    onClick={() => handleLessonClick(lesson.moduleId)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Badge variant="secondary" className="shrink-0">
                      {lesson.order}
                    </Badge>
                    <span className="text-sm flex-1 truncate">{lesson.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Întreabă ceva despre Warrior's Way..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !question.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Floating button to open the mentor
export const WarriorAiMentorButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 z-40"
      size="icon"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};
