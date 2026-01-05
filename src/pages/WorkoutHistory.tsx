import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { ro } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, Dumbbell, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkoutSession {
  id: string;
  date: string;
  started_at: string | null;
  ended_at: string | null;
  total_duration_minutes: number | null;
  notes: string | null;
}

interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
}

const WorkoutHistory = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [sessionsResult, exercisesResult] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false }),
        supabase
          .from('workout_exercises')
          .select('*')
          .eq('user_id', session.user.id)
      ]);

      if (sessionsResult.data) setSessions(sessionsResult.data);
      if (exercisesResult.data) setExercises(exercisesResult.data);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    const filteredSessions = sessions.filter(s => {
      const date = new Date(s.date);
      return date >= startDate && date <= endDate;
    });

    const totalMinutes = filteredSessions.reduce((acc, s) => acc + (s.total_duration_minutes || 0), 0);
    
    const sessionExerciseIds = new Set(filteredSessions.map(s => s.id));
    const filteredExercises = exercises.filter(e => sessionExerciseIds.has(e.session_id));
    
    const totalWeight = filteredExercises.reduce((acc, e) => {
      const weight = e.weight_kg || 0;
      const sets = e.sets || 1;
      const reps = e.reps || 1;
      return acc + (weight * sets * reps);
    }, 0);

    const totalSessions = filteredSessions.length;
    const avgDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;

    return {
      totalMinutes,
      totalWeight,
      totalSessions,
      avgDuration,
      filteredSessions,
      filteredExercises
    };
  }, [sessions, exercises, timeRange]);

  const chartData = useMemo(() => {
    const now = new Date();
    let intervals: Date[];
    let formatStr: string;

    switch (timeRange) {
      case 'week':
        intervals = eachDayOfInterval({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        });
        formatStr = 'EEE';
        break;
      case 'month':
        intervals = eachWeekOfInterval({
          start: startOfMonth(now),
          end: endOfMonth(now)
        }, { weekStartsOn: 1 });
        formatStr = "'Săpt' w";
        break;
      case 'year':
        intervals = eachMonthOfInterval({
          start: startOfYear(now),
          end: endOfYear(now)
        });
        formatStr = 'MMM';
        break;
    }

    return intervals.map(date => {
      let start: Date, end: Date;
      
      switch (timeRange) {
        case 'week':
          start = date;
          end = date;
          break;
        case 'month':
          start = date;
          end = endOfWeek(date, { weekStartsOn: 1 });
          break;
        case 'year':
          start = startOfMonth(date);
          end = endOfMonth(date);
          break;
      }

      const periodSessions = stats.filteredSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= start && sessionDate <= end;
      });

      const minutes = periodSessions.reduce((acc, s) => acc + (s.total_duration_minutes || 0), 0);
      
      const sessionIds = new Set(periodSessions.map(s => s.id));
      const periodExercises = stats.filteredExercises.filter(e => sessionIds.has(e.session_id));
      const weight = periodExercises.reduce((acc, e) => {
        return acc + ((e.weight_kg || 0) * (e.sets || 1) * (e.reps || 1));
      }, 0);

      return {
        name: format(date, formatStr, { locale: ro }),
        minute: minutes,
        greutate: Math.round(weight),
        sesiuni: periodSessions.length
      };
    });
  }, [stats, timeRange]);

  const exerciseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    stats.filteredExercises.forEach(e => {
      const name = e.exercise_name || 'Altele';
      breakdown[name] = (breakdown[name] || 0) + 1;
    });
    
    return Object.entries(breakdown)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [stats.filteredExercises]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#22c55e', '#f59e0b'];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Istoric Antrenamente</h1>
          <p className="text-muted-foreground">Vizualizează progresul și statisticile tale de antrenament</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as 'week' | 'month' | 'year')}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="week">Săptămânal</TabsTrigger>
              <TabsTrigger value="month">Lunar</TabsTrigger>
              <TabsTrigger value="year">Anual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timp Total</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalMinutes)} min</p>
                  <p className="text-xs text-muted-foreground">
                    ({(stats.totalMinutes / 60).toFixed(1)} ore)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Dumbbell className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Greutate Ridicată</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalWeight).toLocaleString()} kg</p>
                  <p className="text-xs text-muted-foreground">total volume</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sesiuni</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">antrenamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Media/Sesiune</p>
                  <p className="text-2xl font-bold">{Math.round(stats.avgDuration)} min</p>
                  <p className="text-xs text-muted-foreground">durată medie</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timp de Antrenament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="minute" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Minute" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Volum Greutăți
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="greutate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="Greutate (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Breakdown & Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Exerciții
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exerciseBreakdown.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={exerciseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {exerciseBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nu există exerciții înregistrate
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sesiuni Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sessions.slice(0, 10).map(session => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(session.date), 'd MMMM yyyy', { locale: ro })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.total_duration_minutes || 0} minute
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {exercises.filter(e => e.session_id === session.id).length} exerciții
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nu există sesiuni de antrenament înregistrate
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutHistory;
