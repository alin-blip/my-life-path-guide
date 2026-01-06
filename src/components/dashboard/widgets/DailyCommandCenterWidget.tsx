import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDailyScore } from '@/hooks/useDailyScore';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  ArrowRight, 
  Flame, 
  Star,
  CheckCircle2,
  Circle,
  Zap,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DailyCommandCenterWidget: React.FC = () => {
  const { data, loading } = useDailyScore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalScore, bigOne, nextAction, progress, streak, xpLevel, greeting } = data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-emerald-500/10';
    if (score >= 60) return 'from-yellow-500/20 to-amber-500/10';
    if (score >= 40) return 'from-orange-500/20 to-amber-500/10';
    return 'from-red-500/20 to-orange-500/10';
  };

  const handleActionClick = () => {
    if (nextAction.route) {
      navigate(nextAction.route);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-primary/30",
      "bg-gradient-to-br",
      getScoreGradient(totalScore)
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
      
      <CardContent className="relative p-4 md:p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{greeting}, Campion!</h2>
              <p className="text-sm text-muted-foreground">
                Nivel {xpLevel} • 
                {streak > 0 && (
                  <span className="inline-flex items-center ml-1">
                    <Flame className="h-3 w-3 text-orange-500 mr-0.5" />
                    {streak} zile
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Score Circle */}
          <div className="relative">
            <div className={cn(
              "flex flex-col items-center justify-center w-16 h-16 rounded-full",
              "bg-background/80 backdrop-blur border-2",
              totalScore >= 80 ? "border-green-500" : 
              totalScore >= 60 ? "border-yellow-500" : 
              totalScore >= 40 ? "border-orange-500" : "border-red-500"
            )}>
              <span className={cn("text-2xl font-bold", getScoreColor(totalScore))}>
                {totalScore}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
            {totalScore === 100 && (
              <Trophy className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={totalScore} className="h-2" />
        </div>

        {/* Big One Section */}
        {bigOne.text && (
          <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Big One de Azi
                </p>
                <p className={cn(
                  "text-sm font-medium truncate",
                  bigOne.completed && "line-through text-muted-foreground"
                )}>
                  {bigOne.text}
                </p>
              </div>
              {bigOne.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 rounded-lg bg-background/30">
            <span className="text-xs text-muted-foreground">Rutină Campion</span>
            <span className={cn("text-sm font-semibold", progress.routine.done ? "text-green-500" : "text-muted-foreground")}>
              {progress.routine.done ? '✓' : '−'}
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-background/30">
            <span className="text-xs text-muted-foreground">Core 4</span>
            <span className="text-sm font-semibold">
              {progress.core.completed}/{progress.core.total}
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-background/30">
            <span className="text-xs text-muted-foreground">Biz 4</span>
            <span className="text-sm font-semibold">
              {progress.biz.completed}/{progress.biz.total}
            </span>
          </div>
        </div>

        {/* Next Action Button */}
        <Button 
          onClick={handleActionClick}
          className="w-full group"
          variant={nextAction.type === 'complete' ? 'secondary' : 'default'}
        >
          <Zap className="h-4 w-4 mr-2" />
          <span className="truncate">{nextAction.title}</span>
          {nextAction.route && (
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
