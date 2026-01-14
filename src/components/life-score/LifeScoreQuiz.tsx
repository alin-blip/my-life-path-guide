import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lifeScoreQuestions, categoryLabels } from '@/data/lifeScoreQuestions';
import { LifeScoreResult } from './LifeScoreResult';
import { ArrowRight, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const hasAnswer = answers[currentQuestion?.id] !== undefined;
  const progress = ((currentQuestionIndex + 1) / lifeScoreQuestions.length) * 100;

  const handleSelectAnswer = (points: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
    
    // Auto-advance after selection with a small delay
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
          setStep('results');
          return;
        }
        throw error;
      }

      setStep('results');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Something went wrong. Please try again.' 
          : 'Ceva nu a mers bine. Încearcă din nou.',
        variant: 'destructive',
      });
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
        className="max-w-md mx-auto space-y-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Your Score is Ready! 🎉' : 'Scorul Tău e Gata! 🎉'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Enter your email to see your Life Score and get personalized insights'
              : 'Introdu email-ul pentru a vedea Scorul Vieții și insight-uri personalizate'}
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder={language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
          />
          <Input
            type="email"
            placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold" 
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

        <p className="text-center text-xs text-muted-foreground">
          🔒 {language === 'en' 
            ? 'We respect your privacy. No spam, ever.'
            : 'Respectăm confidențialitatea ta. Fără spam, niciodată.'}
        </p>
      </motion.div>
    );
  }

  const categoryInfo = categoryLabels[currentQuestion.category];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestionIndex + 1}/{lifeScoreQuestions.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Category Badge */}
      <div className="flex justify-center">
        <span 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
        >
          <span>{categoryInfo.emoji}</span>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground leading-tight">
            {language === 'en' ? currentQuestion.question : currentQuestion.questionRo}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleSelectAnswer(option.points)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 hover:scale-[1.02] ${
                  answers[currentQuestion.id] === option.points
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium text-foreground">
                  {language === 'en' ? option.label : option.labelRo}
                </span>
                {answers[currentQuestion.id] === option.points && (
                  <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back' : 'Înapoi'}
        </Button>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          ⚡ {language === 'en' ? '60 seconds to complete' : '60 secunde pentru a termina'}
        </div>
      </div>
    </div>
  );
};
