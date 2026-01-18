import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Zap, Brain, Heart, Briefcase, Loader2, Sparkles } from 'lucide-react';
import { QuizCategory } from '@/components/vision-quiz/quizData';
import { supabase } from '@/integrations/supabase/client';

interface GoalsWizardProps {
  language: 'en' | 'ro';
  scores: Record<QuizCategory, number>;
  email: string;
  name: string;
  onComplete: (goals: Record<QuizCategory, string>) => void;
}

const categoryConfig: Record<QuizCategory, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  questionRo: string;
  questionEn: string;
  placeholderRo: string;
  placeholderEn: string;
}> = {
  body: {
    icon: <Zap className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    questionRo: 'Care este obiectivul tău principal pentru CORP în 2026?',
    questionEn: 'What is your main BODY goal for 2026?',
    placeholderRo: 'Ex: Să am mai multă energie, să slăbesc 10kg, să alerg un maraton...',
    placeholderEn: 'E.g.: Have more energy, lose 10kg, run a marathon...',
  },
  being: {
    icon: <Brain className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    questionRo: 'Care este obiectivul tău principal pentru SPIRIT în 2026?',
    questionEn: 'What is your main SPIRIT/MINDSET goal for 2026?',
    placeholderRo: 'Ex: Să meditez zilnic, să am mai multă claritate mentală, să gestionez stresul mai bine...',
    placeholderEn: 'E.g.: Daily meditation, more mental clarity, better stress management...',
  },
  balance: {
    icon: <Heart className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
    questionRo: 'Care este obiectivul tău principal pentru RELAȚII în 2026?',
    questionEn: 'What is your main RELATIONSHIPS goal for 2026?',
    placeholderRo: 'Ex: Să petrec mai mult timp de calitate cu familia, să reconectez cu prietenii...',
    placeholderEn: 'E.g.: Spend more quality time with family, reconnect with friends...',
  },
  business: {
    icon: <Briefcase className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    questionRo: 'Care este obiectivul tău principal pentru BUSINESS/CARIERĂ în 2026?',
    questionEn: 'What is your main BUSINESS/CAREER goal for 2026?',
    placeholderRo: 'Ex: Să cresc veniturile cu 50%, să lansez un produs nou, să obțin o promovare...',
    placeholderEn: 'E.g.: Increase income by 50%, launch a new product, get a promotion...',
  },
};

const categoryLabels: Record<QuizCategory, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Spirit', ro: 'Spirit' },
  balance: { en: 'Balance', ro: 'Relații' },
  business: { en: 'Business', ro: 'Business' },
};

export const GoalsWizard: React.FC<GoalsWizardProps> = ({
  language,
  scores,
  email,
  name,
  onComplete,
}) => {
  const categories: QuizCategory[] = ['body', 'being', 'balance', 'business'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goals, setGoals] = useState<Record<QuizCategory, string>>({
    body: '',
    being: '',
    balance: '',
    business: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = categories[currentIndex];
  const config = categoryConfig[currentCategory];
  const isLast = currentIndex === categories.length - 1;
  const lang = language === 'en' ? 'en' : 'ro';

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Get current user (should exist from quiz signup)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save goals as annual missions
        const missions = Object.entries(goals)
          .filter(([_, goal]) => goal.trim())
          .map(([category, goal]) => ({
            user_id: user.id,
            category,
            mission_type: 'annual',
            title: goal.trim(),
            goal_data: { 
              objective: goal.trim(),
              source: 'vision_2026_quiz',
              scores,
            },
            period: '2026',
            is_impossible_game: false,
            completed: false,
          }));

        if (missions.length > 0) {
          await supabase.from('missions').insert(missions);
        }
      }

      // Send email with goals via edge function
      try {
        await supabase.functions.invoke('send-vision-plan', {
          body: {
            email,
            name,
            language: lang,
            scores,
            goals,
          }
        });
      } catch (emailError) {
        console.error('Error sending plan email:', emailError);
      }

      onComplete(goals);
    } catch (error) {
      console.error('Error saving goals:', error);
      onComplete(goals);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {categories.map((cat, idx) => (
          <div
            key={cat}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex 
                ? 'w-8 bg-primary' 
                : idx < currentIndex 
                  ? 'bg-primary/60' 
                  : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <Card className="p-6 md:p-8">
        {/* Category Header */}
        <div className={`flex items-center gap-3 mb-6 p-3 rounded-xl ${config.bgColor}`}>
          <div className={`w-12 h-12 rounded-full bg-white/80 flex items-center justify-center ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              {lang === 'en' ? `Step ${currentIndex + 1} of 4` : `Pasul ${currentIndex + 1} din 4`}
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {lang === 'en' ? categoryLabels[currentCategory].en : categoryLabels[currentCategory].ro}
            </h2>
          </div>
        </div>

        {/* Question */}
        <p className="text-lg font-medium text-slate-800 mb-4">
          {lang === 'en' ? config.questionEn : config.questionRo}
        </p>

        {/* Score Context */}
        <p className="text-sm text-slate-500 mb-4">
          {lang === 'en' 
            ? `Your current score: ${scores[currentCategory]}/16 — This goal will help you improve this area.`
            : `Scorul tău actual: ${scores[currentCategory]}/16 — Acest obiectiv te va ajuta să îmbunătățești această arie.`}
        </p>

        {/* Input */}
        <Textarea
          value={goals[currentCategory]}
          onChange={(e) => setGoals(prev => ({ ...prev, [currentCategory]: e.target.value }))}
          placeholder={lang === 'en' ? config.placeholderEn : config.placeholderRo}
          className="min-h-[120px] text-lg resize-none mb-6"
        />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={currentIndex === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!goals[currentCategory].trim() || isSubmitting}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {lang === 'en' ? 'Saving...' : 'Se salvează...'}
              </>
            ) : isLast ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Create My Plan' : 'Creează Planul Meu'}
              </>
            ) : (
              <>
                {lang === 'en' ? 'Next' : 'Următorul'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Skip option */}
      {!isLast && (
        <p className="text-center mt-4">
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            {lang === 'en' ? 'Skip this category' : 'Sari peste această categorie'}
          </button>
        </p>
      )}
    </div>
  );
};
