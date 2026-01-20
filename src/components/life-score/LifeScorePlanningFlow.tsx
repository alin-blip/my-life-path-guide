import React, { useState, useCallback, useEffect } from 'react';
import { GoalCategory } from '@/types/goalWizard';
import { CategoryMultiSelector } from './CategoryMultiSelector';
import { LifeVisionPlanningModal, VisionPlanData } from './LifeVisionPlanningModal';
import { PlanCreatedSummary } from './PlanCreatedSummary';
import { MembershipOfferStack } from '@/components/vision-quiz/planning/MembershipOfferStack';
import { QuizCategory } from '@/components/vision-quiz/quizData';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getWeekKeyForPlanning } from '@/utils/weekUtils';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

type FlowStep = 'category-select' | 'planning' | 'plan-created' | 'offer';

const LIFE_SCORE_PENDING_KEY = 'life_score_pending_planning';

interface LifeScorePlanningFlowProps {
  categoryScores: Record<string, number>;
  weakestCategory: string;
  language: 'en' | 'ro';
}

const CATEGORY_LABELS: Record<GoalCategory, { en: string; ro: string }> = {
  business: { en: 'Business', ro: 'Business' },
  body: { en: 'Body & Health', ro: 'Corp & Sănătate' },
  being: { en: 'Spirit & Mindset', ro: 'Spirit & Mindset' },
  balance: { en: 'Relationships', ro: 'Relații' },
};

// Map life score categories to quiz categories for MembershipOfferStack
const mapToQuizScores = (categoryScores: Record<string, number>): Record<QuizCategory, number> => {
  return {
    body: (categoryScores['body'] || 3) * 25,
    being: (categoryScores['being'] || 3) * 25,
    balance: (categoryScores['balance'] || 3) * 25,
    business: (categoryScores['business'] || 3) * 25,
  };
};

