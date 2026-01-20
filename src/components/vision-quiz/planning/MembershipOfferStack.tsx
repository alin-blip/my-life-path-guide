import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Star, Crown, Zap, ArrowRight, Target, Rocket, 
  Calendar, Map, Users, Video, Brain, Trophy, Sparkles,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { QuizCategory } from '../quizData';
import { PlanningAnswers } from './VisionPlanningWizard';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

interface MembershipOfferStackProps {
  language: 'en' | 'ro';
  scores: Record<QuizCategory, number>;
  answers: PlanningAnswers;
}

const OFFER_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '49',
    originalPrice: '98',
    currency: '€',
    period: '/ lună',
    periodEn: '/ month',
    highlight: 'Early Bird',
    valueLabel: '50% OFF',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/50',
    features: [
      { icon: Target, labelEn: 'AI Coaching for Offers & Pricing', labelRo: 'AI Coaching pentru Ofertă și Preț' },
      { icon: Calendar, labelEn: 'Champion Routine - Daily System', labelRo: 'Champion Routine - Sistem Zilnic' },
      { icon: Map, labelEn: 'Door - Weekly Planning', labelRo: 'Door - Planificare Săptămânală' },
      { icon: Brain, labelEn: 'Stacks - Quick Mental Reset', labelRo: 'Stacks - Reset Mental Rapid' },
      { icon: Trophy, labelEn: 'Progress Journal & Reports', labelRo: 'Jurnal de Progres & Rapoarte' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '97',
    originalPrice: '197',
    currency: '€',
    period: '/ lună',
    periodEn: '/ month',
    highlight: '7 Zile Trial Gratuit',
    highlightEn: '7-Day Free Trial',
    valueLabel: '51% OFF',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/50',
    featured: true,
    hasTrial: true,
    features: [
      { icon: Check, labelEn: 'Everything in Basic +', labelRo: 'Tot din Basic +', isHeader: true },
      { icon: Video, labelEn: 'Weekly LIVE Group Coaching', labelRo: 'Coaching de Grup LIVE Săptămânal' },
      { icon: Users, labelEn: 'VIP Pro Community', labelRo: 'Comunitate VIP Pro' },
      { icon: Target, labelEn: '90-Day Sprint with KPIs', labelRo: 'Sprint 90 Zile cu KPIs' },
      { icon: Star, labelEn: 'Exclusive Q&A Sessions', labelRo: 'Sesiuni Q&A Exclusive' },
      { icon: Rocket, labelEn: 'Priority Support', labelRo: 'Support Prioritar' },
    ],
  },
];

