import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TribePointEntry {
  id: string;
  tribe_id: string;
  user_id: string;
  points: number;
  reason: string;
  source_type: string;
  created_at: string;
}

export interface TribeBadge {
  id: string;
  tribe_id: string;
  name: string;
  description: string | null;
  icon: string;
  points_required: number;
  badge_type: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  badges_count: number;
}

export function useCoachTribeGamification(tribeId: string | undefined, userId: string | undefined) {
  const [pointsLog, setPointsLog] = useState<TribePointEntry[]>([]);
  const [badges, setBadges] = useState<TribeBadge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Record<string, string[]>>({}); // badgeId -> userIds
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!tribeId) return;
    setLoading(true);

    const [pointsRes, badgesRes, earnedRes] = await Promise.all([
      supabase.from('tribe_points').select('*').eq('tribe_id', tribeId).order('created_at', { ascending: false }).limit(200),
      supabase.from('tribe_badges').select('*').eq('tribe_id', tribeId).order('points_required', { ascending: true }),
      supabase.from('tribe_user_badges').select('*, tribe_badges!inner(tribe_id)').eq('tribe_badges.tribe_id', tribeId),
    ]);

    if (pointsRes.data) {
      setPointsLog(pointsRes.data as TribePointEntry[]);
      // Build leaderboard
      const totals: Record<string, number> = {};
      pointsRes.data.forEach((p: any) => {
        totals[p.user_id] = (totals[p.user_id] || 0) + p.points;
      });
      const lb = Object.entries(totals)
        .map(([user_id, total_points]) => ({ user_id, total_points, badges_count: 0 }))
        .sort((a, b) => b.total_points - a.total_points);
      
      // Count badges per user
      if (earnedRes.data) {
        const badgeCounts: Record<string, number> = {};
        const badgeMap: Record<string, string[]> = {};
        earnedRes.data.forEach((e: any) => {
          badgeCounts[e.user_id] = (badgeCounts[e.user_id] || 0) + 1;
          if (!badgeMap[e.badge_id]) badgeMap[e.badge_id] = [];
          badgeMap[e.badge_id].push(e.user_id);
        });
        setEarnedBadges(badgeMap);
        lb.forEach(entry => {
          entry.badges_count = badgeCounts[entry.user_id] || 0;
        });
      }
      setLeaderboard(lb);
    }

    if (badgesRes.data) setBadges(badgesRes.data as TribeBadge[]);
    setLoading(false);
  }, [tribeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const awardPoints = async (targetUserId: string, points: number, reason: string) => {
    if (!tribeId) return;
    const { error } = await supabase.from('tribe_points').insert({
      tribe_id: tribeId,
      user_id: targetUserId,
      points,
      reason,
      source_type: 'manual',
    });
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `+${points} puncte acordate!` });
      fetchData();
    }
  };

  const createBadge = async (data: { name: string; description?: string; icon?: string; points_required?: number; badge_type?: string }) => {
    if (!tribeId) return;
    const { error } = await supabase.from('tribe_badges').insert({
      tribe_id: tribeId,
      name: data.name,
      description: data.description || null,
      icon: data.icon || '🏆',
      points_required: data.points_required || 0,
      badge_type: data.badge_type || 'achievement',
    });
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Badge creat!' });
      fetchData();
    }
  };

  const deleteBadge = async (badgeId: string) => {
    const { error } = await supabase.from('tribe_badges').delete().eq('id', badgeId);
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Badge șters!' });
      fetchData();
    }
  };

  const awardBadge = async (badgeId: string, targetUserId: string) => {
    const { error } = await supabase.from('tribe_user_badges').insert({
      badge_id: badgeId,
      user_id: targetUserId,
    });
    if (error) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Badge acordat!' });
      fetchData();
    }
  };

  return { pointsLog, badges, earnedBadges, leaderboard, loading, awardPoints, createBadge, deleteBadge, awardBadge, refetch: fetchData };
}
