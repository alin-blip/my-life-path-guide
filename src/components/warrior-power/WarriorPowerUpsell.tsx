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
import { useLanguage } from '@/context/LanguageContext';
import type { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { saveRealityMapScores } from '@/services/realityMapService';

interface WarriorPowerUpsellProps {
  scores: WarriorPowerScores;
  userName: string;
  onContinueFree: () => void;
}

const COPY = {
  ro: {
    nextStep: 'Pasul Următor',
    chooseplan: 'Alege planul tău de transformare',
    personalizedMsg: (total: number, dim: string) =>
      `Cu un scor de ${total}/96 și ${dim} ca zonă de focalizare principală, ai nevoie de un plan structurat pentru a deveni ACCELERAT în toate ariile.`,
    totalValue: 'Valoare totală:',
    processing: 'Se procesează...',
    trialBtn: (period: string) => `Începe ${period}`,
    startNow: 'Începe acum',
    normalPrice: (cur: string, price: string) => `${cur}${price}/lună`,
    thenPrice: (cur: string, price: string) => `Apoi ${cur}${price}/lună`,
    save50: 'Economisești 50%',
    guarantee: 'Garanție 100% Satisfacție',
    guaranteeDesc: 'Dacă în 7 zile nu vezi rezultate, primești banii înapoi. Fără întrebări.',
    users: 'utilizatori',
    continueFree: 'Continuă fără abonament (funcții limitate)',
    resultsSaved: 'Rezultatele tale au fost salvate și trimise pe email',
    authRequired: 'Te rugăm să te autentifici pentru a continua.',
    checkoutError: 'A apărut o eroare. Încearcă din nou.',
    paymentError: 'Nu s-a putut crea sesiunea de plată',
    dimNames: { body: 'Corp', being: 'Ființă', balance: 'Echilibru', business: 'Business' },
    plans: {
      basic: { period: 'lună', highlight: '💪 Începe Acum' },
      pro:   { period: '7 zile trial', highlight: '⭐ Cel Mai Popular' },
      elite: { period: 'lună', highlight: '🔥 Transformare Totală' },
    },
  },
  en: {
    nextStep: 'Next Step',
    chooseplan: 'Choose your transformation plan',
    personalizedMsg: (total: number, dim: string) =>
      `With a score of ${total}/96 and ${dim} as your primary focus area, you need a structured plan to become ACCELERATED in all areas.`,
    totalValue: 'Total value:',
    processing: 'Processing...',
    trialBtn: (period: string) => `Start ${period}`,
    startNow: 'Start now',
    normalPrice: (cur: string, price: string) => `${cur}${price}/mo`,
    thenPrice: (cur: string, price: string) => `Then ${cur}${price}/mo`,
    save50: 'Save 50%',
    guarantee: '100% Satisfaction Guarantee',
    guaranteeDesc: "If you don't see results in 7 days, you get your money back. No questions asked.",
    users: 'users',
    continueFree: 'Continue without subscription (limited features)',
    resultsSaved: 'Your results have been saved and sent to your email',
    authRequired: 'Please sign in to continue.',
    checkoutError: 'An error occurred. Please try again.',
    paymentError: 'Could not create payment session',
    dimNames: { body: 'Body', being: 'Being', balance: 'Balance', business: 'Business' },
    plans: {
      basic: { period: 'month', highlight: '💪 Start Now' },
      pro:   { period: '7-day trial', highlight: '⭐ Most Popular' },
      elite: { period: 'month', highlight: '🔥 Total Transformation' },
    },
  },
};

const UPSELL_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '49',
    normalPrice: '97',
    currency: '€',
    hasTrial: false,
    tier: 'basic',
    totalValue: '€341',
    benefits: {
      ro: [
        'Acces complet la platformă',
        'Harta Realității interactivă',
        'Champion Routine completă',
        'Door - planificare săptămânală',
        'AI Coaching pentru business',
      ],
      en: [
        'Full platform access',
        'Interactive Reality Map',
        'Complete Champion Routine',
        'Door - weekly planning',
        'AI Business Coaching',
      ],
    },
    featured: false,
    gradient: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500',
    icon: Gift,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '0',
    afterTrialPrice: '97',
    normalPrice: '197',
    currency: '€',
    hasTrial: true,
    tier: 'pro',
    totalValue: '€882+',
    benefits: {
      ro: [
        '✓ Tot din Basic +',
        '7 zile trial gratuit',
        'Coaching de grup LIVE săptămânal',
        'Comunitate VIP Pro',
        'Sprint 90 zile cu KPIs',
        '💰 REFERRAL: Câștigă 50% comision recurent',
        'Support VIP dedicat',
      ],
      en: [
        '✓ Everything in Basic +',
        '7-day free trial',
        'Weekly LIVE group coaching',
        'VIP Pro community',
        '90-day Sprint with KPIs',
        '💰 REFERRAL: Earn 50% recurring commission',
        'Dedicated VIP support',
      ],
    },
    featured: true,
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500',
    icon: Star,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '297',
    normalPrice: '500',
    currency: '€',
    hasTrial: false,
    tier: 'elite',
    totalValue: '€2,570',
    benefits: {
      ro: [
        '✓ Tot din Pro +',
        'Warrior Certified Coach (€1,999 valoare)',
        '47+ lecții video premium',
        'Coaching 1-on-1 lunar (30 min)',
        '🎓 COACH DASHBOARD: Creează-ți propria platformă',
        '💰 REFERRAL: 50% comision recurent',
        'Acces prioritar la toate cursurile',
      ],
      en: [
        '✓ Everything in Pro +',
        'Warrior Certified Coach (€1,999 value)',
        '47+ premium video lessons',
        'Monthly 1-on-1 Coaching (30 min)',
        '🎓 COACH DASHBOARD: Build your own platform',
        '💰 REFERRAL: 50% recurring commission',
        'Priority access to all courses',
      ],
    },
    featured: false,
    gradient: 'from-purple-500 to-violet-500',
    borderColor: 'border-purple-500',
    icon: Crown,
  },
];

