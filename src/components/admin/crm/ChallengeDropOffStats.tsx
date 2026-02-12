import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import { 
  AlertTriangle, TrendingDown, Users, Mail, 
  RefreshCw, CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

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

interface DayUser {
  email: string;
  name: string | null;
  completed: boolean;
  completed_at: string | null;
  video_watched: boolean;
  created_at: string;
}

export const ChallengeDropOffStats: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRecovery, setSendingRecovery] = useState(false);
  
  // Sheet state for day users
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayUsers, setDayUsers] = useState<DayUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

      // Get email leads who signed up for challenge - include ALL challenge sources
      const { data: challengeLeads, error: leadsError } = await supabase
        .from('email_leads')
        .select('email, created_at')
        .ilike('lead_magnet', 'challenge%');

      if (leadsError) throw leadsError;

      // Deduplicate leads by email (lowercase)
      const uniqueEmails = new Set(challengeLeads?.map(l => l.email.toLowerCase()));
      
      // Count unique users from challenge_progress
      const uniqueProgressUsers = new Set(progress?.map(p => p.user_id)).size;
      
      // Total participants = max of both sources (users may overlap)
      const uniqueParticipants = Math.max(uniqueProgressUsers, uniqueEmails.size);

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
          ? uniqueParticipants 
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
      const completedAll = progress?.filter(p => p.day_number === 7 && p.completed).length || 0;
      const recoveryConversions = recoveryEmails?.filter(e => e.converted).length || 0;

      setStats({
        totalParticipants: uniqueParticipants,
        completedAll,
        overallCompletionRate: uniqueParticipants > 0 ? (completedAll / uniqueParticipants) * 100 : 0,
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

  const loadDayUsers = async (dayNumber: number) => {
    setLoadingUsers(true);
    setSelectedDay(dayNumber);
    
    try {
      // Get challenge progress for this day with user info via user_id
      const { data: progressData, error: progressError } = await supabase
        .from('challenge_progress')
        .select('user_id, completed, completed_at, video_watched, created_at')
        .eq('day_number', dayNumber)
        .order('completed_at', { ascending: false, nullsFirst: false });

      if (progressError) throw progressError;

      // Get CRM contact profiles to match emails
      const userIds = progressData?.map(p => p.user_id) || [];
      const { data: contacts, error: contactsError } = await supabase
        .from('crm_contact_profiles')
        .select('user_id, email, name')
        .in('user_id', userIds);

      if (contactsError) throw contactsError;

      // Map contact info by user_id
      const contactMap = new Map(contacts?.map(c => [c.user_id, c]) || []);

      // Combine data
      const users: DayUser[] = (progressData || []).map(p => {
        const contact = contactMap.get(p.user_id);
        return {
          email: contact?.email || 'Unknown',
          name: contact?.name || null,
          completed: p.completed || false,
          completed_at: p.completed_at,
          video_watched: p.video_watched || false,
          created_at: p.created_at || ''
        };
      });

      setDayUsers(users);
    } catch (error) {
      console.error('Error loading day users:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca utilizatorii',
        variant: 'destructive'
      });
      setDayUsers([]);
    } finally {
      setLoadingUsers(false);
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
            Click pe o zi pentru a vedea utilizatorii - Analiza completărilor și abandonului
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
                <div 
                  key={day.day} 
                  className="space-y-2 cursor-pointer hover:bg-muted/50 p-3 rounded-lg border transition-colors"
                  onClick={() => loadDayUsers(day.day)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isHighDropOff ? 'destructive' : 'secondary'}
                        className="w-8 h-8 flex items-center justify-center rounded-full"
                      >
                        {day.day}
                      </Badge>
                      <span className="font-medium">{dayNames[index]}</span>
                      <Eye className="h-4 w-4 text-muted-foreground ml-2" />
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

      {/* Day Users Sheet */}
      <Sheet open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Utilizatori {selectedDay ? dayNames[selectedDay - 1] : ''}
            </SheetTitle>
            <SheetDescription>
              {dayUsers.length} utilizatori au ajuns la această zi
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-3 mt-6">
            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dayUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Niciun utilizator la această zi
              </p>
            ) : (
              dayUsers.map((user, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    user.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : user.video_watched 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                        : 'bg-muted/30'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    user.completed ? 'bg-green-100' : user.video_watched ? 'bg-blue-100' : 'bg-muted'
                  }`}>
                    {user.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : user.video_watched ? (
                      <Eye className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.email}</p>
                    {user.name && (
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {user.completed ? (
                        <Badge className="bg-green-500 text-white text-xs">
                          ✓ Completat
                        </Badge>
                      ) : user.video_watched ? (
                        <Badge className="bg-blue-500 text-white text-xs">
                          👁️ Video vizionat
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          ⏳ Început
                        </Badge>
                      )}
                      {user.completed_at ? (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(user.completed_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                        </span>
                      ) : user.created_at ? (
                        <span className="text-xs text-muted-foreground">
                          Început {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ro })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
