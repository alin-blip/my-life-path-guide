import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, SkipForward, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ALL_MIND_QUIZZES } from '@/data/mind-quizzes';
import type { MindQuiz } from '@/data/mind-quizzes/types';
import { mindQuizService } from '@/services/mindQuizService';
import { QuizRunner } from '@/components/mind/QuizRunner';

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

const todayKey = () => `mind_test_done_${new Date().toISOString().split('T')[0]}`;

export function MindTestStep({ onNext, onSkip }: Props) {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'ro';
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<MindQuiz | null>(null);
  const [isReevaluation, setIsReevaluation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mindQuizService
      .getAllLatestResponses()
      .then((map) => {
        if (cancelled) return;
        const undone = ALL_MIND_QUIZZES.find((q) => !map[q.slug]);
        if (undone) {
          setQuiz(undone);
          setIsReevaluation(false);
        } else {
          const sorted = ALL_MIND_QUIZZES.slice().sort((a, b) => {
            const ta = new Date(map[a.slug]?.completed_at || 0).getTime();
            const tb = new Date(map[b.slug]?.completed_at || 0).getTime();
            return ta - tb;
          });
          setQuiz(sorted[0] ?? null);
          setIsReevaluation(true);
        }
      })
      .catch(() => {
        if (!cancelled) setQuiz(ALL_MIND_QUIZZES[0] ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkip = () => {
    try {
      const key = `mind_test_skip_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(key, '1');
    } catch {}
    onSkip();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(todayKey(), '1');
    } catch {}
    setTimeout(onNext, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {lang === 'en' ? 'Loading test…' : 'Se încarcă testul…'}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <Brain className="w-10 h-10 mx-auto text-violet-500" />
            <p>
              {lang === 'en'
                ? 'No Mind tests available right now.'
                : 'Niciun test Minte disponibil.'}
            </p>
            <Button onClick={onNext}>
              {lang === 'en' ? 'Continue' : 'Continuă'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="w-6 h-6 text-violet-500 mt-1 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2 flex-wrap">
              {lang === 'en' ? 'Mind — Daily Test' : 'Minte — Test Zilnic'}
              {isReevaluation && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600">
                  {lang === 'en' ? 'Re-evaluation' : 'Reevaluare'}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'en'
                ? 'Short 10-question test. Answers auto-save — you can skip and come back without leaving the routine.'
                : 'Test scurt de 10 întrebări. Răspunsurile se salvează automat — poți sări și reveni fără să ieși din rutină.'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            <SkipForward className="w-4 h-4 mr-1" />
            {lang === 'en' ? 'Skip' : 'Sari'}
          </Button>
        </CardContent>
      </Card>

      <QuizRunner key={quiz.slug} quiz={quiz} onComplete={handleComplete} />
    </div>
  );
}
