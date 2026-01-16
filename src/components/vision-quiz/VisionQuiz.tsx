import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { quizQuestions, QuizCategory } from './quizData';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { ArrowRight, ArrowLeft, Mail, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VisionQuizProps {
  language: 'en' | 'ro';
}

type QuizStep = 'quiz' | 'email' | 'results';

export const VisionQuiz: React.FC<VisionQuizProps> = ({ language }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<QuizStep>('quiz');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
  const hasAnswer = answers[currentQuestion?.id] !== undefined;

  const handleSelectAnswer = (points: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: points,
    }));
    
    // Auto-advance after short delay for visual feedback
    setTimeout(() => {
      if (currentQuestionIndex === quizQuestions.length - 1) {
        setStep('email');
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStep('email');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScores = (): Record<QuizCategory, number> => {
    const scores: Record<QuizCategory, number> = {
      body: 0,
      being: 0,
      balance: 0,
      business: 0,
    };

    quizQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        scores[question.category] += answer;
      }
    });

    return scores;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const scores = calculateScores();
      
      const { error } = await supabase
        .from('email_leads')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          lead_magnet: 'vision_2026_quiz',
          source: 'vision-2026',
          metadata: {
            scores,
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
      // Still show results even if save fails
      setStep('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTrial = () => {
    navigate('/auth');
  };

  if (step === 'results') {
    return (
      <QuizResults 
        scores={calculateScores()} 
        language={language} 
        onStartTrial={handleStartTrial}
      />
    );
  }

  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'en' ? 'Almost There!' : 'Aproape Gata!'}
            </h2>
            <p className="text-white/70">
              {language === 'en' 
                ? 'Enter your email to see your personalized 2026 Vision Score and action plan'
                : 'Introdu email-ul pentru a vedea Scorul Viziunii 2026 și planul de acțiune personalizat'}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder={language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            <Input
              type="email"
              placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white font-bold py-6 shadow-lg shadow-orange-500/30 border-0" 
              size="lg"
              disabled={!email.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {language === 'en' ? 'See My Results' : 'Vezi Rezultatele'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-xs text-white/50 mt-6">
            {language === 'en' 
              ? 'We respect your privacy. No spam, ever.'
              : 'Respectăm confidențialitatea ta. Fără spam, niciodată.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
        <QuizProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
          currentCategory={currentQuestion.category}
          language={language}
        />

        <div key={currentQuestionIndex} className="mt-8 animate-fade-in">
          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelect={handleSelectAnswer}
            language={language}
          />
        </div>

        {currentQuestionIndex > 0 && (
          <div className="flex justify-center mt-6 animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white/60 hover:text-white hover:bg-white/10"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back' : 'Înapoi'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
