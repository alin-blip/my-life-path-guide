import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Users, Zap, Gift } from 'lucide-react';

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
    nameEn: 'FREE Trial',
    nameRo: 'Trial GRATUIT',
    price: '0',
    currency: '€',
    periodEn: '3 days FREE',
    periodRo: '3 zile GRATUIT',
    highlightEn: '🎁 TRY FREE',
    highlightRo: '🎁 ÎNCEARCĂ GRATUIT',
    benefitsEn: [
      '3 days FULL access FREE',
      'All Pro features included',
      'No credit card required',
      'Cancel anytime, no obligations',
      'Then only €49/month if you continue'
    ],
    benefitsRo: [
      '3 zile acces COMPLET gratuit',
      'Toate funcțiile Pro incluse',
      'Fără card de credit necesar',
      'Anulează oricând, fără obligații',
      'Apoi doar €49/lună dacă continui'
    ],
    featured: true,
    icon: Gift,
    color: 'from-green-500 to-emerald-500'
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
    highlightEn: 'Early Bird -50%',
    highlightRo: 'Early Bird -50%',
    benefitsEn: [
      'Hormozi-style AI Coaching',
      'Complete Champion Routine',
      'Door weekly planning',
      'Stacks for rapid reset',
      '90-day Sprint with KPIs'
    ],
    benefitsRo: [
      'AI Coaching tip Hormozi',
      'Champion Routine completă',
      'Planificare săptămânală Door',
      'Stacks pentru reset rapid',
      'Sprint 90 zile cu KPIs'
    ],
    featured: false,
    icon: Zap,
    color: 'from-primary to-accent'
  },
  {
    id: 'elite',
    nameEn: 'Elite',
    nameRo: 'Elite',
    price: '497',
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
    featured: false,
    icon: Crown,
    color: 'from-amber-500 to-orange-500'
  }
];

export const ChallengePremiumOffer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(language === 'en' ? 'Please sign in first' : 'Te rugăm să te autentifici');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
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
                className={`w-full font-bold ${
                  plan.id === 'free'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 shadow-lg shadow-green-500/30'
                    : isElite 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : isPro
                        ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                        : ''
                }`}
                size={plan.id === 'free' ? 'lg' : 'default'}
                variant="default"
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id 
                  ? '...' 
                  : plan.id === 'free'
                    ? (language === 'en' ? '🚀 START FREE NOW' : '🚀 ÎNCEPE GRATUIT ACUM')
                    : (language === 'en' ? `Choose ${plan.nameEn}` : `Alege ${plan.nameRo}`)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Coaching Highlight */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
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