export function WarriorPowerUpsell({ scores, userName, onContinueFree }: WarriorPowerUpsellProps) {
  const { language } = useLanguage();
  const t = COPY[language];
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [activeUsers, setActiveUsers] = useState(1247);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setHasSession(!!session);
    });

    setActiveUsers(1200 + Math.floor(Math.random() * 100));
    return () => subscription.unsubscribe();
  }, []);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const dimensionTotals = {
    body: (scores.body_fitness || 0) + (scores.body_nutrition || 0),
    being: (scores.being_connection || 0) + (scores.being_certainty || 0),
    balance: (scores.balance_relationship || 0) + (scores.balance_family || 0),
    business: (scores.business_mechanics || 0) + (scores.business_money || 0),
  };

  const weakestDimension = Object.entries(dimensionTotals).sort(([, a], [, b]) => a - b)[0][0] as keyof typeof t.dimNames;
  const weakestDimName = t.dimNames[weakestDimension];

  const handleCheckout = async (planId: string) => {
    setIsLoading(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info(t.authRequired);
        navigate('/auth', { state: { returnUrl: '/warrior-power', plan: planId, scores } });
        return;
      }

      await saveRealityMapScores(scores);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'warrior-power' },
      });

      if (error) {
        let message = error.message;
        const anyErr = error as any;
        if (anyErr?.context) {
          try { const body = await anyErr.context.json(); message = body?.error ?? message; } catch {}
        } else if ((data as any)?.error) {
          message = (data as any).error;
        }
        throw new Error(message);
      }

      if ((data as any)?.url) { window.location.href = (data as any).url; return; }
      throw new Error((data as any)?.error ?? t.paymentError);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message, error });
      toast.error(message || t.checkoutError);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Message */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm uppercase tracking-widest text-primary font-bold">{t.nextStep}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.chooseplan}</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          {t.personalizedMsg(totalScore, weakestDimName).split('ACCELERATED').map((part, i, arr) =>
            i < arr.length - 1
              ? <span key={i}>{part}<strong className="text-primary">{language === 'en' ? 'ACCELERATED' : 'ACCELERAT'}</strong></span>
              : <span key={i}>{part}</span>
          )}
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
          const IconComponent = plan.icon;
          const planCopy = t.plans[plan.id as keyof typeof t.plans];
          const benefits = plan.benefits[language];

          return (
            <Card
              key={plan.id}
              variant="outline"
              className={cn(
                "relative overflow-hidden transition-all duration-300 bg-white",
                `border-2 ${plan.borderColor} shadow-lg`,
                plan.featured && "ring-2 ring-amber-500/50"
              )}
            >
              <div className={cn("absolute top-0 left-0 w-full h-1", `bg-gradient-to-r ${plan.gradient}`)} />

              {planCopy.highlight && (
                <Badge className={cn("absolute top-4 right-4 border-0 text-white text-xs", `bg-gradient-to-r ${plan.gradient}`)}>
                  {planCopy.highlight}
                </Badge>
              )}

              <CardContent className="p-5">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={cn("h-5 w-5",
                      plan.id === 'basic' && "text-blue-500",
                      plan.id === 'pro' && "text-amber-500",
                      plan.id === 'elite' && "text-purple-500"
                    )} />
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  </div>

                  <div className="mb-2 p-2 rounded-lg bg-white border border-gray-200">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">{t.totalValue}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold line-through text-gray-400">{plan.totalValue}</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-3xl font-black",
                      plan.id === 'basic' && "text-blue-500",
                      plan.id === 'pro' && "text-amber-500",
                      plan.id === 'elite' && "text-purple-500"
                    )}>
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-gray-700 text-sm">/ {planCopy.period}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 line-through">
                      {t.normalPrice(plan.currency, plan.normalPrice)}
                    </span>
                    {plan.hasTrial && plan.afterTrialPrice && (
                      <span className="text-xs font-semibold text-green-500">
                        {t.thenPrice(plan.currency, plan.afterTrialPrice)}
                      </span>
                    )}
                    {!plan.hasTrial && (
                      <span className="text-xs font-semibold text-green-500">{t.save50}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-xs">
                      <Check className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                        plan.id === 'basic' && "text-blue-500",
                        plan.id === 'pro' && "text-amber-500",
                        plan.id === 'elite' && "text-purple-500"
                      )} />
                      <span className="text-gray-800">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading !== null}
                  variant="default"
                  size="sm"
                  className={cn("w-full gap-2 text-white", `bg-gradient-to-r ${plan.gradient} hover:opacity-90`)}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      {plan.hasTrial ? t.trialBtn(planCopy.period) : t.startNow}
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
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900">{t.guarantee}</p>
                <p className="text-xs text-gray-600">{t.guaranteeDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-center md:text-right">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-900">{activeUsers.toLocaleString()}+</span>
                <span className="text-xs text-gray-600">{t.users}</span>
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

      {/* Continue Without Subscription */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
        <Button variant="ghost" onClick={onContinueFree} className="gap-2 text-gray-500 hover:text-gray-900 text-sm">
          {t.continueFree}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Results Saved Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-4"
      >
        <Zap className="h-4 w-4 text-primary" />
        <span>{t.resultsSaved}</span>
      </motion.div>
    </div>
  );
}
