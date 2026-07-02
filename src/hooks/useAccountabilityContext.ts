import { useMemo } from 'react';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTodayActivity } from '@/hooks/useTodayActivity';

export interface AccountabilityContext {
  userName: string | null;
  foundationStatus: {
    completionPercentage: number;
    isComplete: boolean;
    pendingCount: number;
    pendingItems: string[];
  };
  todayActivity: {
    totalCount: number;
    countsByAxis: Record<string, number>;
    recentTitles: string[];
  };
  contextSummary: string;
}

export const useAccountabilityContext = (): AccountabilityContext => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const foundation = useFoundationStatus();
  const { snapshot } = useTodayActivity();

  const contextSummary = useMemo(() => {
    const parts: string[] = [];

    if (!foundation.isLoading) {
      if (foundation.isFoundationComplete) {
        parts.push('User has completed all foundation setup.');
      } else {
        parts.push(`User's foundation is ${foundation.completionPercentage}% complete.`);
        if (foundation.pendingItems.length > 0) {
          const pending = foundation.pendingItems.map(item => item.message.en);
          parts.push(`Pending: ${pending.join(', ')}`);
        }
      }
      if (!foundation.hasAllAnnualCategories) {
        parts.push(`Missing annual objectives for: ${foundation.missingAnnualCategories.join(', ')}`);
      }
      if (!foundation.hasQuarterly) parts.push('Has not set 90-day objectives yet.');
      if (!foundation.hasMonthly) parts.push('Has not set monthly focus yet.');
      if (!foundation.hasTodayTasks) parts.push('No tasks set for today.');
      if (!foundation.hasStartedRoutineToday) parts.push('Has not started champion routine today.');
      if (!foundation.hasVisionBoard) parts.push('Vision board is incomplete.');
    }

    // Shadow Coach: today's real activity across the platform
    if (snapshot && snapshot.totalCount > 0) {
      const c = snapshot.countsByAxis;
      parts.push(
        `Today's activity — total ${snapshot.totalCount} actions (body:${c.body}, being:${c.being}, balance:${c.balance}, business:${c.business}, mind:${c.mind}).`
      );
      const recent = snapshot.items.slice(0, 6).map(i => `[${i.axis}] ${i.title}`).join('; ');
      if (recent) parts.push(`Recent: ${recent}.`);
    } else if (snapshot) {
      parts.push('No tracked activity yet today.');
    }

    return parts.join(' ');
  }, [foundation, snapshot]);

  return {
    userName: user?.email?.split('@')[0] || null,
    foundationStatus: {
      completionPercentage: foundation.completionPercentage,
      isComplete: foundation.isFoundationComplete,
      pendingCount: foundation.pendingItems.length,
      pendingItems: foundation.pendingItems.map(item => item.message.en),
    },
    todayActivity: {
      totalCount: snapshot?.totalCount ?? 0,
      countsByAxis: snapshot?.countsByAxis ?? { body: 0, being: 0, balance: 0, business: 0, mind: 0 },
      recentTitles: (snapshot?.items ?? []).slice(0, 8).map(i => i.title),
    },
    contextSummary,
  };
};
