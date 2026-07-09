import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFeatureAccess, type FeatureKey } from '@/hooks/useFeatureAccess';
import { UpgradeModal } from './UpgradeModal';
import { useLanguage } from '@/context/LanguageContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { formatDistanceToNow } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

interface FeatureGateProps {
  featureKey: FeatureKey;
  featureName: string;
  teaser?: string;
  /** When true, calls consume() automatically once children mount. Default false — caller handles consume via useFeatureAccess. */
  autoConsume?: boolean;
  children: React.ReactNode;
  /** Optional callback fired when consume succeeded. */
  onConsumed?: () => void;
}

/**
 * Wraps a feature with a soft usage cap. Paid tiers always see children raw.
 * Free tier sees a subtle "N remaining" banner above children; when limit is
 * hit, shows a paywall card instead of children.
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  featureName,
  teaser,
  autoConsume = false,
  children,
  onConsumed,
}) => {
  const { status, loading, refresh, consume } = useFeatureAccess(featureKey);
  const { canAccess } = useTierAccess();
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const [modalOpen, setModalOpen] = useState(false);
  const consumedRef = useRef(false);

  // Paid users bypass entirely (no consume, no banner).
  const isPaid = canAccess('basic');

  useEffect(() => {
    if (!isPaid && autoConsume && status && !consumedRef.current && status.allowed) {
      consumedRef.current = true;
      consume().then((ok) => { if (ok) onConsumed?.(); });
    }
  }, [isPaid, autoConsume, status, consume, onConsumed]);

  if (isPaid) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!status) {
    // Auth failed / no session — render children (they'll fail their own auth check)
    return <>{children}</>;
  }

  if (!status.allowed) {
    const resetText = status.reset_at
      ? formatDistanceToNow(new Date(status.reset_at), { addSuffix: true, locale: isRo ? ro : enUS })
      : '';
    return (
      <>
        <Card className="p-8 text-center space-y-4 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
            <Sparkles className="mr-1 h-3 w-3" />
            {isRo ? 'Limita gratuită atinsă' : 'Free limit reached'}
          </Badge>
          <h3 className="text-lg font-semibold">{featureName}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isRo
              ? `Ai folosit toate cele ${status.limit} sesiuni gratuite din această perioadă. Deblochează acces nelimitat în Basic sau așteaptă ${resetText}.`
              : `You used all ${status.limit} free sessions this period. Unlock unlimited access with Basic or wait ${resetText}.`}
          </p>
          {teaser && (
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto">{teaser}</p>
          )}
          <Button onClick={() => setModalOpen(true)} size="lg" className="shadow-lg">
            {isRo ? 'Deblochează Basic' : 'Unlock Basic'}
          </Button>
        </Card>
        <UpgradeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          requiredTier="basic"
          featureName={featureName}
        />
      </>
    );
  }

  const remaining = status.limit != null ? Math.max(0, status.limit - status.used) : null;

  return (
    <div className="space-y-3">
      {remaining != null && remaining <= status.limit! && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
          <span className="text-amber-700 dark:text-amber-400">
            {isRo
              ? `${remaining} din ${status.limit} sesiuni gratuite rămase luna asta`
              : `${remaining} of ${status.limit} free sessions left this period`}
          </span>
          <Button size="sm" variant="ghost" className="h-auto py-1 px-2 text-xs" onClick={() => setModalOpen(true)}>
            {isRo ? 'Deblochează nelimitat' : 'Go unlimited'}
          </Button>
        </div>
      )}
      {children}
      <UpgradeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        requiredTier="basic"
        featureName={featureName}
      />
    </div>
  );
};
