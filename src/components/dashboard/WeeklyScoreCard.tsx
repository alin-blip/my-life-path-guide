import React from 'react';
import { useWeeklyScore, useMonthlyScore } from '@/hooks/useWeeklyScore';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Star, Flame, Target } from 'lucide-react';
import { format, startOfWeek, addDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export const WeeklyScoreCard: React.FC = () => {
  const { language } = useLanguage();
  const { weeklyScore, isLoading } = useWeeklyScore();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!weeklyScore) return null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getScoreForDay = (date: Date): number | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = weeklyScore.daily_scores.find(d => d.date === dateStr);
    return entry ? entry.score : null;
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'bg-muted';
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            {language === 'ro' ? 'Scor Săptămânal' : 'Weekly Score'}
          </CardTitle>
          <Badge variant={weeklyScore.total_score >= 80 ? "default" : "secondary"}>
            {Math.round(weeklyScore.total_score)}/100
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily scores visualization */}
        <div className="flex justify-between gap-1">
          {weekDays.map((day, index) => {
            const score = getScoreForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div key={index} className="flex-1 text-center">
                <span className="text-[10px] text-muted-foreground block mb-1">
                  {format(day, 'EEE')}
                </span>
                <div className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                  getScoreColor(score),
                  score !== null && "text-white",
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}>
                  {score !== null ? Math.round(score) : '-'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-lg font-bold">{Math.round(weeklyScore.average_score)}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {language === 'ro' ? 'Medie' : 'Average'}
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-purple-500" />
              <span className="text-lg font-bold">
                {weeklyScore.objectives_completed}/{weeklyScore.objectives_total}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {language === 'ro' ? 'Obiective' : 'Objectives'}
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-lg font-bold">{weeklyScore.streak_bonus}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {language === 'ro' ? 'Bonus' : 'Bonus'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MonthlyHeatMap: React.FC = () => {
  const { language } = useLanguage();
  const { monthlyScore, isLoading } = useMonthlyScore();
  const { weeklyScore } = useWeeklyScore();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get scores from weekly data
  const allDailyScores = weeklyScore?.daily_scores || [];
  
  const getScoreForDay = (date: Date): number | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = allDailyScores.find(d => d.date === dateStr);
    return entry ? entry.score : null;
  };

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'bg-muted/50';
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    if (score >= 30) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add empty days for the first week
  const firstDayOfWeek = monthStart.getDay();
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = 0; i < mondayOffset; i++) {
    currentWeek.push(null as any);
  }

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null as any);
    }
    weeks.push(currentWeek);
  }

  const perfectDays = allDailyScores.filter(d => d.score >= 100).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            {language === 'ro' ? 'Calendar Lunar' : 'Monthly Calendar'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              {perfectDays} {language === 'ro' ? 'zile perfecte' : 'perfect days'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="aspect-square" />;
                }
                
                const score = getScoreForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                const isPerfect = score !== null && score >= 100;
                
                return (
                  <div 
                    key={dayIndex}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all relative",
                      getScoreColor(score),
                      score !== null && score > 0 && "text-white",
                      isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    )}
                    title={score !== null ? `${format(day, 'MMM d')}: ${Math.round(score)}%` : format(day, 'MMM d')}
                  >
                    {format(day, 'd')}
                    {isPerfect && (
                      <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>{language === 'ro' ? 'Mai puțin' : 'Less'}</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <div className="w-3 h-3 rounded-sm bg-red-400" />
            <div className="w-3 h-3 rounded-sm bg-orange-400" />
            <div className="w-3 h-3 rounded-sm bg-yellow-400" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
          </div>
          <span>{language === 'ro' ? 'Mai mult' : 'More'}</span>
        </div>
      </CardContent>
    </Card>
  );
};
