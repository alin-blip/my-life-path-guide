import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Flame, Zap, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { MentalitateStackFlow } from '@/components/mentalitate/MentalitateStackFlow';
import { AngerStack } from '@/components/stack/AngerStack';
import { FrustrationStack } from '@/components/stack/FrustrationStack';
import { FearStack } from '@/components/stack/FearStack';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getActiveWeekKey } from '@/utils/weekUtils';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

type Method = 'none' | 'reconstruction' | 'anger' | 'frustration' | 'fear';

/**
 * Step wrapper shown inside Warrior Routine.
 * Renders the chosen mentality stack inline — never navigates away.
 */
export const MindShiftingMethodStep: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [method, setMethod] = useState<Method>('none');

  const addActionToHitList = useCallback(async (actionText: string) => {
    if (!actionText?.trim()) return;
    try {
      const weekKey = getActiveWeekKey();
      await doorUserTasksService.addIdeaToWeek(weekKey, {
        id: `routine-stack-${Date.now()}`,
        text: actionText,
        category: 'hot',
        priority: 'none' as any,
      });
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'ideaAdded' } }));
      toast.success('Acțiune adăugată în HIT List');
    } catch (e: any) {
      console.error(e);
      toast.error('Nu am putut salva acțiunea.');
    }
  }, []);

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
        onClick={onComplete}
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
          onComplete={onComplete}
          onSkip={onSkip}
        />
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

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-tight">
            Alege metoda prin care lucrăm astăzi la mentalitate
          </h3>
          <p className="text-xs text-muted-foreground">
            Setează starea de putere pentru ziua de azi. Alege procesul care ți se potrivește acum.
          </p>
        </div>

        <div className="grid gap-2">
          <button
            onClick={() => setMethod('reconstruction')}
            className="group text-left rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">Reconstrucție Mentală</span>
                <Badge variant="outline" className="text-[10px]">recomandat zilnic</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trigger → Distorsiune → Reframe → Acțiune → Integrare. Îmbunătățește mentalitatea.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 mt-2" />
          </button>

          <button
            onClick={() => setMethod('anger')}
            className="group text-left rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Anger Coach</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transformă furia în claritate și direcție (42Q).
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 mt-2" />
          </button>

          <button
            onClick={() => setMethod('frustration')}
            className="group text-left rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Frustration Coach</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deblochează așteptările neîmplinite și găsește următorul pas.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 mt-2" />
          </button>

          <button
            onClick={() => setMethod('fear')}
            className="group text-left rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Fear Coach</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Transformă frica în direcție și acțiune curajoasă.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 mt-2" />
          </button>
        </div>

        <button
          onClick={onSkip}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Sari peste astăzi
        </button>
      </CardContent>
    </Card>
  );
};
