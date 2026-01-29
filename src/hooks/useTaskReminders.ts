import { useState, useEffect, useCallback, useRef } from 'react';
import { useTodaysTasks, TodayTask } from './useTodaysTasks';
import { playNotificationSound, playCelebrationSound, showBrowserNotification, requestNotificationPermission } from '@/utils/notificationSound';
import { toast } from 'sonner';

export interface TaskReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // 15, 30, 60, 120, or 0 (off)
  soundEnabled: boolean;
  browserNotifications: boolean;
}

const STORAGE_KEY = 'task-reminder-settings';

const defaultSettings: TaskReminderSettings = {
  enabled: true,
  intervalMinutes: 60, // default: every hour
  soundEnabled: true,
  browserNotifications: false,
};

const getStoredSettings = (): TaskReminderSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultSettings;
};

export const useTaskReminders = () => {
  const { tasks, completedCount, totalCount, toggleTask, isLoading } = useTodaysTasks();
  const [settings, setSettings] = useState<TaskReminderSettings>(getStoredSettings);
  const [lastReminderAt, setLastReminderAt] = useState<Date | null>(null);
  const lastInteractionRef = useRef<Date>(new Date());
  const previousCompletedCountRef = useRef<number>(0);

  // Remaining tasks
  const remainingTasks = tasks.filter(t => !t.completed);
  const remainingCount = remainingTasks.length;

  // Update settings and persist
  const updateSettings = useCallback((updates: Partial<TaskReminderSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  // Track user interaction
  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = new Date();
  }, []);

  // Trigger reminder
  const triggerReminder = useCallback((tasksToRemind: TodayTask[]) => {
    // Don't remind if user just interacted (within last 30 seconds)
    const timeSinceInteraction = Date.now() - lastInteractionRef.current.getTime();
    if (timeSinceInteraction < 30000) {
      return;
    }

    // Play sound
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification
    if (settings.browserNotifications) {
      showBrowserNotification(
        '📋 Taskuri Rămase',
        `Ai ${tasksToRemind.length} ${tasksToRemind.length === 1 ? 'task' : 'taskuri'} de completat astăzi`
      );
    }

    // Show toast
    toast.info(`Ai ${tasksToRemind.length} taskuri rămase pentru azi`, {
      action: {
        label: 'Vezi',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('open-accountability-coach', { detail: { tab: 'plan' } }));
        },
      },
    });

    // Open accountability coach
    window.dispatchEvent(new CustomEvent('open-accountability-coach', { detail: { tab: 'plan' } }));

    setLastReminderAt(new Date());
  }, [settings.soundEnabled, settings.browserNotifications]);

  // Request browser notification permission
  const enableBrowserNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      updateSettings({ browserNotifications: true });
      toast.success('Notificări browser activate!');
    } else {
      if (Notification.permission === 'denied') {
        toast.error('Notificările sunt blocate. Verifică setările browserului (click pe 🔒 din bara de adresă).', {
          duration: 5000,
        });
      } else {
        toast.error('Nu am primit permisiunea pentru notificări. Încearcă din nou.');
      }
    }
  }, [updateSettings]);

  // Celebration when all tasks completed
  useEffect(() => {
    if (!isLoading && totalCount > 0 && completedCount === totalCount && previousCompletedCountRef.current < totalCount) {
      playCelebrationSound();
      toast.success('🎉 Toate taskurile de azi sunt complete!');
    }
    previousCompletedCountRef.current = completedCount;
  }, [completedCount, totalCount, isLoading]);

  // Periodic reminder interval
  useEffect(() => {
    if (!settings.enabled || settings.intervalMinutes === 0) {
      return;
    }

    const intervalMs = settings.intervalMinutes * 60 * 1000;

    const checkAndRemind = () => {
      if (remainingTasks.length > 0) {
        triggerReminder(remainingTasks);
      }
    };

    const interval = setInterval(checkAndRemind, intervalMs);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.intervalMinutes, remainingTasks, triggerReminder]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => recordInteraction();
    
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [recordInteraction]);

  return {
    tasks,
    remainingTasks,
    remainingCount,
    completedCount,
    totalCount,
    toggleTask,
    isLoading,
    settings,
    updateSettings,
    lastReminderAt,
    enableBrowserNotifications,
    triggerReminder: () => triggerReminder(remainingTasks),
  };
};
