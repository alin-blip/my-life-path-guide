import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Users, Flame, Trophy, Target, Activity, Clock,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Calendar, BarChart3, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';

interface ChallengeOverview {
  totalParticipants: number;
  activeThisWeek: number;
  completedAll: number;
  avgDaysCompleted: number;
  completionRate: number;
  dropOffDay: number; // Most common drop-off day
  dayBreakdown: { day: number; completed: number; started: number; rate: number }[];
}

interface UserEngagement {
  totalActiveUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  avgSessionsPerWeek: number;
  topFeatures: { feature: string; count: number }[];
  activityTrend: { date: string; active: number; newUsers: number }[];
}

interface CohortData {
  cohort: string;
  total: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

export const EngagementDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeOverview | null>(null);
  const [engagement, setEngagement] = useState<UserEngagement | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [view, setView] = useState<'challenge' | 'activity' | 'cohorts'>('challenge');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadChallengeData(), loadEngagementData(), loadCohortData()]);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChallengeData = async () => {
    try {
      const { data: progress, error } = await supabase
        .from('challenge_progress')
        .select('user_id, day_number, completed, completed_at, video_watched');
      if (error) throw error;

      const progressData = progress || [];
      
      // Group by user
      const userMap: Record<string, { days: number[]; maxDay: number }> = {};
      progressData.forEach(p => {
        if (!userMap[p.user_id]) userMap[p.user_id] = { days: [], maxDay: 0 };
        if (p.completed) {
          userMap[p.user_id].days.push(p.day_number);
          userMap[p.user_id].maxDay = Math.max(userMap[p.user_id].maxDay, p.day_number);
        }
      });

      const users = Object.values(userMap);
      const totalParticipants = users.length;
      const completedAll = users.filter(u => u.maxDay >= 90).length;
      const avgDaysCompleted = totalParticipants > 0
        ? Math.round(users.reduce((sum, u) => sum + u.days.length, 0) / totalParticipants)
        : 0;

      // Active this week (completed a day in last 7 days)
      const weekAgo = subDays(new Date(), 7).toISOString();
      const recentProgress = progressData.filter(p => p.completed_at && p.completed_at >= weekAgo);
      const activeThisWeek = new Set(recentProgress.map(p => p.user_id)).size;

      // Day breakdown (first 30 days for visualization)
      const dayBreakdown: ChallengeOverview['dayBreakdown'] = [];
      for (let d = 1; d <= 30; d++) {
        const started = users.filter(u => u.maxDay >= d - 1).length;
        const completed = users.filter(u => u.days.includes(d)).length;
        dayBreakdown.push({
          day: d,
          started,
          completed,
          rate: started > 0 ? Math.round((completed / started) * 100) : 0,
        });
      }

      // Find most common drop-off day
      let maxDropOff = 0;
      let dropOffDay = 1;
      for (let i = 1; i < dayBreakdown.length; i++) {
        const dropOff = dayBreakdown[i - 1].completed - dayBreakdown[i].completed;
        if (dropOff > maxDropOff) {
          maxDropOff = dropOff;
          dropOffDay = dayBreakdown[i].day;
        }
      }

      setChallenge({
        totalParticipants,
        activeThisWeek,
        completedAll,
        avgDaysCompleted,
        completionRate: totalParticipants > 0 ? Math.round((completedAll / totalParticipants) * 100) : 0,
        dropOffDay,
        dayBreakdown,
      });
    } catch (error) {
      console.error('Error loading challenge data:', error);
    }
  };

  const loadEngagementData = async () => {
    try {
      // Get activity timeline data
      const { data: activities, error } = await supabase
        .from('crm_activity_timeline')
        .select('contact_id, activity_type, created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;

      const activityData = activities || [];
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = subDays(new Date(), 7).toISOString();

      // Unique active users
      const allActiveUsers = new Set(activityData.map(a => a.contact_id));
      const dailyActive = new Set(
        activityData.filter(a => format(new Date(a.created_at), 'yyyy-MM-dd') === today).map(a => a.contact_id)
      );
      const weeklyActive = new Set(
        activityData.filter(a => a.created_at >= weekAgo).map(a => a.contact_id)
      );

      // Top features by activity type
      const featureMap: Record<string, number> = {};
      activityData.forEach(a => {
        const type = a.activity_type || 'unknown';
        featureMap[type] = (featureMap[type] || 0) + 1;
      });
      const topFeatures = Object.entries(featureMap)
        .map(([feature, count]) => ({ feature: formatActivityType(feature), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Daily activity trend (last 30 days)
      const activityTrend: UserEngagement['activityTrend'] = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayActivities = activityData.filter(a => format(new Date(a.created_at), 'yyyy-MM-dd') === dateStr);
        const uniqueUsers = new Set(dayActivities.map(a => a.contact_id));
        const newUsers = dayActivities.filter(a => a.activity_type === 'account_created').length;
        activityTrend.push({
          date: format(date, 'dd MMM'),
          active: uniqueUsers.size,
          newUsers,
        });
      }

      setEngagement({
        totalActiveUsers: allActiveUsers.size,
        dailyActiveUsers: dailyActive.size,
        weeklyActiveUsers: weeklyActive.size,
        avgSessionsPerWeek: weeklyActive.size > 0
          ? Math.round(activityData.filter(a => a.created_at >= weekAgo).length / weeklyActive.size)
          : 0,
        topFeatures,
        activityTrend,
      });
    } catch (error) {
      console.error('Error loading engagement data:', error);
    }
  };

  const loadCohortData = async () => {
    try {
      const { data: contacts, error } = await supabase
        .from('crm_contact_profiles')
        .select('created_at, last_activity_at, funnel_stage')
        .order('created_at', { ascending: true });
      if (error) throw error;

      const contactData = contacts || [];
      
      // Group by month cohort
      const cohortMap: Record<string, { total: number; week1: number; week2: number; week3: number; week4: number }> = {};
      
      contactData.forEach(c => {
        if (!c.created_at) return;
        const cohortMonth = format(new Date(c.created_at), 'MMM yyyy');
        if (!cohortMap[cohortMonth]) {
          cohortMap[cohortMonth] = { total: 0, week1: 0, week2: 0, week3: 0, week4: 0 };
        }
        cohortMap[cohortMonth].total++;
        
        if (c.last_activity_at) {
          const daysSinceCreation = differenceInDays(new Date(c.last_activity_at), new Date(c.created_at));
          if (daysSinceCreation >= 7) cohortMap[cohortMonth].week1++;
          if (daysSinceCreation >= 14) cohortMap[cohortMonth].week2++;
          if (daysSinceCreation >= 21) cohortMap[cohortMonth].week3++;
          if (daysSinceCreation >= 28) cohortMap[cohortMonth].week4++;
        }
      });

      setCohorts(
        Object.entries(cohortMap)
          .map(([cohort, data]) => ({ cohort, ...data }))
          .slice(-6) // Last 6 months
      );
    } catch (error) {
      console.error('Error loading cohort data:', error);
    }
  };

  const formatActivityType = (type: string) => {
    const labels: Record<string, string> = {
      'page_view': 'Vizualizare Pagină',
      'challenge_day_completed': 'Zi Challenge Completată',
      'challenge_started': 'Challenge Început',
      'challenge_video_watched': 'Video Challenge Vizionat',
      'quiz_completed': 'Quiz Completat',
      'course_started': 'Curs Început',
      'course_completed': 'Curs Completat',
      'login': 'Login',
      'account_created': 'Cont Creat',
      'subscription_started': 'Abonament Început',
      'door_completed': 'Door Completat',
      'post_created': 'Postare Creată',
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-green-500" />
            Engagement & Challenge Tracking
          </h2>
          <p className="text-muted-foreground text-sm">Monitorizare activitate utilizatori și progres challenge</p>
        </div>
        <div className="flex gap-2">
          {(['challenge', 'activity', 'cohorts'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {v === 'challenge' ? 'Challenge 90 Zile' : v === 'activity' ? 'Activitate' : 'Cohorte'}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge View */}
      {view === 'challenge' && challenge && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" /> Participanți
                </div>
                <div className="text-2xl font-bold">{challenge.totalParticipants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Flame className="h-4 w-4 text-orange-500" /> Activi Săptămâna Asta
                </div>
                <div className="text-2xl font-bold">{challenge.activeThisWeek}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" /> Completat 90 Zile
                </div>
                <div className="text-2xl font-bold">{challenge.completedAll}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4 text-blue-500" /> Media Zile
                </div>
                <div className="text-2xl font-bold">{challenge.avgDaysCompleted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Drop-off Maxim
                </div>
                <div className="text-2xl font-bold">Ziua {challenge.dropOffDay}</div>
              </CardContent>
            </Card>
          </div>

          {/* Challenge Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progres Challenge — Primele 30 Zile</CardTitle>
              <CardDescription>Câți utilizatori completează fiecare zi vs câți au început</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={challenge.dayBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} label={{ value: 'Ziua', position: 'bottom', offset: -5 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'completed' ? 'Completat' : 'Început'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="started" name="Început" fill="#3b82f6" fillOpacity={0.3} />
                    <Bar dataKey="completed" name="Completat" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rata de Completare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Ziua 1', day: 1 },
                  { label: 'Ziua 7', day: 7 },
                  { label: 'Ziua 14', day: 14 },
                  { label: 'Ziua 30', day: 30 },
                  { label: 'Ziua 60', day: 60 },
                  { label: 'Ziua 90', day: 90 },
                ].map(milestone => {
                  const dayData = challenge.dayBreakdown.find(d => d.day === milestone.day);
                  const rate = dayData?.rate || (milestone.day > 30 
                    ? (challenge.totalParticipants > 0 
                      ? Math.round((challenge.completedAll / challenge.totalParticipants) * 100) 
                      : 0)
                    : 0);
                  return (
                    <div key={milestone.day} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{milestone.label}</span>
                        <span className="text-muted-foreground">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Activity View */}
      {view === 'activity' && engagement && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" /> Utilizatori Activi (30 zile)
                </div>
                <div className="text-2xl font-bold">{engagement.totalActiveUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Zap className="h-4 w-4 text-amber-500" /> DAU (Azi)
                </div>
                <div className="text-2xl font-bold">{engagement.dailyActiveUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" /> WAU (Săptămâna)
                </div>
                <div className="text-2xl font-bold">{engagement.weeklyActiveUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <BarChart3 className="h-4 w-4 text-green-500" /> Sesiuni/Săptămână
                </div>
                <div className="text-2xl font-bold">{engagement.avgSessionsPerWeek}</div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trend Activitate Zilnică</CardTitle>
              <CardDescription>Utilizatori activi unici și conturi noi pe zi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagement.activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="active" name="Utilizatori Activi" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="newUsers" name="Conturi Noi" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Funcționalități Folosite</CardTitle>
              <CardDescription>Ce fac utilizatorii cel mai des pe platformă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engagement.topFeatures.map((f, i) => {
                  const maxCount = engagement.topFeatures[0]?.count || 1;
                  return (
                    <div key={f.feature} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{f.feature}</span>
                        <span className="text-muted-foreground">{f.count} acțiuni</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(f.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Cohorts View */}
      {view === 'cohorts' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retenție pe Cohorte</CardTitle>
            <CardDescription>
              Ce procent din utilizatori rămân activi după 1, 2, 3, 4 săptămâni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Cohortă</th>
                    <th className="text-center py-2 px-3 font-medium">Total</th>
                    <th className="text-center py-2 px-3 font-medium">Săpt. 1</th>
                    <th className="text-center py-2 px-3 font-medium">Săpt. 2</th>
                    <th className="text-center py-2 px-3 font-medium">Săpt. 3</th>
                    <th className="text-center py-2 px-3 font-medium">Săpt. 4</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map(c => (
                    <tr key={c.cohort} className="border-b">
                      <td className="py-2 px-3 font-medium">{c.cohort}</td>
                      <td className="text-center py-2 px-3">{c.total}</td>
                      {[c.week1, c.week2, c.week3, c.week4].map((val, i) => {
                        const rate = c.total > 0 ? Math.round((val / c.total) * 100) : 0;
                        const bg = rate >= 50 ? 'bg-green-500/20 text-green-700' :
                                   rate >= 25 ? 'bg-amber-500/20 text-amber-700' :
                                   rate > 0 ? 'bg-red-500/20 text-red-700' : 'text-muted-foreground';
                        return (
                          <td key={i} className={`text-center py-2 px-3 rounded ${bg}`}>
                            {rate}% ({val})
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {cohorts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nu sunt date suficiente pentru cohorte</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
