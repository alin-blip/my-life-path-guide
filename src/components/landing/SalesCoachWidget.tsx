import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSalesCoach } from '@/hooks/useSalesCoach';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface SalesCoachWidgetProps {
  pendingMessage?: string | null;
  onMessageProcessed?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const quickActionsRo = [
  { label: '💰 Cât costă?', message: 'Cât costă abonamentul?' },
  { label: '🎯 Cum funcționează?', message: 'Cum funcționează platforma?' },
  { label: '🆓 Trial gratuit?', message: 'Aveți trial gratuit?' },
  { label: '👤 Pentru cine e?', message: 'Pentru ce tip de business e potrivit?' },
  { label: '✅ Ce garanții?', message: 'Ce garanții oferiți?' },
];

const quickActionsEn = [
  { label: '💰 Pricing?', message: 'How much does it cost?' },
  { label: '🎯 How it works?', message: 'How does the platform work?' },
  { label: '🆓 Free trial?', message: 'Do you have a free trial?' },
  { label: '👤 Who is it for?', message: 'What type of business is it for?' },
  { label: '✅ Guarantees?', message: 'What guarantees do you offer?' },
];

export const SalesCoachWidget: React.FC<SalesCoachWidgetProps> = ({ 
  pendingMessage, 
  onMessageProcessed,
  isOpen: controlledIsOpen,
  onOpenChange 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearMessages, hasMessages } = useSalesCoach();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const quickActions = language === 'ro' ? quickActionsRo : quickActionsEn;
  const t = {
    title: language === 'ro' ? 'Consultant Virtual' : 'Virtual Consultant',
    subtitle: language === 'ro' ? 'Întreabă-mă orice!' : 'Ask me anything!',
    placeholder: language === 'ro' ? 'Scrie întrebarea ta...' : 'Type your question...',
    welcome: language === 'ro' 
      ? 'Salut! 👋 Sunt aici să te ajut să înțelegi cum WarriorOS îți poate transforma business-ul. Ce te interesează?'
      : 'Hi! 👋 I\'m here to help you understand how WarriorOS can transform your business. What interests you?',
    clear: language === 'ro' ? 'Resetează' : 'Reset',
  };

  // Handle pending message from HeroInlineChat
  useEffect(() => {
    if (pendingMessage && isOpen) {
      sendMessage(pendingMessage);
      onMessageProcessed?.();
    }
  }, [pendingMessage, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  // Handle markdown links for navigation
  const handleLinkClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
      setIsOpen(false);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
              <span className="sr-only">Open chat</span>
            </Button>
            
            {/* Badge - repositioned for full visibility on all devices */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-10 right-0 md:-top-12 md:right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap"
            >
              <Sparkles className="h-3 w-3 inline mr-1" />
              <span>{t.subtitle}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: 'min(550px, calc(100vh - 100px))' }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-xs opacity-80">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMessages}
                    className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {/* Welcome message */}
                {!hasMessages && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm">{t.welcome}</p>
                    </div>
                  </div>
                )}

                {/* Quick Actions (only show if no messages) */}
                {!hasMessages && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.message)}
                        className="text-xs h-8 hover:bg-primary/10 hover:border-primary/50"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Conversation */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_a]:font-medium">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <button
                                  onClick={() => href && handleLinkClick(href)}
                                  className="text-primary underline font-medium hover:opacity-80"
                                >
                                  {children}
                                </button>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
