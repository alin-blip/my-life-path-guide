import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Target, Zap, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface QuizQuestion {
  id: string;
  icon: React.ReactNode;
  questionRo: string;
  questionEn: string;
  options: {
    labelRo: string;
    labelEn: string;
    points: number;
  }[];
}

const questions: QuizQuestion[] = [
  {
    id: 'business',
    icon: <Target className="w-8 h-8 text-amber-500" />,
    questionRo: 'Cât de clar îți este planul de business pentru următoarele 90 de zile?',
    questionEn: 'How clear is your business plan for the next 90 days?',
    options: [
      { labelRo: 'Nu am un plan clar', labelEn: 'I don\'t have a clear plan', points: 1 },
      { labelRo: 'Am idei, dar nu structurate', labelEn: 'I have ideas, but unstructured', points: 2 },
      { labelRo: 'Am un plan decent', labelEn: 'I have a decent plan', points: 3 },
      { labelRo: 'Am un plan foarte clar cu KPIs', labelEn: 'I have a very clear plan with KPIs', points: 4 },
    ]
  },
  {
    id: 'health',
    icon: <Heart className="w-8 h-8 text-red-500" />,
    questionRo: 'Cum te simți fizic în ultimele 30 de zile?',
    questionEn: 'How have you been feeling physically in the last 30 days?',
    options: [
      { labelRo: 'Epuizat și fără energie', labelEn: 'Exhausted and low energy', points: 1 },
      { labelRo: 'Obosit, dar funcțional', labelEn: 'Tired, but functional', points: 2 },
      { labelRo: 'Destul de bine, cu ups and downs', labelEn: 'Pretty good, with ups and downs', points: 3 },
      { labelRo: 'Plin de energie și în formă', labelEn: 'Full of energy and in shape', points: 4 },
    ]
  },
  {
    id: 'mindset',
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    questionRo: 'Cât timp dedici zilnic dezvoltării personale?',
    questionEn: 'How much time do you dedicate daily to personal development?',
    options: [
      { labelRo: '0 minute - nu am timp', labelEn: '0 minutes - I don\'t have time', points: 1 },
      { labelRo: '5-15 minute ocazional', labelEn: '5-15 minutes occasionally', points: 2 },
      { labelRo: '15-30 minute zilnic', labelEn: '15-30 minutes daily', points: 3 },
      { labelRo: '30+ minute zilnic cu rutină clară', labelEn: '30+ minutes daily with clear routine', points: 4 },
    ]
  }
];

interface QuickResultsQuizProps {
  onComplete?: (scores: Record<string, number>) => void;
}

export function QuickResultsQuiz({ onComplete }: QuickResultsQuizProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (points: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: points };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
      onComplete?.(newAnswers);
    }
  };

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 4;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getScoreLevel = () => {
    if (percentage >= 75) return { level: 'high', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    if (percentage >= 50) return { level: 'medium', color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
    return { level: 'low', color: 'text-red-500', bgColor: 'bg-red-500/10' };
  };

  const scoreInfo = getScoreLevel();

  const getRecommendation = () => {
    if (percentage < 50) {
      return {
        titleRo: 'Ești în ciclul burnout-procrastinare',
        titleEn: 'You\'re in the burnout-procrastination cycle',
        descRo: 'Challenge-ul anti-burnout de 7 zile te va ajuta să spargi ciclul și să construiești momentum real.',
        descEn: 'The 7-day anti-burnout challenge will help you break the cycle and build real momentum.',
        ctaRo: 'Ieși din Burnout — Challenge Gratuit',
        ctaEn: 'Escape Burnout — Free Challenge',
        path: '/challenge'
      };
    }
    if (percentage < 75) {
      return {
        titleRo: 'Ești pe drumul cel bun!',
        titleEn: 'You\'re on the right track!',
        descRo: 'Rutina Champion te va ajuta să-ți structurezi ziua și să maximizezi performanța în toate domeniile.',
        descEn: 'The Champion Routine will help you structure your day and maximize performance in all areas.',
        ctaRo: 'Activează Champion Routine',
        ctaEn: 'Activate Champion Routine',
        path: '/champion-routine'
      };
    }
    return {
      titleRo: 'Ești aproape de excelență!',
      titleEn: 'You\'re close to excellence!',
      descRo: 'Dashboard-ul tău personalizat te așteaptă. Setează-ți obiectivele și urmărește-ți progresul zilnic.',
      descEn: 'Your personalized dashboard awaits. Set your goals and track your daily progress.',
      ctaRo: 'Mergi la Dashboard',
      ctaEn: 'Go to Dashboard',
      path: '/dashboard'
    };
  };

  const recommendation = getRecommendation();

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto p-6 bg-card rounded-2xl border shadow-xl"
      >
        {/* Score Circle */}
        <div className="text-center mb-6">
          <div className={`w-32 h-32 mx-auto rounded-full ${scoreInfo.bgColor} flex items-center justify-center mb-4`}>
            <div className="text-center">
              <span className={`text-4xl font-bold ${scoreInfo.color}`}>{percentage}%</span>
              <div className="text-xs text-muted-foreground mt-1">
                {language === 'ro' ? 'Scor Warrior' : 'Warrior Score'}
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ro' ? recommendation.titleRo : recommendation.titleEn}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ro' ? recommendation.descRo : recommendation.descEn}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3 mb-6">
          {questions.map((q) => {
            const score = answers[q.id] || 0;
            const qPercent = (score / 4) * 100;
            return (
              <div key={q.id} className="flex items-center gap-3">
                {q.icon}
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{q.id}</span>
                    <span className="font-medium">{score}/4</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${qPercent}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        qPercent >= 75 ? 'bg-green-500' : qPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate(recommendation.path)}
          className="w-full py-6 text-lg font-bold group"
          size="lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          {language === 'ro' ? recommendation.ctaRo : recommendation.ctaEn}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-card rounded-2xl border shadow-xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            {language === 'ro' ? 'Întrebarea' : 'Question'} {currentIndex + 1}/{questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              {currentQuestion.icon}
            </div>
            <h3 className="text-xl font-semibold">
              {language === 'ro' ? currentQuestion.questionRo : currentQuestion.questionEn}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleAnswer(option.points)}
                className="w-full p-4 text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span>{language === 'ro' ? option.labelRo : option.labelEn}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
