import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Rocket, Zap, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { Tier } from '@/config/routeTiers';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredTier: Tier;
  featureName?: string;
}

const TIER_META: Record<Exclude<Tier, 'free'>, { icon: React.ElementType; color: string; reason: string }> = {
  basic: { icon: Zap, color: 'text-emerald-400', reason: 'membership_required' },
  pro: { icon: Crown, color: 'text-amber-400', reason: 'pro_required' },
  elite: { icon: Rocket, color: 'text-fuchsia-400', reason: 'elite_required' },
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onOpenChange, requiredTier, featureName }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRo = language === 'ro';

  const tierKey = (requiredTier === 'free' ? 'basic' : requiredTier) as Exclude<Tier, 'free'>;
  const meta = TIER_META[tierKey];
  const Icon = meta.icon;

  const tierLabel = tierKey.charAt(0).toUpperCase() + tierKey.slice(1);

  const benefits: Record<Exclude<Tier, 'free'>, string[]> = {
    basic: isRo
      ? ['Acces la toată platforma', 'Rutina Războinicului completă', 'Mind Coach & Stack Library']
      : ['Full platform access', 'Complete Warrior Routine', 'Mind Coach & Stack Library'],
    pro: isRo
      ? ['Tot din Basic', 'Coaching LIVE săptămânal', 'Comunitatea VIP (Brotherhood)']
      : ['Everything in Basic', 'Weekly LIVE coaching', 'VIP Community (Brotherhood)'],
    elite: isRo
      ? ['Tot din Pro', 'Warrior Launch Accelerator', 'Sesiuni 1:1 cu Coach-ul']
      : ['Everything in Pro', 'Warrior Launch Accelerator', '1:1 sessions with Coach'],
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing', { state: { reason: meta.reason, requiredTier: tierKey, featureName } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted ${meta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            {isRo ? `Deblochează cu ${tierLabel}` : `Unlock with ${tierLabel}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {featureName
              ? isRo
                ? `„${featureName}" este disponibil în planul ${tierLabel}.`
                : `"${featureName}" is available on the ${tierLabel} plan.`
              : isRo
              ? `Această funcție necesită planul ${tierLabel}.`
              : `This feature requires the ${tierLabel} plan.`}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {benefits[tierKey].map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <Lock className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {isRo ? 'Închide' : 'Close'}
          </Button>
          <Button onClick={handleUpgrade} className="gap-2">
            <Icon className="h-4 w-4" />
            {isRo ? 'Vezi planurile' : 'View plans'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