export const MembershipOfferStack: React.FC<MembershipOfferStackProps> = ({
  language,
  scores,
  answers,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async (planId: string) => {
    // Pre-open window before async operations (avoids popup blocker in iframe)
    const preOpened = preOpenWindow();
    
    setIsLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Close pre-opened window if exists
        if (preOpened) preOpened.close();
        
        toast.info(language === 'en' 
          ? 'Please sign in to continue.' 
          : 'Te rugăm să te autentifici pentru a continua.');
        navigate('/auth', { 
          state: { 
            returnUrl: '/vision-2026',
            plan: planId
          } 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'vision-quiz-planning' },
      });

      if (error) {
        if (preOpened) preOpened.close();
        throw new Error(error.message);
      }

      if ((data as any)?.url) {
        redirectExternal((data as any).url, preOpened);
        return;
      }

      if (preOpened) preOpened.close();
      throw new Error('Nu s-a putut crea sesiunea de plată');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Checkout error:', { planId, message });
      toast.error(message || 'A apărut o eroare. Încearcă din nou.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleContinueFree = () => {
    navigate('/door?tab=annual&startWizard=true', { 
      state: { 
        fromVisionQuiz: true, 
        scores,
        planningAnswers: answers
      } 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
            {language === 'en' ? 'Your Roadmap is Ready' : 'Harta Ta este Gata'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' 
            ? 'Get the Tools to Execute' 
            : 'Primește Uneltele pentru Execuție'}
        </h2>
        
        <p className="text-white/60 max-w-lg mx-auto text-sm">
          {language === 'en'
            ? 'Your strategic plan is saved. Now choose your execution toolkit to turn your vision into reality.'
            : 'Planul tău strategic este salvat. Acum alege kit-ul de execuție pentru a transforma viziunea în realitate.'}
        </p>
      </div>

      {/* What You Created */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-3 text-center">
          {language === 'en' ? "What you've created:" : 'Ce ai creat:'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Target, label: language === 'en' ? 'Annual Vision' : 'Viziune Anuală' },
            { icon: Rocket, label: language === 'en' ? '90-Day Sprint' : 'Sprint 90 Zile' },
            { icon: Calendar, label: language === 'en' ? '30-Day Mission' : 'Misiune 30 Zile' },
            { icon: Map, label: language === 'en' ? 'Week 1 Action' : 'Acțiune Săpt. 1' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <item.icon className="w-4 h-4 text-white/40" />
              <span className="text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {OFFER_PLANS.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 bg-white/5 backdrop-blur-sm",
              plan.featured 
                ? "border-2 border-amber-500/50 md:scale-105 md:-my-2" 
                : "border-2 border-purple-500/50"
            )}
          >
            {/* Top gradient bar */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r",
              plan.gradient
            )} />
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-1">
              {plan.hasTrial && (
                <Badge className="border-0 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Gift className="w-3 h-3 mr-1" />
                  {language === 'en' ? plan.highlightEn : plan.highlight}
                </Badge>
              )}
              {!plan.hasTrial && (
                <Badge className={cn(
                  "border-0 text-xs bg-gradient-to-r text-white",
                  plan.gradient
                )}>
                  {plan.highlight}
                </Badge>
              )}
              <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                {plan.valueLabel}
              </Badge>
            </div>

            <CardContent className="p-5 pt-12">
              {/* Plan name and price */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={cn(
                    "h-6 w-6",
                    plan.featured ? "text-amber-500" : "text-purple-400"
                  )} />
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/40 line-through text-sm">
                    {plan.currency}{plan.originalPrice}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-4xl font-black",
                    plan.featured ? "text-amber-500" : "text-white"
                  )}>
                    {plan.currency}{plan.price}
                  </span>
                  <span className="text-white/50 text-sm">
                    {language === 'en' ? plan.periodEn : plan.period}
                  </span>
                </div>
                
                {plan.hasTrial && (
                  <p className="text-green-400 text-xs mt-1">
                    {language === 'en' 
                      ? '✓ Try free for 7 days, cancel anytime' 
                      : '✓ Încearcă gratuit 7 zile, anulează oricând'}
                  </p>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 mb-5">
                {plan.features.map((feature, idx) => (
                  <li 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-2.5",
                      (feature as any).isHeader && "font-medium"
                    )}
                  >
                    <feature.icon className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      plan.featured ? "text-amber-500" : "text-green-400"
                    )} />
                    <span className="text-white/80 text-sm">
                      {language === 'en' ? feature.labelEn : feature.labelRo}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => handleCheckout(plan.id)}
                disabled={isLoading !== null}
                className={cn(
                  "w-full gap-2 font-bold py-5",
                  plan.featured 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                )}
              >
                {isLoading === plan.id ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'en' ? 'Processing...' : 'Se procesează...'}
                  </>
                ) : (
                  <>
                    {plan.featured ? <Crown className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    {plan.hasTrial 
                      ? (language === 'en' ? 'Start 7-Day Trial' : 'Începe Trial 7 Zile')
                      : (language === 'en' ? `Choose ${plan.name}` : `Alege ${plan.name}`)
                    }
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Free Option */}
      <div className="text-center pt-2">
        <Button
          variant="ghost"
          onClick={handleContinueFree}
          className="gap-2 text-white/50 hover:text-white hover:bg-white/10 text-sm"
        >
          {language === 'en' 
            ? 'Continue with Free Plan (limited features)' 
            : 'Continuă cu Planul Gratuit (funcții limitate)'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
        <span>🔒 {language === 'en' ? 'Secure Payment' : 'Plată Securizată'}</span>
        <span>•</span>
        <span>💳 {language === 'en' ? 'Cancel Anytime' : 'Anulează Oricând'}</span>
        <span>•</span>
        <span>✨ {language === 'en' ? 'Instant Access' : 'Acces Instant'}</span>
      </div>
    </div>
  );
};
