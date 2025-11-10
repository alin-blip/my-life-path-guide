

import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { toPlanningWeekKey } from '@/utils/weekKey';

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

      // Set hot/hit/do lists
      setters.setHotList(hotList);
      setters.setHitList(hitList);
      setters.setDoList(doList);

      // Try to load Domino + Key Points from weekly_planning
      try {
        const planningKey = toPlanningWeekKey(currentWeekKey);
        const plan = await weeklyPlanningService.getPlanForWeek(planningKey);
        
        if (plan && plan.dominoTitle) {
          // Reconstruct selectedDomino from plan
          setters.setSelectedDomino({
            id: `domino-${currentWeekKey}`,
            text: plan.dominoTitle,
            priority: 'none',
            selected: false,
          });

          // Map key points from plan with full metadata
          const mappedKeyPoints: DominoKeyPoint[] = plan.keyPoints.map((kp, index) => ({
            id: kp.id ? `key${kp.id}` : `key${index + 1}`,
            text: kp.title || '',
            completed: false,
            metadata: {
              objective: kp.objective || '',
              why: kp.why || '',
              positiveImpact: kp.positiveImpact || '',
              negativeImpact: kp.negativeImpact || '',
              steps: kp.steps || [],
              responsible: kp.responsible || 'Eu',
              deadline: kp.deadline || '',
            },
          }));

          // Ensure exactly 4 key points
          while (mappedKeyPoints.length < 4) {
            mappedKeyPoints.push({
              id: `key${mappedKeyPoints.length + 1}`,
              text: '',
              completed: false,
            });
          }

          setters.setDominoKeyPoints(mappedKeyPoints);
          const isComplete = setters.checkDominoCompletion(mappedKeyPoints);
          setters.setIsDominoCompleted(isComplete);
          setters.setActiveList('hit');

          logStorageAction('Loaded weekly plan from cloud', {
            weekKey: currentWeekKey,
            planningKey,
            dominoTitle: plan.dominoTitle,
            keyPointsCount: plan.keyPoints.length,
          });
        } else {
          // No plan exists, reset to default
          setters.setSelectedDomino(null);
          const defaultKeyPoints: DominoKeyPoint[] = [
            { id: 'key1', text: '', completed: false },
            { id: 'key2', text: '', completed: false },
            { id: 'key3', text: '', completed: false },
            { id: 'key4', text: '', completed: false },
          ];
          setters.setDominoKeyPoints(defaultKeyPoints);
          setters.setIsDominoCompleted(false);
          setters.setActiveList('hit');
        }
      } catch (planError: any) {
        logStorageAction('Error loading weekly plan', { error: planError.message });
        console.error('Error loading weekly plan:', planError);
        // Reset to default if plan loading fails
        setters.setSelectedDomino(null);
        const defaultKeyPoints: DominoKeyPoint[] = [
          { id: 'key1', text: '', completed: false },
          { id: 'key2', text: '', completed: false },
          { id: 'key3', text: '', completed: false },
          { id: 'key4', text: '', completed: false },
        ];
        setters.setDominoKeyPoints(defaultKeyPoints);
        setters.setIsDominoCompleted(false);
        setters.setActiveList('hit');
      }

      if ((hotList.length + hitList.length + doList.length) > 0) {
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
