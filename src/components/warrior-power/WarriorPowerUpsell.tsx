import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Brain, Target, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';

interface WarriorPowerUpsellProps {
  scores: WarriorPowerScores;
  userName: string;
  onContinueFree: () => void;
}

const UPSELL_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '49',
    originalPrice: '98',
    currency: '€',
    period: '/ lună',
    highlight: 'Early Bird',
    benefits: [
      'AI Coaching tip Hormozi pentru ofertă și preț',
      'Champion Routine completă',
      'Door - planificare săptămânală',
      'Stacks pentru reset rapid',
      'Sprint 90 zile cu KPIs'
    ],
    featured: true
  },
  {
    id: 'free',
    name: 'Trial',
    price: '0',
    afterTrialPrice: '49',
    currency: '€',
    period: '/ 3 zile',
    highlight: '3 Zile Gratuit',
    benefits: [
      '3 zile acces complet GRATUIT',
      'Toate funcțiile Pro incluse',
      'Anulează oricând în trial',
      'Apoi doar €49/lună'
    ],
    featured: false,
    isTrial: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '497',
    currency: '€',
    period: '/ lună',
    highlight: 'Complet',
    benefits: [
      'Tot din Pro +',
      'Warrior Launch Accelerator (€970)',
      'Coaching LIVE cu Alin Radu',
      'Comunitate VIP Elite',
      'Support VIP dedicat'
    ],
    featured: true
  }
];

export function WarriorPowerUpsell({ scores, userName, onContinueFree }: WarriorPowerUpsellProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Trebuie să fii autentificat pentru a continua.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
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

      {/* Plans Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
      >
        {UPSELL_PLANS.map((plan) => {
          const isElite = plan.id === 'elite';
          const isTrial = plan.id === 'free';
          const isPro = plan.id === 'pro';
          
          return (
            <Card 
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isElite 
                  ? "border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 shadow-lg shadow-amber-500/10" 
                  : isTrial
                    ? "border border-primary/50 bg-gradient-to-br from-primary/5 via-background to-accent/5"
                    : "border-2 border-primary bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-lg shadow-primary/10"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                isElite 
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
                  : isTrial
                    ? "bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50"
                    : "bg-gradient-to-r from-primary via-accent to-primary"
              )} />
              
              {plan.highlight && (
                <Badge 
                  className={cn(
                    "absolute top-4 right-4 border-0",
                    isElite 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : isTrial
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-primary to-accent text-white"
                  )}
                >
                  {plan.highlight}
                </Badge>
              )}

              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isElite ? (
                      <Crown className="h-6 w-6 text-amber-500" />
                    ) : isTrial ? (
                      <Sparkles className="h-6 w-6 text-green-500" />
                    ) : (
                      <Zap className="h-6 w-6 text-primary" />
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground line-through">
                        {plan.currency}{plan.originalPrice}
                      </span>
                      <Badge variant="secondary" className="text-xs">Valoare</Badge>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-black",
                      isElite ? "text-amber-500" : isTrial ? "text-green-500" : "text-foreground"
                    )}>
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  {(plan as any).afterTrialPrice && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Apoi {plan.currency}{(plan as any).afterTrialPrice}/lună
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-sm">
                      <Check className={cn(
                        "h-4 w-4 mt-0.5 flex-shrink-0",
                        isElite ? "text-amber-500" : isTrial ? "text-green-500" : "text-green-500"
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
                    isElite 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                      : isTrial
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  )}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      {isElite && <Crown className="h-4 w-4" />}
                      {isPro && <Star className="h-4 w-4" />}
                      {isTrial && <Sparkles className="h-4 w-4" />}
                      {isTrial ? 'Începe Trial Gratuit' : `Alege ${plan.name}`}
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
