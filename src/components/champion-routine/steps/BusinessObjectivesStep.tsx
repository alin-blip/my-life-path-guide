import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Flag, Crown, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBigOne } from '@/hooks/useBigOne';
import { useTierAccess } from '@/hooks/useTierAccess';
import { UpgradeModal } from '@/components/access/UpgradeModal';
import { cn } from '@/lib/utils';

interface Props {
  onNext: () => void;
}

/**
 * Business Objectives step — closes the Warrior Routine by anchoring the day
 * in the strategic ladder: Weekly (free) → Monthly → 90 Days → Annual (Basic).
 */
export const BusinessObjectivesStep: React.FC<Props> = ({ onNext }) => {
  const navigate = useNavigate();
  const { bigOne, suggestedBigOne, isLoading } = useBigOne();
  const { canAccess } = useTierAccess();
  const [modalOpen, setModalOpen] = React.useState(false);

  const isPaid = canAccess('basic');
  const weeklyFocus = bigOne || suggestedBigOne;

  const horizons = [
    {
      key: 'monthly',
      icon: Flag,
      label: 'Misiune Lunară',
      subtitle: '30 zile • Focus principal',
      preview: 'Setează misiunea lunii cu milestone-uri săptămânale.',
      tab: 'monthly',
    },
    {
      key: 'quarterly',
      icon: Target,
      label: 'Obiective 90 Zile',
      subtitle: 'Trimestru • Strategie',
      preview: 'Definește 3 obiective majore și tracking-ul lor.',
      tab: 'quarterly',
    },
    {
      key: 'annual',
      icon: Crown,
      label: 'Viziune Anuală',
      subtitle: '12 luni • North Star',
      preview: 'Viziunea completă pe 12 luni + design de viață.',
      tab: 'annual',
    },
  ];

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          <Target className="w-3 h-3 mr-1" /> Business
        </Badge>
        <h2 className="text-2xl font-bold">Obiectivele tale</h2>
        <p className="text-sm text-muted-foreground">
          Închide rutina cu o privire strategică. Ce se aliniază astăzi cu ce ai
          decis pentru săptămâna, luna, trimestrul și anul tău?
        </p>
      </div>

      {/* Weekly — always free & editable */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
              <Flag className="w-3 h-3" />
              Săptămâna asta
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Big One de execuție</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">FREE</Badge>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" /> Încărcare...
          </div>
        ) : weeklyFocus ? (
          <p className="text-base font-semibold leading-snug">{weeklyFocus}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nu ai încă un focus săptămânal. Deschide Domino Door pentru a-l seta.
          </p>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="mt-3 h-auto py-1 px-2 text-xs"
          onClick={() => navigate('/door')}
        >
          Deschide Domino Door <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </Card>

      {/* Horizons ladder */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground pl-1">
          Orizonturi strategice
        </p>
        {horizons.map((h) => (
          <Card
            key={h.key}
            className={cn(
              'p-3 flex items-center gap-3 relative overflow-hidden',
              !isPaid && 'opacity-90'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              isPaid ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <h.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{h.label}</span>
                {!isPaid && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {isPaid ? h.subtitle : h.preview}
              </p>
            </div>
            {isPaid ? (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={() => navigate(`/door?tab=${h.tab}`)}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-xs"
                onClick={() => setModalOpen(true)}
              >
                Deblochează
              </Button>
            )}
          </Card>
        ))}
      </div>

      {!isPaid && (
        <p className="text-xs text-center text-muted-foreground italic">
          Basic deblochează planificarea completă pe 30 zile, 90 zile și anual.
        </p>
      )}

      <Button size="lg" className="w-full" onClick={onNext}>
        Continuă rutina <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        requiredTier="basic"
        featureName="Planificare Strategică Extinsă"
      />
    </div>
  );
};
