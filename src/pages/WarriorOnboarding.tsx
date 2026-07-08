import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sword, Check, Zap, Target, Sparkles } from 'lucide-react';

const benefits = [
  { icon: Target, title: 'Descoperi tipul tău', text: 'Din 4 arhetipuri: Reactor · Disciplinat · Experimentator · Warrior.' },
  { icon: Zap, title: 'Rutina personalizată', text: '7-16 pași optimizați pentru profilul tău, cu durate ajustate.' },
  { icon: Sparkles, title: 'Activare automată', text: 'Un click și rutina e în contul tău, gata de start.' },
];

const steps = [
  'Faci quiz-ul (2 min · 8 întrebări)',
  'Vezi rezultatul + preview rutină',
  'Îți trimit raportul complet pe email',
  'Activezi cu 7 zile trial · 7€/lună după',
];

const WarriorOnboarding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Capture UTM params to localStorage so the funnel edge functions can pick them up.
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
        <title>Rutina Warrior — descoperă-ți tipul în 2 min | CEO Mind OS</title>
        <meta name="description" content="Quiz gratuit: descoperă-ți tipul de Warrior și primește rutina personalizată. 7 zile trial · 7€/lună după." />
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
            <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
              Ești{' '}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">Reactor</span>,{' '}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">Disciplinat</span>,{' '}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">Experimentator</span> sau{' '}
              <span className="bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">Warrior</span>?
              <span className="block text-white/80 text-2xl md:text-3xl font-medium mt-4">Rutina ta de dimineață depinde de răspuns.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Hai să-l aflăm împreună — 8 întrebări, 2 minute, și primești rutina calibrată pe tine, activată direct în cont.
            </p>
            <div className="pt-2 flex flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={() => navigate('/quiz-rutina?source=warrior-onboarding')}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 text-base"
              >
                Începe quiz-ul <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-white/50">Fără card · Rezultatul livrat pe email</p>
            </div>
          </motion.section>

          {/* Benefits */}
          <section className="grid md:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <Card className="bg-white/5 border-white/10 p-6 h-full">
                  <b.icon className="w-6 h-6 text-[#D4A84A] mb-3" />
                  <h3 className="font-semibold mb-1">{b.title}</h3>
                  <p className="text-sm text-white/70">{b.text}</p>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* How it works */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Cum funcționează</h2>
            <Card className="bg-white/5 border-white/10 p-6 md:p-8 max-w-2xl mx-auto">
              <ol className="space-y-4">
                {steps.map((s, i) => (
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

          {/* Pricing preview */}
          <section className="text-center space-y-4">
            <Card className="bg-gradient-to-br from-[#D4A84A]/10 to-[#D4A84A]/5 border-[#D4A84A]/30 p-6 md:p-8 max-w-md mx-auto">
              <div className="text-xs uppercase tracking-wider text-[#D4A84A] mb-2">Warrior Starter</div>
              <div className="text-5xl font-bold mb-1">7€<span className="text-lg text-white/60">/lună</span></div>
              <div className="text-sm text-white/60 mb-4">după 7 zile trial gratuit</div>
              <div className="space-y-2 text-sm text-white/85 text-left">
                {[
                  'Rutina Warrior personalizată',
                  'Daily Flow — sistem de dimineață',
                  'Domino Door — planificare săptămânală',
                  'Mind Coach (5 sesiuni/lună)',
                  'Anulezi oricând',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4A84A]" /> {f}
                  </div>
                ))}
              </div>
            </Card>
            <Button
              size="lg"
              onClick={() => navigate('/quiz-rutina?source=warrior-onboarding')}
              className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8"
            >
              Începe cu quiz-ul <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
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
