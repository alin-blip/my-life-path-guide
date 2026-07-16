import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Flame,
  Zap,
  Shield,
  Wind,
  AlertCircle,
  CloudRain,
  EyeOff,
  HandHeart,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { MentalitateStackFlow } from '@/components/mentalitate/MentalitateStackFlow';
import { AngerStack } from '@/components/stack/AngerStack';
import { FrustrationStack } from '@/components/stack/FrustrationStack';
import { FearStack } from '@/components/stack/FearStack';
import { AnxietyStack } from '@/components/stack/AnxietyStack';
import { PanicStack } from '@/components/stack/PanicStack';
import { SadnessStack } from '@/components/stack/SadnessStack';
import { ShameStack } from '@/components/stack/ShameStack';
import { DivinePrayerStack } from '@/components/stack/divine-stack/DivinePrayerStack';
import { KillItTodayStack } from '@/components/stack/KillItTodayStack';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getActiveWeekKey } from '@/utils/weekUtils';
import { logRoutineEvent } from '@/lib/routineTelemetry';


interface Props {
  onComplete: () => void;
  onSkip: () => void;
  alreadyCompleted?: boolean;
}

type Method =
  | 'none'
  | 'reconstruction'
  | 'kill-it-today'
  | 'anger'
  | 'frustration'
  | 'fear'
  | 'anxiety'
  | 'panic'
  | 'sadness'
  | 'shame'
  | 'prayer';

/**
 * Step wrapper shown inside Warrior Routine.
 * Renders the chosen mentality stack inline — never navigates away.
 */
const METHOD_STORAGE_KEY = () => `mindShifting_method_${new Date().toISOString().split('T')[0]}`;

const VALID_METHODS: Method[] = [
  'none', 'reconstruction', 'kill-it-today', 'anger', 'frustration',
  'fear', 'anxiety', 'panic', 'sadness', 'shame', 'prayer',
];

