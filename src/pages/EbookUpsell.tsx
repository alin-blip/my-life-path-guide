import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { Rocket, Shield, Loader2, ArrowRight, CheckCircle2, Calendar, Users, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';

const EbookUpsell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language: 'ro' | 'en' = location.pathname.includes('-en') ? 'en' : 'ro';
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  const t = language === 'ro'
    ? {
        seoTitle: 'Challenge 7 Zile + 14 Zile Pro Gratis — Ofertă Exclusivă | CEO Mind OS',
        seoDesc: 'Challenge 7 zile cu Alin la 485 LEI + 14 zile Pro gratis, apoi 245 LEI/lună. Ofertă unică, doar acum.',
        badge: 'OFERTĂ EXCLUSIVĂ — DOAR PE ACEASTĂ PAGINĂ',
        h1: 'Următorul pas: Challenge-ul de 7 Zile cu Alin',
        sub: 'Cartea îți dă harta. Challenge-ul te ia de mână 7 zile și te pune în mișcare.',
        priceLine: '485 LEI plată unică + 14 ZILE GRATIS la platforma Pro',
        priceSub: 'apoi doar 245 LEI/lună • anulezi oricând',
        cta: 'DA — Vreau Challenge-ul + 14 Zile Pro',
        dismiss: 'Nu, mulțumesc. Doar cartea pentru acum.',
        guarantee: 'Garanție 30 de zile — fără risc',
        guaranteeDesc: 'Dacă în primele 30 de zile nu vezi o transformare reală, îți returnez banii integral. Fără întrebări.',
        items: [
          { icon: Calendar, title: 'Challenge 7 Zile cu Alin', desc: 'O temă pe zi, ghidaje video, accountability zilnic. De la "vreau" la "fac".' },
          { icon: Zap, title: '14 zile GRATIS la CEO Mind OS Pro', desc: 'Rutine zilnice, AI Coach, Domino Door, Stack-uri emoționale, comunitate privată.' },
          { icon: Trophy, title: 'Plan personalizat de recuperare', desc: 'Bazat pe scorul tău din testul de burnout — focus pe zona ta cea mai slabă.' },
          { icon: Users, title: 'Comunitate de antreprenori', desc: 'Acces la grupul privat, suport zilnic, peer accountability.' },
        ],
      }
    : {
        seoTitle: '7-Day Challenge + 14-Day Pro Trial — Exclusive Offer | CEO Mind OS',
        seoDesc: '7-day Challenge with Alin for $97 + 14 days free Pro, then $49/month. One-time offer.',
        badge: 'EXCLUSIVE OFFER — ONLY ON THIS PAGE',
        h1: 'Next step: The 7-Day Challenge with Alin',
        sub: 'The book gives you the map. The Challenge takes you by the hand for 7 days and puts you in motion.',
        priceLine: '$97 one-time + 14 DAYS FREE on the Pro platform',
        priceSub: 'then just $49/month • cancel anytime',
        cta: 'YES — I want the Challenge + 14 Days Pro',
        dismiss: 'No thanks. Just the book for now.',
        guarantee: '30-day guarantee — zero risk',
        guaranteeDesc: 'If you don\'t see a real transformation in the first 30 days, I\'ll refund your money in full. No questions asked.',
        items: [
          { icon: Calendar, title: '7-Day Challenge with Alin', desc: 'One theme per day, video guidance, daily accountability. From "I want to" to "I\'m doing it".' },
          { icon: Zap, title: '14 days FREE on CEO Mind OS Pro', desc: 'Daily routines, AI Coach, Domino Door, emotional Stacks, private community.' },
          { icon: Trophy, title: 'Personalized recovery plan', desc: 'Based on your burnout test score — focused on your weakest area.' },
          { icon: Users, title: 'Entrepreneur community', desc: 'Access to the private group, daily support, peer accountability.' },
        ],
      };

  const handleBuy = async () => {
    const preOpened = preOpenWindow();
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (preOpened) preOpened.close();
        toast.info(language === 'ro' ? 'Te rugăm să te autentifici.' : 'Please log in.');
        navigate('/auth');
        return;
      }
      const plan = language === 'en' ? 'challenge-plus-trial-en' : 'challenge-plus-trial';
      const response = await supabase.functions.invoke('create-checkout', {
        body: { plan, source: `ebook_upsell_${language}` },
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
      });
      if (response.error) {
        if (preOpened) preOpened.close();
        throw new Error(response.error.message);
      }
      if (response.data?.url) {
        redirectExternal(response.data.url, preOpened);
      } else {
        if (preOpened) preOpened.close();
        throw new Error('Checkout session failed');
      }
    } catch (err) {
      console.error('Challenge upsell error:', err);
      toast.error(language === 'ro' ? 'Eroare la procesarea plății.' : 'Payment processing error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10172d] text-white">
      <Helmet>
        <title>{t.seoTitle}</title>
        <meta name="description" content={t.seoDesc} />
      </Helmet>

      <EbookNav language={language} />

      <section className="py-16 px-6 text-center max-w-4xl mx-auto">
        <span className="inline-block text-xs tracking-[0.15em] text-white/50 border border-white/10 rounded-full px-4 py-2 mb-8 uppercase">
          {t.badge}
        </span>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.h1}</h1>
        <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">{t.sub}</p>

        {/* Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          {t.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
          <p className="text-amber-400 font-bold text-lg mb-1">{t.priceLine}</p>
          <p className="text-white/60 text-sm">{t.priceSub}</p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                {t.cta}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            {t.dismiss}
          </button>
        </div>

        {/* Guarantee */}
        <div className="mt-16 bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 max-w-2xl mx-auto text-center">
          <Shield className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-2">{t.guarantee}</h3>
          <p className="text-white/50 text-sm">{t.guaranteeDesc}</p>
        </div>
      </section>
    </div>
  );
};

export default EbookUpsell;
