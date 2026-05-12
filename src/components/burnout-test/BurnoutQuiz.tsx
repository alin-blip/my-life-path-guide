import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { burnoutQuestions, burnoutCategoryLabels, BurnoutCategory } from '@/data/burnoutTestQuestions';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { trackQuizCompleted } from '@/lib/facebook-pixel';
import { motion, AnimatePresence } from 'framer-motion';
import { BurnoutResults } from './BurnoutResults';

interface BurnoutQuizProps {
  language: 'en' | 'ro';
}

type QuizStep = 'quiz' | 'results';

export const BurnoutQuiz: React.FC<BurnoutQuizProps> = ({ language }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<QuizStep>('quiz');

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
        setStep('results');
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

  // Signup handler removed — handled in BurnoutResults via email-only capture

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

  // (Signup gate removed — quiz goes directly to results, email captured there)

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
