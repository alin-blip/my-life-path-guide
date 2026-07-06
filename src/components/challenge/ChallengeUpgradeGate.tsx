import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, Crown, Sparkles, Shield, 
  Zap, Gift, Check, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';
import { plans } from '@/data/pricing';

const basicPlan = plans.find(p => p.id === 'basic')!;
const proPlan = plans.find(p => p.id === 'pro')!;

interface ChallengeUpgradeGateProps {
  className?: string;
  variant?: 'card' | 'modal' | 'inline';
  onClose?: () => void;
}

const UPGRADE_PLANS = [
  {
    id: 'basic',
    planId: 'basic',
    icon: Gift,
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-500',
    featured: false,
    price: '€49',
    originalPrice: '€97',
    discountBadge: '-50%',
    subtitle: '/ lună',
    subtitleEn: '/ month',
    trialRo: '7 zile trial gratuit',
    trialEn: '7-day free trial',
    cta: 'Începe 7 Zile Trial',
    ctaEn: 'Start 7-Day Free Trial',
    priceValue: 49,
    benefitsRo: basicPlan.benefitsRo,
    benefitsEn: basicPlan.benefitsEn,
  },
  {
    id: 'pro',
    planId: 'pro',
    icon: Zap,
    gradient: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-500',
    featured: false,
    price: '€97',
    originalPrice: '€197',
    discountBadge: '-50% Early Bird',
    subtitle: '/ lună',
    subtitleEn: '/ month',
    trialRo: null,
    trialEn: null,
    cta: 'Activează Pro - Early Bird',
    ctaEn: 'Activate Pro - Early Bird',
    priceValue: 97,
    benefitsRo: proPlan.benefitsRo,
    benefitsEn: proPlan.benefitsEn,
  },
  {
    id: 'pro-3mo',
    planId: 'pro-challenge-3mo',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-500',
    featured: true,
    price: '€29',
    originalPrice: '€97',
    discountBadge: '-70%',
    subtitle: '/ lună (apoi €99/lună)',
    subtitleEn: '/ month (then €99/mo)',
    trialRo: null,
    trialEn: null,
    cta: 'Plătește €29 - Ofertă Limitată',
    ctaEn: 'Pay €29 - Limited Offer',
    priceValue: 29,
    benefitsRo: proPlan.benefitsRo,
    benefitsEn: proPlan.benefitsEn,
    hasWarrior88: true,
  },
];

