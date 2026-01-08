import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFoundationStatus, FoundationItem } from '@/hooks/useFoundationStatus';
import { cn } from '@/lib/utils';

interface CoachRemindersProps {
  onClose?: () => void;
}

export const CoachReminders: React.FC<CoachRemindersProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { pendingItems, completionPercentage, isFoundationComplete, isLoading } = useFoundationStatus();

  const handleAction = (item: FoundationItem) => {
    if (item.action.route) {
      navigate(item.action.route);
      onClose?.();
    }
    if (item.action.callback) {
      item.action.callback();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (isFoundationComplete) {
    return (
      <div className="p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">
          {language === 'ro' ? 'Totul e la punct!' : 'All set!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ro' 
            ? 'Ai completat toate task-urile de bază. Continuă cu rutina ta!' 
            : 'You\'ve completed all base tasks. Continue with your routine!'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">
            {language === 'ro' ? 'Progres fundație' : 'Foundation progress'}
          </span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Reminders List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
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
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 mt-1.5 text-amber-500 hover:text-amber-400 group-hover:translate-x-1 transition-transform"
                    onClick={() => handleAction(item)}
                  >
                    {item.action.label[language as 'en' | 'ro'] || item.action.label.en}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
