import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTierAccess } from '@/hooks/useTierAccess';
import { useLanguage } from '@/context/LanguageContext';
import { UpgradeModal } from './UpgradeModal';
import type { Tier } from '@/config/routeTiers';

interface TierLockOverlayProps {
  requiredTier: Tier;
  featureName?: string;
  /** Short paragraph shown in the overlay above the CTA. */
  teaser?: string;
  /** The blurred preview content behind the overlay. */
  children: React.ReactNode;
  /** Blur intensity in px. Default 6. */
  blurPx?: number;
  className?: string;
  /** If true, render a compact inline lock instead of full overlay (best for cards). */
  compact?: boolean;
}

/**
 * Full-section paywall overlay. Renders children blurred + non-interactive
 * with a centered CTA that opens the upgrade modal. Use for large sections
 * (Vision Board canvas, Belief Reprogrammer phases, Domino Door 30/90/annual tabs).
 *
 * When the user already has access, children render raw with no wrapper.
 */
export const TierLockOverlay: React.FC<TierLockOverlayProps> = ({
  requiredTier,
  featureName,
  teaser,
  children,
  blurPx = 6,
  className,
  compact = false,
}) => {
  const { canAccess } = useTierAccess();
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const isRo = language === 'ro';

  if (canAccess(requiredTier)) {
    return <>{children}</>;
  }

  const tierLabel = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl ${className ?? ''}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none select-none opacity-50"
          style={{ filter: `blur(${blurPx}px)` }}
        >
          {children}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/40 via-background/70 to-background/90 backdrop-blur-[2px]">
          <div className={`flex ${compact ? 'flex-row items-center gap-3 px-4 py-3' : 'flex-col items-center gap-3 max-w-sm text-center px-6 py-8'} rounded-2xl border border-primary/30 bg-card/95 shadow-2xl`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div className={compact ? 'flex-1 min-w-0' : 'contents'}>
              <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                <Sparkles className="mr-1 h-3 w-3" />
                {isRo ? `Necesită ${tierLabel}` : `${tierLabel} required`}
              </Badge>
              {featureName && (
                <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-lg'} text-foreground`}>
                  {featureName}
                </h3>
              )}
              {teaser && !compact && (
                <p className="text-sm text-muted-foreground leading-relaxed">{teaser}</p>
              )}
            </div>
            <Button
              size={compact ? 'sm' : 'default'}
              onClick={() => setOpen(true)}
              className="shrink-0 shadow-lg"
            >
              {isRo ? `Deblochează ${tierLabel}` : `Unlock ${tierLabel}`}
            </Button>
          </div>
        </div>
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
