import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Users, Zap, Gift } from 'lucide-react';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

interface PricingPlan {
  id: 'free' | 'pro' | 'elite';
  nameEn: string;
  nameRo: string;
  price: string;
  originalPrice?: string;
  currency: string;
  periodEn: string;
  periodRo: string;
  highlightEn?: string;
  highlightRo?: string;
  benefitsEn: string[];
  benefitsRo: string[];
  featured?: boolean;
  icon: React.ElementType;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    nameEn: 'Free',
    nameRo: 'Gratuit',
    price: '0',
    currency: '€',
    periodEn: '3 days',
    periodRo: '3 zile',
    highlightEn: 'Start Here',
    highlightRo: 'Începe Aici',
    benefitsEn: [
      'Habit Tracking for daily discipline',
      'Access to transformation Challenges',
      'Discover WarriorOS potential',
      'Upgrade option anytime'
    ],
    benefitsRo: [
      'Habit Tracking pentru disciplină zilnică',
      'Acces la Challenge-uri de transformare',
      'Descoperă potențialul WarriorOS',
      'Opțiune de upgrade oricând'
    ],
    icon: Gift,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'pro',
    nameEn: 'Pro',
    nameRo: 'Pro',
    price: '49',
    originalPrice: '98',
    currency: '€',
    periodEn: '/ month',
    periodRo: '/ lună',
    highlightEn: 'Early Bird',
    highlightRo: 'Early Bird',
    benefitsEn: [
      'Everything in Free plan',
      'Hormozi-style AI Coaching',
      'Complete Champion Routine',
      'Door weekly planning',
      '90-day Sprint with KPIs'
    ],
    benefitsRo: [
      'Tot ce include planul Gratuit',
      'AI Coaching tip Hormozi',
      'Champion Routine completă',
      'Planificare săptămânală Door',
      'Sprint 90 zile cu KPIs'
    ],
    featured: true,
    icon: Zap,
    color: 'from-primary to-accent'
  },
  {
    id: 'elite',
    nameEn: 'Elite',
    nameRo: 'Elite',
    price: '297',
    currency: '€',
    periodEn: '/ month',
    periodRo: '/ lună',
    highlightEn: 'Complete Warrior',
    highlightRo: 'Războinic Complet',
    benefitsEn: [
      'Everything in Pro plan',
      'Warrior Accelerator (€970 value)',
      'Weekly LIVE coaching with Alin Radu',
      'VIP Elite community',
      'Priority VIP support'
    ],
    benefitsRo: [
      'Tot ce include planul Pro',
      'Warrior Accelerator (valoare €970)',
      'Coaching LIVE săptămânal cu Alin Radu',
      'Comunitate VIP Elite',
      'Support VIP prioritar'
    ],
    featured: true,
    icon: Crown,
    color: 'from-amber-500 to-orange-500'
  }
];

export const ChallengePremiumOffer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    // Pre-open window before async operations
    const preOpened = preOpenWindow();
    
    setLoading(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (preOpened) preOpened.close();
        toast.error(language === 'en' ? 'Please sign in first' : 'Te rugăm să te autentifici');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId }
      });

      if (error) {
        if (preOpened) preOpened.close();
        throw error;
      }
      if (data?.url) {
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' ? 'Error creating checkout' : 'Eroare la creare checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 border-primary/20">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          🎓 {language === 'en' ? 'Challenge Graduate Exclusive' : 'Exclusiv Absolvent Challenge'}
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' 
            ? 'Continue Your Warrior Journey' 
            : 'Continuă Călătoria de Războinic'}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {language === 'en' 
            ? 'You\'ve built the foundation. Now choose your path to transformation.' 
            : 'Ai construit fundația. Acum alege drumul tău către transformare.'}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {pricingPlans.map((plan) => {
          const Icon = plan.icon;
          const isElite = plan.id === 'elite';
          const isPro = plan.id === 'pro';
          
          return (
            <div 
              key={plan.id}
              className={`relative rounded-xl p-5 border transition-all ${
                isElite 
                  ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30 shadow-lg shadow-amber-500/10' 
                  : isPro
                    ? 'bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30 shadow-lg shadow-primary/10'
                    : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              {/* Featured Badge */}
              {plan.highlightEn && (
                <Badge 
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 ${
                    isElite 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                      : isPro
                        ? 'bg-gradient-to-r from-primary to-accent'
                        : 'bg-muted text-foreground'
                  } text-white border-0`}
                >
                  {language === 'en' ? plan.highlightEn : plan.highlightRo}
                </Badge>
              )}

              {/* Plan Header */}
              <div className="text-center mb-4 pt-2">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {language === 'en' ? plan.nameEn : plan.nameRo}
                </h3>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                {plan.originalPrice && (
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-muted-foreground line-through">
                      {plan.currency}{plan.originalPrice}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {language === 'en' ? 'Value' : 'Valoare'}
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-3xl font-bold ${isElite ? 'text-amber-500' : 'text-foreground'}`}>
                    {plan.currency}{plan.price}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {language === 'en' ? plan.periodEn : plan.periodRo}
                </span>
              </div>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {(language === 'en' ? plan.benefitsEn : plan.benefitsRo).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                      isElite ? 'text-amber-500' : 'text-green-500'
                    }`} />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                className={`w-full ${
                  isElite 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    : isPro
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                      : ''
                }`}
                variant={plan.id === 'free' ? 'outline' : 'default'}
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id 
                  ? '...' 
                  : language === 'en' 
                    ? `Choose ${plan.nameEn}` 
                    : `Alege ${plan.nameRo}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Warrior Launch Accelerator CTA */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 shadow-lg">
        <div className="text-center mb-4">
          <Badge className="mb-3 bg-gradient-to-r from-primary to-accent text-white border-0">
            🚀 {language === 'en' ? 'Fast-Track Your Results' : 'Accelerează-ți Rezultatele'}
          </Badge>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Warrior Certified Coach' : 'Warrior Certified Coach'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {language === 'en' 
              ? '90-day intensive program with step-by-step guidance, weekly coaching, and proven frameworks to 10X your results.' 
              : 'Program intensiv de 90 de zile cu ghidare pas cu pas, coaching săptămânal și framework-uri dovedite pentru a-ți multiplica rezultatele de 10X.'}
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
            onClick={() => navigate('/warrior-launch-accelerator')}
          >
            {language === 'en' ? 'Explore Accelerator →' : 'Explorează Acceleratorul →'}
          </Button>
        </div>
      </div>

      {/* Coaching Highlight */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">
              🎯 {language === 'en' ? 'Weekly LIVE Coaching with Alin Radu (Elite Only)' : 'Coaching LIVE Săptămânal cu Alin Radu (doar Elite)'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Join live sessions every week. Get personalized guidance and connect with other Elite warriors.' 
                : 'Participă la sesiuni live în fiecare săptămână. Primește ghidare personalizată și conectează-te cu alți războinici Elite.'}
            </p>
          </div>
        </div>
      </div>

      {/* Free Alternative */}
      <div className="mt-6 text-center">
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/dashboard')}
        >
          {language === 'en' 
            ? 'Continue with Habit Tracking only →' 
            : 'Continuă doar cu Habit Tracking →'}
        </Button>
      </div>
    </Card>
  );
};
