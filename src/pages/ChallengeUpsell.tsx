import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Rocket, Check, ArrowRight, Shield, Star, Loader2, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { trackEvent, trackCheckoutInitiated, trackPurchase } from '@/lib/facebook-pixel';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

const ChallengeUpsell = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const voomlyLoaded = useRef(false);

  const isCheckoutSuccess = searchParams.get('checkout') === 'success';

  useEffect(() => {
    if (!isCheckoutSuccess) {
      navigate('/challenge', { replace: true });
      return;
    }
    trackEvent('ViewContent', { content_name: 'challenge_upsell' });
  }, [isCheckoutSuccess, navigate]);

  // Load Voomly embed script
  useEffect(() => {
    if (voomlyLoaded.current) return;
    voomlyLoaded.current = true;
    const script = document.createElement('script');
    script.src = 'https://embed.voomly.softwarepublishingapp.com/embed/embed-build.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  const handleCheckout = async (planId: string, value: number) => {
    const preOpened = preOpenWindow();
    
    if (!user) {
      if (preOpened) preOpened.close();
      toast.info('Trebuie să fii autentificat');
      return;
    }

    setLoadingPlan(planId);
    trackCheckoutInitiated(planId, value);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-upsell', utm: getStoredUtm() || undefined },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` }
      });

      if (error) { if (preOpened) preOpened.close(); throw error; }
      if (data?.url) {
        trackPurchase(value);
        redirectExternal(data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        throw new Error('Nu s-a putut crea sesiunea de checkout');
      }
    } catch (error) {
      console.error('Upsell checkout error:', error);
      toast.error('Eroare la procesarea plății. Încearcă din nou.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!isCheckoutSuccess) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30 text-sm px-4 py-1">
            ✅ Plata confirmată cu succes!
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            🎉 Felicitări! Ai făcut primul pas.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acum ai acces complet la Challenge. Dar înainte să intri, avem o ofertă 
            <span className="text-amber-500 font-semibold"> exclusivă </span>
            disponibilă doar ACUM:
          </p>
        </div>

        {/* Voomly Video */}
        <div className="max-w-3xl mx-auto mb-8">
          <div 
            className="voomly-embed" 
            data-id="G5IbvhsenY2gmA1ZIhmdw6vEGFgnMDiWaW8qLjJNHd1D2xIpf" 
            data-ratio="1.777778" 
            data-type="v" 
            data-skin-color="#2758EB" 
            data-shadow="" 
            style={{ width: '100%', aspectRatio: '1.77778 / 1', background: 'linear-gradient(45deg, rgb(142, 150, 164) 0%, rgb(201, 208, 222) 100%)', borderRadius: '10px' }}
          />
        </div>

        {/* Upsell Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Warrior Certified Coach - Early Bird */}
          <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-card to-orange-500/5 ring-2 ring-amber-500/30">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 py-1.5 text-center">
              <span className="text-white text-xs font-bold tracking-wider">
                🔥 OFERTĂ LIMITATĂ - DOAR ACUM
              </span>
            </div>
            <CardContent className="p-6 pt-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Warrior Certified Coach</h3>
                  <p className="text-sm text-muted-foreground">Program premium de transformare</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  '47+ lecții video premium',
                  '8 module complete de învățare',
                  'Framework de transformare în 90 de zile',
                  'Certificare oficială Warrior Coach',
                  'Acces pe viață la toate update-urile',
                  'Garanție 90 de zile satisfacție',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-muted/50 rounded-lg p-4 text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-muted-foreground line-through text-lg">€1.999</span>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">-50%</Badge>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-amber-500">€999</span>
                  <span className="text-muted-foreground text-sm">o singură plată</span>
                </div>
              </div>

              <Button
                onClick={() => handleCheckout('warrior-accelerator-earlybird', 999)}
                disabled={loadingPlan !== null}
                className="w-full py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {loadingPlan === 'warrior-accelerator-earlybird' ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Se procesează...</>
                ) : (
                  <><Rocket className="w-5 h-5 mr-2" /> Vreau Warrior Coach - €999 <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Elite Subscription */}
          <Card className="relative overflow-hidden border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 via-card to-violet-500/5">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-violet-500 py-1.5 text-center">
              <span className="text-white text-xs font-bold tracking-wider">
                ⭐ ACCES COMPLET LA TOT
              </span>
            </div>
            <CardContent className="p-6 pt-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Abonament Elite</h3>
                  <p className="text-sm text-muted-foreground">Pachetul complet de transformare</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  'Tot ce include Pro +',
                  'Warrior Certified Coach inclus (€1.999)',
                  'Coaching LIVE săptămânal cu Alin Radu',
                  'Elite Brotherhood exclusiv',
                  'Coach Dashboard + 50% comision lifetime',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-muted/50 rounded-lg p-4 text-center mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-purple-500">€297</span>
                  <span className="text-muted-foreground text-sm">/ lună</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Plată directă, fără trial</p>
              </div>

              <Button
                onClick={() => handleCheckout('elite', 297)}
                disabled={loadingPlan !== null}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
              >
                {loadingPlan === 'elite' ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Se procesează...</>
                ) : (
                  <><Crown className="w-5 h-5 mr-2" /> Începe Elite - €297/lună <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skip / No thanks */}
        <div className="text-center space-y-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/challenge')}
            className="text-muted-foreground hover:text-foreground text-base"
          >
            Nu mersi, vreau să intru pe platformă →
          </Button>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Garanție 100% satisfacție. Anulezi oricând.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeUpsell;
