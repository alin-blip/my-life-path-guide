import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { useToast } from '@/hooks/use-toast';
import { useDoorStorageLogger } from './useDoorStorageLogger';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';

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
      // Save global hot list separately
      await doorUserTasksService.saveGlobalHotList(data.hotList);
      
      // Save weekly hit/do lists
      await doorUserTasksService.saveWeekLists(data.currentWeekKey, {
        hitList: data.hitList,
        doList: data.doList,
      });

      logStorageAction('Saved Door lists to Supabase', {
        weekKey: data.currentWeekKey,
        hotListItems: data.hotList.length,
        hitListItems: data.hitList.length,
        doListItems: data.doList.length,
      });

      // Save Domino + Key Points to weekly_planning
      // Use currentWeekKey directly - service handles format normalization
      if (data.selectedDomino || data.dominoKeyPoints.some(kp => kp.text || kp.metadata)) {
        try {
          const planningKey = data.currentWeekKey;
          
          // Load existing plan to preserve weekGoal and other data
          const existingPlan = await weeklyPlanningService.getPlanForWeek(planningKey);
          
          // Build payload with current Domino + ALL Key Points (including empty ones)
          const planPayload = {
            weekKey: planningKey,
            dominoTitle: data.selectedDomino?.text || existingPlan?.dominoTitle || '',
            weekGoal: existingPlan?.weekGoal || '',
            keyPoints: data.dominoKeyPoints.map((kp, index) => ({
              id: index + 1,
              title: kp.text || '',
              objective: kp.metadata?.objective || '',
              why: kp.metadata?.why || '',
              positiveImpact: kp.metadata?.positiveImpact || '',
              negativeImpact: kp.metadata?.negativeImpact || '',
              steps: kp.metadata?.steps || [],
              responsible: kp.metadata?.responsible || 'Eu',
              deadline: kp.metadata?.deadline || '',
            })),
          };

          const planSaved = await weeklyPlanningService.savePlan(planPayload);
          
          if (planSaved) {
            logStorageAction('Saved weekly plan to cloud', {
              weekKey: data.currentWeekKey,
              planningKey,
              dominoTitle: planPayload.dominoTitle,
              keyPointsCount: planPayload.keyPoints.length,
              keyPointsWithText: planPayload.keyPoints.filter(kp => kp.title).length,
            });
          } else {
            logStorageAction('Failed to save weekly plan', { planningKey });
          }
        } catch (planError: any) {
          logStorageAction('Error saving weekly plan', { error: planError.message });
          console.error('Error saving weekly plan:', planError);
        }
      }

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
