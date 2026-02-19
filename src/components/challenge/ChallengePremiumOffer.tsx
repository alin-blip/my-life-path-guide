import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Zap, Gift, Loader2, Sparkles, Shield } from 'lucide-react';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'basic',
    planId: 'basic',
    nameEn: 'Basic',
    nameRo: 'Basic',
    price: '49',
    displayPrice: '€49',
    subtitleRo: '/ lună',
    subtitleEn: '/ month',
    ctaRo: 'Activează Acum',
    ctaEn: 'Activate Now',
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-500',
    icon: Gift,
    featured: false,
    benefitsEn: ['Full platform access', 'Champion Routine', 'Door planning'],
    benefitsRo: ['Acces complet platformă', 'Champion Routine', 'Door planning'],
  },
  {
    id: 'pro-trial',
    planId: 'pro-challenge-trial',
    nameEn: 'Pro Trial',
    nameRo: 'Pro Trial',
    price: '0',
    displayPrice: '€0',
    subtitleRo: 'acum, apoi €49/lună',
    subtitleEn: 'now, then €49/mo',
    ctaRo: 'Începe 7 Zile Gratuit',
    ctaEn: 'Start 7-Day Free Trial',
    gradient: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-500',
    icon: Zap,
    featured: false,
    benefitsEn: ['7-day FREE trial', 'Everything in Basic', 'AI Coaching included'],
    benefitsRo: ['7 zile trial GRATUIT', 'Tot ce include Basic', 'AI Coaching inclus'],
  },
  {
    id: 'pro-3mo',
    planId: 'pro-challenge-3mo',
    nameEn: 'Pro 3 Months',
    nameRo: 'Pro 3 Luni',
    price: '29',
    displayPrice: '€29',
    subtitleRo: '/ lună (apoi €97/lună)',
    subtitleEn: '/ month (then €97/mo)',
    ctaRo: 'Plătește 29 EUR - Ofertă Limitată',
    ctaEn: 'Pay €29 - Limited Offer',
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-500',
    icon: Crown,
    featured: true,
    badge: 'Ofertă Limitată - Doar Aici',
    benefitsEn: ['First 3 months only €29/mo', 'Everything in Pro', 'Warrior88 code auto-applied', 'Weekly LIVE coaching'],
    benefitsRo: ['Primele 3 luni doar €29/lună', 'Tot ce include Pro', 'Cod Warrior88 aplicat automat', 'Coaching LIVE săptămânal'],
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
        toast.error(isRo ? 'Te rugăm să te autentifici' : 'Please sign in first');
        navigate('/auth');
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
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const benefits = isRo ? plan.benefitsRo : plan.benefitsEn;
          const priceValue = plan.id === 'pro-trial' ? 0 : plan.id === 'pro-3mo' ? 29 : 49;

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
              {plan.badge && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">
                  ⭐ {plan.badge}
                </Badge>
              )}

              <div className="text-center mb-4 pt-2">
                <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-3", plan.gradient)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {isRo ? plan.nameRo : plan.nameEn}
                </h3>
              </div>

              <div className="text-center mb-4">
                <span className={cn("text-3xl font-bold", plan.textColor)}>{plan.displayPrice}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  {isRo ? plan.subtitleRo : plan.subtitleEn}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", plan.featured ? 'text-amber-500' : 'text-green-500')} />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full text-white",
                  `bg-gradient-to-r ${plan.gradient} hover:opacity-90`,
                  plan.featured && "py-3 font-bold"
                )}
                onClick={() => handleUpgrade(plan.planId, priceValue)}
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
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/dashboard')}
        >
          {isRo ? 'Continuă doar cu Habit Tracking →' : 'Continue with Habit Tracking only →'}
        </Button>
      </div>
    </Card>
  );
};
