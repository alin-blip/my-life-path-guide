import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Play, Check, Sunrise, ArrowRight } from 'lucide-react';

interface DailyFlowSession {
  id: string;
  completed_at: string | null;
  steps_completed: Record<string, boolean>;
}

const TOTAL_STEPS = 6;

export const StartDayCard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<DailyFlowSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('daily_flow_sessions')
          .select('id, completed_at, steps_completed')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (!error && data) {
          setSession({
            ...data,
            steps_completed: (data.steps_completed as Record<string, boolean>) || {}
          });
        }
      } catch (error) {
        console.error('Error fetching daily flow session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [today]);

  const completedCount = session 
    ? Object.values(session.steps_completed).filter(Boolean).length 
    : 0;
  
  const progressPercent = (completedCount / TOTAL_STEPS) * 100;
  const isCompleted = session?.completed_at !== null;
  const hasStarted = session !== null;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
        : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50'
    }`} onClick={() => navigate('/daily-flow')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-amber-500/20 text-amber-500'
          }`}>
            {isCompleted ? (
              <Check className="h-6 w-6" />
            ) : (
              <Sunrise className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {isCompleted ? 'Ziua Completată! 🎉' : hasStarted ? 'Continuă Ziua' : 'Începe Ziua'}
            </h3>
            <p className="text-sm text-muted-foreground font-normal">
              {format(new Date(), "EEEE, d MMMM", { locale: ro })}
            </p>
          </div>
          {!isCompleted && (
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progres zilnic</span>
          <span className="font-medium">{completedCount}/{TOTAL_STEPS} pași</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        
        {!hasStarted && (
          <Button className="w-full gap-2 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Play className="h-4 w-4" />
            Start Day
          </Button>
        )}
        
        {hasStarted && !isCompleted && (
          <div className="flex gap-2 mt-2">
            <div className="flex -space-x-1">
              {['morning', 'fitness', 'relationships', 'content', 'todo', 'focus'].map((step, i) => (
                <div 
                  key={step}
                  className={`h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-xs ${
                    session?.steps_completed[step] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {session?.steps_completed[step] ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
