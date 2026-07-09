import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sword, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

const WarriorWelcome = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const authUrl = isEn ? '/en/auth' : '/auth';
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<'processing' | 'ready' | 'error'>('processing');

  useEffect(() => {
    // Poll briefly for the webhook to complete. Stripe webhook activates the routine
    // asynchronously; give it a few seconds to land.
    let attempts = 0;
    const maxAttempts = 8;
    const check = async () => {
      attempts += 1;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setStatus('ready');
          return;
        }
      } catch {}
      if (attempts >= maxAttempts) {
        setStatus('ready'); // fall through to magic-link CTA
        return;
      }
      setTimeout(check, 1500);
    };
    if (sessionId) check();
    else setStatus('ready');
  }, [sessionId]);

  return (
    <>
      <Helmet>
        <title>{isEn ? 'Welcome, Warrior! · CEO Mind OS' : 'Bun venit, Warrior! · CEO Mind OS'}</title>
        <meta name="description" content={isEn ? 'Your Warrior routine is live. Log in with the magic link and begin day 1.' : 'Rutina ta de Warrior este activă. Autentifică-te cu magic link și începe ziua 1.'} />
        <link rel="canonical" href={`https://ceomindos.com${isEn ? '/en/warrior/welcome' : '/warrior/welcome'}`} />
        <meta property="og:url" content={`https://ceomindos.com${isEn ? '/en/warrior/welcome' : '/warrior/welcome'}`} />
        <meta property="og:title" content={isEn ? 'Welcome, Warrior! · CEO Mind OS' : 'Bun venit, Warrior! · CEO Mind OS'} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="alternate" hrefLang="ro" href="https://ceomindos.com/warrior/welcome" />
        <link rel="alternate" hrefLang="en" href="https://ceomindos.com/en/warrior/welcome" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-white/5 border-white/10 p-8 md:p-10 text-center space-y-6">
            <div className="flex justify-center">
              {status === 'processing' ? (
                <Loader2 className="w-12 h-12 animate-spin text-[#D4A84A]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#D4A84A]/15 border border-[#D4A84A]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#D4A84A]" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#D4A84A] text-xs uppercase tracking-wider">
                <Sword className="w-3 h-3" /> {isEn ? 'Welcome, Warrior' : 'Bun venit, Warrior'}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {status === 'processing'
                  ? (isEn ? 'Setting up your routine...' : 'Configurez rutina ta...')
                  : (isEn ? 'Your routine is live! ⚔️' : 'Rutina ta e activă! ⚔️')}
              </h1>
              <p className="text-white/70">
                {status === 'processing'
                  ? (isEn
                      ? 'Creating your account and applying your personalized routine. Just a few seconds...'
                      : 'Îți creez contul și îți aplicăm rutina personalizată. Câteva secunde...')
                  : (isEn
                      ? 'Your 7-day trial has started. We sent you an email with your account access link.'
                      : 'Trialul de 7 zile a pornit. Ți-am trimis un email cu link de acces la cont.')}
              </p>
            </div>

            {status !== 'processing' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-lg bg-[#D4A84A]/5 border border-[#D4A84A]/20 text-left flex gap-3">
                  <Mail className="w-5 h-5 text-[#D4A84A] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/85">
                    <div className="font-semibold text-white mb-1">
                      {isEn ? 'Check your inbox' : 'Check inbox-ul tău'}
                    </div>
                    {isEn
                      ? 'We sent the magic link for access + trial confirmation. Check spam if you don\'t see it within 2 min.'
                      : 'Am trimis link-ul magic pentru acces + confirmarea trialului. Verifică și spam dacă nu-l vezi în 2 min.'}
                  </div>
                </div>

                <Button asChild size="lg" className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 w-full">
                  <Link to={authUrl}>
                    {isEn ? 'Log in to account' : 'Log in la cont'} <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                <p className="text-xs text-white/50">
                  {isEn
                    ? 'Free 7-day trial · then $9/month · cancel anytime in Settings'
                    : 'Trial gratuit 7 zile · apoi 7€/lună · anulezi oricând din Setări'}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default WarriorWelcome;
