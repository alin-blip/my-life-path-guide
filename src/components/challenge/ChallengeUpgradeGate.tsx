import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, Crown, Sparkles, Shield, Star, 
  Zap, Gift, Clock, Check, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';

interface ChallengeUpgradeGateProps {
  className?: string;
  variant?: 'card' | 'modal' | 'inline';
  onClose?: () => void;
}

const UPGRADE_PLANS = [
  {
    id: 'basic',
    planId: 'basic',
    name: 'Basic',
    price: '49',
    displayPrice: '€49',
    subtitle: '/ lună',
    currency: '€',
    cta: 'Activează Acum',
    ctaEn: 'Activate Now',
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-500',
    icon: Gift,
    featured: false,
    benefits: [
      'Acces complet platformă',
      'Champion Routine',
      'Door planning',
    ],
  },
  {
    id: 'pro-trial',
    planId: 'pro-challenge-trial',
    name: 'Pro Trial',
    price: '0',
    displayPrice: '€0',
    subtitle: 'acum, apoi €49/lună',
    currency: '€',
    cta: 'Începe 7 Zile Gratuit',
    ctaEn: 'Start 7-Day Free Trial',
    gradient: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-500',
    icon: Zap,
    featured: false,
    benefits: [
      '7 zile trial GRATUIT',
      'Tot ce include Basic',
      'AI Coaching inclus',
    ],
  },
  {
    id: 'pro-3mo',
    planId: 'pro-challenge-3mo',
    name: 'Pro 3 Luni',
    price: '29',
    displayPrice: '€29',
    subtitle: '/ lună (apoi €97/lună)',
    currency: '€',
    cta: 'Plătește 29 EUR - Ofertă Limitată',
    ctaEn: 'Pay €29 - Limited Offer',
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-500',
    icon: Crown,
    featured: true,
    badge: 'Ofertă Limitată - Doar Aici',
    benefits: [
      'Primele 3 luni doar €29/lună',
      'Tot ce include Pro',
      'Cod Warrior88 aplicat automat',
      'Coaching LIVE săptămânal',
    ],
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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info(isRo ? 'Te rugăm să te autentifici.' : 'Please log in.');
        navigate('/auth', { state: { returnUrl: '/challenge', plan: planId } });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-7-zile' },
      });
      if (error) throw error;
      if ((data as any)?.url) { window.location.href = (data as any).url; return; }
      throw new Error((data as any)?.error ?? 'Failed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, msg });
      toast.error(msg || 'A apărut o eroare.');
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

          {/* Benefits Preview */}
          <div className="mb-6 p-4 rounded-lg bg-muted/30">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {isRo ? 'Ce primești cu upgrade:' : 'What you get:'}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                isRo ? 'Acces la Zilele 3-7 din Challenge' : 'Access to Days 3-7',
                isRo ? 'AI Vision Board & Meditație' : 'AI Vision Board & Meditation',
                isRo ? 'Accountability & Integrare completă' : 'Full Integration',
              ].map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {UPGRADE_PLANS.map((plan) => {
              const IconComponent = plan.icon;
              const priceValue = plan.id === 'pro-trial' ? 0 : plan.id === 'pro-3mo' ? 29 : 49;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 bg-card",
                    `border-2 ${plan.borderColor}`,
                    plan.featured && "ring-2 ring-amber-500/50 scale-[1.03] shadow-lg shadow-amber-500/10"
                  )}
                >
                  {plan.badge && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                      ⭐ {plan.badge}
                    </Badge>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={cn("h-5 w-5", plan.textColor)} />
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                    </div>

                    <div className="mb-3">
                      <span className={cn("text-2xl font-black", plan.textColor)}>
                        {plan.displayPrice}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">{plan.subtitle}</span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleCheckout(plan.planId, priceValue)}
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
