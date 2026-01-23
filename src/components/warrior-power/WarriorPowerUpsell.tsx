import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Target, ArrowRight, Sparkles, Star, Crown, Gift, Shield, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { saveRealityMapScores } from '@/services/realityMapService';

interface WarriorPowerUpsellProps {
  scores: WarriorPowerScores;
  userName: string;
  onContinueFree: () => void;
}

// HORMOZI 3-TIER STRUCTURE with Value Anchoring
const UPSELL_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '0',
    afterTrialPrice: '49',
    normalPrice: '99',
    currency: '€',
    period: '3 zile gratuit',
    highlight: '🎁 Start GRATUIT',
    tier: 'basic',
    // Value stack
    valueItems: [
      { name: 'Harta Realității + AI Coaching', value: '€197' },
      { name: 'Champion Routine System', value: '€97' },
      { name: 'Door Planning Framework', value: '€47' },
    ],
    totalValue: '€341',
    benefits: [
      '3 zile acces complet GRATUIT',
      'Harta Realității interactivă',
      'Champion Routine completă',
      'Door - planificare săptămânală',
      'AI Coaching pentru business',
    ],
    featured: true,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    borderColor: 'border-green-500',
    icon: Gift,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '0',
    afterTrialPrice: '97',
    normalPrice: '197',
    currency: '€',
    period: '7 zile trial',
    highlight: '⭐ Cel Mai Popular',
    tier: 'pro',
    valueItems: [
      { name: 'Tot din Basic', value: '€341' },
      { name: 'Coaching LIVE Săptămânal', value: '€297' },
      { name: 'Comunitate VIP Pro', value: '€97' },
      { name: 'Sprint 90 Zile + KPIs', value: '€147' },
      { name: 'Referral Program 50%', value: '€∞' },
    ],
    totalValue: '€882+',
    benefits: [
      '✓ Tot din Basic +',
      '7 zile trial gratuit',
      'Coaching de grup LIVE săptămânal',
      'Comunitate VIP Pro',
      'Sprint 90 zile cu KPIs',
      '💰 REFERRAL: Câștigă 50% comision recurent',
      'Support VIP dedicat'
    ],
    featured: false,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 via-white to-orange-50',
    borderColor: 'border-amber-500',
    icon: Star,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '0',
    afterTrialPrice: '297',
    normalPrice: '497',
    currency: '€',
    period: '7 zile trial',
    highlight: '🔥 Transformare Totală',
    tier: 'elite',
    valueItems: [
      { name: 'Tot din Pro', value: '€882' },
      { name: 'Warrior Launch Accelerator', value: '€497' },
      { name: '47+ Lecții Video Premium', value: '€397' },
      { name: 'Coaching 1-on-1 Lunar', value: '€297' },
      { name: 'Coach Dashboard', value: '€497' },
    ],
    totalValue: '€2,570',
    benefits: [
      '✓ Tot din Pro +',
      '7 zile trial gratuit',
      'Warrior Launch Accelerator (€497)',
      '47+ lecții video premium',
      'Coaching 1-on-1 lunar (30 min)',
      '🎓 COACH DASHBOARD: Creează-ți propria platformă',
      '💰 REFERRAL: 50% comision recurent',
      'Acces prioritar la toate cursurile'
    ],
    featured: false,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50 via-white to-violet-50',
    borderColor: 'border-purple-500',
    icon: Crown,
  }
];

