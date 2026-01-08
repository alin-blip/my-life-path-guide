import { useMemo } from 'react';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface AccountabilityContext {
  // User Info
  userName: string | null;
  
  // Foundation Status
  foundationStatus: {
    completionPercentage: number;
    isComplete: boolean;
    pendingCount: number;
    pendingItems: string[];
  };
  
  // Summary for AI
  contextSummary: string;
}

export const useAccountabilityContext = (): AccountabilityContext => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const foundation = useFoundationStatus();

  const contextSummary = useMemo(() => {
    const parts: string[] = [];
    
    // Foundation status
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
      
      if (!foundation.hasQuarterly) {
        parts.push('Has not set 90-day objectives yet.');
      }
      
      if (!foundation.hasMonthly) {
        parts.push('Has not set monthly focus yet.');
      }
      
      if (!foundation.hasTodayTasks) {
        parts.push('No tasks set for today.');
      }
      
      if (!foundation.hasStartedRoutineToday) {
        parts.push('Has not started champion routine today.');
      }
      
      if (!foundation.hasVisionBoard) {
        parts.push('Vision board is incomplete.');
      }
    }
    
    return parts.join(' ');
  }, [foundation]);

  return {
    userName: user?.email?.split('@')[0] || null,
    foundationStatus: {
      completionPercentage: foundation.completionPercentage,
      isComplete: foundation.isFoundationComplete,
      pendingCount: foundation.pendingItems.length,
      pendingItems: foundation.pendingItems.map(item => item.message.en),
    },
    contextSummary,
  };
};
