import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getLifeScoreQuestions, categoryLabels } from '@/data/lifeScoreQuestions';
import { ArrowLeft, Loader2, CheckCircle2, Sparkles, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackQuizCompleted, trackAccountCreated } from '@/lib/facebook-pixel';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { assignLifeScoreVariant, SplitVariant } from '@/utils/splitTest';

// ---------------------------------------------------------------------------
// Bilingual copy dictionary
// ---------------------------------------------------------------------------
const COPY = {
  ro: {
    question: 'Întrebarea',
    createTitle: 'Creează-ți Planul 2026!',
    createSubtitle: 'Creează un cont gratuit pentru a-ți construi viziunea anuală',
    namePlaceholder: 'Numele tău (opțional)',
    emailPlaceholder: 'Adresa ta de email',
    passwordPlaceholder: 'Creează parolă (min 6 caractere)',
    createBtn: 'Creează Planul Meu',
    trialBadge: 'Trial gratuit 3 zile • Fără card bancar',
    featureWizard: 'Wizard AI',
    featureGoals: 'Obiective Anuale',
    featurePlan: 'Plan 90 Zile',
    back: 'Înapoi',
    timeLeft: '~60 secunde rămase',
    // toast messages
    passShort: 'Parolă prea scurtă',
    passShortDesc: 'Parola trebuie să aibă minim 6 caractere',
    accountExists: 'Contul există deja',
    accountExistsDesc: 'Folosește alt email sau loghează-te',
    accountCreated: 'Cont creat!',
    redirectChallenge: 'Te redirecționăm către Challenge-ul de 7 Zile...',
    redirectDashboard: 'Bine ai venit în aplicație!',
    redirectBusiness: 'Ai potențial de business - vezi oferta specială!',
    redirectJourney: 'Te redirecționăm...',
    errorTitle: 'Eroare',
    errorDesc: 'Ceva nu a mers bine',
  },
  en: {
    question: 'Question',
    createTitle: 'Create Your 2026 Plan!',
    createSubtitle: 'Create a free account to build your annual vision',
    namePlaceholder: 'Your name (optional)',
    emailPlaceholder: 'Your email address',
    passwordPlaceholder: 'Create password (min 6 chars)',
    createBtn: 'Create My Plan',
    trialBadge: '3-day free trial • No credit card required',
    featureWizard: 'AI Wizard',
    featureGoals: 'Annual Goals',
    featurePlan: '90-Day Plan',
    back: 'Back',
    timeLeft: '~60 seconds left',
    // toast messages
    passShort: 'Password too short',
    passShortDesc: 'Password must be at least 6 characters',
    accountExists: 'Account exists',
    accountExistsDesc: 'Please use a different email or login',
    accountCreated: 'Account created!',
    redirectChallenge: 'Redirecting to 7-Day Challenge...',
    redirectDashboard: 'Welcome to your dashboard!',
    redirectBusiness: 'You have business potential - check this special offer!',
    redirectJourney: 'Redirecting to your journey...',
    errorTitle: 'Error',
    errorDesc: 'Something went wrong',
  },
} as const;

interface LifeScoreQuizProps {
  language: 'en' | 'ro';
}

type QuizStep = 'quiz' | 'signup';

