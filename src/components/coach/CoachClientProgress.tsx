import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Flame, Target, Trophy, TrendingUp, Calendar, 
  CheckCircle2, User, Activity 
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface ClientProgress {
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
  current_streak: number;
  total_xp: number;
  door_completion_rate: number;
  last_activity: string | null;
  status: 'active' | 'pending' | 'inactive';
  lifetime_value: number;
}

interface CoachClientProgressProps {
  coachProfileId: string;
}

export const CoachClientProgress: React.FC<CoachClientProgressProps> = ({ coachProfileId }) => {
  const [clients, setClients] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProgress | null>(null);

  const fetchClientProgress = useCallback(async () => {
    try {
      // Get all referrals for this coach
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('referred_user_id, status, lifetime_value, created_at')
        .eq('coach_id', coachProfileId);

      if (refError) throw refError;
      if (!referrals?.length) {
        setClients([]);
        setLoading(false);
        return;
      }

      const userIds = referrals.map(r => r.referred_user_id);

      // Fetch profiles and progress data in parallel
      const [profilesResult, xpResult, progressResult] = await Promise.allSettled([
        supabase
          .from('leaderboard_profiles')
          .select('user_id, display_name, avatar_emoji')
          .in('user_id', userIds),
        supabase
          .from('user_xp')
          .select('user_id, total_xp')
          .in('user_id', userIds),
        supabase
          .from('daily_progress_stats')
          .select('user_id, streak_days, completion_rate, date')
          .in('user_id', userIds)
          .order('date', { ascending: false }),
      ]);

      const profilesData = profilesResult.status === 'fulfilled' ? (profilesResult.value.data ?? []) : [];
      const xpData = xpResult.status === 'fulfilled' ? (xpResult.value.data ?? []) : [];
      const progressData = progressResult.status === 'fulfilled' ? (progressResult.value.data ?? []) : [];

      const profileMap = new Map(profilesData.map(p => [p.user_id, p]));
      const xpMap = new Map<string, number>(xpData.map(x => [x.user_id, x.total_xp ?? 0]));
      
      // Get latest progress per user
      const progressMap = new Map<string, { streak: number; rate: number; date: string }>();
      for (const p of progressData) {
        if (!progressMap.has(p.user_id)) {
          progressMap.set(p.user_id, {
            streak: p.streak_days || 0,
            rate: p.completion_rate || 0,
            date: p.date,
          });
        }
      }

      const clientList: ClientProgress[] = referrals.map(ref => {
        const profile = profileMap.get(ref.referred_user_id);
        const progress = progressMap.get(ref.referred_user_id);
        const xp = xpMap.get(ref.referred_user_id) || 0;

        // Determine activity status
        let activityStatus: 'active' | 'pending' | 'inactive' = 'pending';
        if (progress?.date) {
          const lastDate = new Date(progress.date);
          const weekAgo = subDays(new Date(), 7);
          activityStatus = lastDate >= weekAgo ? 'active' : 'inactive';
        }

        return {
          user_id: ref.referred_user_id,
          display_name: profile?.display_name || 'Unknown User',
          avatar_emoji: profile?.avatar_emoji || null,
          current_streak: progress?.streak || 0,
          total_xp: xp,
          door_completion_rate: progress?.rate || 0,
          last_activity: progress?.date || null,
          status: ref.status as 'active' | 'pending' || activityStatus,
          lifetime_value: ref.lifetime_value || 0,
        };
      });

      // Sort by activity and streak
      clientList.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        return b.current_streak - a.current_streak;
      });

      setClients(clientList);
    } catch (error) {
      console.error('Error fetching client progress:', error);
    } finally {
      setLoading(false);
    }
  }, [coachProfileId]);

  useEffect(() => {
    fetchClientProgress();
  }, [fetchClientProgress]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Inactive</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No clients yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Share your referral link to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedClient) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedClient(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ←
              </button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-xl">
                  {selectedClient.avatar_emoji || selectedClient.display_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{selectedClient.display_name}</CardTitle>
                {getStatusBadge(selectedClient.status)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{selectedClient.current_streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Target className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{selectedClient.door_completion_rate}%</p>
              <p className="text-xs text-muted-foreground">Door Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{selectedClient.total_xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">€{selectedClient.lifetime_value}</p>
              <p className="text-xs text-muted-foreground">Lifetime Value</p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Last Activity</p>
              <p className="text-sm text-muted-foreground">
                {selectedClient.last_activity 
                  ? format(new Date(selectedClient.last_activity), 'PPP')
                  : 'No activity recorded'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Door Completion</span>
              <span>{selectedClient.door_completion_rate}%</span>
            </div>
            <Progress value={selectedClient.door_completion_rate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Client List View
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Client Progress
        </CardTitle>
        <CardDescription>
          Monitor your clients' daily activity and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y">
            {clients.map((client) => (
              <button
                key={client.user_id}
                onClick={() => setSelectedClient(client)}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-4"
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xl">
                    {client.avatar_emoji || client.display_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{client.display_name}</span>
                    {getStatusBadge(client.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {client.current_streak} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-green-500" />
                      {client.door_completion_rate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      {client.total_xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">€{client.lifetime_value}</p>
                  <p className="text-xs text-muted-foreground">LTV</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
