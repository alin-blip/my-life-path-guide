import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Rocket, Calendar, Map, ArrowRight, Crown, 
  Dumbbell, Brain, Heart, Briefcase, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GoalCategory } from '@/types/goalWizard';

interface PlanData {
  category: GoalCategory;
  annual?: string;
  quarterly?: string;
  monthly?: string;
  weekly?: string;
}

interface MultiCategoryPlanSummaryProps {
  plans: PlanData[];
  onChooseMembership: () => void;
  language: 'en' | 'ro';
}

const CATEGORY_INFO: Record<GoalCategory, { icon: React.ElementType; en: string; ro: string; color: string; gradient: string }> = {
  business: { icon: Briefcase, en: 'Business', ro: 'Business', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  body: { icon: Dumbbell, en: 'Body', ro: 'Corp', color: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  being: { icon: Brain, en: 'Spirituality', ro: 'Spiritualitate', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
  balance: { icon: Heart, en: 'Relationships', ro: 'Relații', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
};

export const MultiCategoryPlanSummary: React.FC<MultiCategoryPlanSummaryProps> = ({
  plans,
  onChooseMembership,
  language,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div 
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Map className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' ? 'Your 2026 Roadmap' : 'Harta Ta pentru 2026'}
        </h2>
        
        <p className="text-white/60 max-w-lg mx-auto text-sm">
          {language === 'en'
            ? `You've created ${plans.length} strategic ${plans.length > 1 ? 'plans' : 'plan'}. Here's your complete vision.`
            : `Ai creat ${plans.length} ${plans.length > 1 ? 'planuri strategice' : 'plan strategic'}. Iată viziunea ta completă.`}
        </p>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const info = CATEGORY_INFO[plan.category];
          const CategoryIcon = info.icon;
          
          return (
            <motion.div
              key={plan.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                {/* Category Header */}
                <div className={cn(
                  "h-1 w-full bg-gradient-to-r",
                  info.gradient
                )} />
                
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      info.gradient
                    )}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">
                        {language === 'en' ? info.en : info.ro}
                      </h3>
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        {language === 'en' ? 'PLANNED' : 'PLANIFICAT'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Plan Details */}
                  <div className="space-y-2 text-sm">
                    {plan.annual && (
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-white/50 text-xs">
                            {language === 'en' ? 'Annual:' : 'Anual:'}
                          </span>
                          <p className="text-white">{plan.annual}</p>
                        </div>
                      </div>
                    )}
                    
                    {plan.quarterly && (
                      <div className="flex items-start gap-2">
                        <Rocket className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-white/50 text-xs">
                            {language === 'en' ? '90-Day:' : '90 Zile:'}
                          </span>
                          <p className="text-white">{plan.quarterly}</p>
                        </div>
                      </div>
                    )}
                    
                    {plan.monthly && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-white/50 text-xs">
                            {language === 'en' ? 'Monthly:' : 'Lunar:'}
                          </span>
                          <p className="text-white">{plan.monthly}</p>
                        </div>
                      </div>
                    )}
                    
                    {plan.weekly && (
                      <div className="flex items-start gap-2">
                        <Map className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-white/50 text-xs">
                            {language === 'en' ? 'Week 1:' : 'Săptămâna 1:'}
                          </span>
                          <p className="text-white">{plan.weekly}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { icon: Target, label: language === 'en' ? 'Annual' : 'Anuale', count: plans.length },
            { icon: Rocket, label: language === 'en' ? '90-Day' : '90 Zile', count: plans.filter(p => p.quarterly).length },
            { icon: Calendar, label: language === 'en' ? 'Monthly' : 'Lunare', count: plans.filter(p => p.monthly).length },
            { icon: Map, label: language === 'en' ? 'Weekly' : 'Săpt.', count: plans.filter(p => p.weekly).length },
          ].map((stat, idx) => (
            <div key={idx}>
              <stat.icon className="w-5 h-5 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-bold text-white">{stat.count}</p>
              <p className="text-[10px] text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Button
        onClick={onChooseMembership}
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-xl shadow-lg"
      >
        <Crown className="w-5 h-5 mr-2" />
        {language === 'en' 
          ? 'Choose Your Membership' 
          : 'Alege Abonamentul Tău'}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};
