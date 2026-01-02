import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Flame, Trophy, TrendingUp, Calendar, Check } from 'lucide-react';

interface WeeklyStats {
  completedDays: number;
  totalDays: number;
  currentStreak: number;
  mostCompletedStep: { name: string; count: number } | null;
  dailyCompletion: { date: string; completed: boolean; stepsCount: number }[];
}

const STEP_NAMES: Record<string, string> = {
  morning: 'Rutina de Dimineață',
  fitness: 'Fitness',
  relationships: 'Relații',
  content: 'Content',
  todo: 'To Do',
  focus: 'Focus'
};

export const WeeklyFlowStats = () => {
  const [stats, setStats] = useState<WeeklyStats>({
    completedDays: 0,
    totalDays: 7,
    currentStreak: 0,
    mostCompletedStep: null,
    dailyCompletion: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: today });
        const dateStrings = weekDays.map(d => format(d, 'yyyy-MM-dd'));

        // Fetch sessions from this week
        const { data: sessions, error } = await supabase
          .from('daily_flow_sessions')
          .select('date, completed_at, steps_completed')
          .eq('user_id', user.id)
          .gte('date', dateStrings[0])
          .order('date', { ascending: true });

        if (error) throw error;

        // Calculate completed days
        const completedDays = sessions?.filter(s => s.completed_at !== null).length || 0;

        // Calculate streak (consecutive completed days ending today or yesterday)
        let streak = 0;
        const allSessions = sessions || [];
        for (let i = 0; i < 30; i++) {
          const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
          const session = allSessions.find(s => s.date === checkDate);
          if (session?.completed_at) {
            streak++;
          } else if (i === 0) {
            // Today not completed yet, keep checking
            continue;
          } else {
            break;
          }
        }

        // Calculate most completed step
        const stepCounts: Record<string, number> = {};
        sessions?.forEach(session => {
          const steps = session.steps_completed as Record<string, boolean> || {};
          Object.entries(steps).forEach(([step, completed]) => {
            if (completed) {
              stepCounts[step] = (stepCounts[step] || 0) + 1;
            }
          });
        });

        let mostCompletedStep: { name: string; count: number } | null = null;
        Object.entries(stepCounts).forEach(([step, count]) => {
          if (!mostCompletedStep || count > mostCompletedStep.count) {
            mostCompletedStep = { name: STEP_NAMES[step] || step, count };
          }
        });

        // Build daily completion array
        const dailyCompletion = dateStrings.map(date => {
          const session = sessions?.find(s => s.date === date);
          const stepsCompleted = session?.steps_completed as Record<string, boolean> || {};
          return {
            date,
            completed: session?.completed_at !== null,
            stepsCount: Object.values(stepsCompleted).filter(Boolean).length
          };
        });

        setStats({
          completedDays,
          totalDays: weekDays.length,
          currentStreak: streak,
          mostCompletedStep,
          dailyCompletion
        });
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Statistici Săptămânale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <Check className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{stats.completedDays}/{stats.totalDays}</div>
            <div className="text-xs text-muted-foreground">Zile Complete</div>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Flame className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Streak Curent</div>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold truncate">
              {stats.mostCompletedStep?.name || '-'}
            </div>
            <div className="text-xs text-muted-foreground">Cel Mai Completat</div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="flex gap-1 justify-between">
          {stats.dailyCompletion.map((day) => {
            const date = new Date(day.date);
            const dayName = format(date, 'EEEEE', { locale: ro });
            const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div 
                key={day.date} 
                className={`flex-1 p-2 rounded-lg text-center ${
                  day.completed 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : day.stepsCount > 0 
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-muted/30'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  {dayName}
                </div>
                <div className={`text-sm font-bold ${
                  day.completed ? 'text-green-500' : day.stepsCount > 0 ? 'text-amber-500' : 'text-muted-foreground'
                }`}>
                  {day.completed ? '✓' : day.stepsCount > 0 ? day.stepsCount : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
