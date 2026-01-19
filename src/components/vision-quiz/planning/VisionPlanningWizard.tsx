import React, { useState } from 'react';
import { AnnualVisionStep } from './steps/AnnualVisionStep';
import { QuarterlySprintStep } from './steps/QuarterlySprintStep';
import { MonthlyMissionStep } from './steps/MonthlyMissionStep';
import { VisionPlanSummary } from './VisionPlanSummary';
import { MembershipOfferStack } from './MembershipOfferStack';
import { QuizCategory } from '../quizData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PlanningStep = 'annual' | 'quarterly' | 'monthly' | 'summary' | 'offer';

export interface PlanningAnswers {
  annual: Record<string, string>;
  quarterly: Record<string, string>;
  monthly: Record<string, string>;
}

interface VisionPlanningWizardProps {
  scores: Record<QuizCategory, number>;
  lowestCategory: QuizCategory;
  language: 'en' | 'ro';
  onComplete?: () => void;
}

export const VisionPlanningWizard: React.FC<VisionPlanningWizardProps> = ({
  scores,
  lowestCategory,
  language,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<PlanningStep>('annual');
  const [answers, setAnswers] = useState<PlanningAnswers>({
    annual: {},
    quarterly: {},
    monthly: {},
  });
  const [savedMissionIds, setSavedMissionIds] = useState<{
    annual?: string;
    quarterly?: string;
    monthly?: string;
  }>({});

  const handleAnnualComplete = async (annualAnswers: Record<string, string>) => {
    setAnswers(prev => ({ ...prev, annual: annualAnswers }));
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: user.id,
            category: lowestCategory,
            mission_type: 'annual',
            period: '2026',
            title: annualAnswers.main_goal || 'Annual Vision 2026',
            measurable_result: annualAnswers.success_feeling || '',
            goal_data: { 
              source: 'vision-quiz',
              answers: annualAnswers,
              scores 
            },
          })
          .select('id')
          .single();
        
        if (!error && data) {
          setSavedMissionIds(prev => ({ ...prev, annual: data.id }));
        }
      }
    } catch (err) {
      console.error('Error saving annual mission:', err);
    }
    
    setCurrentStep('quarterly');
  };

  const handleQuarterlyComplete = async (quarterlyAnswers: Record<string, string>) => {
    setAnswers(prev => ({ ...prev, quarterly: quarterlyAnswers }));
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-2026`;
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: user.id,
            category: lowestCategory,
            mission_type: 'quarterly',
            period: currentQuarter,
            parent_mission_id: savedMissionIds.annual || null,
            title: quarterlyAnswers.quarterly_milestone || '90-Day Sprint',
            measurable_result: quarterlyAnswers.three_milestones || '',
            goal_data: { 
              source: 'vision-quiz',
              answers: quarterlyAnswers 
            },
          })
          .select('id')
          .single();
        
        if (!error && data) {
          setSavedMissionIds(prev => ({ ...prev, quarterly: data.id }));
        }
      }
    } catch (err) {
      console.error('Error saving quarterly mission:', err);
    }
    
    setCurrentStep('monthly');
  };

  const handleMonthlyComplete = async (monthlyAnswers: Record<string, string>) => {
    setAnswers(prev => ({ ...prev, monthly: monthlyAnswers }));
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data, error } = await supabase
          .from('missions')
          .insert({
            user_id: user.id,
            category: lowestCategory,
            mission_type: 'monthly',
            period: currentMonth,
            parent_mission_id: savedMissionIds.quarterly || null,
            title: monthlyAnswers.monthly_focus || '30-Day Mission',
            measurable_result: monthlyAnswers.weekly_commitment || '',
            goal_data: { 
              source: 'vision-quiz',
              answers: monthlyAnswers 
            },
          })
          .select('id')
          .single();
        
        if (!error && data) {
          setSavedMissionIds(prev => ({ ...prev, monthly: data.id }));
          toast.success(language === 'en' 
            ? 'Your 2026 roadmap has been saved!' 
            : 'Harta ta pentru 2026 a fost salvată!');
        }
      }
    } catch (err) {
      console.error('Error saving monthly mission:', err);
    }
    
    setCurrentStep('summary');
  };

  const handleSummaryComplete = () => {
    setCurrentStep('offer');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {currentStep === 'annual' && (
        <AnnualVisionStep
          language={language}
          lowestCategory={lowestCategory}
          onComplete={handleAnnualComplete}
        />
      )}
      
      {currentStep === 'quarterly' && (
        <QuarterlySprintStep
          language={language}
          annualGoal={answers.annual.main_goal}
          onComplete={handleQuarterlyComplete}
          onBack={() => setCurrentStep('annual')}
        />
      )}
      
      {currentStep === 'monthly' && (
        <MonthlyMissionStep
          language={language}
          quarterlyGoal={answers.quarterly.quarterly_milestone}
          onComplete={handleMonthlyComplete}
          onBack={() => setCurrentStep('quarterly')}
        />
      )}
      
      {currentStep === 'summary' && (
        <VisionPlanSummary
          language={language}
          answers={answers}
          lowestCategory={lowestCategory}
          onContinue={handleSummaryComplete}
        />
      )}
      
      {currentStep === 'offer' && (
        <MembershipOfferStack
          language={language}
          scores={scores}
          answers={answers}
        />
      )}
    </div>
  );
};