export function WarriorPowerUpsell({ scores, userName, onContinueFree }: WarriorPowerUpsellProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [activeUsers, setActiveUsers] = useState(1247);
  const navigate = useNavigate();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasSession(!!session);
    });

    // Simulate active users (slight random variation)
    setActiveUsers(1200 + Math.floor(Math.random() * 100));

    return () => subscription.unsubscribe();
  }, []);

  // Calculate total score
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Find weakest dimension
  const dimensionTotals = {
    body: (scores.body_fitness || 0) + (scores.body_nutrition || 0),
    being: (scores.being_connection || 0) + (scores.being_certainty || 0),
    balance: (scores.balance_relationship || 0) + (scores.balance_family || 0),
    business: (scores.business_mechanics || 0) + (scores.business_money || 0)
  };

  const weakestDimension = Object.entries(dimensionTotals)
    .sort(([, a], [, b]) => a - b)[0][0];

  const dimensionNames: Record<string, string> = {
    body: 'Corp',
    being: 'Ființă',
    balance: 'Echilibru',
    business: 'Business'
  };

  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.info('Te rugăm să te autentifici pentru a continua.');
        navigate('/auth', { 
          state: { 
            returnUrl: '/warrior-power',
            plan: planId,
            scores: scores 
          } 
        });
        return;
      }

      // Save scores to fact_maps before checkout
      await saveRealityMapScores(scores);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan: planId,
          source: 'warrior-power'
        },
      });

      if (error) {
        let message = error.message;
        const anyErr = error as any;
        if (anyErr?.context) {
          try {
            const body = await anyErr.context.json();
            message = body?.error ?? message;
          } catch {
            // ignore
          }
        } else if ((data as any)?.error) {
          message = (data as any).error;
        }
        throw new Error(message);
      }

      if ((data as any)?.url) {
        window.location.href = (data as any).url;
        return;
      }

      throw new Error((data as any)?.error ?? 'Nu s-a putut crea sesiunea de plată');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message, error });
      toast.error(message || 'A apărut o eroare. Încearcă din nou.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm uppercase tracking-widest text-primary font-bold">
            Pasul Următor
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Alege planul tău de transformare
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cu un scor de <strong className="text-foreground">{totalScore}/96</strong> și 
          {' '}<strong className="text-foreground">{dimensionNames[weakestDimension]}</strong> ca zonă de focalizare principală, 
          ai nevoie de un plan structurat pentru a deveni <strong className="text-primary">ACCELERAT</strong> în toate ariile.
        </p>
      </motion.div>

      {/* Plans Grid - 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
      >
        {UPSELL_PLANS.map((plan) => {
          const IconComponent = plan.icon;
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                `border-2 ${plan.borderColor} bg-gradient-to-br ${plan.bgGradient} shadow-lg`,
                plan.featured && "ring-2 ring-green-500/50"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                `bg-gradient-to-r ${plan.gradient}`
              )} />
              
              {plan.highlight && (
                <Badge 
                  className={cn(
                    "absolute top-4 right-4 border-0 text-white text-xs",
                    `bg-gradient-to-r ${plan.gradient}`
                  )}
                >
                  {plan.highlight}
                </Badge>
              )}

              <CardContent className="p-5">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={cn("h-5 w-5", 
                      plan.id === 'basic' && "text-green-500",
                      plan.id === 'pro' && "text-amber-500",
                      plan.id === 'elite' && "text-purple-500"
                    )} />
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  
                  {/* Value Anchor */}
                  <div className="mb-2 p-2 rounded-lg bg-white border border-gray-200">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Valoare totală:</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold line-through text-muted-foreground">{plan.totalValue}</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-3xl font-black",
                      plan.id === 'basic' && "text-green-500",
                      plan.id === 'pro' && "text-amber-500",
                      plan.id === 'elite' && "text-purple-500"
                    )}>
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground line-through">
                      {plan.currency}{plan.normalPrice}/lună
                    </span>
                    <span className="text-xs font-semibold text-green-500">
                      Apoi {plan.currency}{plan.afterTrialPrice}/lună
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-xs">
                      <Check className={cn(
                        "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                        plan.id === 'basic' && "text-green-500",
                        plan.id === 'pro' && "text-amber-500",
                        plan.id === 'elite' && "text-purple-500"
                      )} />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading !== null}
                  variant="default"
                  size="sm"
                  className={cn(
                    "w-full gap-2 text-white",
                    `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                  )}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Începe {plan.period}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Guarantee + Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-3xl mx-auto"
      >
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Guarantee */}
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Garanție 100% Satisfacție</p>
                <p className="text-xs text-muted-foreground">
                  Dacă în 7 zile nu vezi rezultate, primești banii înapoi. Fără întrebări.
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 text-center md:text-right">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{activeUsers.toLocaleString()}+</span>
                <span className="text-xs text-muted-foreground">utilizatori</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-foreground">4.9</span>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Without Subscription Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <Button
          variant="ghost"
          onClick={onContinueFree}
          className="gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          Continuă fără abonament (funcții limitate)
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Results Saved Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4"
      >
        <Zap className="h-4 w-4 text-primary" />
        <span>Rezultatele tale au fost salvate și trimise pe email</span>
      </motion.div>
    </div>
  );
}
