import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { burnoutQuestions, burnoutCategoryLabels, BurnoutCategory } from '@/data/burnoutTestQuestions';
import { ArrowLeft, Loader2, CheckCircle2, Sparkles, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackQuizCompleted, trackAccountCreated } from '@/lib/facebook-pixel';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BurnoutResults } from './BurnoutResults';

interface BurnoutQuizProps {
  language: 'en' | 'ro';
}

type QuizStep = 'quiz' | 'signup' | 'results';

export const BurnoutQuiz: React.FC<BurnoutQuizProps> = ({ language }) => {
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

  const currentQuestion = burnoutQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === burnoutQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / burnoutQuestions.length) * 100;

  const handleSelectAnswer = (points: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: points }));
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        const finalAnswers = { ...answers, [currentQuestion.id]: points };
        const totalScore = Object.values(finalAnswers).reduce((sum, s) => sum + s, 0);
        trackQuizCompleted('burnout_test', totalScore);
        setStep('signup');
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const calculateCategoryScores = (): Record<BurnoutCategory, number> => {
    const scores: Record<string, number> = { body: 0, being: 0, balance: 0, business: 0 };
    burnoutQuestions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) scores[q.category] += answer;
    });
    return scores as Record<BurnoutCategory, number>;
  };

  const calculateTotalScore = (): number => {
    return Object.values(answers).reduce((sum, s) => sum + s, 0);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password.length < 6) {
      toast({
        title: language === 'en' ? 'Password too short' : 'Parolă prea scurtă',
        description: language === 'en' ? 'Minimum 6 characters' : 'Minim 6 caractere',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const emailLower = email.trim().toLowerCase();
    const categoryScores = calculateCategoryScores();
    const totalScore = calculateTotalScore();

    try {
      // 1. Create account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: emailLower,
        password,
        options: {
          data: { full_name: name.trim() || null, source: 'burnout_test' },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailLower,
            password,
          });
          if (signInError) {
            toast({
              title: language === 'en' ? 'Account exists' : 'Contul există deja',
              description: language === 'en' ? 'Use a different email or login' : 'Folosește alt email sau loghează-te',
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

      // 2. Save to email_leads
      await supabase
        .from('email_leads')
        .delete()
        .eq('email', emailLower)
        .eq('lead_magnet', 'burnout_test');

      await supabase.from('email_leads').insert({
        email: emailLower,
        name: name.trim() || null,
        lead_magnet: 'burnout_test',
        source: 'burnout_test_quiz',
        metadata: {
          totalScore,
          categoryScores,
          answers,
          completed_at: new Date().toISOString(),
        },
      });

      // 3. Set up 3-day trial
      if (userId) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 3);
        await supabase.from('subscribers').upsert({
          user_id: userId,
          email: emailLower,
          subscription_tier: 'trial',
          subscription_status: 'trialing',
          early_bird_expires_at: trialEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }

      trackAccountCreated('burnout_test');

      toast({
        title: language === 'en' ? 'Account created!' : 'Cont creat!',
        description: language === 'en' ? 'Here are your full results' : 'Iată rezultatele tale complete',
      });

      setStep('results');
    } catch (error: any) {
      console.error('Burnout signup error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: error.message || (language === 'en' ? 'Something went wrong' : 'Ceva nu a mers bine'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // RESULTS
  if (step === 'results') {
    return (
      <BurnoutResults
        categoryScores={calculateCategoryScores()}
        totalScore={calculateTotalScore()}
        language={language}
      />
    );
  }

  // SIGNUP GATE
  if (step === 'signup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_10px_40px_rgba(239,68,68,0.3)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              {language === 'en' ? 'See Your Full Results!' : 'Vezi Rezultatele Complete!'}
            </h2>
            <p className="text-white/70 text-lg">
              {language === 'en'
                ? 'Create a free account to unlock your burnout radar chart + personalized recommendations'
                : 'Creează un cont gratuit pentru a debloca graficul radar + recomandări personalizate'}
            </p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder={language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-red-400 focus:ring-red-400/20"
            />
            <Input
              type="email"
              placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-red-400 focus:ring-red-400/20"
            />
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={language === 'en' ? 'Create password (min 6 chars)' : 'Creează parolă (min 6 caractere)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-14 pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-red-400 focus:ring-red-400/20"
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
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl shadow-[0_10px_30px_rgba(239,68,68,0.3)]"
              size="lg"
              disabled={!email.trim() || !password.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {language === 'en' ? 'Unlock My Results' : 'Deblochează Rezultatele'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-white/40 flex items-center justify-center gap-2">
              <span>🔒</span>
              {language === 'en'
                ? '3-day free trial • No credit card required'
                : 'Trial gratuit 3 zile • Fără card bancar'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // QUIZ
  const categoryInfo = burnoutCategoryLabels[currentQuestion.category];
  const categoryGradients: Record<BurnoutCategory, string> = {
    body: 'from-green-500 to-emerald-400',
    being: 'from-purple-500 to-violet-400',
    balance: 'from-pink-500 to-rose-400',
    business: 'from-blue-500 to-cyan-400',
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-white/60">
              {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestionIndex + 1}/{burnoutQuestions.length}
            </span>
            <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${categoryGradients[currentQuestion.category]}`}>
              {language === 'en' ? categoryInfo.en : categoryInfo.ro}
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${categoryGradients[currentQuestion.category]} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
              {language === 'en' ? currentQuestion.question : currentQuestion.questionRo}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(option.points)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 group ${
                    answers[currentQuestion.id] === option.points
                      ? 'border-red-400 bg-red-400/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{option.emoji}</span>
                  <span className="font-medium text-white flex-1">
                    {language === 'en' ? option.label : option.labelRo}
                  </span>
                  {answers[currentQuestion.id] === option.points && (
                    <CheckCircle2 className="w-6 h-6 text-red-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Back Button */}
        {currentQuestionIndex > 0 && (
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back' : 'Înapoi'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
