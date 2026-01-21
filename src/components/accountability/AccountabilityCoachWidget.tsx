import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Mic, X, Trophy, RotateCcw, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useRealityMapStatus } from '@/hooks/useRealityMapStatus';
import { CoachChatMode } from './CoachChatMode';
import { CoachVoiceMode } from './CoachVoiceMode';
import { CoachReminders } from './CoachReminders';
import { cn } from '@/lib/utils';

const getQuickActionsForCoach = (language: 'en' | 'ro') => {
  return language === 'ro' ? [
    { label: 'Ce am de făcut azi?', message: 'Ce am de făcut azi?' },
    { label: 'Progres săptămânal', message: 'Cum arată progresul meu săptămânal?' },
    { label: 'Motivație', message: 'Am nevoie de puțină motivație.' },
    { label: 'Următorul pas', message: 'Care e următorul pas pe care ar trebui să-l fac?' },
  ] : [
    { label: 'What should I do today?', message: 'What should I do today?' },
    { label: 'Weekly progress', message: 'How does my weekly progress look?' },
    { label: 'Motivation', message: 'I need some motivation.' },
    { label: 'Next step', message: 'What\'s the next step I should take?' },
  ];
};

export const AccountabilityCoachWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'reminders'>('chat');
  const location = useLocation();
  const { language } = useLanguage();
  const { pendingItems } = useFoundationStatus();
  const { hasRealityMap, isLoading: realityMapLoading } = useRealityMapStatus();
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  } = useAccountabilityCoach({
    currentPage: location.pathname,
    hasRealityMap,
  });

  const quickActions = getQuickActionsForCoach(language as 'en' | 'ro');
  const pendingCount = pendingItems.length;

  const handleReset = () => {
    clearMessages();
  };

  return (
    <>
      {/* Floating Button - Bottom Left */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
          'transition-all duration-300',
          'flex items-center justify-center',
          isOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 hover:scale-105'
        )}
      >
        <Trophy className="w-6 h-6 text-white" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Button>

      {/* Coach Sheet - Left Side */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-full sm:w-[400px] p-0 flex flex-col data-[state=open]:animate-enter data-[state=closed]:animate-exit"
        >
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base">
                    Accountability Coach
                  </SheetTitle>
                  {pendingCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {pendingCount} {language === 'ro' ? 'reminder-uri' : 'reminders'}
                    </p>
                  )}
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
            onValueChange={(v) => setActiveMode(v as 'chat' | 'voice' | 'reminders')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-3 max-w-[calc(100%-2rem)]">
              <TabsTrigger value="chat" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5">
                <Mic className="w-4 h-4" />
                {language === 'ro' ? 'Voce' : 'Voice'}
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-1.5 relative">
                <Bell className="w-4 h-4" />
                {language === 'ro' ? 'Remindere' : 'Reminders'}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-2">
              <CoachChatMode
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                quickActions={quickActions}
              />
            </TabsContent>

            <TabsContent value="voice" className="flex-1 overflow-hidden m-0 mt-2">
              <CoachVoiceMode
                currentPage={location.pathname}
                quickActions={quickActions}
              />
            </TabsContent>

            <TabsContent value="reminders" className="flex-1 overflow-hidden m-0 mt-2">
              <CoachReminders onClose={() => setIsOpen(false)} />
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
