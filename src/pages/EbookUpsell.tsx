import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { CountdownTimer } from '@/components/ebook/CountdownTimer';
import { ValueStack } from '@/components/ebook/ValueStack';
import { useLocation, useNavigate } from 'react-router-dom';
import { Rocket, Shield, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import heroUpsell from '@/assets/ebook/hero_upsell.webp';

const EbookUpsell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = location.pathname.includes('-en') ? 'en' : 'ro';
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  const t = language === 'ro'
    ? {
        seoTitle: 'Pachetul Accelerator — Ofertă Exclusivă | CEO Mind OS',
        seoDesc: 'Accelerează-ți transformarea cu Audiobook + Challenge 90 de Zile la doar 99 LEI.',
        badge: 'OFERTĂ EXCLUSIVĂ — DOAR PE ACEASTĂ PAGINĂ',
        h1: 'Felicitări! Cartea ta e pe drum.',
        sub: 'Cartea îți dă cunoașterea. Dar cunoașterea fără execuție este inutilă.',
        sub2: 'De aceea am creat pachetul Accelerator — designat să te ducă de la citit la implementat.',
        cta: 'Da! Vreau Pachetul Accelerator',
        dismiss: 'Nu, mulțumesc. Vreau doar cartea gratuită.',
        guarantee: 'Garanție 100% — Fără Risc',
        guaranteeDesc: 'Dacă în 30 de zile nu simți o diferență reală în claritatea, energia și productivitatea ta, îți returnez banii. Fără întrebări.',
        thankYou: '/ebook-multumesc',
        success: '/ebook-plata-reusita',
        comp1: { label: 'Componenta 1', title: 'Audiobook-ul Complet', desc: 'Ascultă cartea cu vocea autorului. Peste 2 ore de conținut narrat de Alin F. Radu — în mașină, la sală, în pauza de masă.', value: '149 lei' },
        comp2: { label: 'Componenta 2', title: 'Challenge-ul "90 de Zile"', desc: 'Ghid pas cu pas de implementare. 90 de zile de acțiuni zilnice structurate, template-uri completate, checklist-uri de execuție.', value: '249 lei' },
        comp3: { label: 'Bonus', title: 'Template-uri Printabile', desc: 'Worksheet-uri printabile pentru The Door, The Stack și Rutina Zilnică — gata de completat.', value: '99 lei' },
        comp4: { label: 'Bonus', title: 'Comunitate Privată', desc: 'Acces 30 de zile la comunitatea privată de accountability — alături de alți antreprenori care implementează CEO Mind OS.', value: '97 lei' },
      }
    : {
        seoTitle: 'Accelerator Package — Exclusive Offer | CEO Mind OS',
        seoDesc: 'Accelerate your transformation with Audiobook + 90-Day Challenge for only $29.',
        badge: 'EXCLUSIVE OFFER — ONLY ON THIS PAGE',
        h1: 'Congratulations! Your book is on its way.',
        sub: 'The book gives you knowledge. But knowledge without execution is useless.',
        sub2: 'That\'s why we created the Accelerator package — designed to take you from reading to implementing.',
        cta: 'Yes! I Want the Accelerator Package',
        dismiss: 'No thanks. I just want the free book.',
        guarantee: '100% Guarantee — Zero Risk',
        guaranteeDesc: 'If in 30 days you don\'t feel a real difference in your clarity, energy and productivity, I\'ll refund your money. No questions asked.',
        thankYou: '/ebook-thank-you',
        success: '/ebook-payment-success',
        comp1: { label: 'Component 1', title: 'Complete Audiobook', desc: 'Listen to the book narrated professionally. 1 hour 20 minutes of content — in your car, at the gym, during lunch.', value: '$39' },
        comp2: { label: 'Component 2', title: '90-Day Challenge', desc: 'Step-by-step implementation guide. 90 days of structured daily actions, completed templates, execution checklists.', value: '$59' },
        comp3: { label: 'Bonus', title: 'Printable Templates', desc: 'Printable worksheets for The Door, The Stack and Daily Routine — ready to fill in.', value: '$29' },
        comp4: { label: 'Bonus', title: 'Private Community', desc: '30-day access to the private accountability community — alongside other entrepreneurs implementing CEO Mind OS.', value: '$19' },
      };

  const components = [t.comp1, t.comp2, t.comp3, t.comp4];

  const handleBuy = async () => {
    const preOpened = preOpenWindow();

    if (!user) {
      if (preOpened) preOpened.close();
      toast.info(language === 'ro' ? 'Trebuie să fii autentificat' : 'You need to be logged in');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-checkout', {
        body: { plan: language === 'en' ? 'ebook-accelerator-en' : 'ebook-accelerator', source: `ebook_upsell_${language}` },
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
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
    } catch (error) {
      console.error('Checkout error:', error);
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
      <CountdownTimer language={language} />

      <section className="py-16 px-6 text-center max-w-4xl mx-auto">
        <span className="inline-block text-xs tracking-[0.15em] text-white/50 border border-white/10 rounded-full px-4 py-2 mb-8 uppercase">
          {t.badge}
        </span>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.h1}</h1>
        <p className="text-white/60 text-lg mb-2">
          {language === 'ro' ? 'Cartea îți dă ' : 'The book gives you '}
          <strong className="text-white">{language === 'ro' ? 'cunoașterea' : 'knowledge'}</strong>
          {language === 'ro' ? '. Dar cunoașterea fără execuție este inutilă.' : '. But knowledge without execution is useless.'}
        </p>
        <p className="text-white/50 mb-12">
          {language === 'ro' ? 'De aceea am creat pachetul ' : 'That\'s why we created the '}
          <span className="text-amber-400">Accelerator</span>
          {language === 'ro' ? ' — designat să te ducă de la citit la implementat.' : ' — designed to take you from reading to implementing.'}
        </p>

        <img
          src={heroUpsell}
          alt="Accelerator Package"
          className="w-full max-w-2xl mx-auto rounded-lg mb-16"
        />

        {/* Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left">
          {components.map((comp, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
              <span className="text-xs text-amber-400/60 uppercase tracking-wider">{comp.label}</span>
              <h3 className="text-white font-bold text-lg mt-1 mb-2">{comp.title}</h3>
              <p className="text-white/50 text-sm mb-3">{comp.desc}</p>
              <p className="text-white/30 text-sm">
                {language === 'ro' ? 'Valoare: ' : 'Value: '}
                <span className="line-through">{comp.value}</span>
              </p>
            </div>
          ))}
        </div>

        <ValueStack language={language} />

        <div className="mt-10 space-y-4 max-w-md mx-auto">
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
            onClick={() => navigate(t.thankYou)}
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
