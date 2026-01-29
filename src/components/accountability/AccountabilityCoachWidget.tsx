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
import { useTaskReminders } from '@/hooks/useTaskReminders';
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
  const { remainingCount, totalCount } = useTaskReminders();
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
  const foundationPendingCount = pendingItems.length;
  
  // Badge shows remaining tasks + foundation items
  const badgeCount = remainingCount + foundationPendingCount;
  const hasTasksToday = totalCount > 0;
  const allTasksComplete = hasTasksToday && remainingCount === 0;

  // Show pulse animation for chat bubble when foundation is complete
  useEffect(() => {
    if (isFoundationComplete && allTasksComplete) {
      const timer = setTimeout(() => setShowPulse(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isFoundationComplete, allTasksComplete]);

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

  // Determine icon and style based on status
  const showCelebration = isFoundationComplete && allTasksComplete;
  const showWarning = badgeCount > 0;

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
          // Different styles based on status
          showCelebration
            ? 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
            : showWarning
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
            : 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
        )}
      >
        {/* Pulse animation for celebration */}
        {showCelebration && showPulse && (
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        )}
        
        {/* Progress ring for tasks */}
        {hasTasksToday && !showCelebration && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/20"
            />
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${((totalCount - remainingCount) / totalCount) * 163} 163`}
              className="text-white transition-all duration-500"
            />
          </svg>
        )}
        
        {/* Icon based on status */}
        {showCelebration ? (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Trophy className="w-6 h-6 text-white" />
        )}
        
        {/* Badge - show pending count or sparkle for complete */}
        {showCelebration ? (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </span>
        ) : badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </Button>

      {/* Coach Sheet - Right Side */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] p-0 flex flex-col data-[state=open]:animate-enter data-[state=closed]:animate-exit"
        >
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  showCelebration 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                )}>
                  {showCelebration ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <Trophy className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <SheetTitle className="text-base">
                    Accountability Coach
                  </SheetTitle>
                  {hasTasksToday && (
                    <p className="text-xs text-muted-foreground">
                      {totalCount - remainingCount}/{totalCount} {language === 'ro' ? 'taskuri' : 'tasks'}
                      {foundationPendingCount > 0 && ` • ${foundationPendingCount} ${language === 'ro' ? 'reminder-uri' : 'reminders'}`}
                    </p>
                  )}
                  {!hasTasksToday && foundationPendingCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {foundationPendingCount} {language === 'ro' ? 'reminder-uri' : 'reminders'}
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
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
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
