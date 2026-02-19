import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Gift, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';
import { cn } from '@/lib/utils';
import { plans } from '@/data/pricing';

const basicPlan = plans.find(p => p.id === 'basic')!;
const proPlan = plans.find(p => p.id === 'pro')!;

const CHALLENGE_PLANS = [
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
    subtitleRo: '/ lună',
    subtitleEn: '/ month',
    trialRo: '7 zile trial gratuit',
    trialEn: '7-day free trial',
    ctaRo: 'Începe 7 Zile Trial',
    ctaEn: 'Start 7-Day Free Trial',
    priceValue: 49,
    benefitsEn: basicPlan.benefitsEn,
    benefitsRo: basicPlan.benefitsRo,
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
    subtitleRo: '/ lună',
    subtitleEn: '/ month',
    trialRo: null,
    trialEn: null,
    ctaRo: 'Activează Pro - Early Bird',
    ctaEn: 'Activate Pro - Early Bird',
    priceValue: 97,
    benefitsEn: proPlan.benefitsEn,
    benefitsRo: proPlan.benefitsRo,
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
    subtitleRo: '/ lună (apoi €99/lună)',
    subtitleEn: '/ month (then €99/mo)',
    trialRo: null,
    trialEn: null,
    ctaRo: 'Plătește €29 - Ofertă Limitată',
    ctaEn: 'Pay €29 - Limited Offer',
    priceValue: 29,
    benefitsEn: proPlan.benefitsEn,
    benefitsRo: proPlan.benefitsRo,
    hasWarrior88: true,
  },
];

export const ChallengePremiumOffer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const isRo = language === 'ro';

  const handleUpgrade = async (planId: string, value: number) => {
    const preOpened = preOpenWindow();
    setLoading(planId);
    trackCheckoutInitiated(planId, value);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (preOpened) preOpened.close();
        // Save pending plan to localStorage so it resumes after auth
        localStorage.setItem('pending_challenge_plan', JSON.stringify({ planId, value }));
        toast.info(isRo ? 'Creează-ți contul pentru a continua' : 'Create your account to continue');
        navigate('/auth', { state: { from: { pathname: '/challenge-7-zile' } } });
        setLoading(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-7-zile' }
      });

      if (error) { if (preOpened) preOpened.close(); throw error; }
      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(isRo ? 'Eroare la creare checkout' : 'Error creating checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 border-primary/20">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          🎓 {isRo ? 'Exclusiv Absolvent Challenge' : 'Challenge Graduate Exclusive'}
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRo ? 'Continuă Călătoria de Războinic' : 'Continue Your Warrior Journey'}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {isRo ? 'Ai construit fundația. Acum alege drumul tău către transformare.' : "You've built the foundation. Now choose your path."}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6 pt-4">
        {CHALLENGE_PLANS.map((plan) => {
          const Icon = plan.icon;
          const benefits = isRo ? plan.benefitsRo : plan.benefitsEn;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-xl p-5 border-2 transition-all",
                plan.borderColor,
                plan.featured && "ring-2 ring-amber-500/50 scale-[1.03] shadow-lg shadow-amber-500/10 bg-gradient-to-br from-amber-500/10 to-orange-500/5",
                !plan.featured && "bg-card"
              )}
            >
              {/* Warrior88 Sticker - only on Pro 3mo */}
              {'hasWarrior88' in plan && plan.hasWarrior88 && (
                <div className="absolute -right-2 top-4 z-10 rotate-[-12deg]">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-amber-500/30">
                    <div className="text-[10px] font-bold leading-tight text-center">
                      Warrior88
                    </div>
                    <div className="text-[9px] font-semibold leading-tight text-center opacity-90">
                      APLICAT ✓
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Badge */}
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-[10px]">
                {plan.discountBadge}
              </Badge>

              <div className="text-center mb-4 pt-4">
                <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-3", plan.gradient)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {plan.id === 'basic' ? 'Basic' : plan.id === 'pro' ? 'Pro' : (isRo ? 'Pro 3 Luni' : 'Pro 3 Months')}
                </h3>
                {plan.trialRo && (
                  <span className="text-xs text-green-500 font-semibold">
                    ✓ {isRo ? plan.trialRo : plan.trialEn}
                  </span>
                )}
              </div>

              <div className="text-center mb-4">
                <span className="text-sm text-muted-foreground line-through mr-2">{plan.originalPrice}</span>
                <span className={cn("text-3xl font-bold", plan.textColor)}>{plan.price}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  {isRo ? plan.subtitleRo : plan.subtitleEn}
                </span>
              </div>

              <ul className="space-y-1.5 mb-6">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", plan.featured ? 'text-amber-500' : 'text-green-500')} />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
                {plan.id === 'pro-3mo' && (
                  <>
                    <li className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span className="text-muted-foreground font-semibold">
                        {isRo ? 'Primele 3 luni doar €29/lună' : 'First 3 months only €29/mo'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span className="text-muted-foreground">
                        {isRo ? 'După 3 luni: €99/lună' : 'After 3 months: €99/mo'}
                      </span>
                    </li>
                  </>
                )}
              </ul>

              <Button
                className={cn(
                  "w-full text-white",
                  `bg-gradient-to-r ${plan.gradient} hover:opacity-90`,
                  plan.featured && "py-3 font-bold"
                )}
                onClick={() => handleUpgrade(plan.planId, plan.priceValue)}
                disabled={loading === plan.planId}
              >
                {loading === plan.planId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    {isRo ? plan.ctaRo : plan.ctaEn}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Guarantee + Skip */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>{isRo ? 'Garanție 100% satisfacție. Anulezi oricând.' : '100% satisfaction guarantee. Cancel anytime.'}</span>
        </div>
      </div>
    </Card>
  );
};
