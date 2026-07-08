import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sword, Check, Sparkles } from 'lucide-react';

const painPoints = [
  'Primul lucru a fost telefonul, nu gândul tău',
  'Ziua începe reactiv, nu intenționat',
  'Ai citit 10 cărți despre rutină, dar n-ai terminat niciuna',
  'Faci totul „perfect", dar nu simți progres',
];

const deliverables = [
  { title: 'Identificare clară', desc: 'ești Reactor, Disciplinat, Experimentator sau Warrior' },
  { title: 'Raport personalizat', desc: 'rutina ta optimă, pas cu pas' },
  { title: 'Acces direct', desc: 'activezi cu un click, începi mâine dimineață' },
  { title: 'Primul pas concret', desc: 'nu teorie, ci ce faci azi' },
];

const howItWorks = [
  'Răspunzi la 8 întrebări (2 min, pe telefon)',
  'Afli tipul tău + de ce rutina ta actuală nu funcționează',
  'Primești raportul pe email (gratuit)',
  'Dacă vrei să aplici, activezi Warrior Starter: 7 zile trial, apoi 7€/lună',
];

const included = [
  'Rutina Warrior personalizată pe tipul tău',
  'Daily Flow — sistem de dimineață',
  'Domino Door — planificare săptămânală',
  'Mind Coach (5 sesiuni/lună)',
  'Anulezi oricând, fără întrebări',
];

const testimonials = [
  {
    quote: 'În prima săptămână am trecut de la reactiv la intenționat. Diferența? 45 de minute dimineața pe care le-am respectat.',
    author: 'Dan, CEO SaaS',
  },
  {
    quote: 'Mihai, 2 business-uri, burnout score 64. După 6 săptămâni cu Warrior Routine: business-ul stă, soția mă recunoaște.',
    author: 'Mihai, CEO Mind OS',
  },
];

const QUIZ_URL = '/quiz-rutina?source=warrior-onboarding';

const WarriorOnboarding = () => {
  const navigate = useNavigate();
  const goToQuiz = () => navigate(QUIZ_URL);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .reduce((acc, k) => { const v = p.get(k); if (v) acc[k] = v; return acc; }, {} as Record<string, string>);
      if (Object.keys(utm).length) {
        localStorage.setItem('warrior_funnel_utm', JSON.stringify({
          ...utm,
          landing_page: '/warrior',
          referrer: document.referrer || '',
          captured_at: new Date().toISOString(),
        }));
      }
    } catch {}
  }, []);

  return (
    <>
      <Helmet>
        <title>Rutina ta funcționează sau te sabotează? Află în 90 sec | CEO Mind OS</title>
        <meta name="description" content="8 întrebări, 90 de secunde, raport personalizat pe email. Descoperi tipul tău de Warrior și rutina de dimineață care funcționează pentru tine." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
        <header className="p-4 md:p-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#D4A84A]" />
            <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
          </div>
          <Link to="/auth" className="text-xs text-white/60 hover:text-white/90">Log in</Link>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-16">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Early access · Primii 100 de fondatori
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] max-w-3xl mx-auto">
              Rutina ta de dimineață{' '}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">funcționează</span>.
              <span className="block mt-2">
                Sau te{' '}
                <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">sabotează</span>.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/85 max-w-2xl mx-auto font-medium">
              În 90 de secunde afli exact care.
            </p>
            <p className="text-base text-white/70 max-w-xl mx-auto">
              8 întrebări. Răspuns personalizat. Activare directă în cont.
            </p>
            <div className="pt-2 flex flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={goToQuiz}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-10 text-base"
              >
                Aflu acum <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-white/50">90 de secunde · Rezultatul livrat pe email</p>
            </div>
          </motion.section>

          {/* Pentru cine e */}
          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Dacă te-ai trezit vreodată dimineața și ai simțit că:
            </h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 space-y-3">
              {painPoints.map((p) => (
                <div key={p} className="flex items-start gap-3 text-white/85">
                  <span className="text-[#D4A84A] font-bold mt-0.5">→</span>
                  <span>{p}</span>
                </div>
              ))}
            </Card>
            <p className="text-center text-lg font-semibold text-[#D4A84A]">
              Quiz-ul e pentru tine.
            </p>
          </section>

          {/* Ce primești */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Ce primești în 90 de secunde
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {deliverables.map((d) => (
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

          {/* Cum funcționează */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Cum funcționează (90 secunde)</h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 max-w-2xl mx-auto">
              <ol className="space-y-4">
                {howItWorks.map((s, i) => (
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

          {/* Preț + CTA */}
          <section className="text-center space-y-4">
            <Card className="bg-gradient-to-br from-[#D4A84A]/10 to-[#D4A84A]/5 border-[#D4A84A]/30 p-6 md:p-10 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Începe cu <span className="text-[#D4A84A]">7 zile gratuite</span>.
              </h2>
              <p className="text-white/80 mb-6">
                Plătești <span className="text-[#D4A84A] font-semibold">7€</span> doar dacă continui. Anulezi oricând.
              </p>
              <Button
                size="lg"
                onClick={goToQuiz}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 text-base w-full sm:w-auto"
              >
                Activează Warrior Starter — începe cu quiz-ul <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div className="mt-6 pt-6 border-t border-white/10 text-left space-y-2">
                <p className="text-sm font-semibold mb-2">Include:</p>
                {included.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/85">
                    <Check className="w-4 h-4 text-[#D4A84A] flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Testimoniale */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Ce zic alți fondatori</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <Card key={t.author} className="bg-white/5 border-white/10 p-6">
                  <p className="text-white/85 italic mb-4">„{t.quote}"</p>
                  <p className="text-sm text-[#D4A84A] font-semibold">— {t.author}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* De ce funcționează */}
          <section className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              De ce funcționează (nu e altă carte)
            </h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 space-y-4">
              <p className="text-lg text-white/90">
                Nu-ți dăm informație. Îți dăm un <span className="text-[#D4A84A] font-semibold">sistem</span>.
              </p>
              <div>
                <p className="text-sm text-white/70 mb-2">Majoritatea programelor de rutină eșuează pentru că:</p>
                <ul className="space-y-1 text-white/85">
                  <li>• Prea multe opțiuni (paralizie de alegere)</li>
                  <li>• Prea multă teorie (fără acțiune concretă)</li>
                  <li>• Zero accountability (nimeni nu te verifică)</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-white/70 mb-2">Warrior Starter e diferit:</p>
                <ul className="space-y-1 text-white/85">
                  <li><span className="text-[#D4A84A]">→</span> 8 întrebări = profil clar, nu generic</li>
                  <li><span className="text-[#D4A84A]">→</span> Rutina ta = specifică, nu universală</li>
                  <li><span className="text-[#D4A84A]">→</span> Activare directă = în 2 minute ești în cont</li>
                  <li><span className="text-[#D4A84A]">→</span> 5 sesiuni Mind Coach/lună = AI te ajută când te blochezi</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Final CTA */}
          <section className="text-center space-y-4 pt-4">
            <h2 className="text-2xl md:text-3xl font-bold">Gata de descoperit tipul tău?</h2>
            <p className="text-white/70">Doar 2 minute și un email.</p>
            <div className="pt-2">
              <Button
                size="lg"
                onClick={goToQuiz}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-10 text-base"
              >
                Aflu acum — 90 secunde, gratuit <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </section>

          <footer className="pt-8 pb-4 text-center text-xs text-white/40">
            © CEO Mind OS · <Link to="/pricing" className="hover:text-white/70">Vezi toate planurile</Link>
          </footer>
        </main>
      </div>
    </>
  );
};

export default WarriorOnboarding;
