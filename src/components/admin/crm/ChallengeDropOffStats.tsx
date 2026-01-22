import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, TrendingDown, Users, Mail, 
  RefreshCw, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DayStats {
  day: number;
  started: number;
  completed: number;
  dropOffRate: number;
  stuckUsers: { userId: string; email: string; stuckSince: string }[];
}

interface ChallengeStats {
  totalParticipants: number;
  completedAll: number;
  overallCompletionRate: number;
  dayStats: DayStats[];
  atRiskCount: number;
  recoveryEmailsSent: number;
  recoveryConversions: number;
}

export const ChallengeDropOffStats: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRecovery, setSendingRecovery] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get all challenge progress
      const { data: progress, error: progressError } = await supabase
        .from('challenge_progress')
        .select('*');

      if (progressError) throw progressError;

      // Get email leads who signed up for challenge
      const { data: challengeLeads, error: leadsError } = await supabase
        .from('email_leads')
        .select('email, created_at')
        .eq('lead_magnet', 'challenge_7_zile');

      if (leadsError) throw leadsError;

      // Get recovery emails sent
      const { data: recoveryEmails, error: recoveryError } = await supabase
        .from('challenge_recovery_emails')
        .select('*');

      // Group progress by user
      const userProgress = new Map<string, typeof progress>();
      progress?.forEach(p => {
        const existing = userProgress.get(p.user_id) || [];
        existing.push(p);
        userProgress.set(p.user_id, existing);
      });

      // Calculate stats per day
      const dayStats: DayStats[] = [];
      for (let day = 1; day <= 7; day++) {
        const usersAtDay = progress?.filter(p => p.day_number === day) || [];
        const completedAtDay = usersAtDay.filter(p => p.completed);
        
        // Find stuck users (have progress for this day but not completed)
        const stuckUsers = usersAtDay
          .filter(p => !p.completed)
          .map(p => ({
            userId: p.user_id,
            email: '', // Will be filled later
            stuckSince: p.created_at || ''
          }));

        const prevDayCompleted = day === 1 
          ? (challengeLeads?.length || 0) 
          : (progress?.filter(p => p.day_number === day - 1 && p.completed).length || 0);

        dayStats.push({
          day,
          started: usersAtDay.length,
          completed: completedAtDay.length,
          dropOffRate: prevDayCompleted > 0 
            ? ((prevDayCompleted - completedAtDay.length) / prevDayCompleted) * 100 
            : 0,
          stuckUsers
        });
      }

      // Calculate overall stats
      const totalParticipants = challengeLeads?.length || 0;
      const completedAll = progress?.filter(p => p.day_number === 7 && p.completed).length || 0;
      const recoveryConversions = recoveryEmails?.filter(e => e.converted).length || 0;

      setStats({
        totalParticipants,
        completedAll,
        overallCompletionRate: totalParticipants > 0 ? (completedAll / totalParticipants) * 100 : 0,
        dayStats,
        atRiskCount: dayStats.reduce((sum, d) => sum + d.stuckUsers.length, 0),
        recoveryEmailsSent: recoveryEmails?.length || 0,
        recoveryConversions
      });
    } catch (error) {
      console.error('Error loading challenge stats:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca statisticile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryEmails = async () => {
    try {
      setSendingRecovery(true);
      
      const { data, error } = await supabase.functions.invoke('send-challenge-recovery');
      
      if (error) throw error;
      
      toast({
        title: 'Email-uri trimise',
        description: `${data?.sent || 0} email-uri de recovery trimise`
      });
      
      await loadStats();
    } catch (error) {
      console.error('Error sending recovery emails:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut trimite email-urile',
        variant: 'destructive'
      });
    } finally {
      setSendingRecovery(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nu am putut încărca datele</p>
        </CardContent>
      </Card>
    );
  }

  const dayNames = [
    'Ziua 1 - Viziune',
    'Ziua 2 - Identitate',
    'Ziua 3 - Obstacole',
    'Ziua 4 - Plan',
    'Ziua 5 - Stack',
    'Ziua 6 - Accountability',
    'Ziua 7 - Accelerare'
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Participanți</p>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.overallCompletionRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">La Risc</p>
                <p className="text-2xl font-bold text-orange-500">{stats.atRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovery Success</p>
                <p className="text-2xl font-bold text-purple-500">
                  {stats.recoveryEmailsSent > 0 
                    ? ((stats.recoveryConversions / stats.recoveryEmailsSent) * 100).toFixed(0) 
                    : 0}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Action */}
      <Card className={stats.atRiskCount > 0 ? 'border-orange-200' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email-uri de Recovery
              </CardTitle>
              <CardDescription>
                Trimite email-uri personalizate utilizatorilor blocați
              </CardDescription>
            </div>
            <Button 
              onClick={sendRecoveryEmails}
              disabled={sendingRecovery || stats.atRiskCount === 0}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${sendingRecovery ? 'animate-spin' : ''}`} />
              {sendingRecovery ? 'Se trimit...' : `Trimite (${stats.atRiskCount})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{stats.recoveryEmailsSent} trimise total</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{stats.recoveryConversions} conversii</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day by Day Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Drop-off pe Zile
          </CardTitle>
          <CardDescription>
            Analiza completărilor și abandonului pe fiecare zi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.dayStats.map((day, index) => {
              const isHighDropOff = day.dropOffRate > 50;
              const prevCompleted = index === 0 
                ? stats.totalParticipants 
                : stats.dayStats[index - 1].completed;
              const completionVsPrev = prevCompleted > 0 
                ? (day.completed / prevCompleted) * 100 
                : 0;

              return (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isHighDropOff ? 'destructive' : 'secondary'}
                        className="w-8 h-8 flex items-center justify-center rounded-full"
                      >
                        {day.day}
                      </Badge>
                      <span className="font-medium">{dayNames[index]}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {day.started} începuți
                      </span>
                      <span className={day.completed > 0 ? 'text-green-600' : 'text-red-500'}>
                        {day.completed} completați
                      </span>
                      {isHighDropOff && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          -{day.dropOffRate.toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={completionVsPrev} 
                      className={`h-2 flex-1 ${isHighDropOff ? '[&>div]:bg-red-500' : ''}`}
                    />
                    <span className="text-xs text-muted-foreground w-12">
                      {completionVsPrev.toFixed(0)}%
                    </span>
                  </div>

                  {day.stuckUsers.length > 0 && (
                    <div className="ml-10 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {day.stuckUsers.length} utilizatori blocați la această zi
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Days Alert */}
      {stats.dayStats.some(d => d.dropOffRate > 50) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Zile Critice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.dayStats.filter(d => d.dropOffRate > 50).map(day => (
                <li key={day.day} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{dayNames[day.day - 1]}:</span>
                  <span className="text-red-600">{day.dropOffRate.toFixed(0)}% abandon</span>
                  <span className="text-muted-foreground">
                    - {day.stuckUsers.length} utilizatori blocați
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Recomandare: Trimite email-uri de recovery și revizuiește conținutul zilelor problematice.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