export const ChallengeUpgradeGate: React.FC<ChallengeUpgradeGateProps> = ({
  className,
  variant = 'card',
  onClose
}) => {
  const { language } = useLanguage();
  const { earlyBirdExpiresAt, isEarlyBirdActive } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const isRo = language === 'ro';

  // Early Bird Countdown
  useEffect(() => {
    if (!earlyBirdExpiresAt) return;
    const updateCountdown = () => {
      const diff = new Date(earlyBirdExpiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [earlyBirdExpiresAt]);

  const handleCheckout = async (planId: string, value: number) => {
    setIsLoading(planId);
    trackCheckoutInitiated(planId, value);

    // Log intent for funnel analytics
    const sessionId = sessionStorage.getItem('crm_session_id')
      || `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('crm_session_id', sessionId);
    supabase.from('checkout_events').insert({
      event_type: 'checkout_initiated',
      plan_id: planId,
      source: 'challenge-upgrade-gate',
      session_id: sessionId,
      metadata: { value, path: window.location.pathname, guest: true },
    }).then(() => {});

    try {
      const utmRaw = localStorage.getItem('utm_data');
      const utm = utmRaw ? JSON.parse(utmRaw) : undefined;
      // Guest checkout — Stripe collects email + card; account is created after payment via webhook
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: planId,
          source: 'challenge-upgrade-gate',
          language: isRo ? 'ro' : 'en',
          utm,
        },
      });
      if (error) throw error;
      if ((data as any)?.url) {
        supabase.from('checkout_events').insert({
          event_type: 'checkout_redirected',
          plan_id: planId,
          source: 'challenge-upgrade-gate',
          session_id: sessionId,
          metadata: { value, guest: true },
        }).then(() => {});
        window.location.href = (data as any).url;
        return;
      }
      throw new Error((data as any)?.error ?? 'Failed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, msg });
      supabase.from('checkout_events').insert({
        event_type: 'checkout_error',
        plan_id: planId,
        source: 'challenge-upgrade-gate',
        session_id: sessionId,
        error_message: msg.slice(0, 500),
        metadata: { value, guest: true },
      }).then(() => {});
      toast.error(msg || (isRo ? 'A apărut o eroare.' : 'Something went wrong.'));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      <Card className="overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🔥 {isRo ? 'Deblochează Zilele 3-7' : 'Unlock Days 3-7'}
            </h2>
            <p className="text-muted-foreground">
              {isRo ? 'Continuă momentum-ul cu acces complet la Challenge' : 'Continue your momentum with full Challenge access'}
            </p>
          </div>

          {/* Early Bird Countdown */}
          {isEarlyBirdActive && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-red-500" />
                <span className="font-bold text-red-500">EARLY BIRD - {isRo ? 'OFERTĂ LIMITATĂ' : 'LIMITED OFFER'}</span>
              </div>
              <div className="flex justify-center gap-3">
                {[
                  { val: timeLeft.hours, label: isRo ? 'ore' : 'hrs' },
                  { val: timeLeft.minutes, label: 'min' },
                  { val: timeLeft.seconds, label: 'sec' },
                ].map((t, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="text-2xl font-bold text-muted-foreground">:</div>}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{String(t.val).padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {UPGRADE_PLANS.map((plan) => {
              const IconComponent = plan.icon;
              const benefits = isRo ? plan.benefitsRo : plan.benefitsEn;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 bg-card",
                    `border-2 ${plan.borderColor}`,
                    plan.featured && "ring-2 ring-amber-500/50 scale-[1.03] shadow-lg shadow-amber-500/10"
                  )}
                >
                  {/* Warrior88 Sticker */}
                  {'hasWarrior88' in plan && plan.hasWarrior88 && (
                    <div className="absolute -right-2 top-4 z-10 rotate-[-12deg]">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30">
                        <div className="text-[10px] font-bold leading-tight text-center">Warrior88</div>
                        <div className="text-[9px] font-semibold leading-tight text-center opacity-90">APLICAT ✓</div>
                      </div>
                    </div>
                  )}

                  {/* Discount Badge */}
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] z-10">
                    {plan.discountBadge}
                  </Badge>

                  <CardContent className="p-4 pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={cn("h-5 w-5", plan.textColor)} />
                      <h3 className="font-bold text-foreground">
                        {plan.id === 'basic' ? 'Basic' : plan.id === 'pro' ? 'Pro' : (isRo ? 'Pro 3 Luni' : 'Pro 3 Months')}
                      </h3>
                    </div>

                    {plan.trialRo && (
                      <span className="text-[10px] text-green-500 font-semibold">
                        ✓ {isRo ? plan.trialRo : plan.trialEn}
                      </span>
                    )}

                    <div className="mb-3">
                      <span className="text-xs text-muted-foreground line-through mr-1">{plan.originalPrice}</span>
                      <span className={cn("text-2xl font-black", plan.textColor)}>
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
                        {isRo ? plan.subtitle : plan.subtitleEn}
                      </span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs">
                          <Check className={cn("h-3 w-3 mt-0.5 flex-shrink-0", plan.featured ? 'text-amber-500' : 'text-green-500')} />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                      {plan.id === 'pro-3mo' && (
                        <>
                          <li className="flex items-start gap-1.5 text-xs">
                            <Check className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                            <span className="text-muted-foreground font-semibold">
                              {isRo ? 'Primele 3 luni doar €29/lună' : 'First 3 months only €29/mo'}
                            </span>
                          </li>
                          <li className="flex items-start gap-1.5 text-xs">
                            <Check className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                            <span className="text-muted-foreground">
                              {isRo ? 'După 3 luni: €99/lună' : 'After 3 months: €99/mo'}
                            </span>
                          </li>
                        </>
                      )}
                    </ul>

                    <Button
                      onClick={() => handleCheckout(plan.planId, plan.priceValue)}
                      disabled={isLoading !== null}
                      size="sm"
                      className={cn(
                        "w-full gap-1 text-white text-xs",
                        `bg-gradient-to-r ${plan.gradient} hover:opacity-90`,
                        plan.featured && "py-3 text-sm font-bold"
                      )}
                    >
                      {isLoading === plan.planId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          {isRo ? plan.cta : plan.ctaEn}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>{isRo ? 'Garanție 100% satisfacție. Anulezi oricând.' : '100% satisfaction guarantee. Cancel anytime.'}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
