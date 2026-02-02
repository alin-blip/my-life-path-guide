import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, Sparkles, Star, Crown, Gift, Shield, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { plans, getLocalizedPlan } from '@/data/pricing';

interface MembershipUpsellCardsProps {
  source: 'warrior-power' | 'challenge-7-zile' | 'life-score';
  totalScore?: number;
  weakestDimension?: string;
  userName?: string;
  onContinueFree?: () => void;
}

const dimensionNames: Record<string, string> = {
  body: 'Corp',
  being: 'Ființă',
  balance: 'Echilibru',
  business: 'Business'
};

// Styling config for each tier
const tierConfig = {
  basic: {
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 via-white to-cyan-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    icon: Gift,
    totalValue: '€341',
  },
  pro: {
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 via-white to-orange-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-500',
    icon: Star,
    totalValue: '€1,200+',
  },
  elite: {
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50 via-white to-violet-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-500',
    icon: Crown,
    totalValue: '€5,000+',
  }
};

export function MembershipUpsellCards({ 
  source, 
  totalScore, 
  weakestDimension,
  userName,
  onContinueFree 
}: MembershipUpsellCardsProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState(1247);
  const navigate = useNavigate();

  // Get localized plans from centralized pricing
  const monthlyPlans = plans
    .filter(p => ['basic', 'pro', 'elite'].includes(p.id))
    .map(p => getLocalizedPlan(p, language as 'en' | 'ro'));

  useEffect(() => {
    // Simulate active users (slight random variation)
    setActiveUsers(1200 + Math.floor(Math.random() * 100));
  }, []);

  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.info(language === 'ro' ? 'Te rugăm să te autentifici pentru a continua.' : 'Please log in to continue.');
        navigate('/auth', { 
          state: { 
            returnUrl: `/${source === 'challenge-7-zile' ? 'challenge-7-zile' : source}`,
            plan: planId,
          } 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan: planId,
          source: source
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

      throw new Error((data as any)?.error ?? (language === 'ro' ? 'Nu s-a putut crea sesiunea de plată' : 'Could not create checkout session'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message, error });
      toast.error(message || (language === 'ro' ? 'A apărut o eroare. Încearcă din nou.' : 'An error occurred. Try again.'));
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
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-amber-500/20">
          <Zap className="h-5 w-5 text-amber-600" />
          <span className="text-sm uppercase tracking-widest text-amber-700 font-bold">
            {language === 'ro' ? 'Pasul Următor' : 'Next Step'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {language === 'ro' ? 'Alege planul tău de transformare' : 'Choose your transformation plan'}
        </h2>
        
        {totalScore !== undefined && weakestDimension && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro' ? (
              <>Cu un scor de <strong className="text-foreground">{totalScore}</strong> și 
              {' '}<strong className="text-foreground">{dimensionNames[weakestDimension] || weakestDimension}</strong> ca zonă de focalizare principală, 
              ai nevoie de un plan structurat pentru a deveni <strong className="text-amber-600 font-bold">ACCELERAT</strong> în toate ariile.</>
            ) : (
              <>With a score of <strong className="text-foreground">{totalScore}</strong> and 
              {' '}<strong className="text-foreground">{weakestDimension}</strong> as your main focus area, 
              you need a structured plan to become <strong className="text-amber-600 font-bold">ACCELERATED</strong> in all areas.</>
            )}
          </p>
        )}
        
        {!totalScore && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ro' 
              ? <>Alege planul potrivit pentru a-ți transforma viața în <strong className="text-amber-600 font-bold">toate cele 4 dimensiuni</strong>.</>
              : <>Choose the right plan to transform your life in <strong className="text-amber-600 font-bold">all 4 dimensions</strong>.</>
            }
          </p>
        )}
      </motion.div>

      {/* Plans Grid - 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto"
      >
        {monthlyPlans.map((plan) => {
          const config = tierConfig[plan.id as keyof typeof tierConfig] || tierConfig.basic;
          const IconComponent = config.icon;
          
          return (
            <Card 
              key={plan.id}
              variant="outline"
              className={cn(
                "relative overflow-hidden transition-all duration-300 bg-white",
                `border-2 ${config.borderColor} shadow-lg`,
                plan.featured && "ring-2 ring-amber-500/50"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                `bg-gradient-to-r ${config.gradient}`
              )} />
              
              {plan.highlight && (
                <Badge 
                  className={cn(
                    "absolute top-4 right-4 border-0 text-white text-xs",
                    `bg-gradient-to-r ${config.gradient}`
                  )}
                >
                  {plan.id === 'basic' ? '💪' : plan.id === 'pro' ? '⭐' : '🔥'} {plan.highlight}
                </Badge>
              )}

              <CardContent className="p-5">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={cn("h-5 w-5", config.textColor)} />
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  
                  {/* Value Anchor */}
                  <div className="mb-2 p-2 rounded-lg bg-white border border-gray-200">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">
                      {language === 'ro' ? 'Valoare totală:' : 'Total value:'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold line-through text-gray-400">{config.totalValue}</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-3xl font-black", config.textColor)}>
                      €0
                    </span>
                    <span className="text-gray-700 text-sm">/ {plan.trialDays} {language === 'ro' ? 'zile trial' : 'day trial'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 line-through">
                      {plan.originalPrice}/{language === 'ro' ? 'lună' : 'month'}
                    </span>
                    <span className="text-xs font-semibold text-green-500">
                      {language === 'ro' ? 'Apoi' : 'Then'} {plan.price}/{language === 'ro' ? 'lună' : 'month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.benefits.slice(0, 7).map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-xs">
                      <Check className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", config.textColor)} />
                      <span className="text-gray-800">{benefit}</span>
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
                    `bg-gradient-to-r ${config.gradient} hover:opacity-90`
                  )}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {language === 'ro' ? 'Se procesează...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      {plan.cta}
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
                <p className="font-bold text-gray-900">
                  {language === 'ro' ? 'Garanție 100% Satisfacție' : '100% Satisfaction Guarantee'}
                </p>
                <p className="text-xs text-gray-600">
                  {language === 'ro' 
                    ? 'Dacă în 7 zile nu vezi rezultate, primești banii înapoi. Fără întrebări.'
                    : "If you don't see results in 7 days, get your money back. No questions asked."}
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 text-center md:text-right">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-900">{activeUsers.toLocaleString()}+</span>
                <span className="text-xs text-gray-600">{language === 'ro' ? 'utilizatori' : 'users'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-900">4.9</span>
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
      {onContinueFree && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <Button
            variant="ghost"
            onClick={onContinueFree}
            className="gap-2 text-gray-500 hover:text-gray-900 text-sm"
          >
            {language === 'ro' ? 'Continuă fără abonament (funcții limitate)' : 'Continue without subscription (limited features)'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