export const MindShiftingMethodStep: React.FC<Props> = ({ onComplete, onSkip, alreadyCompleted = false }) => {
  // Persist selected method for today so tab switches / re-mounts don't reset
  // the user back to the method chooser (e.g. losing an in-progress prayer stack).
  const [method, setMethod] = useState<Method>(() => {
    try {
      const saved = localStorage.getItem(METHOD_STORAGE_KEY());
      if (saved && VALID_METHODS.includes(saved as Method)) return saved as Method;
    } catch {}
    return 'none';
  });
  const [showAllStacks, setShowAllStacks] = useState(false);

  const markMindShiftDone = useCallback((reason: 'stack_selected' | 'stack_action_saved' | 'stack_flow_complete' | 'continue_button', sub?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const wasAlreadyDone = localStorage.getItem(`mind_shift_done_${today}`) === '1';
      localStorage.setItem(`mind_shift_done_${today}`, '1');
      logRoutineEvent({
        step: 'mindShifting',
        reason,
        sub,
        meta: { wasAlreadyDone },
      });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (method === 'none') {
        localStorage.removeItem(METHOD_STORAGE_KEY());
      } else {
        localStorage.setItem(METHOD_STORAGE_KEY(), method);
        // Any chosen stack counts as completing the mindShifting step —
        // marks Warrior Routine step 1/N done regardless of which stack the
        // user picks (prayer, anger, reconstruction, kill-it-today, etc.).
        markMindShiftDone('stack_selected', method);
      }
    } catch {}
  }, [method, markMindShiftDone]);

  const completeAndContinue = useCallback(() => {
    markMindShiftDone('stack_flow_complete', method);
    onComplete();
  }, [markMindShiftDone, onComplete, method]);

  const addActionToHitList = useCallback(async (actionText: string) => {
    if (!actionText?.trim()) return;
    // Adding an action from any stack also confirms the mindShifting step.
    markMindShiftDone('stack_action_saved', method);
    try {
      const weekKey = getActiveWeekKey();
      const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'] as const;
      const today = days[new Date().getDay()];
      // Kill It Today (and other stacks) extract actionable tasks — put them
      // in today's HIT list so they show up in "Sarcinile de azi" (Door),
      // matching what the stack UI promises.
      const category: 'hit' | 'hot' = method === 'kill-it-today' ? 'hit' : 'hot';
      await doorUserTasksService.addIdeaToWeek(weekKey, {
        id: `routine-stack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: actionText,
        category,
        priority: category === 'hit' ? ('urgent-important' as any) : ('none' as any),
        day: category === 'hit' ? (today as any) : undefined,
      });
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'ideaAdded' } }));
      toast.success(
        category === 'hit'
          ? 'Adăugat în Sarcinile de azi'
          : 'Acțiune adăugată în HIT List'
      );
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut salva acțiunea.');
    }
  }, [markMindShiftDone, method]);



  const InlineHeader = () => (
    <div className="flex items-center justify-between mb-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMethod('none')}
        className="text-xs gap-1 h-8 px-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Schimbă metoda
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { markMindShiftDone('continue_button', method); onComplete(); }}
        className="text-xs h-8 px-2"
      >
        Continuă rutina →
      </Button>
    </div>
  );

  if (method === 'reconstruction') {
    return (
      <div>
        <InlineHeader />
        <MentalitateStackFlow
          mode="daily"
          source="routine"
          onComplete={completeAndContinue}
          onSkip={onSkip}
        />
      </div>
    );
  }

  if (method === 'kill-it-today') {
    return (
      <div>
        <InlineHeader />
        <KillItTodayStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'anger') {
    return (
      <div>
        <InlineHeader />
        <AngerStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'frustration') {
    return (
      <div>
        <InlineHeader />
        <FrustrationStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'fear') {
    return (
      <div>
        <InlineHeader />
        <FearStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'anxiety') {
    return (
      <div>
        <InlineHeader />
        <AnxietyStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'panic') {
    return (
      <div>
        <InlineHeader />
        <PanicStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'sadness') {
    return (
      <div>
        <InlineHeader />
        <SadnessStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'shame') {
    return (
      <div>
        <InlineHeader />
        <ShameStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  if (method === 'prayer') {
    return (
      <div>
        <InlineHeader />
        <DivinePrayerStack onAddToHitList={addActionToHitList} />
      </div>
    );
  }

  const options: Array<{
    id: Exclude<Method, 'none'>;
    title: string;
    desc: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    badge?: string;
  }> = [
    {
      id: 'reconstruction',
      title: 'Reconstrucție Mentală',
      desc: 'Trigger → Distorsiune → Reframe → Acțiune → Integrare. Îmbunătățește mentalitatea.',
      Icon: RotateCcw,
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-500',
      hoverBorder: 'group-hover:text-violet-500',
      badge: 'recomandat zilnic',
    },
    {
      id: 'kill-it-today',
      title: 'Kill It Today',
      desc: 'Mod dominație: mentalitate → win → ancoră → familie → corp. Setează-te în putere.',
      Icon: Zap,
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-500',
      hoverBorder: 'group-hover:text-orange-500',
      badge: 'când te simți echilibrat',
    },
    {
      id: 'anger',
      title: 'Anger Coach',
      desc: 'Transformă furia în claritate și direcție (42Q).',
      Icon: Flame,
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-500',
      hoverBorder: 'group-hover:text-red-500',
    },
    {
      id: 'frustration',
      title: 'Frustration Coach',
      desc: 'Deblochează așteptările neîmplinite și găsește următorul pas.',
      Icon: Zap,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-500',
      hoverBorder: 'group-hover:text-amber-500',
    },
    {
      id: 'fear',
      title: 'Fear Coach',
      desc: 'Transformă frica în direcție și acțiune curajoasă.',
      Icon: Shield,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-500',
      hoverBorder: 'group-hover:text-emerald-500',
    },
    {
      id: 'anxiety',
      title: 'Anxiety Coach',
      desc: 'Calmează anxietatea și ancorează-te în prezent (12Q).',
      Icon: Wind,
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-500',
      hoverBorder: 'group-hover:text-sky-500',
    },
    {
      id: 'panic',
      title: 'Panic Reset',
      desc: 'Ancorare 5-4-3-2-1 + respirație box pentru val de panică.',
      Icon: AlertCircle,
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-500',
      hoverBorder: 'group-hover:text-orange-500',
      badge: 'urgent',
    },
    {
      id: 'sadness',
      title: 'Sadness & Grief',
      desc: 'Onorează tristețea, nu o reprima. Procesare blândă.',
      Icon: CloudRain,
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-500',
      hoverBorder: 'group-hover:text-blue-500',
    },
    {
      id: 'shame',
      title: 'Shame & Guilt',
      desc: 'Distinge „am greșit" de „sunt greșit". Restaurează demnitatea.',
      Icon: EyeOff,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-500',
      hoverBorder: 'group-hover:text-rose-500',
    },
    {
      id: 'prayer',
      title: 'Prayer Stack',
      desc: 'Dialogul cu Divinitatea. Conectare, predare, ascultare.',
      Icon: HandHeart,
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-500',
      hoverBorder: 'group-hover:text-indigo-500',
      badge: 'spiritual',
    },
  ];

  return (
    <Card variant="premium" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'var(--gradient-mesh)' }}
      />
      <CardContent className="relative p-5 space-y-4">
        {alreadyCompleted && !showAllStacks ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 to-yellow-500/10 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/30 flex items-center justify-center shrink-0">
                <ChevronRight className="w-5 h-5 text-amber-500 rotate-90" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-amber-200">
                  ✓ Mentalitate completă azi
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ai făcut deja un stack mental astăzi. Poți continua rutina sau alege încă un stack.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Button
                size="lg"
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 hover:from-amber-500 hover:to-yellow-600 font-semibold"
              >
                Continuă rutina →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllStacks(true)}
                className="w-full"
              >
                Alege încă un stack
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-tight">
                Alege metoda prin care lucrăm astăzi la mentalitate
              </h3>
              <p className="text-xs text-muted-foreground">
                Setează starea de putere pentru ziua de azi. Alege procesul care ți se potrivește acum.
              </p>
            </div>

            <div className="grid gap-2.5">
              {options.map((opt) => {
                const isRecommended = opt.id === 'reconstruction' || opt.id === 'kill-it-today';
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMethod(opt.id)}
                    className={`card-3d group text-left rounded-lg p-3 flex items-start gap-3 ${
                      isRecommended ? 'ring-1 ring-primary/40' : ''
                    }`}
                    style={
                      isRecommended
                        ? { boxShadow: 'var(--shadow-3d-sm), 0 0 24px -6px hsl(var(--primary) / 0.35)' }
                        : undefined
                    }
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${opt.iconBg} flex items-center justify-center shrink-0 relative`}
                      style={{
                        boxShadow:
                          'inset 0 1px 0 0 hsl(0 0% 100% / 0.08), inset 0 -1px 0 0 hsl(0 0% 0% / 0.25)',
                      }}
                    >
                      <opt.Icon className={`w-4 h-4 ${opt.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{opt.title}</span>
                        {opt.badge && (
                          <Badge variant="outline" className="text-[10px]">
                            {opt.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-muted-foreground ${opt.hoverBorder} mt-2 transition-transform group-hover:translate-x-0.5`}
                    />
                  </button>
                );
              })}
            </div>

            <button
              onClick={alreadyCompleted ? onComplete : onSkip}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {alreadyCompleted ? 'Continuă rutina →' : 'Sari peste astăzi'}
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
