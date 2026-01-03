import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, Flame, Beef, Brain, Dumbbell, Heart, Target } from 'lucide-react';

interface ChampionLog {
  id: string;
  date: string;
  water_drunk: boolean;
  light_exposure: boolean;
  breathing_completed: boolean;
  meditation_duration_seconds: number;
  gratitude_items: string[];
  autosuggestion_completed: boolean;
  visualization_completed: boolean;
  reading_completed: boolean;
  journaling_completed: boolean;
  exercise_completed: boolean;
  priorities: string[];
  relationship_actions: { person_id: string; action: string; completed: boolean }[];
  meals_logged: { id: string; type: string; description: string; calories: number; protein: number }[];
  total_calories: number;
  total_protein: number;
  content_script: string | null;
  content_topic: string | null;
  pomodoro_sessions: number;
  big_one_today: string | null;
  daily_todos: { id: string; text: string; completed: boolean }[];
}

export default function ChampionRoutineHistory() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<ChampionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ChampionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, currentMonth]);

  const fetchLogs = async () => {
    if (!user) return;
    setIsLoading(true);

    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('champion_routine_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    if (!error && data) {
      setLogs(data.map(log => ({
        ...log,
        gratitude_items: (log.gratitude_items as string[]) || [],
        priorities: (log.priorities as string[]) || [],
        relationship_actions: (log.relationship_actions as { person_id: string; action: string; completed: boolean }[]) || [],
        meals_logged: (log.meals_logged as { id: string; type: string; description: string; calories: number; protein: number }[]) || [],
        daily_todos: (log.daily_todos as { id: string; text: string; completed: boolean }[]) || [],
      })));
    }
    setIsLoading(false);
  };

  const getLogForDay = (date: Date): ChampionLog | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.find(log => log.date === dateStr);
  };

  const calculateCompletionScore = (log: ChampionLog): number => {
    let completed = 0;
    let total = 10;

    if (log.gratitude_items?.length >= 3) completed++;
    if (log.water_drunk) completed++;
    if (log.meditation_duration_seconds >= 600) completed++;
    if (log.autosuggestion_completed) completed++;
    if (log.exercise_completed) completed++;
    if (log.meals_logged?.length > 0) completed++;
    if (log.content_script || log.content_topic) completed++;
    if (log.pomodoro_sessions > 0) completed++;
    if (log.big_one_today || log.daily_todos?.length > 0) completed++;
    if (log.relationship_actions?.some(r => r.completed)) completed++;

    return Math.round((completed / total) * 100);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const firstDayOfWeek = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Istoric Rutină de Campion</h1>
            <p className="text-muted-foreground">Vizualizează progresul tău în timp</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Înapoi
          </Button>
        </div>

        {/* Month Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xl font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ro })}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-4 md:p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const log = getLogForDay(day);
              const isToday = isSameDay(day, new Date());
              const score = log ? calculateCompletionScore(log) : 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => log && setSelectedLog(log)}
                  disabled={!log}
                  className={`
                    aspect-square rounded-lg p-1 flex flex-col items-center justify-center gap-1
                    transition-all relative
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    ${log ? 'cursor-pointer hover:scale-105' : 'opacity-50'}
                    ${score >= 80 ? 'bg-green-500/20' : score >= 50 ? 'bg-yellow-500/20' : score > 0 ? 'bg-orange-500/20' : 'bg-muted/30'}
                  `}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {log && (
                    <span className={`text-xs font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-orange-500'}`}>
                      {score}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20" />
              <span>80-100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20" />
              <span>50-79%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20" />
              <span>1-49%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted/30" />
              <span>Fără date</span>
            </div>
          </div>
        </Card>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{logs.length}</div>
            <div className="text-sm text-muted-foreground">Zile Active</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">
              {logs.filter(l => calculateCompletionScore(l) >= 80).length}
            </div>
            <div className="text-sm text-muted-foreground">Zile Complete</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-500">
              {logs.reduce((acc, l) => acc + (l.total_calories || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Calorii</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">
              {logs.reduce((acc, l) => acc + (l.total_protein || 0), 0).toLocaleString()}g
            </div>
            <div className="text-sm text-muted-foreground">Total Proteine</div>
          </Card>
        </div>
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedLog && format(new Date(selectedLog.date), 'd MMMM yyyy', { locale: ro })}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedLog && (
              <div className="space-y-4">
                {/* Score */}
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-4xl font-bold text-primary">
                    {calculateCompletionScore(selectedLog)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Scor Completare</div>
                </div>

                {/* Being Section */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Being (Mindset)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedLog.gratitude_items?.length >= 3 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span>Recunoștință ({selectedLog.gratitude_items?.length || 0}/3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedLog.water_drunk ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span>Hidratare</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedLog.meditation_duration_seconds >= 600 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span>Meditație ({Math.floor(selectedLog.meditation_duration_seconds / 60)} min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedLog.autosuggestion_completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span>Autosugestie</span>
                    </div>
                  </div>
                  {selectedLog.gratitude_items?.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-purple-500/30">
                      <p className="text-xs text-muted-foreground mb-1">Recunoștință:</p>
                      {selectedLog.gratitude_items.map((item, i) => (
                        <p key={i} className="text-sm">• {item}</p>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Body Section */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-green-500" />
                    Body (Fizic)
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    {selectedLog.exercise_completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    <span>Exerciții</span>
                  </div>
                  {selectedLog.meals_logged?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Mese înregistrate:</p>
                      {selectedLog.meals_logged.map((meal, i) => (
                        <div key={i} className="text-sm flex justify-between">
                          <span>{meal.description}</span>
                          <span className="text-muted-foreground">{meal.calories} kcal / {meal.protein}g</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>{selectedLog.total_calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Beef className="h-4 w-4 text-red-500" />
                      <span>{selectedLog.total_protein}g proteine</span>
                    </div>
                  </div>
                </Card>

                {/* Business Section */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Business (Execution)
                  </h3>
                  {selectedLog.content_topic && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Topic conținut:</p>
                      <p>{selectedLog.content_topic}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span>Sesiuni Pomodoro: {selectedLog.pomodoro_sessions}</span>
                  </div>
                  {selectedLog.big_one_today && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Big One Today:</p>
                      <p className="font-medium">{selectedLog.big_one_today}</p>
                    </div>
                  )}
                  {selectedLog.daily_todos?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Daily To-Dos:</p>
                      {selectedLog.daily_todos.map((todo, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {todo.completed ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>{todo.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Balance Section */}
                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Balance (Relații)
                  </h3>
                  {selectedLog.relationship_actions?.length > 0 ? (
                    <div className="space-y-1">
                      {selectedLog.relationship_actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {action.completed ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          <span>{action.action}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nicio acțiune înregistrată</p>
                  )}
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
