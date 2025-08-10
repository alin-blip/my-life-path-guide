import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HotListItem, HitListItem, DoListItem } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';

interface UseDoorRealtimeProps {
  currentWeekKey: string;
  onDataUpdate: (data: {
    hotList: HotListItem[];
    hitList: HitListItem[];
    doList: DoListItem[];
  }) => void;
}

export function useDoorRealtime({ currentWeekKey, onDataUpdate }: UseDoorRealtimeProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!currentWeekKey) return;

    // Set up real-time subscription for user_tasks changes
    const channel = supabase
      .channel(`door-realtime-${currentWeekKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `week_key=eq.${currentWeekKey}`
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          try {
            // Re-fetch latest data when changes occur using the service
            const { hotList, hitList, doList } = await doorUserTasksService.fetchWeekLists(currentWeekKey);
            onDataUpdate({ hotList, hitList, doList });
            
            // Show notification for real-time updates
            if (payload.eventType === 'INSERT') {
              toast({
                title: "➕ Element nou adăugat",
                description: "Un nou task a fost sincronizat",
              });
            } else if (payload.eventType === 'UPDATE') {
              toast({
                title: "📝 Modificare sincronizată",
                description: "Task-ul a fost actualizat în timp real",
              });
            } else if (payload.eventType === 'DELETE') {
              toast({
                title: "🗑️ Element șters",
                description: "Task-ul a fost eliminat și sincronizat",
              });
            }
          } catch (error) {
            console.error('Error handling real-time update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWeekKey, onDataUpdate, toast]);
}

// Helper functions (duplicate from doorSupabaseService for independence)
function fromDbPriority(val: number | null): 'none' | 'important' | 'urgent' | 'urgent-important' {
  switch (val) {
    case 2:
      return 'important';
    case 3:
      return 'urgent';
    case 4:
      return 'urgent-important';
    default:
      return 'none';
  }
}

function normalizeDay(day: any): 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su' | null {
  if (!day) return null;
  const map: Record<string, 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su'> = {
    monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th', friday: 'F', saturday: 'Sa', sunday: 'Su',
    m: 'M', t: 'T', w: 'W', th: 'Th', f: 'F', sa: 'Sa', su: 'Su',
  };
  const key = String(day).toLowerCase();
  return map[key] || (day as 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su');
}