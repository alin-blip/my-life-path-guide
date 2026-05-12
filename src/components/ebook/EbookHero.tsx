import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Headphones, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUtmMetadata } from '@/hooks/useUtmCapture';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import heroLanding from '@/assets/ebook/hero_landing.webp';
import ebookBundle from '@/assets/ebook-bundle.png';

interface EbookHeroProps {
  language: 'ro' | 'en';
}

export const EbookHero: React.FC<EbookHeroProps> = ({ language }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bundle, setBundle] = useState(true);
  const [loading, setLoading] = useState(false);

  // Prefill from burnout test capture
  useEffect(() => {
    const n = sessionStorage.getItem('ebook_lead_name');
    const e = sessionStorage.getItem('ebook_lead_email');
    if (n) setName(n);
    if (e) setEmail(e);
  }, []);

  const t = language === 'ro'
    ? {
        badge: 'CEO MIND OS — DE LA BURNOUT LA PEAK PERFORMANCE',
        h1a: 'Cartea care te scoate ',
        h1b: 'din burnout',
        h1c: ' — în 90 de zile.',
        desc: 'Primește instant ebook-ul + (opțional) audiobook-ul cu vocea autorului. Sistemul testat de antreprenori care au trecut de la haos la claritate.',
        namePh: 'Prenumele tău',
        emailPh: 'Adresa ta de email',
        bumpTitle: '+ Adaugă audiobook-ul (vocea autorului)',
        bumpDesc: 'Ascultă-l în mașină, la sală, în pauză. Doar +35 LEI (în loc de 149 LEI).',
        priceOnly: '35 LEI',
        priceBundle: '70 LEI',
        cta: 'CUMPĂRĂ ACUM',
        spam: 'Plată sigură cu Stripe • Garanție 30 zile.',
      }
    : {
        badge: 'CEO MIND OS — FROM BURNOUT TO PEAK PERFORMANCE',
        h1a: 'The book that pulls you ',
        h1b: 'out of burnout',
        h1c: ' — in 90 days.',
        desc: 'Get instant access to the ebook + (optional) audiobook narrated by the author. The proven system entrepreneurs use to go from chaos to clarity.',
        namePh: 'Your first name',
        emailPh: 'Your email address',
        bumpTitle: '+ Add the audiobook (author\'s voice)',
        bumpDesc: 'Listen in your car, at the gym, on a walk. Only +$7 (regular $39).',
        priceOnly: '$7',
        priceBundle: '$14',
        cta: 'GET INSTANT ACCESS',
        spam: 'Secure Stripe checkout • 30-day guarantee.',
      };

  const planFor = () => {
    if (language === 'ro') return bundle ? 'ebook-bundle' : 'ebook-only';
    return bundle ? 'ebook-bundle-en' : 'ebook-only-en';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const preOpened = preOpenWindow();

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Lead capture (idempotent)
      try {
        const utmMeta = getUtmMetadata();
        await supabase.from('email_leads').insert({
          email: cleanEmail,
          name: cleanName || null,
          lead_magnet: 'ebook_burnout',
          source: `ebook_landing_${language}`,
          subscribed: true,
          metadata: { ...utmMeta, bundle },
        });
      } catch {/* ignore duplicates */}

      // Auto-create account if not logged in
      let session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        const tempPwd = crypto.randomUUID().replace(/-/g, '') + 'A1!';
        const { error: signErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: tempPwd,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: cleanName, source: 'ebook_funnel' },
          },
        });
        if (signErr && !signErr.message.toLowerCase().includes('already')) {
          console.warn('Signup warning:', signErr.message);
        }
        session = (await supabase.auth.getSession()).data.session;
      }

      sessionStorage.setItem('ebook_lead_name', cleanName);
      sessionStorage.setItem('ebook_lead_email', cleanEmail);

      // Create checkout
      const response = await supabase.functions.invoke('create-checkout', {
        body: { plan: planFor(), source: `ebook_landing_${language}` },
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      if (response.error) {
        if (preOpened) preOpened.close();
        // If no auth (user must verify email first), fallback to /auth
        if (response.error.message?.includes('authoriz')) {
          toast.info(language === 'ro' ? 'Te rugăm să te autentifici pentru a finaliza plata.' : 'Please log in to complete checkout.');
          navigate('/auth');
          return;
        }
        throw new Error(response.error.message);
      }

      if (response.data?.url) {
        redirectExternal(response.data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        throw new Error('No checkout URL');
      }
    } catch (err) {
      console.error('Ebook checkout error:', err);
      if (preOpened) try { preOpened.close(); } catch {/* ignore */}
      toast.error(language === 'ro' ? 'Eroare. Încearcă din nou.' : 'Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <p className="text-xs tracking-[0.2em] text-amber-400/80 uppercase mb-6">{t.badge}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t.h1a}
            <em className="italic text-amber-400">{t.h1b}</em>
            {t.h1c}
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-lg">{t.desc}</p>

          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePh}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPh}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
            />

            {/* Order bump */}
            <label
              htmlFor="audiobookBump"
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                bundle
                  ? 'border-amber-400 bg-amber-400/5'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <input
                id="audiobookBump"
                type="checkbox"
                checked={bundle}
                onChange={(e) => setBundle(e.target.checked)}
                className="mt-1 w-5 h-5 accent-amber-400 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  {t.bumpTitle}
                </div>
                <p className="text-white/50 text-xs mt-1">{t.bumpDesc}</p>
              </div>
              <img
                src={ebookBundle}
                alt="Book + Audiobook bundle"
                className="w-20 h-20 object-contain shrink-0 hidden sm:block"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  {t.cta} — {bundle ? t.priceBundle : t.priceOnly}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-white/30 text-xs mt-3">{t.spam}</p>
        </div>

        {/* Right - Book image */}
        <div className="flex justify-center lg:justify-end">
          <img
            src={heroLanding}
            alt="CEO Mind OS — De la Burnout la Peak Performance și Echilibru"
            className="w-full max-w-lg rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};
