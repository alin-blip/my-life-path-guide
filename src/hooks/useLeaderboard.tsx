import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  pages_read: number;
  actions_completed: number;
  principles_touched: number;
  last_activity: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  is_visible: boolean;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .order('pages_read', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      
      setLeaderboard((data || []).map(entry => ({
        ...entry,
        pages_read: Number(entry.pages_read) || 0,
        actions_completed: Number(entry.actions_completed) || 0,
        principles_touched: Number(entry.principles_touched) || 0,
      })));
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('leaderboard_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const joinLeaderboard = async (displayName: string, avatarEmoji: string = '📚') => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error: insertError } = await supabase
        .from('leaderboard_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          avatar_emoji: avatarEmoji,
          is_visible: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setUserProfile(data);
      await fetchLeaderboard();
      return { success: true };
    } catch (err: any) {
      console.error('Error joining leaderboard:', err);
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_emoji' | 'is_visible'>>) => {
    if (!user || !userProfile) return { success: false, error: 'No profile found' };

    try {
      const { data, error: updateError } = await supabase
        .from('leaderboard_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setUserProfile(data);
      await fetchLeaderboard();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message };
    }
  };

  const leaveLeaderboard = async () => {
    return updateProfile({ is_visible: false });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchLeaderboard(), fetchUserProfile()]);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const userRank = userProfile 
    ? leaderboard.findIndex(entry => entry.user_id === user?.id) + 1 
    : null;

  return {
    leaderboard,
    userProfile,
    userRank: userRank || null,
    isLoading,
    error,
    joinLeaderboard,
    updateProfile,
    leaveLeaderboard,
    refetch: fetchLeaderboard,
  };
};
