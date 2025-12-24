import { useEffect, useState, useCallback } from 'react';
import { biz4MetricsService } from '@/services/biz4MetricsService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const ACTION_LABELS: Record<string, { en: string; ro: string }> = {
  content: { en: 'Create Content', ro: 'Creează Conținut' },
  engage: { en: 'Engage', ro: 'Interacționează' },
  outreach: { en: 'Outreach', ro: 'Prospectare' },
  close: { en: 'Close', ro: 'Închide Vânzare' },
};

export const useBiz4Reminders = () => {
  const [incompleteActions, setIncompleteActions] = useState<string[]>([]);
  const [hasShownReminder, setHasShownReminder] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const checkIncompleteActions = useCallback(async () => {
    try {
      const incomplete = await biz4MetricsService.getTodayIncompleteActions();
      setIncompleteActions(incomplete);
      return incomplete;
    } catch (error) {
      console.error('Error checking incomplete actions:', error);
      return [];
    }
  }, []);

  const showReminder = useCallback((incomplete: string[]) => {
    if (incomplete.length === 0) return;

    const actionNames = incomplete
      .map(action => ACTION_LABELS[action]?.[language] || action)
      .join(', ');

    const title = language === 'en' 
      ? `📋 Biz 4: ${incomplete.length} actions remaining`
      : `📋 Biz 4: ${incomplete.length} acțiuni rămase`;
    
    const description = language === 'en'
      ? `Complete today: ${actionNames}`
      : `Completează azi: ${actionNames}`;

    toast({
      title,
      description,
      duration: 8000,
    });
  }, [toast, language]);

  // Check on mount and show reminder once per session
  useEffect(() => {
    const checkAndRemind = async () => {
      // Check if we've already shown a reminder today
      const today = new Date().toISOString().split('T')[0];
      const reminderKey = `biz4_reminder_${today}`;
      const alreadyReminded = sessionStorage.getItem(reminderKey);

      if (alreadyReminded) {
        setHasShownReminder(true);
        // Still check incomplete actions for display purposes
        await checkIncompleteActions();
        return;
      }

      const incomplete = await checkIncompleteActions();
      
      // Show reminder after a short delay (let user see the dashboard first)
      if (incomplete.length > 0 && !hasShownReminder) {
        setTimeout(() => {
          showReminder(incomplete);
          setHasShownReminder(true);
          sessionStorage.setItem(reminderKey, 'true');
        }, 2000);
      }
    };

    checkAndRemind();
  }, [checkIncompleteActions, showReminder, hasShownReminder]);

  // Evening reminder (6 PM)
  useEffect(() => {
    const checkEveningReminder = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Only show evening reminder between 6 PM and 7 PM
      if (hour === 18) {
        const today = now.toISOString().split('T')[0];
        const eveningKey = `biz4_evening_reminder_${today}`;
        const alreadyReminded = sessionStorage.getItem(eveningKey);

        if (!alreadyReminded && incompleteActions.length > 0) {
          const title = language === 'en'
            ? '🌆 Evening check: Biz 4 actions'
            : '🌆 Check seară: acțiuni Biz 4';
          
          const description = language === 'en'
            ? `${incompleteActions.length} actions still incomplete. Complete before end of day!`
            : `${incompleteActions.length} acțiuni încă necompletate. Finalizează până la sfârșitul zilei!`;

          toast({
            title,
            description,
            duration: 10000,
          });

          sessionStorage.setItem(eveningKey, 'true');
        }
      }
    };

    // Check immediately and then every 30 minutes
    checkEveningReminder();
    const interval = setInterval(checkEveningReminder, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [incompleteActions, language, toast]);

  const refreshIncomplete = useCallback(async () => {
    await checkIncompleteActions();
  }, [checkIncompleteActions]);

  return {
    incompleteActions,
    refreshIncomplete,
    completedCount: 4 - incompleteActions.length,
    totalActions: 4,
  };
};
