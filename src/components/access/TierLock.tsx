import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTierAccess } from '@/hooks/useTierAccess';
import { useLanguage } from '@/context/LanguageContext';
import { UpgradeModal } from './UpgradeModal';
import type { Tier } from '@/config/routeTiers';

interface TierLockProps {
  requiredTier: Tier;
  featureName?: string;
  children: React.ReactNode;
  /** When false the child is rendered raw (no wrapper) if the user has access */
  wrap?: boolean;
  className?: string;
}

/**
 * Wraps any UI. If the current user's tier is below `requiredTier`,
 * the child is blurred, click is intercepted, and an upgrade modal opens.
 */
export const TierLock: React.FC<TierLockProps> = ({
  requiredTier,
  featureName,
  children,
  wrap = true,
  className,
}) => {
  const { canAccess } = useTierAccess();
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const isRo = language === 'ro';

  const allowed = canAccess(requiredTier);

  if (allowed) {
    return wrap ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const tierLabel = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

  return (
    <>
      <div className={`relative ${className ?? ''}`}>
        {/* Blurred, non-interactive content */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none opacity-60 blur-[2px]"
        >
          {children}
        </div>

        {/* Overlay */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/40 backdrop-blur-sm transition hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="uppercase tracking-wide">
            {tierLabel}
          </Badge>
          <span className="text-xs font-medium text-foreground/90">
            {isRo ? `Deblochează cu ${tierLabel}` : `Unlock with ${tierLabel}`}
          </span>
          <Button size="sm" variant="default" className="mt-1" tabIndex={-1}>
            {isRo ? 'Upgrade' : 'Upgrade'}
          </Button>
        </button>
      </div>

      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        requiredTier={requiredTier}
        featureName={featureName}
      />
    </>
  );
};