export const LifeScorePlanningFlow: React.FC<LifeScorePlanningFlowProps> = ({
  categoryScores,
  weakestCategory,
  language,
}) => {
  const [step, setStep] = useState<FlowStep>('category-select');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [createdPlan, setCreatedPlan] = useState<VisionPlanData | null>(null);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for pending planning after auth redirect
  useEffect(() => {
    const checkPendingPlanning = async () => {
      const pending = localStorage.getItem(LIFE_SCORE_PENDING_KEY);
      if (pending) {
        try {
          const { category } = JSON.parse(pending);
          const { data: { user } } = await supabase.auth.getUser();
          if (user && category) {
            // User is now authenticated, resume planning
            localStorage.removeItem(LIFE_SCORE_PENDING_KEY);
            setSelectedCategory(category as GoalCategory);
            setShowPlanningModal(true);
            setStep('planning');
          }
        } catch (e) {
          console.error('Error restoring pending planning:', e);
          localStorage.removeItem(LIFE_SCORE_PENDING_KEY);
        }
      }
    };
    checkPendingPlanning();
  }, []);

  const handleStartPlanning = useCallback(async (categories: GoalCategory[]) => {
    // Use first selected category (single selection for free tier)
    const category = categories[0];
    
    // Check if user is authenticated before opening AI planning modal
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Save pending state and redirect to auth
      localStorage.setItem(LIFE_SCORE_PENDING_KEY, JSON.stringify({ 
        category,
        categoryScores,
        weakestCategory 
      }));
      
      toast({
        title: language === 'ro' ? 'Autentificare necesară' : 'Authentication required',
        description: language === 'ro' 
          ? 'Te rugăm să te autentifici pentru a începe planificarea AI' 
          : 'Please sign in to start AI planning',
      });
      
      navigate('/auth', { 
        state: { 
          returnUrl: '/life-score',
          reason: 'planning'
        } 
      });
      return;
    }
    
    setSelectedCategory(category);
    setShowPlanningModal(true);
    setStep('planning');
  }, [categoryScores, weakestCategory, language, toast, navigate]);

  const handlePlanComplete = useCallback(async (planData: VisionPlanData) => {
    console.log('📝 Plan complete:', planData);
    setCreatedPlan(planData);
    setShowPlanningModal(false);
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'ro' ? 'Eroare' : 'Error',
          description: language === 'ro' ? 'Trebuie să fii autentificat' : 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      // Save annual mission
      const { error: annualError } = await supabase
        .from('missions')
        .upsert({
          user_id: user.id,
          category: planData.category,
          mission_type: 'annual',
          title: planData.annualVision,
          period: String(new Date().getFullYear()),
          completed: false,
        }, {
          onConflict: 'user_id,category,mission_type,period'
        });

      if (annualError) {
        console.error('Error saving annual mission:', annualError);
      }

      // Save quarterly mission
      const quarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const { error: quarterlyError } = await supabase
        .from('missions')
        .upsert({
          user_id: user.id,
          category: planData.category,
          mission_type: 'quarterly',
          title: planData.quarterlyMilestone,
          period: `${new Date().getFullYear()}-Q${quarter}`,
          completed: false,
        }, {
          onConflict: 'user_id,category,mission_type,period'
        });

      if (quarterlyError) {
        console.error('Error saving quarterly mission:', quarterlyError);
      }

      // Save monthly mission
      const { error: monthlyError } = await supabase
        .from('missions')
        .upsert({
          user_id: user.id,
          category: planData.category,
          mission_type: 'monthly',
          title: planData.monthlyFocus,
          period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          completed: false,
        }, {
          onConflict: 'user_id,category,mission_type,period'
        });

      if (monthlyError) {
        console.error('Error saving monthly mission:', monthlyError);
      }

      // Save weekly planning with keys
      const weekKey = getWeekKeyForPlanning();
      await weeklyPlanningService.savePlan({
        weekKey,
        dominoTitle: planData.annualVision,
        weekGoal: planData.monthlyFocus,
        keyPoints: planData.weeklyKeys.map(key => ({
          id: key.id,
          title: key.title,
          objective: key.objective,
          why: '',
          positiveImpact: '',
          negativeImpact: '',
          steps: key.steps,
          responsible: '',
          deadline: key.deadline || '',
        })),
        category: planData.category,
      });

      // Add tasks to user_tasks
      for (const key of planData.weeklyKeys) {
        for (const step of key.steps || []) {
          try {
            await supabase.from('user_tasks').insert({
              user_id: user.id,
              week_key: weekKey,
              title: `[${planData.categoryLabel}] ${step.text}`,
              task_type: 'door',
              day_of_week: step.day,
              list_type: step.listType,
              completed: false,
              category: planData.category,
            });
          } catch (taskError) {
            console.error('Error adding task:', taskError);
          }
        }
      }

      toast({
        title: language === 'ro' ? '✅ Plan salvat!' : '✅ Plan saved!',
        description: language === 'ro' 
          ? `Strategia ta pentru ${planData.categoryLabel} a fost salvată.`
          : `Your ${planData.categoryLabel} strategy has been saved.`,
      });

    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: language === 'ro' ? 'Eroare' : 'Error',
        description: language === 'ro' ? 'Nu s-a putut salva planul' : 'Could not save plan',
        variant: 'destructive',
      });
    }

    setStep('plan-created');
  }, [language, toast]);

  const handleContinueToOffer = useCallback(() => {
    setStep('offer');
  }, []);

  const getCategoryLabel = (category: GoalCategory) => {
    return CATEGORY_LABELS[category]?.[language] || category;
  };

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === 'category-select' && (
          <motion.div
            key="category-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CategoryMultiSelector
              categoryScores={categoryScores}
              weakestCategory={weakestCategory}
              onStartPlanning={handleStartPlanning}
              language={language}
            />
          </motion.div>
        )}

        {step === 'plan-created' && createdPlan && (
          <motion.div
            key="plan-created"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PlanCreatedSummary
              planData={createdPlan}
              onContinue={handleContinueToOffer}
              language={language}
            />
          </motion.div>
        )}

        {step === 'offer' && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MembershipOfferStack
              language={language}
              scores={mapToQuizScores(categoryScores)}
              answers={{
                annual: {},
                quarterly: {},
                monthly: {},
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedCategory && (
        <LifeVisionPlanningModal
          isOpen={showPlanningModal}
          onClose={() => {
            setShowPlanningModal(false);
            if (!createdPlan) {
              setStep('category-select');
            }
          }}
          category={selectedCategory}
          categoryLabel={getCategoryLabel(selectedCategory)}
          onPlanComplete={handlePlanComplete}
          language={language}
        />
      )}
    </div>
  );
};
