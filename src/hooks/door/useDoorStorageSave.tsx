
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { doorStorageManager } from '@/services/doorStorageManager';

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
      const success = await doorStorageManager.saveData({
        ...data,
        isDominoCompleted: data.dominoKeyPoints.length > 0 && data.dominoKeyPoints.every(point => 
          point.text && point.text.trim() !== '' && point.completed === true
        )
      });
      
      if (success) {
        logStorageAction('Successfully saved data via storage manager', {
          weekKey: data.currentWeekKey,
          hotListItems: data.hotList.length,
          hitListItems: data.hitList.length,
          doListItems: data.doList.length,
          dominoSelected: !!data.selectedDomino,
          keyPoints: data.dominoKeyPoints.length
        });

        // Show periodic save confirmation (not too often)
        const shouldShowToast = Math.random() < 0.05; // 5% chance
        if (shouldShowToast) {
          toast({
            title: "💾 Date salvate securizat",
            description: `Progresul pentru săptămâna ${data.currentWeekKey.split('-').pop()} a fost salvat cu backup automat`,
          });
        }
      } else {
        throw new Error('Storage manager save failed');
      }
    } catch (error: any) {
      logStorageAction('Error saving state via storage manager', { error: error.message });
      console.error('Error saving state:', error);
      toast({
        title: "⚠️ Eroare salvare",
        description: "A apărut o problemă la salvarea datelor. Datele sunt protejate prin backup automat.",
        variant: "destructive",
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
