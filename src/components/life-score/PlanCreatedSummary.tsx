import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Calendar, 
  CalendarDays, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Clock,
  Briefcase,
  Heart,
  Brain,
  Users
} from 'lucide-react';
import { GoalCategory } from '@/types/goalWizard';
import { VisionPlanData } from './LifeVisionPlanningModal';
import { motion } from 'framer-motion';

interface PlanCreatedSummaryProps {
  planData: VisionPlanData;
  onContinue: () => void;
  language: 'en' | 'ro';
}

const CATEGORY_CONFIG: Record<GoalCategory, { icon: React.ElementType; color: string; gradient: string }> = {
  business: { icon: Briefcase, color: 'text-amber-500', gradient: 'from-amber-500/20 to-orange-500/10' },
  body: { icon: Heart, color: 'text-rose-500', gradient: 'from-rose-500/20 to-pink-500/10' },
  being: { icon: Brain, color: 'text-purple-500', gradient: 'from-purple-500/20 to-indigo-500/10' },
  balance: { icon: Users, color: 'text-blue-500', gradient: 'from-blue-500/20 to-cyan-500/10' },
};

const DAY_LABELS: Record<string, { en: string; ro: string }> = {
  'M': { en: 'Monday', ro: 'Luni' },
  'T': { en: 'Tuesday', ro: 'Marți' },
  'W': { en: 'Wednesday', ro: 'Miercuri' },
  'Th': { en: 'Thursday', ro: 'Joi' },
  'F': { en: 'Friday', ro: 'Vineri' },
  'Sa': { en: 'Saturday', ro: 'Sâmbătă' },
  'Su': { en: 'Sunday', ro: 'Duminică' },
};

export const PlanCreatedSummary: React.FC<PlanCreatedSummaryProps> = ({
  planData,
  onContinue,
  language,
}) => {
  const config = CATEGORY_CONFIG[planData.category];
  const CategoryIcon = config.icon;

  const totalTasks = planData.weeklyKeys.reduce((acc, key) => acc + (key.steps?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'ro' ? '🎉 Planul Tău Este Gata!' : '🎉 Your Plan Is Ready!'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ro' 
            ? `Ai creat o strategie completă pentru ${planData.categoryLabel}`
            : `You've created a complete strategy for ${planData.categoryLabel}`
          }
        </p>
      </motion.div>

      {/* Plan Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`bg-gradient-to-br ${config.gradient} border-0 shadow-lg`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/80 ${config.color}`}>
                <CategoryIcon className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">{planData.categoryLabel}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Annual Vision */}
            <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
              <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  {language === 'ro' ? 'Viziune Anuală' : 'Annual Vision'}
                </p>
                <p className="font-medium">{planData.annualVision}</p>
              </div>
            </div>

            {/* 90 Day Milestone */}
            <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
              <CalendarDays className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  {language === 'ro' ? 'Milestone 90 Zile' : '90 Day Milestone'}
                </p>
                <p className="font-medium">{planData.quarterlyMilestone}</p>
              </div>
            </div>

            {/* Monthly Focus */}
            <div className="flex items-start gap-3 p-3 bg-background/60 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  {language === 'ro' ? 'Focus Luna 1' : 'Month 1 Focus'}
                </p>
                <p className="font-medium">{planData.monthlyFocus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {language === 'ro' ? 'Săptămâna 1 - Acțiuni Cheie' : 'Week 1 - Key Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {planData.weeklyKeys.map((key, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {language === 'ro' ? `Cheie ${key.id}` : `Key ${key.id}`}
                  </Badge>
                  <span className="font-medium text-sm">{key.title}</span>
                </div>
                
                {key.steps && key.steps.length > 0 && (
                  <div className="pl-4 space-y-1">
                    {key.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${step.listType === 'hit' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <span className="text-muted-foreground">
                          {DAY_LABELS[step.day]?.[language] || step.day}:
                        </span>
                        <span>{step.text}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {step.listType.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">4</p>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'Chei' : 'Keys'}
          </p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">{totalTasks}</p>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'Taskuri' : 'Tasks'}
          </p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">1</p>
          <p className="text-xs text-muted-foreground">
            {language === 'ro' ? 'Categorie' : 'Category'}
          </p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg gap-2"
          size="lg"
        >
          {language === 'ro' ? 'Continuă - Alege Abonament' : 'Continue - Choose Membership'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};
