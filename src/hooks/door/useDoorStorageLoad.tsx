

import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { useDoorStorageLogger } from './useDoorStorageLogger';

interface LoadStateSetters {
  setHotList: React.Dispatch<React.SetStateAction<HotListItem[]>>;
  setHitList: React.Dispatch<React.SetStateAction<HitListItem[]>>;
  setDoList: React.Dispatch<React.SetStateAction<DoListItem[]>>;
  setSelectedDomino: React.Dispatch<React.SetStateAction<HotListItem | null>>;
  setDominoKeyPoints: React.Dispatch<React.SetStateAction<DominoKeyPoint[]>>;
  setIsDominoCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  selectDayOfWeek: (day: DayOfWeek) => void;
  setActiveList: React.Dispatch<React.SetStateAction<'hit' | 'do'>>;
  checkDominoCompletion: (keyPoints: DominoKeyPoint[]) => boolean;
}

export function useDoorStorageLoad() {
  const { toast } = useToast();
  const { logStorageAction } = useDoorStorageLogger();

  const loadSavedState = async (currentWeekKey: string, setters: LoadStateSetters) => {
    try {
      logStorageAction('Loading Door lists from Supabase', { weekKey: currentWeekKey });

      // Load global hot list (permanent inbox)
      const hotList = await doorUserTasksService.fetchGlobalHotList();
      
      // Load weekly hit/do lists
      const { hitList, doList } = await doorUserTasksService.fetchWeekLists(currentWeekKey);

      if ((hotList.length + hitList.length + doList.length) > 0) {
        setters.setHotList(hotList);
        setters.setHitList(hitList);
        setters.setDoList(doList);
        setters.setSelectedDomino(null);

        const defaultKeyPoints: DominoKeyPoint[] = [
          { id: 'key1', text: '', completed: false },
          { id: 'key2', text: '', completed: false },
          { id: 'key3', text: '', completed: false },
          { id: 'key4', text: '', completed: false },
        ];
        setters.setDominoKeyPoints(defaultKeyPoints);

        const isComplete = setters.checkDominoCompletion(defaultKeyPoints);
        setters.setIsDominoCompleted(isComplete);
        setters.setActiveList('hit');

        logStorageAction('Loaded Door lists from Supabase', {
          weekKey: currentWeekKey,
          hotItems: hotList.length,
          hitItems: hitList.length,
          doItems: doList.length,
        });

        toast({
          title: '👋 Date încărcate din cloud',
          description: `Săptămâna ${currentWeekKey.split('-').pop()} a fost încărcată din Supabase`,
        });
      } else {
        logStorageAction('No cloud data for week - using defaults', { weekKey: currentWeekKey });
        resetToDefaultState(setters);
        toast({
          title: '🆕 Săptămână nouă',
          description: 'Nu există încă sarcini salvate în cloud pentru această săptămână.',
        });
      }
    } catch (error: any) {
      logStorageAction('Error loading from Supabase', { error: error.message });
      console.error('Error in loadSavedState (Supabase):', error);
      toast({
        title: '⚠️ Eroare încărcare',
        description: 'A apărut o problemă la încărcarea din cloud. Încearcă din nou.',
        variant: 'destructive',
      });
      resetToDefaultState(setters);
    }
  };

  // Helper to reset to default state
  const resetToDefaultState = (setters: LoadStateSetters) => {
    setters.setHitList([]);
    setters.setDoList([]);
    setters.setSelectedDomino(null);
    setters.setDominoKeyPoints([
      { id: 'key1', text: '', completed: false },
      { id: 'key2', text: '', completed: false },
      { id: 'key3', text: '', completed: false },
      { id: 'key4', text: '', completed: false },
    ]);
    setters.setIsDominoCompleted(false);
    logStorageAction('Reset to default state');
  };

  return { loadSavedState };
}
