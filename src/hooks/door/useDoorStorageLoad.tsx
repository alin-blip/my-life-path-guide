
import { format } from 'date-fns';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { doorStorageManager } from '@/services/doorStorageManager';

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

  const loadSavedState = (currentWeekKey: string, setters: LoadStateSetters) => {
    try {
      logStorageAction('Starting data load via storage manager', { weekKey: currentWeekKey });
      
      const loadedData = doorStorageManager.loadData(currentWeekKey);
      
      if (loadedData) {
        logStorageAction('Found data via storage manager', {
          weekKey: currentWeekKey,
          hotItems: loadedData.hotList?.length || 0,
          hitItems: loadedData.hitList?.length || 0,
          doItems: loadedData.doList?.length || 0,
          hasDomino: !!loadedData.selectedDomino,
          keyPoints: loadedData.dominoKeyPoints?.length || 0,
          isDominoComplete: loadedData.isDominoCompleted
        });
        
        // Set loaded data
        setters.setHotList(loadedData.hotList || []);
        setters.setHitList(loadedData.hitList || []);
        setters.setDoList(loadedData.doList || []);
        setters.setSelectedDomino(loadedData.selectedDomino);
        
        // Handle domino key points
        const loadedKeyPoints = loadedData.dominoKeyPoints || [
          { id: 'key1', text: '', completed: false },
          { id: 'key2', text: '', completed: false },
          { id: 'key3', text: '', completed: false },
          { id: 'key4', text: '', completed: false },
        ];
        
        setters.setDominoKeyPoints(loadedKeyPoints);

        // Normalize and set day/list
        const normalizeDay = (d: any): DayOfWeek => {
          if (typeof d !== 'string') return (d as DayOfWeek) || 'M';
          const map: Record<string, DayOfWeek> = {
            monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th', friday: 'F', saturday: 'Sa', sunday: 'Su',
            m: 'M', t: 'T', w: 'W', th: 'Th', f: 'F', sa: 'Sa', su: 'Su',
          };
          const key = d.toLowerCase();
          return map[key] || (d as DayOfWeek) || 'M';
        };
        
        setters.selectDayOfWeek(normalizeDay(loadedData.activeDay || 'M'));
        setters.setActiveList(loadedData.activeList || 'hit');
        
        // Set domino completion status
        const isComplete = loadedData.isDominoCompleted ?? setters.checkDominoCompletion(loadedKeyPoints);
        setters.setIsDominoCompleted(isComplete);
        
        logStorageAction('Successfully loaded data via storage manager', {
          activeDay: loadedData.activeDay,
          activeList: loadedData.activeList,
          isDominoComplete: isComplete
        });

        // Show welcome back message for returning users (if this is not a new week)
        if (loadedData.hitList.length > 0 || loadedData.doList.length > 0) {
          toast({
            title: "👋 Date încărcate securizat",
            description: `Progresul tău pentru săptămâna ${currentWeekKey.split('-').pop()} a fost încărcat cu succes`,
          });
        }
        
      } else {
        logStorageAction('No data found - setting defaults via storage manager', { weekKey: currentWeekKey });
        resetToDefaultState(setters);
        
        // Show new week message
        toast({
          title: "🆕 Săptămână nouă securizată",
          description: "Ai început o nouă săptămână! Datele tale sunt protejate prin backup automat.",
        });
      }
    } catch (error: any) {
      logStorageAction('Critical error in loadSavedState via storage manager', { error: error.message });
      console.error('Error in loadSavedState:', error);
      toast({
        title: "⚠️ Eroare încărcare",
        description: "A apărut o problemă la încărcarea datelor. Sistemul de backup va încerca recuperarea automată.",
        variant: "destructive",
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
