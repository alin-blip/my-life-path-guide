import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { quizQuestions, QuizCategory } from './quizData';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { ArrowRight, ArrowLeft, Mail, Loader2 } from 'lucide-react';
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
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Almost There!' : 'Aproape Gata!'}
          </h2>
          <p className="text-muted-foreground">
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
          />
          <Input
            type="email"
            placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!email.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {language === 'en' ? 'See My Results' : 'Vezi Rezultatele'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {language === 'en' 
            ? 'We respect your privacy. No spam, ever.'
            : 'Respectăm confidențialitatea ta. Fără spam, niciodată.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <QuizProgress
        currentQuestion={currentQuestionIndex}
        totalQuestions={quizQuestions.length}
        currentCategory={currentQuestion.category}
        language={language}
      />

      <QuizQuestion
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] ?? null}
        onSelect={handleSelectAnswer}
        language={language}
      />

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back' : 'Înapoi'}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="flex-1"
        >
          {isLastQuestion 
            ? (language === 'en' ? 'See Results' : 'Vezi Rezultatele')
            : (language === 'en' ? 'Next' : 'Următoarea')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
