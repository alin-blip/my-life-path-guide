import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield, Lock, ArrowRight } from 'lucide-react';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';

const PLAN_ID = 'basic';
const PLAN_VALUE = 49;

export const ChallengePremiumOffer = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isRo = language === 'ro';

  const handleActivate = async () => {
    const preOpened = preOpenWindow();
    setLoading(true);
    trackCheckoutInitiated(PLAN_ID, PLAN_VALUE);

    const sessionId = sessionStorage.getItem('crm_session_id')
      || `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('crm_session_id', sessionId);
    supabase.from('checkout_events').insert({
      event_type: 'checkout_initiated',
      plan_id: PLAN_ID,
      source: 'challenge-7-zile',
      session_id: sessionId,
      metadata: { value: PLAN_VALUE, path: window.location.pathname, guest: true },
    }).then(() => {});

    try {
      const utmRaw = localStorage.getItem('utm_data');
      const utm = utmRaw ? JSON.parse(utmRaw) : undefined;
      // Guest checkout — Stripe collects email + card; webhook creates account after payment
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: PLAN_ID,
          source: 'challenge-7-zile',
          language: isRo ? 'ro' : 'en',
          utm,
        }
      });

      if (error) { if (preOpened) preOpened.close(); throw error; }
      if (data?.url) {
        supabase.from('checkout_events').insert({
          event_type: 'checkout_redirected',
          plan_id: PLAN_ID,
          source: 'challenge-7-zile',
          session_id: sessionId,
          metadata: { value: PLAN_VALUE, guest: true },
        }).then(() => {});
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      supabase.from('checkout_events').insert({
        event_type: 'checkout_error',
        plan_id: PLAN_ID,
        source: 'challenge-7-zile',
        session_id: sessionId,
        error_message: (error as any)?.message?.slice(0, 500) || 'unknown',
        metadata: { value: PLAN_VALUE, guest: true },
      }).then(() => {});
      toast.error(isRo ? 'Eroare la creare checkout' : 'Error creating checkout');
    } finally {
      setLoading(false);
    }
  };

  const price = isRo ? '249 LEI' : '€49';
  const originalPrice = isRo ? '490 LEI' : '€97';
  const period = isRo ? '/lună' : '/month';

  return (
    <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 border-primary/20 max-w-2xl mx-auto">
      <div className="text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {isRo ? 'Ai trecut prin burnout.' : "You've been through burnout."}
        </h2>
        <h2 className="text-3xl md:text-4xl font-bold text-amber-500 mt-1 leading-tight">
          {isRo ? 'Acum construiește ceva din el.' : 'Now build something out of it.'}
        </h2>

        {/* Subcopy */}
        <p className="text-base md:text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
          {isRo
            ? 'În 7 zile, nu doar înveți — implementezi un sistem complet care rulează dimineața, în business, în relații.'
            : 'In 7 days you don\'t just learn — you implement a complete system that runs your mornings, your business, your relationships.'}
        </p>

        {/* Price */}
        <div className="my-8">
          <div className="flex items-baseline justify-center gap-2 flex-wrap">
            <span className="text-lg text-muted-foreground line-through">{originalPrice}</span>
            <span className="text-5xl md:text-6xl font-bold text-amber-500">{price}</span>
            <span className="text-xl text-muted-foreground">{period}</span>
          </div>
          <p className="text-base text-foreground mt-3 font-medium">
            {isRo
              ? '7 zile gratuite. Nu pierzi nimic dacă anulezi.'
              : '7 days free. You lose nothing if you cancel.'}
          </p>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          onClick={handleActivate}
          disabled={loading}
          className="w-full md:w-auto text-lg px-10 py-6 h-auto font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {isRo ? 'Transformă burnout-ul în oportunitate!' : 'Turn burnout into opportunity!'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        {/* Micro-trust */}
        <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          {isRo
            ? 'Taxăm doar după 7 zile. Doar dacă continui.'
            : 'We only charge after 7 days. Only if you continue.'}
        </p>

        {/* What you build */}
        <div className="mt-10 text-left max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            {isRo ? 'Ce construiești în 7 zile:' : "What you build in 7 days:"}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold text-lg leading-tight">→</span>
              <span className="text-foreground">
                {isRo
                  ? 'Warrior Routine de 45 min (dimineața, zero telefon)'
                  : '45-min Warrior Routine (morning, zero phone)'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold text-lg leading-tight">→</span>
              <span className="text-foreground">
                {isRo
                  ? 'Primul tău Domino Door (focus pe ce contează)'
                  : 'Your first Domino Door (focus on what matters)'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold text-lg leading-tight">→</span>
              <span className="text-foreground">
                {isRo
                  ? 'Master Plan pe 90 zile (hartă clară pentru business)'
                  : '90-day Master Plan (clear map for your business)'}
              </span>
            </li>
          </ul>
        </div>

        {/* Guarantee */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex items-start justify-center gap-2 text-sm text-muted-foreground max-w-lg mx-auto">
            <Shield className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>
              {isRo
                ? 'Garanție 100% — dacă nu vezi valoare în 7 zile, anulezi și nu plătești. Fără telefon, fără explicații.'
                : '100% guarantee — if you don\'t see value in 7 days, cancel and pay nothing. No phone calls, no explanations.'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
