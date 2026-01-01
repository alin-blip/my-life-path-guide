import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Dumbbell, Heart, Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'body' | 'being' | 'balance' | 'business';

interface QuizQuestion {
  category: Category;
  question: string;
  questionRo: string;
  placeholder: string;
  placeholderRo: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    category: 'body',
    question: 'How does your ideal body look and feel in 2026? Describe your physical transformation.',
    questionRo: 'Cum arată și se simte corpul tău ideal în 2026? Descrie transformarea ta fizică.',
    placeholder: 'I see myself fit, energetic, running marathons...',
    placeholderRo: 'Mă văd în formă, plin de energie, alergând maratoane...'
  },
  {
    category: 'body',
    question: 'What physical activities bring you joy and make you feel powerful?',
    questionRo: 'Ce activități fizice îți aduc bucurie și te fac să te simți puternic/ă?',
    placeholder: 'I love swimming, hiking in mountains, yoga at sunrise...',
    placeholderRo: 'Îmi place înnotul, drumeții în munți, yoga la răsărit...'
  },
  {
    category: 'being',
    question: 'What does inner peace and spiritual alignment look like for you in 2026?',
    questionRo: 'Cum arată pacea interioară și alinierea spirituală pentru tine în 2026?',
    placeholder: 'I meditate daily, feel connected to my purpose, at peace with myself...',
    placeholderRo: 'Meditez zilnic, mă simt conectat la scopul meu, în pace cu mine...'
  },
  {
    category: 'being',
    question: 'What daily practices bring you mental clarity and emotional balance?',
    questionRo: 'Ce practici zilnice îți aduc claritate mentală și echilibru emoțional?',
    placeholder: 'Morning journaling, gratitude practice, mindful breathing...',
    placeholderRo: 'Jurnal dimineața, practică de recunoștință, respirație conștientă...'
  },
  {
    category: 'balance',
    question: 'How do your ideal relationships look in 2026? Describe your connections.',
    questionRo: 'Cum arată relațiile tale ideale în 2026? Descrie conexiunile tale.',
    placeholder: 'Deep conversations with loved ones, quality time with family...',
    placeholderRo: 'Conversații profunde cu cei dragi, timp de calitate cu familia...'
  },
  {
    category: 'balance',
    question: 'What moments with family and friends do you want to experience?',
    questionRo: 'Ce momente cu familia și prietenii vrei să trăiești?',
    placeholder: 'Family dinners, travel adventures together, celebrating milestones...',
    placeholderRo: 'Cine în familie, aventuri de călătorie împreună, sărbătorind reușite...'
  },
  {
    category: 'business',
    question: 'What professional success do you want to achieve in 2026?',
    questionRo: 'Ce succes profesional vrei să atingi în 2026?',
    placeholder: 'Leading my own company, 6-figure income, impacting thousands...',
    placeholderRo: 'Conduc propria companie, venit de 6 cifre, impact asupra miilor...'
  },
  {
    category: 'business',
    question: 'What impact do you want to have through your work?',
    questionRo: 'Ce impact vrei să ai prin munca ta?',
    placeholder: 'Helping others transform, building lasting legacy, financial freedom...',
    placeholderRo: 'Ajut alții să se transforme, construiesc un moștenire, libertate financiară...'
  }
];

const categoryIcons: Record<Category, React.ReactNode> = {
  body: <Dumbbell className="h-6 w-6" />,
  being: <Heart className="h-6 w-6" />,
  balance: <Users className="h-6 w-6" />,
  business: <Briefcase className="h-6 w-6" />
};

const categoryColors: Record<Category, string> = {
  body: 'from-blue-500 to-cyan-500',
  being: 'from-purple-500 to-pink-500',
  balance: 'from-green-500 to-emerald-500',
  business: 'from-amber-500 to-orange-500'
};

const categoryLabels: Record<Category, { en: string; ro: string }> = {
  body: { en: 'Body', ro: 'Corp' },
  being: { en: 'Being', ro: 'Suflet' },
  balance: { en: 'Balance', ro: 'Echilibru' },
  business: { en: 'Business', ro: 'Business' }
};

interface VisionBoardQuizProps {
  language: 'en' | 'ro';
  onComplete: (answers: Record<Category, string>) => void;
  onBack?: () => void;
}

export const VisionBoardQuiz: React.FC<VisionBoardQuizProps> = ({
  language,
  onComplete,
  onBack
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  
  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Combine answers per category
      const combinedAnswers: Record<Category, string> = {
        body: '',
        being: '',
        balance: '',
        business: ''
      };
      
      quizQuestions.forEach((q, index) => {
        const answer = answers[index] || '';
        if (answer) {
          combinedAnswers[q.category] += (combinedAnswers[q.category] ? ' ' : '') + answer;
        }
      });
      
      onComplete(combinedAnswers);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };
  
  const currentAnswer = answers[currentQuestion] || '';
  const canProceed = currentAnswer.trim().length >= 10;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{language === 'en' ? 'Question' : 'Întrebarea'} {currentQuestion + 1}/{quizQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Category indicator */}
      <div className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r",
        categoryColors[question.category]
      )}>
        {categoryIcons[question.category]}
        <span>{categoryLabels[question.category][language]}</span>
      </div>
      
      {/* Question */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {language === 'en' ? question.question : question.questionRo}
        </h2>
        
        <Textarea
          value={currentAnswer}
          onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
          placeholder={language === 'en' ? question.placeholder : question.placeholderRo}
          className="min-h-[150px] text-lg resize-none"
        />
        
        <p className="text-sm text-muted-foreground">
          {language === 'en' 
            ? 'Be specific and vivid - your words will shape your vision board images!' 
            : 'Fii specific și detaliat - cuvintele tale vor forma imaginile din Vision Board!'}
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'en' ? 'Back' : 'Înapoi'}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {currentQuestion < quizQuestions.length - 1 
            ? (language === 'en' ? 'Next' : 'Următoarea')
            : (language === 'en' ? 'Generate Vision Board' : 'Generează Vision Board')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
