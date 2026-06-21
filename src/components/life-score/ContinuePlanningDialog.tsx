import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, ArrowRight, Map, Dumbbell, Brain, Heart, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GoalCategory } from '@/types/goalWizard';

interface ContinuePlanningDialogProps {
  completedCategories: GoalCategory[];
  remainingCategories: GoalCategory[];
  onContinueWithCategory: (category: GoalCategory) => void;
  onViewPlanAndOffer: () => void;
  language: 'en' | 'ro';
}

const CATEGORY_INFO: Record<GoalCategory, { icon: React.ElementType; en: string; ro: string; gradient: string }> = {
  business: { icon: Briefcase, en: 'Business', ro: 'Business', gradient: 'from-blue-500 to-indigo-500' },
  body: { icon: Dumbbell, en: 'Body', ro: 'Corp', gradient: 'from-green-500 to-emerald-500' },
  being: { icon: Brain, en: 'Spirituality', ro: 'Spiritualitate', gradient: 'from-violet-500 to-purple-500' },
  balance: { icon: Heart, en: 'Relationships', ro: 'Relații', gradient: 'from-pink-500 to-rose-500' },
  minte: { icon: Brain, en: 'Mind', ro: 'Minte', gradient: 'from-violet-600 to-fuchsia-500' },
};

export const ContinuePlanningDialog: React.FC<ContinuePlanningDialogProps> = ({
  completedCategories,
  remainingCategories,
  onContinueWithCategory,
  onViewPlanAndOffer,
  language,
}) => {
  const allCategories: GoalCategory[] = ['business', 'body', 'being', 'balance'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div 
          className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white">
          {language === 'en' 
            ? `${completedCategories.length > 1 ? 'Plans' : 'Plan'} Created!` 
            : `${completedCategories.length > 1 ? 'Planurile au fost' : 'Planul a fost'} Creat${completedCategories.length > 1 ? 'e' : ''}!`}
        </h2>
        
        <p className="text-white/60 text-sm">
          {language === 'en'
            ? 'Great job! Would you like to plan another area or view your complete roadmap?'
            : 'Excelent! Vrei să planifici altă arie sau să vezi harta ta completă?'}
        </p>
      </div>

      {/* Category Status */}
      <Card className="bg-white/5 border-white/10 p-4 space-y-3">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
          {language === 'en' ? 'Your Progress' : 'Progresul Tău'}
        </p>
        
        <div className="space-y-2">
          {allCategories.map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isCompleted = completedCategories.includes(cat);
            const CategoryIcon = info.icon;
            
            return (
              <div 
                key={cat}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all",
                  isCompleted ? "bg-green-500/10" : "bg-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isCompleted 
                    ? "bg-gradient-to-br from-green-400 to-emerald-500"
                    : "bg-white/10"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <CategoryIcon className="w-4 h-4 text-white/50" />
                  )}
                </div>
                
                <span className={cn(
                  "font-medium text-sm",
                  isCompleted ? "text-white" : "text-white/50"
                )}>
                  {language === 'en' ? info.en : info.ro}
                </span>
                
                {isCompleted && (
                  <span className="ml-auto text-green-400 text-xs">
                    ✓ {language === 'en' ? 'Complete' : 'Complet'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {remainingCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/50 text-xs text-center">
              {language === 'en' ? 'Continue planning:' : 'Continuă planificarea:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {remainingCategories.map((cat) => {
                const info = CATEGORY_INFO[cat];
                const CategoryIcon = info.icon;
                
                return (
                  <Button
                    key={cat}
                    variant="outline"
                    onClick={() => onContinueWithCategory(cat)}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 py-6"
                  >
                    <CategoryIcon className="w-4 h-4 mr-2" />
                    {language === 'en' ? info.en : info.ro}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <Button
          onClick={onViewPlanAndOffer}
          size="lg"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl shadow-lg"
        >
          <Map className="w-5 h-5 mr-2" />
          {language === 'en' 
            ? 'View My Roadmap & Choose Membership' 
            : 'Vezi Harta Mea & Alege Abonamentul'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
