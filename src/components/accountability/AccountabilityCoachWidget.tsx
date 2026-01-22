import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, X, Trophy, RotateCcw, Sparkles, ListTodo, Settings, Map } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useRealityMapStatus } from '@/hooks/useRealityMapStatus';
import { CoachChatMode } from './CoachChatMode';
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
  const [activeMode, setActiveMode] = useState<'plan' | 'coach'>('plan');
  const location = useLocation();
  const { language } = useLanguage();
  const { pendingItems, isFoundationComplete } = useFoundationStatus();
  const { hasRealityMap, isLoading: realityMapLoading } = useRealityMapStatus();
  const [showPulse, setShowPulse] = useState(true);
  
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

  // Show pulse animation for chat bubble when foundation is complete
  useEffect(() => {
    if (isFoundationComplete) {
      const timer = setTimeout(() => setShowPulse(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isFoundationComplete]);

  // Listen for tour events to open the widget and switch tabs
  useEffect(() => {
    const handleOpenForTour = (event: CustomEvent<{ tab?: 'plan' | 'coach' }>) => {
      setIsOpen(true);
      if (event.detail?.tab) {
        setActiveMode(event.detail.tab);
      }
    };
    
    window.addEventListener('open-accountability-coach', handleOpenForTour as EventListener);
    return () => {
      window.removeEventListener('open-accountability-coach', handleOpenForTour as EventListener);
    };
  }, []);

  const handleReset = () => {
    clearMessages();
  };

  return (
    <>
      {/* Floating Button - Bottom Right */}
      <Button
        data-tour="accountability-coach"
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg',
          'transition-all duration-300',
          'flex items-center justify-center',
          isOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 hover:scale-105',
          // Different styles based on foundation status
          isFoundationComplete
            ? 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
            : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
        )}
      >
        {/* Pulse animation for chat bubble */}
        {isFoundationComplete && showPulse && (
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        )}
        
        {/* Icon based on foundation status */}
        {isFoundationComplete ? (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Trophy className="w-6 h-6 text-white" />
        )}
        
        {/* Badge - show pending count or sparkle for complete */}
        {isFoundationComplete ? (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </span>
        ) : pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Button>

      {/* Coach Sheet - Left Side */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
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

          {/* Mode Tabs - Plan & AI Coach only */}
          <Tabs 
            value={activeMode} 
            onValueChange={(v) => setActiveMode(v as 'plan' | 'coach')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 max-w-[calc(100%-2rem)]" data-tour="accountability-tabs">
              <TabsTrigger value="plan" className="gap-1.5 relative" data-tour="accountability-plan-tab">
                <ListTodo className="w-4 h-4" />
                Plan
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="coach" className="gap-1.5" data-tour="accountability-coach-tab">
                <MessageCircle className="w-4 h-4" />
                AI Coach
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="flex-1 overflow-hidden m-0 mt-2" data-tour="accountability-plan-content">
              <CoachReminders onClose={() => setIsOpen(false)} />
            </TabsContent>

            <TabsContent value="coach" className="flex-1 overflow-hidden m-0 mt-2" data-tour="accountability-coach-content">
              <CoachChatMode
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                quickActions={quickActions}
              />
            </TabsContent>
          </Tabs>

          {/* Footer with context + actions */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex-shrink-0 space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs gap-1.5"
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('open-onboarding-wizard'));
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                {language === 'ro' ? 'Configurare' : 'Setup Wizard'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs gap-1.5"
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('start-platform-tour'));
                }}
              >
                <Map className="w-3.5 h-3.5" />
                {language === 'ro' ? 'Tur Platformă' : 'Platform Tour'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              📍 {location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
