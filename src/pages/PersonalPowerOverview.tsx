import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { personalPowerDays, totalDays, implementedDays } from '@/data/personalPowerContent';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Lock, Play, ChevronLeft, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PersonalPowerOverview: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<Record<number, any>>({});

  useEffect(() => {
    if (!user) return;

    const fetchAllProgress = async () => {
      const { data } = await supabase
        .from('personal_power_progress')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const map: Record<number, any> = {};
        data.forEach(p => { map[p.day_number] = p; });
        setProgressData(map);
      }
    };

    fetchAllProgress();
  }, [user]);

  const completedCount = Object.values(progressData).filter(
    p => p.lesson_completed && p.exercise_completed
  ).length;

  const overallProgress = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate('/programs')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {language === 'ro' ? 'Înapoi la Programe' : 'Back to Programs'}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary">30 {language === 'ro' ? 'Zile' : 'Days'}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Personal Power Plus
          </h1>
          <p className="text-muted-foreground">
            {language === 'ro'
              ? 'Program de 30 de zile pentru a crea o calitate extraordinară a vieții. După cum am învățat de la Tony Robbins, acest plan transformă modul în care gândești, simți și acționezi.'
              : 'A 30-day program to create an extraordinary quality of life. As we\'ve learned from Tony Robbins, this plan transforms how you think, feel, and act.'}
          </p>
        </div>

        {/* Overall progress */}
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">
              {language === 'ro' ? 'Progresul tău' : 'Your Progress'}
            </h3>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalDays} {language === 'ro' ? 'completate' : 'completed'}
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Days grid */}
        <div className="space-y-3">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayNum = i + 1;
            const dayData = personalPowerDays.find(d => d.day === dayNum);
            const isImplemented = !!dayData;
            const prog = progressData[dayNum];
            const isComplete = prog?.lesson_completed && prog?.exercise_completed;
            const isStarted = prog && (prog.lesson_completed || prog.exercise_completed);

            return (
              <button
                key={dayNum}
                onClick={() => isImplemented && navigate(`/personal-power/${dayNum}`)}
                disabled={!isImplemented}
                className={cn(
                  'w-full flex items-center gap-4 bg-card border rounded-xl p-4 text-left transition-all',
                  isImplemented && 'hover:shadow-md hover:border-primary/30 cursor-pointer',
                  !isImplemented && 'opacity-50 cursor-not-allowed',
                  isComplete && 'border-green-500/30 bg-green-500/5'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm',
                    isComplete && 'bg-green-500 text-white',
                    isStarted && !isComplete && 'bg-primary/20 text-primary',
                    !isStarted && isImplemented && 'bg-muted text-muted-foreground',
                    !isImplemented && 'bg-muted/50 text-muted-foreground/50'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : !isImplemented ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    dayNum
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {language === 'ro' ? 'Ziua' : 'Day'} {dayNum}
                    {dayData && ` — ${language === 'ro' ? dayData.title : dayData.titleEn}`}
                  </p>
                  {isStarted && !isComplete && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'ro' ? 'În progres' : 'In progress'}
                    </p>
                  )}
                  {!isImplemented && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === 'ro' ? 'În curând' : 'Coming soon'}
                    </p>
                  )}
                </div>

                {isImplemented && !isComplete && (
                  <Play className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalPowerOverview;
