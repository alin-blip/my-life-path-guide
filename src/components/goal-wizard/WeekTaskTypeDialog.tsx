import React from 'react';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { ListTodo, Target, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { GoalCategory, CATEGORY_INFO } from '@/types/goalWizard';

interface WeekTaskTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  weekOneTask: string;
  category: GoalCategory;
  onSelectHitList: () => void;
  onSelectMassiveObjective: () => void;
}

export const WeekTaskTypeDialog: React.FC<WeekTaskTypeDialogProps> = ({
  isOpen,
  onClose,
  weekOneTask,
  category,
  onSelectHitList,
  onSelectMassiveObjective
}) => {
  const { language } = useLanguage();
  const categoryInfo = CATEGORY_INFO[category];

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose} className="max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-center">
            {language === 'en' 
              ? 'How do you want to add this task?' 
              : 'Cum vrei să adaugi acest task?'}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="space-y-4">
          {/* Task preview */}
          <div className={cn(
            "p-4 rounded-lg border-2",
            categoryInfo.bgColor,
            "border-dashed"
          )}>
            <p className={cn("text-sm font-medium", categoryInfo.color)}>
              {language === 'en' ? 'Task for week 1:' : 'Task pentru săptămâna 1:'}
            </p>
            <p className="text-foreground mt-1 font-semibold">{weekOneTask}</p>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {/* Option 1: Hit List */}
            <button
              onClick={onSelectHitList}
              className={cn(
                "p-4 rounded-lg border-2 border-border hover:border-primary/50",
                "transition-all duration-200 text-left",
                "hover:bg-muted/50 group"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <ListTodo className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    {language === 'en' ? 'Add to Hit List' : 'Adaugă în Hit List'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'Simple task for next week' 
                      : 'Task simplu pentru săptămâna viitoare'}
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Massive Objective */}
            <button
              onClick={onSelectMassiveObjective}
              className={cn(
                "p-4 rounded-lg border-2 border-primary/30 hover:border-primary",
                "transition-all duration-200 text-left",
                "bg-gradient-to-r from-primary/5 to-goddess-gold/5",
                "hover:from-primary/10 hover:to-goddess-gold/10 group"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-goddess-gold/20">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                    {language === 'en' ? 'Set as Massive Objective' : 'Setează ca Obiectiv Masiv'}
                    <Crown className="w-4 h-4 text-goddess-gold" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? 'The most important goal + 4 strategic keys' 
                      : 'Cel mai important obiectiv + 4 chei strategice'}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Cancel */}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            {language === 'en' ? 'Cancel' : 'Anulează'}
          </Button>
        </div>
      </ResponsiveModal>
  );
};
