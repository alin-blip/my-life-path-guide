import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Users, Zap, Star } from 'lucide-react';

interface PricingPlan {
  id: 'monthly' | 'annual' | 'premium-coach';
  nameEn: string;
  nameRo: string;
  price: string;
  priceValue: number;
  period: string;
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
    id: 'monthly',
    nameEn: 'Monthly',
    nameRo: 'Lunar',
    price: '97',
    priceValue: 9700,
    period: 'LEI',
    periodEn: '/ month',
    periodRo: '/ lună',
    benefitsEn: [
      'All platform modules',
      'AI Coaching for goals',
      'Goal Wizard with milestones',
      'Champion Routine',
      'Weekly planning in Door'
    ],
    benefitsRo: [
      'Toate modulele platformei',
      'Coaching AI pentru obiective',
      'Goal Wizard cu milestone-uri',
      'Rutina Campionului',
      'Planificare săptămânală în Door'
    ],
    icon: Zap,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'annual',
    nameEn: 'Annual',
    nameRo: 'Anual',
    price: '997',
    priceValue: 99700,
    period: 'LEI',
    periodEn: '/ year',
    periodRo: '/ an',
    highlightEn: '-15% Discount',
    highlightRo: '-15% Discount',
    benefitsEn: [
      'Everything in Monthly plan',
      'Unlimited AI personalized meditations',
      'Export & backup your data',
      'Priority support',
      'Access to all future updates'
    ],
    benefitsRo: [
      'Tot ce include planul lunar',
      'Meditații AI personalizate nelimitate',
      'Export și backup date',
      'Support prioritar',
      'Acces la toate update-urile viitoare'
    ],
    featured: true,
    icon: Star,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'premium-coach',
    nameEn: 'Premium + Coaching',
    nameRo: 'Premium + Coaching',
    price: '197',
    priceValue: 19700,
    period: 'LEI',
    periodEn: '/ month',
    periodRo: '/ lună',
    highlightEn: 'With Alin Radu',
    highlightRo: 'Cu Alin Radu',
    benefitsEn: [
      'Everything in Annual plan',
      'Weekly LIVE group coaching with Alin Radu',
      'Exclusive Q&A sessions',
      'VIP community with premium members',
      'Exclusive coaching resources',
      'Priority access to new features'
    ],
    benefitsRo: [
      'Tot ce include planul anual',
      'Coaching de grup săptămânal LIVE cu Alin Radu',
      'Sesiuni Q&A exclusive',
      'Comunitate VIP cu membri premium',
      'Resurse exclusive de coaching',
      'Acces prioritar la funcționalități noi'
    ],
    featured: true,
    icon: Crown,
    color: 'from-purple-500 to-pink-500'
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
    <Card className="p-6 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-amber-500/5 border-primary/20">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          🎓 {language === 'en' ? 'Challenge Graduate Exclusive' : 'Exclusiv Absolvent Challenge'}
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === 'en' 
            ? 'Continue Your Journey with Premium' 
            : 'Continuă Călătoria cu Premium'}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {language === 'en' 
            ? 'You\'ve built the foundation. Now unlock the full power of the platform to achieve your Viziunea 2026.' 
            : 'Ai construit fundația. Acum deblochează puterea completă a platformei pentru a-ți realiza Viziunea 2026.'}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {pricingPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div 
              key={plan.id}
              className={`relative rounded-xl p-5 border transition-all ${
                plan.featured 
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10' 
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              {/* Featured Badge */}
              {plan.highlightEn && (
                <Badge 
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 ${
                    plan.id === 'premium-coach' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
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
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {language === 'en' ? plan.periodEn : plan.periodRo}
                </span>
              </div>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {(language === 'en' ? plan.benefitsEn : plan.benefitsRo).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                className={`w-full ${plan.featured ? `bg-gradient-to-r ${plan.color} hover:opacity-90` : ''}`}
                variant={plan.featured ? 'default' : 'outline'}
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

      {/* Coaching Highlight */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">
              🎯 {language === 'en' ? 'Weekly Group Coaching with Alin Radu' : 'Coaching de Grup Săptămânal cu Alin Radu'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Join live sessions every week. Get personalized guidance, ask questions, and connect with other high performers on the same journey.' 
                : 'Participă la sesiuni live în fiecare săptămână. Primește ghidare personalizată, pune întrebări și conectează-te cu alți performeri de top pe aceeași călătorie.'}
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
            ? 'Continue with limited features →' 
            : 'Continuă cu funcționalități limitate →'}
        </Button>
      </div>
    </Card>
  );
};
