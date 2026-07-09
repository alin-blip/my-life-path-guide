import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sword, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const COPY = {
  ro: {
    metaTitle: 'Rutina ta funcționează sau te sabotează? Află în 90 sec | CEO Mind OS',
    metaDesc: '8 întrebări, 90 de secunde, raport personalizat pe email. Descoperi tipul tău de Warrior și rutina de dimineață care funcționează pentru tine.',
    login: 'Log in',
    badge: 'Early access · Primii 100 de fondatori',
    hero1a: 'Rutina ta de dimineață ',
    heroWorks: 'funcționează',
    hero1b: '.',
    hero2a: 'Sau te ',
    heroSabo: 'sabotează',
    hero2b: '.',
    heroSub1: 'În 90 de secunde afli exact care.',
    heroSub2: '8 întrebări. Răspuns personalizat. Activare directă în cont.',
    ctaHero: 'Aflu acum',
    ctaNote: '90 de secunde · Rezultatul livrat pe email',
    painsTitle: 'Dacă te-ai trezit vreodată dimineața și ai simțit că:',
    painPoints: [
      'Primul lucru a fost telefonul, nu gândul tău',
      'Ziua începe reactiv, nu intenționat',
      'Ai citit 10 cărți despre rutină, dar n-ai terminat niciuna',
      'Faci totul „perfect", dar nu simți progres',
    ],
    quizFor: 'Quiz-ul e pentru tine.',
    deliverTitle: 'Ce primești în 90 de secunde',
    deliverables: [
      { title: 'Identificare clară', desc: 'ești Reactor, Disciplinat, Experimentator sau Warrior' },
      { title: 'Raport personalizat', desc: 'rutina ta optimă, pas cu pas' },
      { title: 'Acces direct', desc: 'activezi cu un click, începi mâine dimineață' },
      { title: 'Primul pas concret', desc: 'nu teorie, ci ce faci azi' },
    ],
    howTitle: 'Cum funcționează (90 secunde)',
    howSteps: [
      'Răspunzi la 8 întrebări (2 min, pe telefon)',
      'Afli tipul tău + de ce rutina ta actuală nu funcționează',
      'Primești raportul pe email (gratuit)',
      'Dacă vrei să aplici, activezi Warrior Starter: 7 zile trial, apoi 7€/lună',
    ],
    testiTitle: 'Ce zic alți fondatori',
    testimonials: [
      { quote: 'În prima săptămână am trecut de la reactiv la intenționat. Diferența? 45 de minute dimineața pe care le-am respectat.', author: 'Dan, CEO SaaS' },
      { quote: 'Mihai, 2 business-uri, burnout score 64. După 6 săptămâni cu Warrior Routine: business-ul stă, soția mă recunoaște.', author: 'Mihai, CEO Mind OS' },
    ],
    whyTitle: 'De ce funcționează (nu e altă carte)',
    whyLead1: 'Nu-ți dăm informație. Îți dăm un ',
    whySystem: 'sistem',
    whyFailsLead: 'Majoritatea programelor de rutină eșuează pentru că:',
    whyFails: [
      'Prea multe opțiuni (paralizie de alegere)',
      'Prea multă teorie (fără acțiune concretă)',
      'Zero accountability (nimeni nu te verifică)',
    ],
    whyDiffLead: 'Warrior Starter e diferit:',
    whyDiff: [
      '8 întrebări = profil clar, nu generic',
      'Rutina ta = specifică, nu universală',
      'Activare directă = în 2 minute ești în cont',
      '5 sesiuni Mind Coach/lună = AI te ajută când te blochezi',
    ],
    finalTitle: 'Gata de descoperit tipul tău?',
    finalSub: 'Doar 2 minute și un email.',
    ctaFinal: 'Aflu acum — 90 secunde, gratuit',
    footerAll: 'Vezi toate planurile',
  },
  en: {
    metaTitle: 'Is your routine working — or sabotaging you? Find out in 90s | CEO Mind OS',
    metaDesc: '8 questions, 90 seconds, personalized report by email. Discover your Warrior type and the morning routine that actually works for you.',
    login: 'Log in',
    badge: 'Early access · First 100 founders',
    hero1a: 'Your morning routine ',
    heroWorks: 'works',
    hero1b: '.',
    hero2a: 'Or it ',
    heroSabo: 'sabotages you',
    hero2b: '.',
    heroSub1: 'In 90 seconds you find out which.',
    heroSub2: '8 questions. Personal answer. One-click account activation.',
    ctaHero: 'Find out now',
    ctaNote: '90 seconds · Report delivered by email',
    painsTitle: 'If you\'ve ever woken up feeling that:',
    painPoints: [
      'The first thing was the phone, not your own thought',
      'Your day starts reactive, not intentional',
      'You read 10 books on routine but never finished one',
      'You do everything "perfectly" but feel no progress',
    ],
    quizFor: 'This quiz is for you.',
    deliverTitle: 'What you get in 90 seconds',
    deliverables: [
      { title: 'Clear identity', desc: 'you\'re a Reactor, Disciplined, Experimenter or Warrior' },
      { title: 'Personalized report', desc: 'your optimal routine, step by step' },
      { title: 'Direct access', desc: 'activate in one click, start tomorrow morning' },
      { title: 'One concrete first step', desc: 'no theory — what you do today' },
    ],
    howTitle: 'How it works (90 seconds)',
    howSteps: [
      'Answer 8 questions (2 min, on your phone)',
      'See your type + why your current routine doesn\'t stick',
      'Get the report by email (free)',
      'If you want to apply it, activate Warrior Starter: 7-day trial, then €7/month',
    ],
    testiTitle: 'What other founders say',
    testimonials: [
      { quote: 'In the first week I shifted from reactive to intentional. The difference? 45 morning minutes I actually protected.', author: 'Dan, SaaS CEO' },
      { quote: 'Mihai, 2 businesses, burnout score 64. After 6 weeks with Warrior Routine: business runs, wife recognizes me again.', author: 'Mihai, CEO Mind OS' },
    ],
    whyTitle: 'Why it works (this isn\'t another book)',
    whyLead1: 'We don\'t give you information. We give you a ',
    whySystem: 'system',
    whyFailsLead: 'Most routine programs fail because:',
    whyFails: [
      'Too many options (choice paralysis)',
      'Too much theory (no concrete action)',
      'Zero accountability (nobody checks on you)',
    ],
    whyDiffLead: 'Warrior Starter is different:',
    whyDiff: [
      '8 questions = clear profile, not generic',
      'Your routine = specific, not universal',
      'Direct activation = in 2 minutes you\'re inside',
      '5 Mind Coach sessions/mo = AI helps you when you\'re stuck',
    ],
    finalTitle: 'Ready to discover your type?',
    finalSub: 'Just 2 minutes and an email.',
    ctaFinal: 'Find out now — 90 seconds, free',
    footerAll: 'See all plans',
  },
} as const;

