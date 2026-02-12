import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DayStats {
  day_number: number;
  completions: number;
}

export const useChallengeStats = () => {
  const [stats, setStats] = useState<DayStats[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get completions per day
        const { data: dayData, error: dayError } = await supabase
          .from('challenge_progress')
          .select('day_number')
          .eq('completed', true);

        if (dayError) throw dayError;

        // Count completions per day
        const dayCounts: Record<number, number> = {};
        dayData?.forEach(row => {
          dayCounts[row.day_number] = (dayCounts[row.day_number] || 0) + 1;
        });

        const statsArray: DayStats[] = [];
        for (let i = 1; i <= 7; i++) {
          statsArray.push({
            day_number: i,
            completions: dayCounts[i] || 0
          });
        }
        setStats(statsArray);

        // Get unique participants: distinct user_ids from progress
        const { data: userData, error: userError } = await supabase
          .from('challenge_progress')
          .select('user_id');

        const uniqueUserIds = new Set(userData?.map(r => r.user_id));

        // Get email leads count as additional participants
        const { data: leadsData } = await supabase
          .from('email_leads')
          .select('email')
          .eq('lead_magnet', 'challenge_7_zile');

        const uniqueLeadEmails = new Set(leadsData?.map(l => l.email.toLowerCase()));

        // Use max of both sources (overlap possible)
        setTotalParticipants(Math.max(uniqueUserIds.size, uniqueLeadEmails.size));
      } catch (error) {
        console.error('Error fetching challenge stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getCompletionsForDay = (dayNumber: number): number => {
    const dayStat = stats.find(s => s.day_number === dayNumber);
    return dayStat?.completions || 0;
  };

  return {
    stats,
    totalParticipants,
    loading,
    getCompletionsForDay
  };
};
