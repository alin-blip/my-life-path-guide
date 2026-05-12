import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { EbookNav } from '@/components/ebook/EbookNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket, Shield, Loader2, ArrowRight, ChevronDown,
  Dumbbell, Brain, Heart, Target, Map, Crown, Sparkles, Bell, Trophy,
  Users, Star, Gift,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { trackCheckoutInitiated } from '@/lib/facebook-pixel';

const EbookUpsell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language: 'ro' | 'en' = location.pathname.includes('-en') ? 'en' : 'ro';
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => { document.documentElement.classList.remove('dark'); };
  }, []);

  const isRo = language === 'ro';

  const seoTitle = isRo
    ? 'Challenge 7 Zile + 14 Zile Pro Gratis — Ofertă Exclusivă | CEO Mind OS'
    : '7-Day Challenge + 14-Day Pro Trial — Exclusive Offer | CEO Mind OS';
  const seoDesc = isRo
    ? 'Challenge 7 zile cu Alin la 485 LEI + 14 zile Pro gratis, apoi 245 LEI/lună. Ofertă unică, doar acum.'
    : '7-day Challenge with Alin for $97 + 14 days free Pro, then $49/month. One-time offer.';

  const challengeDays = [
    { day: 1, icon: Map, title: isRo ? 'Viziune & Declarație' : 'Vision & Declaration', desc: isRo ? 'Viziune Napoleon Hill + Join comunitate + Invită prieteni' : 'Napoleon Hill vision + Join community + Invite friends', color: 'from-purple-500 to-indigo-500' },
    { day: 2, icon: Target, title: isRo ? 'Corp + Spirit + Relații' : 'Body + Spirit + Relationships', desc: isRo ? 'Obiective pentru toate cele 3 arii personale' : 'Set objectives for all 3 personal areas', color: 'from-green-500 to-purple-500' },
    { day: 3, icon: Target, title: isRo ? 'Business + Domino Door' : 'Business + Domino Door', desc: isRo ? 'Viziune business + 90 zile + Lunar + Door săptămânal' : 'Business vision + 90 days + Monthly + Weekly Door', color: 'from-blue-500 to-cyan-500' },
    { day: 4, icon: Crown, title: isRo ? 'Rutina Warrior + Vision AI' : 'Warrior Routine + Vision AI', desc: isRo ? 'Flow zilnic + Imagini AI + Meditație personalizată' : 'Daily flow + AI images + Personalized meditation', color: 'from-amber-500 to-orange-500' },
    { day: 5, icon: Sparkles, title: isRo ? 'Accountability + Mind Coach' : 'Accountability + Mind Coach', desc: isRo ? 'Status check + Transformă emoțiile în putere' : 'Status check + Transform emotions into power', color: 'from-cyan-500 to-blue-500' },
    { day: 6, icon: Bell, title: isRo ? 'Lista de Idei (Filtru Strategic)' : 'Idea List (Strategic Filter)', desc: isRo ? 'Controlul impulsului + Clasificare Eisenhower' : 'Control impulse + Eisenhower classification', color: 'from-red-500 to-pink-500' },
    { day: 7, icon: Trophy, title: isRo ? 'Membership + Continuitate' : 'Membership + Continuity', desc: isRo ? 'Recapitulare + Upgrade + Invitații finale' : 'Recap + Upgrade + Final referral push', color: 'from-amber-500 to-yellow-600' },
  ];

  const pillars = [
    { icon: Dumbbell, label: isRo ? 'Corp' : 'Body', desc: isRo ? 'Oprește oboseala cronică și recapătă energia' : 'Stop chronic fatigue & reclaim your energy' },
    { icon: Brain, label: isRo ? 'Spirit' : 'Being', desc: isRo ? 'Recapătă pacea interioară și claritatea mentală' : 'Regain inner peace & mental clarity' },
    { icon: Heart, label: isRo ? 'Relații' : 'Balance', desc: isRo ? 'Reconstruiește conexiunile neglijate' : 'Rebuild neglected connections' },
    { icon: Target, label: 'Business', desc: isRo ? 'De la haos la execuție focusată' : 'From overwhelm to focused execution' },
  ];

  const benefits = [
    { icon: Target, text: isRo ? 'Oprești ciclul procrastinării' : 'Break the procrastination cycle' },
    { icon: Rocket, text: isRo ? 'Ieși din burnout strategic' : 'Strategic burnout recovery plan' },
    { icon: Sparkles, text: isRo ? 'Recapătă energia și focusul' : 'Reclaim your energy & focus' },
    { icon: Star, text: isRo ? 'Construiești momentum zilnic' : 'Build daily momentum' },
    { icon: Users, text: isRo ? 'Comunitate care te ține responsabil' : 'Community that holds you accountable' },
    { icon: Gift, text: isRo ? '14 zile Pro GRATIS' : '14 days Pro FREE' },
  ];

  const faqItems = [
    {
      q: isRo ? 'Cât timp durează pe zi?' : 'How much time does it take per day?',
      a: isRo ? 'Doar 15 minute pe zi. Fiecare modul este scurt dar impactant — pași mici, impact mare.' : 'Just 15 minutes per day. Each module is short but impactful — small steps, big impact.',
    },
    {
      q: isRo ? 'Cum funcționează prețul?' : 'How does the pricing work?',
      a: isRo ? 'Plătești 485 LEI o singură dată pentru Challenge + 14 zile Pro gratis. Apoi doar 245 LEI/lună pentru platforma completă. Anulezi oricând.' : 'You pay $97 one-time for the Challenge + 14 days Pro free. Then just $49/month for the full platform. Cancel anytime.',
    },
    {
      q: isRo ? 'Ce se întâmplă după cele 7 zile?' : 'What happens after the 7 days?',
      a: isRo ? 'Ai în continuare acces 14 zile gratis la întreaga platformă Pro. Dacă rămâi, plătești 245 LEI/lună. Anulezi oricând.' : "You still get 14 days free on the full Pro platform. If you stay, you pay $49/month. Cancel anytime.",
    },
    {
      q: isRo ? 'Funcționează pe mobil?' : 'Does it work on mobile?',
      a: isRo ? 'Da, platforma este 100% responsive și optimizată pentru mobil.' : 'Yes, the platform is 100% responsive and optimized for mobile.',
    },
  ];

  const handleBuy = async () => {
    const plan = isRo ? 'challenge-plus-trial' : 'challenge-plus-trial-en';
    const value = isRo ? 485 : 97;
    trackCheckoutInitiated(plan, value);
    const preOpened = preOpenWindow();
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (preOpened) preOpened.close();
        localStorage.setItem('pending_challenge_plan', JSON.stringify({ planId: plan, value }));
        toast.info(isRo ? 'Te rugăm să te autentifici.' : 'Please log in.');
        navigate('/auth');
        return;
      }
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
      toast.error(isRo ? 'Eroare la procesarea plății.' : 'Payment processing error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10172d] text-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Helmet>

      <EbookNav language={language} />

      {/* Delivery confirmation banner */}
      <section className="pt-8 px-4">
        <div className="max-w-3xl mx-auto bg-emerald-500/10 border border-emerald-400/30 rounded-2xl px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="text-sm md:text-base">
            <p className="text-emerald-300 font-semibold mb-0.5">
              {isRo ? '✅ Plata confirmată — fișierele au fost trimise pe email' : '✅ Payment confirmed — your files have been sent by email'}
            </p>
            <p className="text-white/70">
              {isRo
                ? 'Verifică inbox-ul (și folder-ul Spam/Promoții) pentru cartea PDF și audiobook-ul. Între timp, profită de oferta de mai jos — disponibilă o singură dată.'
                : 'Check your inbox (and Spam/Promotions) for the PDF book and audiobook. Meanwhile, claim the one-time offer below.'}
            </p>
          </div>
        </div>
      </section>


      <section className="pt-16 pb-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-xs tracking-[0.15em] text-amber-400/80 border border-amber-400/30 rounded-full px-4 py-2 mb-8 uppercase">
            {isRo ? '🎁 Ofertă exclusivă — doar pe această pagină' : '🎁 Exclusive offer — only on this page'}
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {isRo
              ? 'De la blocaj și epuizare la claritate, rezultate și momentum în corp, spiritualitate, relații și business în 7 zile'
              : 'From burnout & blockage to clarity, results & momentum in body, spirit, relationships & business in 7 days'}
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-3xl mx-auto">
            {isRo
              ? 'Cartea îți dă harta. Challenge-ul te ia de mână 7 zile și te pune în mișcare — alături de Alin.'
              : 'The book gives you the map. The Challenge takes you by the hand for 7 days and puts you in motion — with Alin.'}
          </p>

          {/* Voomly video with cyan glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.3)]">
              <iframe
                src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=a1UxQlSF_zsIRg949UdpevBeG3kFJw9e8Ddw8GgXOiKdfh4tG&videoRatio=1.777778&type=v&skinColor=%232758EB"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 PILLARS */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            {isRo ? 'De Ce Ești Blocat? Lipsa Echilibrului în 4 Arii' : 'Why Are You Stuck? Imbalance in 4 Areas'}
          </h2>
          <p className="text-center text-white/60 mb-10 max-w-2xl mx-auto">
            {isRo ? 'Burnout-ul vine când una din arii e neglijată. Fix asta reparăm.' : "Burnout happens when one area is neglected. That's exactly what we fix."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-7 w-7 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{p.label}</h3>
                  <p className="text-sm text-white/60">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7 DAYS */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            {isRo ? 'Planul Tău Anti-Burnout în 7 Pași' : 'Your 7-Step Anti-Burnout Plan'}
          </h2>
          <p className="text-center text-white/60 mb-10 max-w-2xl mx-auto">
            {isRo ? 'Fiecare zi te scoate mai mult din ceață și te mută spre claritate.' : 'Each day pulls you further from the fog and closer to clarity.'}
          </p>
          <div className="space-y-3">
            {challengeDays.map((d) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: d.day * 0.05 }}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                >
                  <div className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {isRo ? `Ziua ${d.day}` : `Day ${d.day}`}
                      </span>
                    </div>
                    <h3 className="font-bold">{d.title}</h3>
                    <p className="text-sm text-white/60">{d.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isRo ? 'Ce Vei Obține' : "What You'll Get"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="font-medium">{b.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SINGLE OFFER */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-2xl p-8 md:p-10 text-center">
            <p className="text-amber-400 font-bold text-xl md:text-2xl mb-2">
              {isRo ? '485 LEI plată unică + 14 ZILE GRATIS la platforma Pro' : '$97 one-time + 14 DAYS FREE on the Pro platform'}
            </p>
            <p className="text-white/60 text-sm mb-8">
              {isRo ? 'apoi doar 245 LEI/lună • anulezi oricând' : 'then just $49/month • cancel anytime'}
            </p>

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
                  {isRo ? 'DA — Vreau Challenge-ul + 14 Zile Pro' : 'YES — I want the Challenge + 14 Days Pro'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="block w-full mt-4 py-3 text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              {isRo ? 'Nu, mulțumesc. Doar cartea pentru acum.' : 'No thanks. Just the book for now.'}
            </button>
          </div>

          {/* Guarantee */}
          <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">
              {isRo ? 'Garanție 30 de zile — fără risc' : '30-day guarantee — zero risk'}
            </h3>
            <p className="text-white/50 text-sm">
              {isRo
                ? 'Dacă în primele 30 de zile nu vezi o transformare reală, îți returnez banii integral. Fără întrebări.'
                : "If you don't see a real transformation in the first 30 days, I'll refund your money in full. No questions asked."}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isRo ? 'Întrebări Frecvente' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="cursor-pointer bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/30 transition-colors rounded-xl p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold pr-4">{item.q}</h3>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <p className="text-white/60 mt-3 text-sm">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Rocket className="h-16 w-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRo ? 'Gata de Momentum?' : 'Ready for Momentum?'}
          </h2>
          <p className="text-xl text-white/60 mb-8">
            {isRo ? 'Oprește ciclul burnout-ului. Începe Challenge-ul azi.' : 'Break the burnout cycle. Start the Challenge today.'}
          </p>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isRo ? 'Activează Challenge-ul' : 'Activate the Challenge'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default EbookUpsell;
