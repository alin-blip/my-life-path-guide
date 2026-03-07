import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Sparkles, CheckCircle2, Crown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EarlyBirdCountdown } from './EarlyBirdCountdown';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const PLANS = [
  {
    id: 'basic',
    name: { en: 'Basic', ro: 'Basic' },
    price: { normal: '49 RON/lună', earlyBird: '25 RON/lună' },
    benefits: [
      { en: 'Unlimited annual goals', ro: 'Obiective anuale nelimitate' },
      { en: '90-day planning', ro: 'Planificare 90 zile' },
      { en: 'Monthly missions', ro: 'Misiuni lunare' },
    ],
    featured: false
  },
  {
    id: 'pro',
    name: { en: 'Pro', ro: 'Pro' },
    price: { normal: '99 RON/lună', earlyBird: '49 RON/lună' },
    benefits: [
      { en: 'Everything in Basic', ro: 'Tot din Basic' },
      { en: 'AI Goal Wizard', ro: 'Wizard Obiective AI' },
      { en: 'Weekly planning (Door)', ro: 'Planificare săptămânală (Door)' },
      { en: 'Champion Routine', ro: 'Rutina Campionului' },
    ],
    featured: true
  },
];

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  const { language } = useLanguage();
  const { isEarlyBirdActive, earlyBirdExpiresAt } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error(language === 'en' ? 'Please log in first' : 'Te rog autentifică-te mai întâi');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' ? 'Error starting checkout' : 'Eroare la pornirea checkout-ului');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {language === 'en' ? 'Upgrade to Continue' : 'Fă Upgrade pentru a Continua'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {feature ? (
              language === 'en' 
                ? `The "${feature}" feature requires an active subscription.`
                : `Funcția "${feature}" necesită un abonament activ.`
            ) : (
              language === 'en'
                ? 'Your trial has ended. Upgrade to keep editing your goals.'
                : 'Perioada ta de trial s-a încheiat. Fă upgrade pentru a continua să îți editezi obiectivele.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Early Bird Countdown */}
        {isEarlyBirdActive && earlyBirdExpiresAt && (
          <div className="my-4">
            <EarlyBirdCountdown expiresAt={earlyBirdExpiresAt} compact />
          </div>
        )}

        {/* Plans */}
        <div className="space-y-3 mt-4">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all ${
                plan.featured 
                  ? 'border-2 border-primary shadow-lg shadow-primary/20' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Recommended' : 'Recomandat'}
                  </Badge>
                </div>
              )}

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${plan.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold text-lg">
                      {plan.name[language === 'en' ? 'en' : 'ro']}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-foreground">
                      {isEarlyBirdActive ? plan.price.earlyBird : plan.price.normal}
                    </div>
                    {isEarlyBirdActive && (
                      <div className="text-xs text-muted-foreground line-through">
                        {plan.price.normal}
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {benefit[language === 'en' ? 'en' : 'ro']}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Loading...' : 'Se încarcă...'}
                    </>
                  ) : (
                    language === 'en' ? 'Choose Plan' : 'Alege Planul'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="ghost" onClick={onClose} className="mt-2">
          {language === 'en' ? 'Maybe Later' : 'Poate Mai Târziu'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