const WarriorOnboarding = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const c = isEn ? COPY.en : COPY.ro;
  const quizUrl = `${isEn ? '/en' : ''}/quiz-rutina?source=warrior-onboarding&autostart=1`;
  const authUrl = isEn ? '/en/auth' : '/auth';
  const pricingUrl = isEn ? '/en/pricing' : '/pricing';
  const goToQuiz = () => navigate(quizUrl);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .reduce((acc, k) => { const v = p.get(k); if (v) acc[k] = v; return acc; }, {} as Record<string, string>);
      if (Object.keys(utm).length) {
        localStorage.setItem('warrior_funnel_utm', JSON.stringify({
          ...utm,
          landing_page: window.location.pathname,
          referrer: document.referrer || '',
          captured_at: new Date().toISOString(),
        }));
      }
    } catch {}
  }, []);

  return (
    <>
      <Helmet>
        <html lang={isEn ? 'en' : 'ro'} />
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="alternate" hrefLang="ro" href="https://ceomindos.com/warrior" />
        <link rel="alternate" hrefLang="en" href="https://ceomindos.com/en/warrior" />
        <link rel="alternate" hrefLang="x-default" href="https://ceomindos.com/warrior" />
        <link rel="canonical" href={`https://ceomindos.com${isEn ? '/en/warrior' : '/warrior'}`} />
        <meta property="og:url" content={`https://ceomindos.com${isEn ? '/en/warrior' : '/warrior'}`} />
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://ceomindos.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
        <header className="p-4 md:p-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#D4A84A]" />
            <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
          </div>
          <Link to={authUrl} className="text-xs text-white/60 hover:text-white/90">{c.login}</Link>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-16">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> {c.badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] max-w-3xl mx-auto">
              {c.hero1a}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">{c.heroWorks}</span>
              {c.hero1b}
              <span className="block mt-2">
                {c.hero2a}
                <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">{c.heroSabo}</span>
                {c.hero2b}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/85 max-w-2xl mx-auto font-medium">
              {c.heroSub1}
            </p>
            <p className="text-base text-white/70 max-w-xl mx-auto">
              {c.heroSub2}
            </p>
            <div className="pt-2 flex flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={goToQuiz}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-10 text-base"
              >
                {c.ctaHero} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-white/50">{c.ctaNote}</p>
            </div>
          </motion.section>

          {/* Pain points */}
          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              {c.painsTitle}
            </h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 space-y-3">
              {c.painPoints.map((p) => (
                <div key={p} className="flex items-start gap-3 text-white/85">
                  <span className="text-[#D4A84A] font-bold mt-0.5">→</span>
                  <span>{p}</span>
                </div>
              ))}
            </Card>
            <p className="text-center text-lg font-semibold text-[#D4A84A]">
              {c.quizFor}
            </p>
          </section>

          {/* Deliverables */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              {c.deliverTitle}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {c.deliverables.map((d) => (
                <Card key={d.title} className="bg-white/5 border-white/10 p-6 flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#D4A84A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{d.title}</h3>
                    <p className="text-sm text-white/70">{d.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center">{c.howTitle}</h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 max-w-2xl mx-auto">
              <ol className="space-y-4">
                {c.howSteps.map((s, i) => (
                  <li key={s} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4A84A]/15 border border-[#D4A84A]/30 text-[#D4A84A] flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span className="text-white/85 pt-1">{s}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          {/* Testimonials */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">{c.testiTitle}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {c.testimonials.map((t) => (
                <Card key={t.author} className="bg-white/5 border-white/10 p-6">
                  <p className="text-white/85 italic mb-4">„{t.quote}"</p>
                  <p className="text-sm text-[#D4A84A] font-semibold">— {t.author}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Why */}
          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              {c.whyTitle}
            </h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 space-y-4">
              <p className="text-lg text-white/90">
                {c.whyLead1}<span className="text-[#D4A84A] font-semibold">{c.whySystem}</span>.
              </p>
              <div>
                <p className="text-sm text-white/70 mb-2">{c.whyFailsLead}</p>
                <ul className="space-y-1 text-white/85">
                  {c.whyFails.map((x) => <li key={x}>• {x}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm text-white/70 mb-2">{c.whyDiffLead}</p>
                <ul className="space-y-1 text-white/85">
                  {c.whyDiff.map((x) => (
                    <li key={x}><span className="text-[#D4A84A]">→</span> {x}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>

          {/* Final CTA */}
          <section className="text-center space-y-4 pt-4">
            <h2 className="text-2xl md:text-3xl font-bold">{c.finalTitle}</h2>
            <p className="text-white/70">{c.finalSub}</p>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={goToQuiz}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-10 text-base"
              >
                {c.ctaFinal} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </section>

          <footer className="pt-8 pb-4 text-center text-xs text-white/40">
            © CEO Mind OS · <Link to={pricingUrl} className="hover:text-white/70">{c.footerAll}</Link>
          </footer>
        </main>
      </div>
    </>
  );
};

export default WarriorOnboarding;
