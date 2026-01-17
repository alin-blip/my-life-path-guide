import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useFoundationStatus, FoundationItem } from '@/hooks/useFoundationStatus';

interface FoundationNotificationsProps {
  onOpenWizard: () => void;
}

export const FoundationNotifications: React.FC<FoundationNotificationsProps> = ({ onOpenWizard }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { pendingItems, completionPercentage, isFoundationComplete, isLoading } = useFoundationStatus();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Session-only dismiss - reappears on next navigation/refresh
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

  // Check if user is in first session (first hour after signup)
  const isFirstSession = () => {
    const graceFlag = localStorage.getItem('new-user-first-session');
    if (graceFlag) {
      return Date.now() - parseInt(graceFlag) < 60 * 60 * 1000; // 1 hour grace period
    }
    return false;
  };

  // Don't show if loading, complete, dismissed, or new user in first session
  if (isLoading || isFoundationComplete || isDismissed || isFirstSession()) {
    return null;
  }

  // Minimized view
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

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-h-[420px] overflow-hidden rounded-xl bg-card/95 backdrop-blur-lg border border-border shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {language === 'en' ? 'Accountability Coach: Your Foundation' : 'Accountability Coach: Fundația ta'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {pendingItems.length} {language === 'en' ? 'items remaining' : 'elemente rămase'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMinimized(true)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
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

      {/* Notification Items */}
      <div className="max-h-[240px] overflow-y-auto p-2 space-y-2">
        {pendingItems.slice(0, 4).map((item) => (
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
        
        {pendingItems.length > 4 && (
          <p className="text-xs text-center text-muted-foreground py-2">
            +{pendingItems.length - 4} {language === 'en' ? 'more items' : 'elemente suplimentare'}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-3">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={onOpenWizard}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Complete Configuration Wizard' : 'Wizard Complet de Configurare'}
        </Button>
      </div>
    </div>
  );
};
