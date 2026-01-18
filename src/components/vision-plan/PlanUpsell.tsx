import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Rocket, Sparkles, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PlanUpsellProps {
  language: 'en' | 'ro';
  onContinueFree: () => void;
}

const plans = [
  {
    id: 'trial',
    name: { en: '3-Day Trial', ro: 'Trial 3 Zile' },
    price: { en: 'FREE', ro: 'GRATUIT' },
    priceNote: { en: 'then €9.90/mo', ro: 'apoi €9.90/lună' },
    icon: Rocket,
    featured: true,
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    benefits: {
      en: ['Full access for 3 days', 'All dashboard features', 'Daily action tasks', 'Cancel anytime'],
      ro: ['Acces complet 3 zile', 'Toate funcțiile dashboard', 'Task-uri zilnice de acțiune', 'Anulezi oricând'],
    },
  },
  {
    id: 'pro',
    name: { en: 'Pro', ro: 'Pro' },
    price: { en: '€9.90', ro: '€9.90' },
    priceNote: { en: '/month', ro: '/lună' },
    icon: Sparkles,
    featured: false,
    color: 'bg-blue-600',
    benefits: {
      en: ['Everything in Trial', 'Weekly planning system', 'Progress tracking', 'Email reminders'],
      ro: ['Tot din Trial', 'Sistem de planificare săptămânală', 'Tracking progres', 'Reminder-e email'],
    },
  },
  {
    id: 'elite',
    name: { en: 'Elite', ro: 'Elite' },
    price: { en: '€19.90', ro: '€19.90' },
    priceNote: { en: '/month', ro: '/lună' },
    icon: Crown,
    featured: false,
    color: 'bg-purple-600',
    benefits: {
      en: ['Everything in Pro', 'AI coaching assistant', 'Priority support', 'Exclusive content'],
      ro: ['Tot din Pro', 'Asistent AI de coaching', 'Suport prioritar', 'Conținut exclusiv'],
    },
  },
];

export const PlanUpsell: React.FC<PlanUpsellProps> = ({ language, onContinueFree }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const lang = language === 'en' ? 'en' : 'ro';

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session) {
        toast.error(lang === 'en' ? 'Please sign in first' : 'Te rugăm să te autentifici');
        navigate('/auth?redirect=/vision-2026/plan');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId,
          successUrl: `${window.location.origin}/door?tab=annual&welcome=true`,
          cancelUrl: `${window.location.origin}/vision-2026/plan`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(lang === 'en' ? 'Error starting checkout' : 'Eroare la checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
          <Check className="w-4 h-4" />
          {lang === 'en' ? 'Your plan has been saved!' : 'Planul tău a fost salvat!'}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {lang === 'en' ? 'Ready to Execute Your 2026 Vision?' : 'Gata să Execuți Viziunea Ta pentru 2026?'}
        </h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          {lang === 'en'
            ? 'Your personalized plan with daily action tasks is waiting. Start your transformation today.'
            : 'Planul tău personalizat cu task-uri zilnice de acțiune te așteaptă. Începe transformarea azi.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id} 
              className={`relative p-5 ${plan.featured ? 'ring-2 ring-amber-500 shadow-lg' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {lang === 'en' ? 'RECOMMENDED' : 'RECOMANDAT'}
                </div>
              )}

              <div className={`w-10 h-10 rounded-lg ${plan.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {plan.name[lang]}
              </h3>
              
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-slate-900">{plan.price[lang]}</span>
                <span className="text-sm text-slate-500">{plan.priceNote[lang]}</span>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.benefits[lang].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.featured ? plan.color : ''}`}
                variant={plan.featured ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  lang === 'en' ? 'Get Started' : 'Începe Acum'
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onContinueFree}
          className="text-slate-500 hover:text-slate-700 text-sm underline"
        >
          {lang === 'en' ? 'Continue with Free Plan →' : 'Continuă cu Planul Gratuit →'}
        </button>
        <p className="text-xs text-slate-400 mt-2">
          {lang === 'en' 
            ? 'Your goals are saved. You can upgrade anytime from the dashboard.'
            : 'Obiectivele tale sunt salvate. Poți face upgrade oricând din dashboard.'}
        </p>
      </div>
    </div>
  );
};
