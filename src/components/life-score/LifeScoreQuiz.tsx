import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lifeScoreQuestions, categoryLabels } from '@/data/lifeScoreQuestions';
import { LifeScoreResult } from './LifeScoreResult';
import { ArrowRight, ArrowLeft, Mail, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackLead } from '@/lib/facebook-pixel';
import { motion, AnimatePresence } from 'framer-motion';

interface LifeScoreQuizProps {
  language: 'en' | 'ro';
}

type QuizStep = 'quiz' | 'email' | 'results';

export const LifeScoreQuiz: React.FC<LifeScoreQuizProps> = ({ language }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<QuizStep>('quiz');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = lifeScoreQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lifeScoreQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / lifeScoreQuestions.length) * 100;

  const handleSelectAnswer = (points: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
    
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep('email');
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
    lifeScoreQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        scores[question.category] = answer;
      }
    });
    return scores;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const categoryScores = calculateCategoryScores();
      const totalScore = calculateTotalScore();
      
      const { error } = await supabase
        .from('email_leads')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          lead_magnet: 'life_score_60s',
          source: 'life-score',
          metadata: {
            totalScore,
            categoryScores,
            answers,
            completed_at: new Date().toISOString(),
          },
        });

      if (error) {
        if (error.code === '23505') {
          // Email already exists, just show results
          trackLead();
          setStep('results');
          return;
        }
        console.error('Error saving lead:', error);
        // Still show results even if save fails
        setStep('results');
        return;
      }

      // Track Facebook Pixel Lead event
      trackLead();

      setStep('results');
    } catch (error) {
      console.error('Error saving lead:', error);
      // Show results anyway
      setStep('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'results') {
    return (
      <LifeScoreResult 
        totalScore={calculateTotalScore()}
        categoryScores={calculateCategoryScores()}
        language={language}
      />
    );
  }

  if (step === 'email') {
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
              {language === 'en' ? 'Your Score is Ready!' : 'Scorul Tău e Gata!'}
            </h2>
            <p className="text-white/70 text-lg">
              {language === 'en' 
                ? 'Enter your email to see your results'
                : 'Introdu email-ul pentru a vedea rezultatele'}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-[0_10px_30px_rgba(251,146,60,0.3)] hover:shadow-[0_15px_40px_rgba(251,146,60,0.4)] transition-all" 
              size="lg"
              disabled={!email.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {language === 'en' ? 'See My Life Score' : 'Vezi Scorul Meu'}
            </Button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6 flex items-center justify-center gap-2">
            <span>🔒</span>
            {language === 'en' 
              ? 'We respect your privacy. No spam, ever.'
              : 'Respectăm confidențialitatea ta. Fără spam.'}
          </p>
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
              {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestionIndex + 1}/{lifeScoreQuestions.length}
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
              {language === 'en' ? currentQuestion.question : currentQuestion.questionRo}
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
                    {language === 'en' ? option.label : option.labelRo}
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
            {language === 'en' ? 'Back' : 'Înapoi'}
          </Button>
          
          <div className="text-sm text-white/40 flex items-center gap-2">
            <span>⏱️</span>
            {language === 'en' ? '~60 seconds left' : '~60 secunde rămase'}
          </div>
        </div>
      </div>
    </div>
  );
};