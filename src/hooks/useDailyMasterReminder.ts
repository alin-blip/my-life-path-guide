import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dailyMasterService } from '@/services/dailyMasterService';

interface UseDailyMasterReminderOptions {
  enabled?: boolean;
}

export const useDailyMasterReminder = (options: UseDailyMasterReminderOptions = {}) => {
  const { enabled = true } = options;
  const { toast } = useToast();
  const [stats, setStats] = useState(dailyMasterService.getStats());

  useEffect(() => {
    if (!enabled) return;

    const checkAndRemind = () => {
      const currentStats = dailyMasterService.getStats();
      setStats(currentStats);

      // Check if it's morning (5AM - 10AM) and not completed today
      const now = new Date();
      const hour = now.getHours();
      const isMorning = hour >= 5 && hour <= 10;

      // Check if we already showed reminder today
      const reminderKey = `daily-master-reminder-${now.toDateString()}`;
      const alreadyReminded = sessionStorage.getItem(reminderKey);

      if (isMorning && !currentStats.completedToday && !alreadyReminded) {
        sessionStorage.setItem(reminderKey, 'true');
        
        const streakMessage = currentStats.currentStreak > 0 
          ? `Ai un streak de ${currentStats.currentStreak} zile! Nu-l pierde! 🔥`
          : 'Începe-ți ziua cu energie și claritate!';

        toast({
          title: '🌅 Bună dimineața!',
          description: `Daily Master Stack te așteaptă. ${streakMessage}`,
          duration: 10000,
        });
      }
    };

    // Check immediately on mount
    checkAndRemind();

    // Check every 30 minutes
    const interval = setInterval(checkAndRemind, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, toast]);

  // Refresh stats
  const refreshStats = () => {
    setStats(dailyMasterService.getStats());
  };

  return {
    stats,
    refreshStats,
    isCompletedToday: stats.completedToday,
    currentStreak: stats.currentStreak
  };
};
