import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Target, ArrowRight, Sparkles, Star, Crown, Gift } from 'lucide-react';
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

// Simplified 2-tier structure for Warrior Power flow
const UPSELL_PLANS = [
  {
    id: 'free', // 3-day trial, then €49/month (Basic)
    name: 'Start Gratuit',
    price: '0',
    afterTrialPrice: '49',
    currency: '€',
    period: '3 zile gratuit',
    highlight: '🎁 3 Zile Trial',
    benefits: [
      '3 zile acces complet GRATUIT',
      'Harta Realității interactivă',
      'Champion Routine completă',
      'Door - planificare săptămânală',
      'Apoi doar €49/lună Early Bird'
    ],
    featured: true,
    isTrial: true
  },
  {
    id: 'pro', // 7-day trial, then €97/month (Pro)
    name: 'Pro',
    price: '0',
    afterTrialPrice: '97',
    currency: '€',
    period: '7 zile trial',
    highlight: '7 Zile Trial + Coaching',
    benefits: [
      'Tot din Basic +',
      '7 zile trial gratuit',
      'Coaching de grup LIVE săptămânal',
      'Comunitate VIP Pro',
      'Sprint 90 zile cu KPIs',
      'Support VIP dedicat'
    ],
    featured: false,
    isTrial: true
  }
];

export function WarriorPowerUpsell({ scores, userName, onContinueFree }: WarriorPowerUpsellProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
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
          Acum că știi unde ești, hai să construim unde vei ajunge
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cu un scor de <strong className="text-foreground">{totalScore}/96</strong> și 
          {' '}<strong className="text-foreground">{dimensionNames[weakestDimension]}</strong> ca zonă de focalizare principală, 
          ai nevoie de un plan structurat pentru a deveni <strong className="text-primary">ACCELERAT</strong> în toate ariile.
        </p>
      </motion.div>

      {/* Plans Grid - 2 columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
      >
        {UPSELL_PLANS.map((plan) => {
          const isFree = plan.id === 'free';
          const isPro = plan.id === 'pro';
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isFree 
                  ? "border-2 border-green-500 bg-gradient-to-br from-green-500/10 via-background to-emerald-500/10 shadow-lg shadow-green-500/10" 
                  : "border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 shadow-lg shadow-amber-500/10"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                isFree 
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
              )} />
              
              {plan.highlight && (
                <Badge 
                  className={cn(
                    "absolute top-4 right-4 border-0",
                    isFree 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  )}
                >
                  {plan.highlight}
                </Badge>
              )}

              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isFree ? (
                      <Gift className="h-6 w-6 text-green-500" />
                    ) : (
                      <Crown className="h-6 w-6 text-amber-500" />
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-black",
                      isFree ? "text-green-500" : "text-amber-500"
                    )}>
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    Apoi {plan.currency}{plan.afterTrialPrice}/lună
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-sm">
                      <Check className={cn(
                        "h-4 w-4 mt-0.5 flex-shrink-0",
                        isFree ? "text-green-500" : "text-amber-500"
                      )} />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading !== null}
                  variant="default"
                  className={cn(
                    "w-full gap-2",
                    isFree 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white" 
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  )}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      {isFree ? <Sparkles className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      {isFree ? 'Începe 3 Zile Gratuit' : 'Începe 7 Zile Pro Trial'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
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
