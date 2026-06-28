import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RotateCcw, Flame, Zap, Shield, ChevronRight } from 'lucide-react';
import { MentalitateStackFlow } from '@/components/mentalitate/MentalitateStackFlow';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Step wrapper shown inside Warrior Routine.
 * Lets the user pick today's mentality method:
 *  - Reconstrucție Mentală (inline MentalitateStackFlow)
 *  - or jump to a dedicated stack (Anger / Frustration / Fear)
 */
export const MindShiftingMethodStep: React.FC<Props> = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'none' | 'reconstruction'>('none');

  if (method === 'reconstruction') {
    return (
      <MentalitateStackFlow
        mode="daily"
        source="routine"
        onComplete={onComplete}
        onSkip={onSkip}
      />
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
            onClick={() => navigate('/stack?type=anger')}
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
            onClick={() => navigate('/stack?type=frustration')}
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
            onClick={() => navigate('/stack?type=fear')}
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
