import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { doorSupabaseService } from '@/services/doorSupabaseService';

interface SaveStateData {
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  activeDay: DayOfWeek;
  activeList: 'hit' | 'do';
}

export function useDoorStorageSave() {
  const { toast } = useToast();
  const { logStorageAction } = useDoorStorageLogger();

  const saveState = async (data: SaveStateData) => {
    if (!data.currentWeekKey) return;

    try {
      await doorSupabaseService.saveWeekLists(data.currentWeekKey, {
        hotList: data.hotList,
        hitList: data.hitList,
        doList: data.doList,
      });

      logStorageAction('Saved Door lists to Supabase', {
        weekKey: data.currentWeekKey,
        hotListItems: data.hotList.length,
        hitListItems: data.hitList.length,
        doListItems: data.doList.length,
      });

      // Optional: quiet success (toast only on forceSave)
    } catch (error: any) {
      logStorageAction('Error saving Door lists to Supabase', { error: error.message });
      console.error('Error saving Door lists:', error);
      toast({
        title: '⚠️ Eroare salvare',
        description: 'Nu s-au putut salva listele în cloud. Încearcă din nou.',
        variant: 'destructive',
      });
    }
  };

  const forceSave = async (data: SaveStateData) => {
    if (data.currentWeekKey) {
      logStorageAction('Force save requested');
      await saveState(data);
      toast({
        title: "💾 Salvare forțată completă",
        description: "Toate modificările au fost salvate securizat cu backup complet.",
      });
    }
  };

  return { saveState, forceSave };
}
