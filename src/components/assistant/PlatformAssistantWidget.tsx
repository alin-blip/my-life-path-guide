import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Mic, X, Bot, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { usePlatformAssistant } from '@/hooks/usePlatformAssistant';
import { getQuickActionsForPage } from '@/data/platformKnowledge';
import { AssistantChatMode } from './AssistantChatMode';
import { AssistantVoiceMode } from './AssistantVoiceMode';
import { cn } from '@/lib/utils';

export const PlatformAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'voice'>('chat');
  const location = useLocation();
  const { language } = useLanguage();
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  } = usePlatformAssistant({
    currentPage: location.pathname,
  });

  const quickActions = getQuickActionsForPage(location.pathname, language as 'en' | 'ro');

  const handleReset = () => {
    clearMessages();
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg',
          'bg-primary hover:bg-primary/90',
          'transition-all duration-300 hover:scale-105',
          'flex items-center justify-center'
        )}
      >
        <Bot className="w-6 h-6" />
      </Button>

      {/* Assistant Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] p-0 flex flex-col"
        >
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <SheetTitle className="text-base">
                  {language === 'ro' ? 'Asistent Platform' : 'Platform Assistant'}
                </SheetTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                  title={language === 'ro' ? 'Resetează conversația' : 'Reset conversation'}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Mode Tabs */}
          <Tabs 
            value={activeMode} 
            onValueChange={(v) => setActiveMode(v as 'chat' | 'voice')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 max-w-[calc(100%-2rem)]">
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                {language === 'ro' ? 'Text' : 'Text'}
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5">
                <Mic className="w-4 h-4" />
                {language === 'ro' ? 'Voce' : 'Voice'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-2">
              <AssistantChatMode
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                quickActions={quickActions}
              />
            </TabsContent>

            <TabsContent value="voice" className="flex-1 overflow-hidden m-0 mt-2">
              <AssistantVoiceMode
                currentPage={location.pathname}
                quickActions={quickActions}
              />
            </TabsContent>
          </Tabs>

          {/* Context indicator */}
          <div className="px-4 py-2 border-t border-border bg-muted/30 flex-shrink-0">
            <p className="text-xs text-muted-foreground text-center">
              📍 {location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
