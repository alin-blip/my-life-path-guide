import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getLevelTitle, getLevelTitleColor } from '@/hooks/useXPSystem';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
        <Crown className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">{rank}</span>
    </div>
  );
};

const LeaderboardRow: React.FC<{ 
  entry: LeaderboardEntry; 
  rank: number;
  isCurrentUser: boolean;
}> = ({ entry, rank, isCurrentUser }) => {
  const titleColor = getLevelTitleColor(entry.current_level);
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all",
      isCurrentUser 
        ? "bg-primary/10 border border-primary/30" 
        : "hover:bg-muted/50"
    )}>
      <RankBadge rank={rank} />
      
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xl">
        {entry.avatar_emoji || '👤'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-semibold truncate",
            isCurrentUser && "text-primary"
          )}>
            {entry.display_name}
          </h4>
          {isCurrentUser && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              You
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={cn("font-medium", titleColor)}>
            Lv.{entry.current_level} {getLevelTitle(entry.current_level)}
          </span>
          {entry.current_streak > 0 && (
            <span className="flex items-center gap-0.5 text-orange-500">
              <Flame className="w-3 h-3" />
              {entry.current_streak}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">{entry.total_xp.toLocaleString()}</span>
        </div>
        <span className="text-xs text-muted-foreground">XP</span>
      </div>
    </div>
  );
};

export const GlobalLeaderboard: React.FC<{ limit?: number }> = ({ limit = 100 }) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['global-leaderboard', limit],
    queryFn: async () => {
      // Get top users by XP
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('user_id, total_xp, current_level')
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (xpError) throw xpError;

      // Get profiles for display names
      const userIds = xpData?.map(u => u.user_id) || [];
      const { data: profiles } = await supabase
        .from('leaderboard_profiles')
        .select('user_id, display_name, avatar_emoji')
        .in('user_id', userIds);

      // Get streaks
      const { data: stats } = await supabase
        .from('user_statistics')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const statsMap = new Map(stats?.map(s => [s.user_id, s]) || []);

      return (xpData || []).map(xp => {
        const profile = profileMap.get(xp.user_id);
        const userStats = statsMap.get(xp.user_id);
        
        return {
          user_id: xp.user_id,
          display_name: profile?.display_name || 'Anonymous',
          avatar_emoji: profile?.avatar_emoji || '👤',
          total_xp: xp.total_xp,
          current_level: xp.current_level,
          current_streak: userStats?.current_streak || 0,
        } as LeaderboardEntry;
      });
    },
  });

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(e => e.user_id === user?.id) + 1;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {language === 'ro' ? 'Clasament Global' : 'Global Leaderboard'}
          </CardTitle>
          {currentUserRank > 0 && (
            <Badge variant="outline">
              {language === 'ro' ? 'Poziția ta:' : 'Your rank:'} #{currentUserRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ro' ? 'Niciun utilizator încă' : 'No users yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <LeaderboardRow 
                key={entry.user_id}
                entry={entry}
                rank={index + 1}
                isCurrentUser={entry.user_id === user?.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
