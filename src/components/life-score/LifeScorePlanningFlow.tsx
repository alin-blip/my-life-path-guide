import React, { useState, useCallback } from 'react';
import { GoalCategory } from '@/types/goalWizard';
import { GoalWizardModal } from '@/components/goal-wizard/GoalWizardModal';
import { CategoryMultiSelector } from './CategoryMultiSelector';
import { ContinuePlanningDialog } from './ContinuePlanningDialog';
import { MultiCategoryPlanSummary } from './MultiCategoryPlanSummary';
import { MembershipOfferStack } from '@/components/vision-quiz/planning/MembershipOfferStack';
import { QuizCategory } from '@/components/vision-quiz/quizData';
import { motion, AnimatePresence } from 'framer-motion';

type FlowStep = 'category-select' | 'planning' | 'continue-dialog' | 'summary' | 'offer';

interface PlanData {
  category: GoalCategory;
  annual?: string;
  quarterly?: string;
  monthly?: string;
  weekly?: string;
}

interface LifeScorePlanningFlowProps {
  categoryScores: Record<string, number>;
  weakestCategory: string;
  language: 'en' | 'ro';
}

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
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [completedCategories, setCompletedCategories] = useState<GoalCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<GoalCategory | null>(null);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  const handleStartPlanning = useCallback((categories: GoalCategory[]) => {
    setSelectedCategories(categories);
    setCurrentCategory(categories[0]);
    setShowWizard(true);
    setStep('planning');
  }, []);

  const handleWizardComplete = useCallback(() => {
    if (!currentCategory) return;

    setCompletedCategories(prev => [...prev, currentCategory]);
    
    setPlans(prev => [...prev, {
      category: currentCategory,
      annual: `${currentCategory} annual goal`,
      quarterly: `${currentCategory} 90-day milestone`,
      monthly: `${currentCategory} monthly focus`,
      weekly: `${currentCategory} week 1 action`,
    }]);

    setShowWizard(false);
    
    const remaining = selectedCategories.filter(
      cat => !completedCategories.includes(cat) && cat !== currentCategory
    );
    
    if (remaining.length > 0) {
      setStep('continue-dialog');
    } else {
      setStep('summary');
    }
  }, [currentCategory, selectedCategories, completedCategories]);

  const handleContinueWithCategory = useCallback((category: GoalCategory) => {
    setCurrentCategory(category);
    setShowWizard(true);
    setStep('planning');
  }, []);

  const handleViewPlanAndOffer = useCallback(() => {
    setStep('summary');
  }, []);

  const handleChooseMembership = useCallback(() => {
    setStep('offer');
  }, []);

  const allRemainingCategories: GoalCategory[] = (['business', 'body', 'being', 'balance'] as GoalCategory[]).filter(
    cat => !completedCategories.includes(cat)
  );

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

        {step === 'continue-dialog' && (
          <motion.div
            key="continue-dialog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContinuePlanningDialog
              completedCategories={completedCategories}
              remainingCategories={allRemainingCategories}
              onContinueWithCategory={handleContinueWithCategory}
              onViewPlanAndOffer={handleViewPlanAndOffer}
              language={language}
            />
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MultiCategoryPlanSummary
              plans={plans}
              onChooseMembership={handleChooseMembership}
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

      {currentCategory && (
        <GoalWizardModal
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            if (!completedCategories.includes(currentCategory)) {
              if (completedCategories.length > 0) {
                setStep('continue-dialog');
              } else {
                setStep('category-select');
              }
            }
          }}
          category={currentCategory}
          missionType="annual"
          period={String(new Date().getFullYear())}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
};
