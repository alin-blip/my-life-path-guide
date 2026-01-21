import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Rocket, Check, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { EarlyBirdCountdown } from './EarlyBirdCountdown';

// Prices: Early Bird vs Normal
const PLAN_PRICES = {
  basic: { earlyBird: '€49', normal: '€97' },
  pro: { earlyBird: '€97', normal: '€197' },
  elite: { earlyBird: '€297', normal: '€500' }
};

const getPlans = (isEarlyBird: boolean) => [
  {
    id: 'basic',
    name: 'Basic',
    price: isEarlyBird ? PLAN_PRICES.basic.earlyBird : PLAN_PRICES.basic.normal,
    originalPrice: isEarlyBird ? PLAN_PRICES.basic.normal : null,
    trial: '3 zile trial',
    highlight: isEarlyBird ? 'Early Bird' : null,
    icon: Zap,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: isEarlyBird ? PLAN_PRICES.pro.earlyBird : PLAN_PRICES.pro.normal,
    originalPrice: isEarlyBird ? PLAN_PRICES.pro.normal : null,
    trial: '7 zile trial',
    highlight: isEarlyBird ? 'Early Bird' : null,
    icon: Crown,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    featured: true,
    badge: 'Popular'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: isEarlyBird ? PLAN_PRICES.elite.earlyBird : PLAN_PRICES.elite.normal,
    originalPrice: isEarlyBird ? PLAN_PRICES.elite.normal : null,
    trial: '7 zile trial',
    highlight: isEarlyBird ? 'Early Bird' : null,
    icon: Rocket,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    eliteBadge: true,
    badge: 'Doar Elitele'
  }
];

export function InlineMembershipBanner() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { earlyBirdExpiresAt, isEarlyBirdActive } = useAuth();

  const plans = getPlans(isEarlyBirdActive);

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth', { 
          state: { 
            returnUrl: '/fact-maps',
            plan: planId 
          } 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'inline-banner' }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('A apărut o eroare. Încearcă din nou.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-6 sm:mt-8"
    >
      <Card className="p-4 sm:p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Early Bird Countdown */}
          {earlyBirdExpiresAt && (
            <div className="mb-4">
              <EarlyBirdCountdown expiresAt={earlyBirdExpiresAt} />
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              {isEarlyBirdActive ? 'Prețuri Early Bird Active' : 'Deblochează Funcții Premium'}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">
              Alege Planul Tău de Transformare
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEarlyBirdActive 
                ? 'Blochează prețul special înainte să expire!' 
                : 'Începe cu un trial gratuit și accesează toate funcțiile premium'
              }
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-pointer ${
                    plan.featured 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                      : plan.eliteBadge
                        ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 shadow-lg shadow-amber-500/10'
                        : `${plan.border} ${plan.bg}`
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.badge && (
                    <Badge className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] ${
                      plan.eliteBadge 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${plan.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{plan.name}</h4>
                        {plan.highlight && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">
                            {plan.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.trial}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                      )}
                      <span className="text-sm text-muted-foreground">/lună</span>
                    </div>
                    <Button
                      size="sm"
                      variant={plan.featured || plan.eliteBadge ? 'default' : 'outline'}
                      disabled={loadingPlan !== null}
                      className={`gap-1 ${plan.eliteBadge ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0' : ''}`}
                    >
                      {loadingPlan === plan.id ? '...' : 'Start'}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits summary */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border/50">
            {['Acces complet', 'Coaching LIVE', 'Comunitate VIP', 'Suport prioritar'].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
