import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useLanguage } from '@/context/LanguageContext';

export const ChallengeProgressWidget: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    currentDay, 
    completedDaysCount, 
    progressPercentage,
    loading,
    isAuthenticated 
  } = useChallengeProgress();

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const isCompleted = completedDaysCount >= 7;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 border-amber-500/20 hover:border-amber-500/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              {language === 'en' ? '7-Day Challenge' : 'Challenge 7 Zile'}
            </h3>
            {!isCompleted && (
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? `Day ${currentDay} of 7` : `Ziua ${currentDay} din 7`}
              </span>
            )}
          </div>
        </div>
        {isCompleted ? (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {language === 'en' ? 'Complete!' : 'Completat!'}
          </Badge>
        ) : (
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-medium">{completedDaysCount}/7</span>
          </div>
        )}
      </div>

      <Progress 
        value={progressPercentage} 
        className="h-2 mb-3 bg-muted"
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                day <= completedDaysCount
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                  : day === currentDay
                    ? 'bg-amber-500/20 text-amber-500 ring-2 ring-amber-500'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {day <= completedDaysCount ? '✓' : day}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
          onClick={() => navigate(isCompleted ? '/challenge' : `/challenge/${currentDay}`)}
        >
          {isCompleted 
            ? (language === 'en' ? 'View' : 'Vezi')
            : (language === 'en' ? 'Continue' : 'Continuă')
          }
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default ChallengeProgressWidget;
