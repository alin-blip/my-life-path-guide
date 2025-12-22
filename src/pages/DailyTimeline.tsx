import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Activity, Video, ListTodo, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface DayProgress {
  date: Date;
  core: Record<string, boolean>;
  dailyFour: Record<string, boolean>;
  stackCompleted: boolean;
  doorTasks: number;
}

export const DailyTimeline: React.FC = () => {
  const { language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [daysProgress, setDaysProgress] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthProgress();
  }, [selectedMonth]);

  const loadMonthProgress = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      const days = eachDayOfInterval({ start, end });

      // Fetch all user_progress entries for this month
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const { data: coreData } = await supabase
        .from('user_progress')
        .select('activity_type, activity_data')
        .eq('user_id', user.id)
        .like('activity_type', 'core_%');

      const { data: dailyFourDataRaw } = await supabase
        .from('user_progress')
        .select('activity_type, activity_data')
        .eq('user_id', user.id)
        .like('activity_type', 'daily_four_%');

      const { data: dailyProgressData } = await supabase
        .from('daily_progress')
        .select('date, progress_data')
        .eq('user_id', user.id);

      const { data: doorStatsData } = await supabase
        .from('daily_progress_stats')
        .select('date, completed_tasks')
        .eq('user_id', user.id);

      // Build progress for each day
      const progress: DayProgress[] = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][day.getDay()];
        
        // Find core data for this date
        const coreEntry = coreData?.find(e => e.activity_type === `core_${dateStr}`);
        const coreProgress = coreEntry?.activity_data as Record<string, Record<string, boolean>> || {};
        const dayCore = coreProgress[dayOfWeek] || {};

        // Find daily four data for this date
        const dailyEntry = dailyFourDataRaw?.find(e => e.activity_type === `daily_four_${dateStr}`);
        const dailyProgress = dailyEntry?.activity_data as Record<string, Record<string, boolean>> || {};
        const dayDaily = dailyProgress[dayOfWeek] || {};

        // Find stack completion
        const dailyProg = dailyProgressData?.find(e => e.date === dateStr);
        const stackCompleted = (dailyProg?.progress_data as any)?.stack?.completed || false;

        // Find door stats
        const doorStats = doorStatsData?.find(e => e.date === dateStr);
        const doorTasks = doorStats?.completed_tasks || 0;

        return {
          date: day,
          core: dayCore,
          dailyFour: dayDaily,
          stackCompleted,
          doorTasks
        };
      });

      setDaysProgress(progress);
    } catch (error) {
      console.error('Error loading month progress:', error);
    }
    setLoading(false);
  };

  const previousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getCoreCount = (core: Record<string, boolean>) => {
    return Object.values(core).filter(Boolean).length;
  };

  const getDailyCount = (daily: Record<string, boolean>) => {
    return Object.values(daily).filter(Boolean).length;
  };

  const getDayScore = (day: DayProgress) => {
    const coreCount = getCoreCount(day.core);
    const dailyCount = getDailyCount(day.dailyFour);
    const stackPoints = day.stackCompleted ? 1 : 0;
    const doorPoints = Math.min(day.doorTasks, 3);
    return coreCount + dailyCount + stackPoints + doorPoints;
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score <= 4) return 'bg-red-500/20 border-red-500/30';
    if (score <= 8) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score <= 12) return 'bg-green-500/20 border-green-500/30';
    return 'bg-emerald-500/30 border-emerald-500/50';
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" asChild className="mr-4">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Dashboard' : 'Înapoi la Dashboard'}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'en' ? 'Daily Timeline' : 'Istoric Zilnic'}
        </h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-lg">
            {format(selectedMonth, 'MMMM yyyy')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {daysProgress.map((day) => {
                  const coreCount = getCoreCount(day.core);
                  const dailyCount = getDailyCount(day.dailyFour);
                  const score = getDayScore(day);
                  const isToday = isSameDay(day.date, new Date());

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={`p-3 rounded-lg border ${getScoreColor(score)} ${isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {format(day.date, 'EEE, dd MMM')}
                          </span>
                          {isToday && (
                            <Badge variant="secondary" className="text-xs">
                              {language === 'en' ? 'Today' : 'Azi'}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={score > 8 ? 'default' : 'outline'} className="text-xs">
                          {score} pts
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Core: {coreCount}/8</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>Daily: {dailyCount}/4</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {day.stackCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          <span>Stack</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ListTodo className="w-3 h-3" />
                          <span>Door: {day.doorTasks}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'en' ? 'Legend' : 'Legendă'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border"></div>
              <span>0 pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
              <span>1-4 pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
              <span>5-8 pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
              <span>9-12 pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50"></div>
              <span>13+ pts</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTimeline;
