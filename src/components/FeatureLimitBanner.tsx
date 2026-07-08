import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Lock, ArrowRight } from 'lucide-react';
import type { FeatureAccessStatus } from '@/hooks/useFeatureAccess';
import { cn } from '@/lib/utils';

interface FeatureLimitBannerProps {
  status: FeatureAccessStatus | null;
  featureLabel: string;
  /** If true, renders a compact inline badge instead of the full card. */
  compact?: boolean;
  className?: string;
  /** Override upgrade destination. Defaults to `/pricing`. */
  upgradeHref?: string;
}

function formatReset(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

/**
 * Shows current usage vs limit for free-tier users, and blocks the feature
 * with an upgrade CTA when the limit is reached. Renders nothing for paid users.
 */
export function FeatureLimitBanner({
  status,
  featureLabel,
  compact = false,
  className,
  upgradeHref = '/pricing',
}: FeatureLimitBannerProps) {
  const navigate = useNavigate();

  if (!status || status.unlimited || status.limit === null) return null;

  const isBlocked = !status.allowed;
  const percent = Math.min(100, (status.used / status.limit) * 100);
  const remaining = Math.max(0, status.limit - status.used);

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border',
        isBlocked
          ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          : 'bg-primary/5 border-primary/20 text-muted-foreground',
        className,
      )}>
        {isBlocked ? <Lock className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
        <span>
          {isBlocked
            ? `Limită atinsă — resetează ${formatReset(status.reset_at)}`
            : `${status.used}/${status.limit} folosite`}
        </span>
        {isBlocked && (
          <button
            onClick={() => navigate(upgradeHref)}
            className="ml-1 font-medium text-primary hover:underline"
          >
            Upgrade
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border p-4 md:p-5 space-y-3',
      isBlocked
        ? 'bg-red-500/5 border-red-500/30'
        : 'bg-primary/5 border-primary/20',
      className,
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-lg p-2',
            isBlocked ? 'bg-red-500/10' : 'bg-primary/10',
          )}>
            {isBlocked
              ? <Lock className="w-4 h-4 text-red-500" />
              : <Zap className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {isBlocked
                ? `Ai atins limita — ${featureLabel}`
                : `Plan gratuit — ${featureLabel}`}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isBlocked ? (
                <>Se resetează pe <strong>{formatReset(status.reset_at)}</strong>. Fă upgrade pentru acces nelimitat.</>
              ) : (
                <>{status.used}/{status.limit} folosite · {remaining} rămase · resetează {formatReset(status.reset_at)}</>
              )}
            </div>
          </div>
        </div>
        {isBlocked && (
          <Button
            size="sm"
            onClick={() => navigate(upgradeHref)}
            className="flex-shrink-0"
          >
            Upgrade <ArrowRight className="ml-1 w-3 h-3" />
          </Button>
        )}
      </div>
      {!isBlocked && (
        <Progress value={percent} className="h-1.5" />
      )}
    </div>
  );
}