export const LifeScoreQuiz: React.FC<LifeScoreQuizProps> = ({ language }) => {
  const t = COPY[language];
  const questions = getLifeScoreQuestions(language);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<QuizStep>('quiz');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (points: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
    
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Track quiz completion
        const finalAnswers = { ...answers, [currentQuestion.id]: points };
        const totalScore = Object.values(finalAnswers).reduce((sum, score) => sum + score, 0);
        trackQuizCompleted('life_score_60s', totalScore);
        
        // Calculate category scores
        const categoryScores: Record<string, number> = {};
        questions.forEach(question => {
          const answer = finalAnswers[question.id];
          if (answer !== undefined) {
            categoryScores[question.category] = answer;
          }
        });
        
        // Save to localStorage for challenge-7-zile page
        localStorage.setItem('lifeScoreData', JSON.stringify({
          totalScore,
          categoryScores,
          answers: finalAnswers,
          timestamp: Date.now()
        }));
        
        // Go to signup step instead of direct redirect (for split test)
        setStep('signup');
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateTotalScore = (): number => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  const calculateCategoryScores = (): Record<string, number> => {
    const scores: Record<string, number> = {};
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        scores[question.category] = answer;
      }
    });
    return scores;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password.length < 6) {
      toast({
        title: t.passShort,
        description: t.passShortDesc,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const emailLower = email.trim().toLowerCase();
    const categoryScores = calculateCategoryScores();
    const totalScore = calculateTotalScore();
    
    // Assign split test variant BEFORE any database operations
    const variant: SplitVariant = assignLifeScoreVariant(emailLower);
    console.log('[Life Score] Assigned split variant:', variant);

    try {
      // 1. Create account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: emailLower,
        password: password,
        options: {
          data: {
            full_name: name.trim() || null,
            source: 'life_score_quiz'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          // Try to sign in instead
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailLower,
            password: password,
          });
          
          if (signInError) {
            toast({
              title: t.accountExists,
              description: t.accountExistsDesc,
              variant: 'destructive',
            });
            setIsSubmitting(false);
            return;
          }
        } else {
          throw signUpError;
        }
      }

      const userId = authData?.user?.id;

      // 2. Save to email_leads with split test source - DELETE+INSERT pattern
      // This ensures split test source is ALWAYS recorded correctly, even for returning users
      await supabase
        .from('email_leads')
        .delete()
        .eq('email', emailLower)
        .eq('lead_magnet', 'life_score_quiz');

      await supabase.from('email_leads').insert({
        email: emailLower,
        name: name.trim() || null,
        lead_magnet: 'life_score_quiz',
        source: `life_score_split_${variant.toLowerCase()}`,
        language,
        metadata: {
          totalScore,
          categoryScores,
          answers,
          splitVariant: variant,
          completed_at: new Date().toISOString(),
        },
      });

      // 3. Set up 3-day trial if we have userId
      if (userId) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 3);

        await supabase.from('subscribers').upsert({
          user_id: userId,
          email: emailLower,
          subscription_tier: 'trial',
          subscription_status: 'trialing',
          early_bird_expires_at: trialEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }

      // Track account creation for funnel analytics
      trackAccountCreated('life_score_quiz');

      // 4. Send results email (non-blocking)
      try {
        await supabase.functions.invoke('send-life-score-results', {
          body: {
            email: emailLower,
            name: name.trim() || 'Warrior',
            scores: categoryScores,
            language
          }
        });
        console.log('Life score results email sent successfully');
      } catch (emailError) {
        console.error('Failed to send life score results email:', emailError);
        // Don't block the flow if email fails
      }

      // 5. Route based on split test variant (already assigned above)
      // Calculate business score for variant C logic
      const businessScore = categoryScores['business'] || 0;
      const businessPercentage = (businessScore / 4) * 100; // max 4 points per category

      // Routing based on variant
      switch (variant) {
        case 'A':
          // Current flow - Challenge
          toast({
            title: t.accountCreated,
            description: t.redirectChallenge,
          });
          setTimeout(() => navigate('/challenge?source=life-score-split-a'), 500);
          break;
          
        case 'B':
          // Direct to dashboard
          toast({
            title: t.accountCreated,
            description: t.redirectDashboard,
          });
          setTimeout(() => navigate('/dashboard?source=life-score-split-b'), 500);
          break;
          
        case 'C':
          // Business performers → Warrior Launch Accelerator
          if (businessPercentage >= 60) {
            toast({
              title: t.accountCreated,
              description: t.redirectBusiness,
            });
            setTimeout(() => navigate('/warrior-launch-accelerator?source=life-score-split-c'), 500);
          } else {
            // Fallback for low business score - go to challenge
            toast({
              title: t.accountCreated,
              description: t.redirectJourney,
            });
            setTimeout(() => navigate('/challenge?source=life-score-split-c-fallback'), 500);
          }
          break;
      }

    } catch (error: any) {
      console.error('Error in signup:', error);
      toast({
        title: t.errorTitle,
        description: error.message || t.errorDesc,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'signup') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(251,146,60,0.3)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              {t.createTitle}
            </h2>
            <p className="text-white/70 text-lg">
              {t.createSubtitle}
            </p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-14 pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-[0_10px_30px_rgba(251,146,60,0.3)] hover:shadow-[0_15px_40px_rgba(251,146,60,0.4)] transition-all" 
              size="lg"
              disabled={!email.trim() || !password.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {t.createBtn}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-white/40 flex items-center justify-center gap-2">
              <span>🔒</span>
              {t.trialBadge}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/30">
              <span>✓ {t.featureWizard}</span>
              <span>✓ {t.featureGoals}</span>
              <span>✓ {t.featurePlan}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const categoryInfo = categoryLabels[currentQuestion.category];

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-white/60">
              {t.question} {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="text-white/60 flex items-center gap-1">
              <span className="text-amber-400">⚡</span>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: `${categoryInfo.color}30`, borderColor: categoryInfo.color, borderWidth: 1 }}
          >
            <span className="text-lg">{categoryInfo.emoji}</span>
            {language === 'en' ? categoryInfo.en : categoryInfo.ro}
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white leading-tight">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(option.points)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 group ${
                    answers[currentQuestion.id] === option.points
                      ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                      : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{option.emoji}</span>
                  <span className="font-medium text-white flex-1">
                    {option.label}
                  </span>
                  {answers[currentQuestion.id] === option.points && (
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
          
          <div className="text-sm text-white/40 flex items-center gap-2">
            <span>⏱️</span>
            {t.timeLeft}
          </div>
        </div>
      </div>
    </div>
  );
};
