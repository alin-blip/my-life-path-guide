import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { GoalCategory } from '@/types/goalWizard';

interface CategorySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: GoalCategory) => void;
}

const CATEGORIES = [
  {
    id: 'body' as GoalCategory,
    icon: Dumbbell,
    label: { en: 'BODY', ro: 'CORP' },
    description: { en: 'Health & Fitness', ro: 'Sănătate & Fitness' },
    gradient: 'from-emerald-600 to-emerald-400',
    bgColor: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500'
  },
  {
    id: 'being' as GoalCategory,
    icon: Brain,
    label: { en: 'SPIRITUALITY', ro: 'SPIRITUALITATE' },
    description: { en: 'Mindset & Growth', ro: 'Mindset & Creștere' },
    gradient: 'from-purple-600 to-purple-400',
    bgColor: 'bg-purple-500/10',
    hoverBg: 'hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-500'
  },
  {
    id: 'balance' as GoalCategory,
    icon: Heart,
    label: { en: 'RELATIONSHIPS', ro: 'RELAȚII' },
    description: { en: 'Family & Friends', ro: 'Familie & Prieteni' },
    gradient: 'from-rose-600 to-rose-400',
    bgColor: 'bg-rose-500/10',
    hoverBg: 'hover:bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-500'
  },
  {
    id: 'business' as GoalCategory,
    icon: Briefcase,
    label: { en: 'BUSINESS', ro: 'BUSINESS' },
    description: { en: 'Career & Finance', ro: 'Carieră & Finanțe' },
    gradient: 'from-blue-600 to-blue-400',
    bgColor: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500'
  }
];

export const CategorySelectionDialog: React.FC<CategorySelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const { language } = useLanguage();

  const handleSelect = (category: GoalCategory) => {
    onSelectCategory(category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {language === 'en' 
                ? 'Which category do you want to start with?' 
                : 'Cu ce categorie vrei să începi?'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "group relative p-5 rounded-xl border-2 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg",
                  cat.bgColor,
                  cat.hoverBg,
                  cat.borderColor
                )}
              >
                {/* Gradient top line */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity",
                  cat.gradient
                )} />
                
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className={cn(
                    "p-3 rounded-xl bg-background/50 group-hover:bg-background/80 transition-colors",
                    cat.iconColor
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-foreground tracking-wide">
                      {cat.label[language as 'en' | 'ro']}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.description[language as 'en' | 'ro']}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6 pt-2 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            {language === 'en' ? 'Skip - I\'ll set them later' : 'Skip - Le voi seta mai târziu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
