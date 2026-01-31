import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, X, Rocket, RotateCcw, Mic, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useChallengeCoach } from '@/hooks/useChallengeCoach';
import { ChallengeCoachChat } from './ChallengeCoachChat';
import { cn } from '@/lib/utils';

interface ChallengeCoachWidgetProps {
  currentDay?: number;
}

export const ChallengeCoachWidget: React.FC<ChallengeCoachWidgetProps> = ({ 
  currentDay = 1 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  const { language } = useLanguage();
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    initializeChat,
  } = useChallengeCoach({ currentDay });

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  const handleReset = useCallback(() => {
    clearMessages();
    initializeChat();
  }, [clearMessages, initializeChat]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg',
          'transition-all duration-300',
          'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
          'flex items-center justify-center',
          isOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 hover:scale-105'
        )}
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
        
        <Rocket className="w-6 h-6 text-white" />
        
        {/* Day badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center shadow">
          {currentDay}
        </span>
      </Button>

      {/* Coach Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[420px] p-0 flex flex-col"
        >
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base">
                    Challenge Coach
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ro' ? `Ziua ${currentDay} din 7` : `Day ${currentDay} of 7`}
                  </p>
                </div>
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
            onValueChange={(v) => setActiveMode(v as 'text' | 'voice')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 max-w-[calc(100%-2rem)]">
              <TabsTrigger value="text" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                {language === 'ro' ? 'Text' : 'Text'}
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5">
                <Phone className="w-4 h-4" />
                {language === 'ro' ? 'Voce' : 'Voice'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="flex-1 overflow-hidden m-0 mt-2">
              <ChallengeCoachChat
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                currentDay={currentDay}
              />
            </TabsContent>

            <TabsContent value="voice" className="flex-1 overflow-hidden m-0 mt-2">
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'ro' ? 'Mod Voce' : 'Voice Mode'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ro' 
                    ? 'Modul voce va fi disponibil în curând. Folosește chat-ul text pentru moment.'
                    : 'Voice mode coming soon. Use text chat for now.'}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setActiveMode('text')}
                >
                  {language === 'ro' ? 'Folosește Text' : 'Use Text'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};
