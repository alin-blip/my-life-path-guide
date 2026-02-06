import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, Crown, Sparkles, ArrowRight, Shield, Star, 
  Zap, Gift, Users, Clock, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface ChallengeUpgradeGateProps {
  className?: string;
  variant?: 'card' | 'modal' | 'inline';
  onClose?: () => void;
}

const UPGRADE_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '49',
    currency: '€',
    period: 'lună',
    trialDays: 5,
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500',
    icon: Gift,
    benefits: [
      'Acces complet platformă',
      'Champion Routine',
      'Door planning',
      '5 zile trial gratuit',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '97',
    currency: '€',
    period: 'lună',
    trialDays: 5,
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    icon: Star,
    featured: true,
    benefits: [
      '✓ Tot din Basic +',
      'Coaching LIVE săptămânal',
      'Comunitate VIP Pro',
      '50% comision referral',
      '5 zile trial gratuit',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '297',
    currency: '€',
    period: 'lună',
    trialDays: 5,
    gradient: 'from-purple-500 to-violet-500',
    borderColor: 'border-purple-500',
    icon: Crown,
    benefits: [
      '✓ Tot din Pro +',
      'Warrior Accelerator (€497)',
      'Coaching 1-on-1 lunar',
      'Coach Dashboard',
      '5 zile trial gratuit',
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
      const now = new Date().getTime();
      const expiry = new Date(earlyBirdExpiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [earlyBirdExpiresAt]);

  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.info(isRo ? 'Te rugăm să te autentifici pentru a continua.' : 'Please log in to continue.');
        navigate('/auth', { state: { returnUrl: '/challenge', plan: planId } });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-7-zile' },
      });

      if (error) throw error;

      if ((data as any)?.url) {
        window.location.href = (data as any).url;
        return;
      }

      throw new Error((data as any)?.error ?? 'Failed to create checkout session');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message });
      toast.error(message || (isRo ? 'A apărut o eroare. Încearcă din nou.' : 'An error occurred. Please try again.'));
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
              {isRo 
                ? 'Continuă momentum-ul cu acces complet la Challenge' 
                : 'Continue your momentum with full Challenge access'}
            </p>
          </div>

          {/* Early Bird Countdown */}
          {isEarlyBirdActive && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-red-500" />
                <span className="font-bold text-red-500">
                  EARLY BIRD 50% {isRo ? 'REDUCERE' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">{isRo ? 'ore' : 'hrs'}</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">min</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">sec</div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Preview */}
          <div className="mb-6 p-4 rounded-lg bg-muted/30">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {isRo ? 'Ce primești cu upgrade:' : 'What you get with upgrade:'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{isRo ? '5 zile TRIAL gratuit' : '5 days FREE TRIAL'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{isRo ? 'Acces la Zilele 3-7 din Challenge' : 'Access to Days 3-7 of Challenge'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{isRo ? 'AI Vision Board & Meditație' : 'AI Vision Board & Meditation'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{isRo ? 'Accountability & Integrare completă' : 'Accountability & Full Integration'}</span>
              </li>
            </ul>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {UPGRADE_PLANS.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 bg-card",
                    `border-2 ${plan.borderColor}`,
                    plan.featured && "ring-2 ring-amber-500/50 scale-[1.02]"
                  )}
                >
                  {plan.featured && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                      ⭐ Popular
                    </Badge>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={cn(
                        "h-5 w-5",
                        plan.id === 'basic' && "text-blue-500",
                        plan.id === 'pro' && "text-amber-500",
                        plan.id === 'elite' && "text-purple-500"
                      )} />
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className={cn(
                        "text-2xl font-black",
                        plan.id === 'basic' && "text-blue-500",
                        plan.id === 'pro' && "text-amber-500",
                        plan.id === 'elite' && "text-purple-500"
                      )}>
                        {plan.currency}{plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {plan.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs">
                          <Check className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading !== null}
                      size="sm"
                      className={cn(
                        "w-full gap-1 text-white text-xs",
                        `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                      )}
                    >
                      {isLoading === plan.id ? (
                        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          {isRo ? 'Începe 5 Zile Trial' : 'Start 5-Day Trial'}
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
