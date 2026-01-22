import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, AlertTriangle, Target, Sparkles, Map, ListTodo, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useFoundationStatus, FoundationItem } from '@/hooks/useFoundationStatus';
import { useRealityMapStatus } from '@/hooks/useRealityMapStatus';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { SidebarChatMode } from '@/components/accountability/SidebarChatMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTourContext } from '@/context/TourContext';

interface FoundationNotificationsProps {
  onOpenWizard: () => void;
  onStartTour?: () => void;
}

export const FoundationNotifications: React.FC<FoundationNotificationsProps> = ({ onOpenWizard, onStartTour }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { pendingItems, completionPercentage, isFoundationComplete, isLoading } = useFoundationStatus();
  const { hasRealityMap } = useRealityMapStatus();
  const { isTourActive } = useTourContext();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('plan');

  // Auto-minimize when tour is active
  useEffect(() => {
    if (isTourActive && !isMinimized) {
      setIsMinimized(true);
    }
  }, [isTourActive, isMinimized]);

  const {
    messages: coachMessages,
    isLoading: coachLoading,
    sendMessage: sendCoachMessage,
  } = useAccountabilityCoach({
    currentPage: `${location.pathname}#foundation-panel`,
    hasRealityMap,
  });

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleAction = (item: FoundationItem) => {
    if (item.action.route) {
      navigate(item.action.route);
    }
    if (item.action.callback) {
      item.action.callback();
    }
  };

  // Don't show if loading, complete, dismissed, or tour is active
  if (isLoading || isFoundationComplete || isDismissed || isTourActive) {
    return null;
  }

  // Minimized view - floating button
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {pendingItems.length}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Bottom sheet with spotlight
  if (isMobile) {
    return (
      <>
        {/* Subtle backdrop - click to minimize */}
        <div 
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
          onClick={() => setIsMinimized(true)}
        />
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col px-3 pb-4"
        >
          {/* Tabs ABOVE panel */}
          <div className="flex items-center justify-between mb-2 px-1">
            <TabsList className="grid grid-cols-2 w-[160px] h-8 bg-muted/90">
              <TabsTrigger value="plan" className="text-xs gap-1 h-7">
                <ListTodo className="w-3 h-3" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="coach" className="text-xs gap-1 h-7">
                <MessageSquare className="w-3 h-3" />
                Coach
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-muted/80 rounded-full"
                onClick={() => setIsMinimized(true)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-muted/80 rounded-full"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main panel - 55% of screen height */}
          <div className="h-[55vh] overflow-hidden rounded-xl bg-card/95 backdrop-blur-lg border border-border shadow-2xl flex flex-col">
            {/* Header compact */}
            <div className="bg-card border-b border-border p-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">Accountability Coach</h3>
                  <p className="text-xs text-muted-foreground">
                    {pendingItems.length} {language === 'en' ? 'items left' : 'elemente rămase'}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary shrink-0">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-1.5 mt-2" />
            </div>

            {/* Content - scrollable */}
            <TabsContent value="plan" className="m-0 flex-1 overflow-y-auto p-3 space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.message[language as 'en' | 'ro'] || item.message.en}
                      </p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.details[language as 'en' | 'ro'] || item.details.en}
                        </p>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-primary hover:text-primary/80"
                        onClick={() => handleAction(item)}
                      >
                        {item.action.label[language as 'en' | 'ro'] || item.action.label.en} →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="coach" className="m-0 flex-1 overflow-hidden">
              <SidebarChatMode
                messages={coachMessages}
                isLoading={coachLoading}
                onSendMessage={sendCoachMessage}
              />
            </TabsContent>

            {/* Footer compact */}
            <div className="bg-card border-t border-border p-2 shrink-0 space-y-1.5">
              <Button
                className="w-full h-9 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={onOpenWizard}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                {language === 'en' ? 'Setup Wizard' : 'Wizard Configurare'}
              </Button>

              {onStartTour && (
                <Button variant="outline" className="w-full h-8 text-xs" onClick={onStartTour}>
                  <Map className="w-3.5 h-3.5 mr-1.5" />
                  {language === 'en' ? 'Platform Tour' : 'Tur Platformă'}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      </>
    );
  }

  // Desktop: Fixed panel in bottom-right
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="fixed bottom-4 right-4 z-50 flex flex-col"
    >
      {/* Tabs ABOVE the panel */}
      <div className="flex items-center justify-between mb-2">
        <TabsList className="grid grid-cols-2 w-[200px]">
          <TabsTrigger value="plan" className="text-xs gap-1.5">
            <ListTodo className="w-3.5 h-3.5" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="coach" className="text-xs gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            AI Coach
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(true)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main panel - TALLER */}
      <div className="w-[380px] h-[520px] overflow-hidden rounded-xl bg-card/95 backdrop-blur-lg border border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {language === 'en' ? 'Accountability Coach' : 'Accountability Coach'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {pendingItems.length} {language === 'en' ? 'items remaining' : 'elemente rămase'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {language === 'en' ? 'Progress' : 'Progres'}
              </span>
              <span className="font-medium text-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <TabsContent value="plan" className="m-0 flex-1 overflow-y-auto p-3 space-y-2">
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.message[language as 'en' | 'ro'] || item.message.en}
                  </p>
                  {item.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.details[language as 'en' | 'ro'] || item.details.en}
                    </p>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-primary hover:text-primary/80"
                    onClick={() => handleAction(item)}
                  >
                    {item.action.label[language as 'en' | 'ro'] || item.action.label.en} →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="coach" className="m-0 flex-1 overflow-hidden">
          <SidebarChatMode
            messages={coachMessages}
            isLoading={coachLoading}
            onSendMessage={sendCoachMessage}
          />
        </TabsContent>

        {/* Footer */}
        <div className="bg-card/95 backdrop-blur-sm border-t border-border p-3 space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={onOpenWizard}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Complete Configuration Wizard' : 'Wizard Complet de Configurare'}
          </Button>

          {onStartTour && (
            <Button variant="outline" className="w-full" onClick={onStartTour}>
              <Map className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Take Platform Tour' : 'Tur Ghidat al Platformei'}
            </Button>
          )}
        </div>
      </div>
    </Tabs>
  );
};