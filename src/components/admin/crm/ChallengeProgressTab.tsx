import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, Play, CheckCircle, Clock, Calendar,
  Target, Flame, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ChallengeProgressTabProps {
  contactId: string;
  userId: string | null;
  challengeStartedAt?: string | null;
  challengeCurrentDay?: number;
  challengeDaysCompleted?: number;
  challengeCompletedAt?: string | null;
}

interface DayProgress {
  day_number: number;
  completed: boolean;
  completed_at: string | null;
  video_watched: boolean;
  created_at: string;
}

interface ActivityEvent {
  id: string;
  activity_type: string;
  activity_title: string | null;
  created_at: string;
  activity_data: unknown;
}

export const ChallengeProgressTab: React.FC<ChallengeProgressTabProps> = ({
  contactId,
  userId,
  challengeStartedAt,
  challengeCurrentDay = 0,
  challengeDaysCompleted = 0,
  challengeCompletedAt
}) => {
  const [loading, setLoading] = useState(true);
  const [dayProgress, setDayProgress] = useState<DayProgress[]>([]);
  const [challengeActivities, setChallengeActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    loadChallengeData();
  }, [userId, contactId]);

  const loadChallengeData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Load day-by-day progress from challenge_progress table
      const { data: progressData, error: progressError } = await supabase
        .from('challenge_progress')
        .select('day_number, completed, completed_at, video_watched, created_at')
        .eq('user_id', userId)
        .order('day_number', { ascending: true });

      if (progressError) throw progressError;
      setDayProgress(progressData || []);

      // Load challenge-related activities from timeline
      const { data: activityData, error: activityError } = await supabase
        .from('crm_activity_timeline')
        .select('id, activity_type, activity_title, created_at, activity_data')
        .eq('contact_id', contactId)
        .or('activity_type.eq.challenge_started,activity_type.eq.challenge_day_completed,activity_type.eq.challenge_video_watched,activity_type.eq.challenge_completed,page_path.ilike.%challenge%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;
      setChallengeActivities(activityData || []);
    } catch (error) {
      console.error('Error loading challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Acest contact nu are un cont activ. Nu există date de challenge disponibile.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (challengeDaysCompleted / 7) * 100;
  const isCompleted = !!challengeCompletedAt;
  const hasStarted = !!challengeStartedAt || dayProgress.length > 0;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-500">Completat</Badge>;
    }
    if (hasStarted) {
      return <Badge className="bg-blue-500">În Progres</Badge>;
    }
    return <Badge variant="secondary">Nu a început</Badge>;
  };

  const getDayStatus = (dayNumber: number) => {
    const day = dayProgress.find(d => d.day_number === dayNumber);
    if (!day) return { status: 'locked', icon: Clock, color: 'text-muted-foreground' };
    if (day.completed) return { status: 'completed', icon: CheckCircle, color: 'text-green-500' };
    if (day.video_watched) return { status: 'in_progress', icon: Play, color: 'text-blue-500' };
    return { status: 'started', icon: Target, color: 'text-yellow-500' };
  };

  return (
    <div className="space-y-6">
      {/* Challenge Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              7-Day Challenge Progress
            </CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>
            {hasStarted 
              ? `Început ${challengeStartedAt ? formatDistanceToNow(new Date(challengeStartedAt), { addSuffix: true, locale: ro }) : 'recent'}`
              : 'Utilizatorul nu a început challenge-ul'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{challengeDaysCompleted}/7 zile complete</span>
              <span className="text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Day-by-Day Progress */}
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNumber) => {
              const { status, icon: Icon, color } = getDayStatus(dayNumber);
              const dayData = dayProgress.find(d => d.day_number === dayNumber);
              
              return (
                <div
                  key={dayNumber}
                  className={`text-center p-3 rounded-lg border transition-colors ${
                    status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' :
                    status === 'in_progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' :
                    'bg-muted/30 border-border'
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto ${color} mb-1`} />
                  <p className="text-sm font-medium">Ziua {dayNumber}</p>
                  {dayData?.completed_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(dayData.completed_at), 'dd MMM', { locale: ro })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Început</p>
                <p className="font-medium">
                  {challengeStartedAt 
                    ? format(new Date(challengeStartedAt), 'dd MMM yyyy, HH:mm', { locale: ro })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Finalizat</p>
                <p className="font-medium">
                  {challengeCompletedAt 
                    ? format(new Date(challengeCompletedAt), 'dd MMM yyyy, HH:mm', { locale: ro })
                    : 'În curs...'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Activitate Challenge
          </CardTitle>
          <CardDescription>
            Toate acțiunile legate de challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challengeActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nu există activități înregistrate pentru challenge
            </p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {challengeActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    activity.activity_type === 'challenge_completed' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.activity_type === 'challenge_day_completed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.activity_type === 'challenge_video_watched' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-muted'
                  }`}>
                    {activity.activity_type === 'challenge_completed' ? (
                      <Trophy className="h-4 w-4 text-green-600" />
                    ) : activity.activity_type === 'challenge_day_completed' ? (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    ) : activity.activity_type === 'challenge_video_watched' ? (
                      <Play className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Target className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.activity_title || activity.activity_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ro })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
