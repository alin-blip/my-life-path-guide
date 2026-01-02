import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Calendar, Clock, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
}

interface WorkoutSession {
  id: string;
  date: string;
  started_at: string | null;
  ended_at: string | null;
  total_duration_minutes: number | null;
  exercises: WorkoutExercise[];
}

export const WorkoutHistory = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch sessions from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        setIsLoading(false);
        return;
      }

      // Fetch exercises for all sessions
      const sessionIds = sessionsData.map(s => s.id);
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select('*')
        .in('session_id', sessionIds)
        .order('order_index', { ascending: true });

      if (exercisesError) throw exercisesError;

      // Combine sessions with their exercises
      const sessionsWithExercises: WorkoutSession[] = sessionsData.map(session => ({
        ...session,
        exercises: (exercisesData || []).filter(ex => ex.session_id === session.id)
      }));

      setSessions(sessionsWithExercises);
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Se încarcă istoricul...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nu ai încă workout-uri salvate.
      </div>
    );
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Istoric Workout-uri (ultimele 30 zile)
      </h3>

      <div className="space-y-2">
        {displayedSessions.map((session) => (
          <Collapsible
            key={session.id}
            open={expandedSession === session.id}
            onOpenChange={(open) => setExpandedSession(open ? session.id : null)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(session.date), 'EEEE, d MMMM', { locale: ro })}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {session.total_duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.total_duration_minutes} min
                        </span>
                      )}
                      <span>{session.exercises.length} exerciții</span>
                    </div>
                  </div>
                </div>
                {expandedSession === session.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-lg border bg-muted/30 overflow-hidden">
                {session.exercises.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercițiu</TableHead>
                        <TableHead className="text-center w-20">Seturi</TableHead>
                        <TableHead className="text-center w-20">Reps</TableHead>
                        <TableHead className="text-center w-24">Greutate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.exercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                          <TableCell className="font-medium">
                            {exercise.exercise_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {exercise.sets || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {exercise.reps || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {exercise.weight_kg ? `${exercise.weight_kg} kg` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="p-3 text-sm text-muted-foreground text-center">
                    Nu au fost salvate exerciții pentru această sesiune.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {sessions.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? 'Arată mai puține' : `Arată toate (${sessions.length})`}
        </Button>
      )}
    </div>
  );
};
