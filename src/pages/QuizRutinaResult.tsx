import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Sword, Loader2, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WARRIOR_TYPES, WARRIOR_TEMPLATES, type WarriorType } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Per-type emotional conversion content: hero → pain → revelation → 3 concrete steps → proof
const RESULT_CONTENT: Record<WarriorType, {
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  pain: string[];
  revelation: string;
  preview: string;
  steps: { day: string; text: string }[];
  testimonial: { quote: string; author: string };
  ctaTransition: string;
}> = {
  reactor: {
    heroTitle: 'Te trezești în panică',
    heroTitleAccent: 'în fiecare dimineață.',
    heroSubtitle: 'Ești tipul Reactor. Și asta te sabotează zilnic.',
    pain: [
      'Telefonul, email-ul, știrile — toate îți spun ce să faci în primul minut.',
      'Reacționezi toată ziua pentru că începi reactiv.',
      'La finalul zilei ești epuizat, dar nu poți spune ce ai făcut cu adevărat.',
    ],
    revelation: 'Nu-ți trebuie mai multă disciplină. Îți trebuie un ritual de tranziție între somn și lume.',
    preview: 'Warrior Routine îți dă 5 pași simpli, în 20 de minute, care fac diferența între „reactiv" și „intenționat".',
    steps: [
      { day: 'Azi', text: 'NU deschide telefonul primul. Stai 5 minute în liniște. Doar respiră.' },
      { day: 'Mâine', text: 'Bea 500ml apă înainte de orice. Hidratezi corpul, nu creierul cu cofeină.' },
      { day: 'Poimâine', text: 'Întreabă-te cu voce tare: „Cum vreau să mă simt azi?" — răspunde 2 minute.' },
    ],
    testimonial: {
      quote: 'Am trecut de la reactiv la intenționat. Diferența? 45 de minute dimineața pe care le-am respectat.',
      author: 'Dan, CEO SaaS',
    },
    ctaTransition: 'reacționat',
  },
  disciplined: {
    heroTitle: 'Faci totul perfect.',
    heroTitleAccent: 'Dar nu simți că avansezi.',
    heroSubtitle: 'Ești tipul Disciplined. Și asta te ține pe loc.',
    pain: [
      'Ai rutină. O urmezi zilnic. Faci totul „corect".',
      'Dar la finalul zilei, te uiți înapoi și nu simți progres.',
      'Nu e lipsă de disciplină. E lipsă de sens.',
    ],
    revelation: 'Disciplina fără direcție e cel mai greu tip de oboseală.',
    preview: 'Warrior Routine nu îți adaugă pași. Îți conectează pașii pe care deja îi faci la o viziune concretă pe 90 de zile.',
    steps: [
      { day: 'Azi', text: 'Scrie pe hârtie: „DE CE fac rutina asta?" Răspunde sincer, nu cu ce ar trebui.' },
      { day: 'Mâine', text: 'Adaugă un element de bucurie în rutină: muzică, mișcare, creație. Disciplina nu trebuie să fie rigidă.' },
      { day: 'Poimâine', text: 'Conectează fiecare pas la viziunea ta pe 90 de zile. Dacă n-o ai scrisă, n-o ai concretă.' },
    ],
    testimonial: {
      quote: 'Am trecut de la „bifat task-uri" la „construit ceva". Aceeași rutină. Altă semnificație.',
      author: 'Mihai, CEO Mind OS',
    },
    ctaTransition: 'bifat',
  },
  experimenter: {
    heroTitle: 'Ai citit 10 cărți despre rutină,',
    heroTitleAccent: 'dar n-ai terminat niciuna.',
    heroSubtitle: 'Ești tipul Experimenter. Și asta te ține pe loc.',
    pain: [
      'Ai citit tot. Miracle Morning, Atomic Habits, The 5AM Club.',
      'Ai testat 20 de sisteme. Ai reset-uit de 20 de ori.',
      'Colectezi sisteme. Nu aplici niciunul.',
    ],
    revelation: 'Nu e problemă de informație. E problemă de execuție. Experimentarea fără angajament e procrastinare cu bonus.',
    preview: 'Warrior Routine îți oprește căutarea. Îți dă UN sistem specific tipului tău și te ține pe el 30 de zile.',
    steps: [
      { day: 'Azi', text: 'Alege UN singur sistem. Fă-l 30 de zile fără să schimbi nimic.' },
      { day: 'Mâine', text: 'Măsoară UN singur lucru: „Mă simt mai bine?" Notează pe o scară de la 1 la 10.' },
      { day: 'Poimâine', text: 'Fă un angajament public. Spune-i cuiva pe cine îl respecți: „30 de zile. Fără excepții."' },
    ],
    testimonial: {
      quote: 'Am încetat să mai caut. Am început să fac. 30 de zile. Un singur sistem. Prima dată când am simțit progres real.',
      author: 'Andrei, founder',
    },
    ctaTransition: 'citit',
  },
  warrior: {
    heroTitle: 'Ai disciplina.',
    heroTitleAccent: 'Îți lipsește direcția.',
    heroSubtitle: 'Ești tipul Warrior. Acum îți trebuie sens.',
    pain: [
      'Rutina ta e solidă. O urmezi zilnic. Ești deja peste 90% dintre fondatori.',
      'Dar ceva nu se simte ca progres. O faci mecanic, fără impact.',
      'Puterea fără direcție e un treadmill: te obosești, dar nu ajungi nicăieri.',
    ],
    revelation: 'Viziunea fără putere e un vis. Puterea fără viziune e un treadmill. Ai puterea. Acum îți trebuie direcția.',
    preview: 'Warrior Routine conectează rutina ta la o viziune pe 90 de zile și un weekly review care îți arată exact ce mută businessul și ce nu.',
    steps: [
      { day: 'Azi', text: 'Scrie viziunea pe 90 de zile. 1 pagină, 3 paragrafe. Fără edit.' },
      { day: 'Mâine', text: 'Conectează fiecare pas din rutină la viziune. Dacă un pas nu servește nimic — scoate-l.' },
      { day: 'Poimâine', text: 'Adaugă un weekly review de 15 minute duminica. Ce a mișcat? Ce nu? Ce ajustezi?' },
    ],
    testimonial: {
      quote: 'Am trecut de la execuție la construcție. Același efort. Alt impact. Diferența a fost weekly review-ul.',
      author: 'Vlad, CEO tech',
    },
    ctaTransition: 'executat',
  },
};

const QuizRutinaResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const warriorType = params.get('type') as WarriorType | null;
  const resultId = params.get('rid');
  const source = params.get('source') || 'quiz';
  const emailFromQuiz = params.get('email') || '';

  const [activating, setActivating] = useState(false);
  const [email, setEmail] = useState(emailFromQuiz);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [autoSendAttempted, setAutoSendAttempted] = useState(false);

  const meta = warriorType ? WARRIOR_TYPES[warriorType] : null;
  const template = warriorType ? WARRIOR_TEMPLATES[warriorType] : null;

  // Preview: show only first 3 steps in the soft-gate variant
  const previewSteps = useMemo(() => template?.active_steps.slice(0, 3) ?? [], [template]);
  const lockedStepsCount = (template?.active_steps.length ?? 0) - previewSteps.length;

  useEffect(() => {
    if (!warriorType || !WARRIOR_TYPES[warriorType]) {
      navigate('/quiz-rutina', { replace: true });
    }
  }, [warriorType, navigate]);

  // Auto-activate if logged in user came back with a pending activation
  useEffect(() => {
    if (!user || authLoading || !warriorType) return;
    try {
      const pending = localStorage.getItem('pending_warrior_activation');
      if (!pending) return;
      const parsed = JSON.parse(pending);
      if (parsed?.warrior_type === warriorType) {
        localStorage.removeItem('pending_warrior_activation');
        activateDirect();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, warriorType]);

  const activateDirect = async () => {
    setActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('activate-warrior-routine', {
        body: { warrior_type: warriorType, result_id: resultId },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Eroare necunoscută');
      toast.success('Rutina Warrior a fost activată! ⚔️');
      navigate(data.redirect_url || '/daily-flow?new=1');
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut activa rutina. Încearcă din nou.');
      setActivating(false);
    }
  };

  // Auto-send report if email arrived from the quiz step
  useEffect(() => {
    if (autoSendAttempted) return;
    if (!emailFromQuiz || !warriorType || !EMAIL_RE.test(emailFromQuiz)) return;
    setAutoSendAttempted(true);
    (async () => {
      setEmailSubmitting(true);
      try {
        const utm = (() => {
          try { return JSON.parse(localStorage.getItem('warrior_funnel_utm') || '{}'); } catch { return {}; }
        })();
        const { data, error } = await supabase.functions.invoke('send-warrior-report', {
          body: {
            email: emailFromQuiz.toLowerCase(),
            warrior_type: warriorType,
            result_id: resultId,
            language: (navigator.language || 'ro').startsWith('en') ? 'en' : 'ro',
            utm: { ...utm, source },
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Eroare');
        setLeadId(data.lead_id);
        setEmailSent(true);
      } catch (err) {
        console.error('auto-send report failed', err);
      } finally {
        setEmailSubmitting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromQuiz, warriorType, resultId]);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      toast.error('Email invalid');
      return;
    }
    setEmailSubmitting(true);
    try {
      const utm = (() => {
        try { return JSON.parse(localStorage.getItem('warrior_funnel_utm') || '{}'); } catch { return {}; }
      })();
      const { data, error } = await supabase.functions.invoke('send-warrior-report', {
        body: {
          email: email.trim().toLowerCase(),
          warrior_type: warriorType,
          result_id: resultId,
          language: (navigator.language || 'ro').startsWith('en') ? 'en' : 'ro',
          utm: { ...utm, source },
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Eroare');
      setLeadId(data.lead_id);
      setEmailSent(true);
      toast.success('Raportul a fost trimis pe email 📧');
    } catch (err) {
      console.error(err);
      toast.error('Nu am putut trimite raportul. Încearcă din nou.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const goToCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const utm = (() => {
        try { return JSON.parse(localStorage.getItem('warrior_funnel_utm') || '{}'); } catch { return {}; }
      })();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan: 'starter',
          source: 'warrior-onboarding',
          guest_email: email.trim().toLowerCase() || undefined,
          language: (navigator.language || 'ro').startsWith('en') ? 'en' : 'ro',
          utm: { ...utm, warrior_type: warriorType, lead_id: leadId },
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL');

      // Mark lead as checkout_started for funnel analytics
      if (leadId) {
        supabase.from('warrior_funnel_leads')
          .update({ checkout_started_at: new Date().toISOString(), status: 'checkout' })
          .eq('id', leadId)
          .then(() => {}, () => {});
      }
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      toast.error('Nu am putut porni checkout-ul. Încearcă din nou.');
      setCheckoutLoading(false);
    }
  };

  if (!meta || !template) {
    return (
      <div className="min-h-screen bg-[#0B1733] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A84A]" />
      </div>
    );
  }

  // ------- Logged-in user: keep original one-click activation flow -------
  if (user) {
    return (
      <>
        <Helmet>
          <title>Ești {meta.name} — Rutina ta Warrior | CEO Mind OS</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
          <header className="p-4 md:p-6 max-w-4xl mx-auto flex items-center gap-2">
            <Sword className="w-5 h-5 text-[#D4A84A]" />
            <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
          </header>
          <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
              <div className="text-7xl">{meta.emoji}</div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Ești <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', meta.color)}>{meta.name}</span>
              </h1>
              <p className="text-xl text-white/80 max-w-xl mx-auto">{meta.tagline}</p>
            </motion.div>
            <Card className="bg-white/5 border-white/10 p-6 space-y-4">
              <p className="text-white/90 leading-relaxed">{meta.description}</p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">Puncte forte</div>
                  <div className="text-sm text-white/85">{meta.strengths}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="text-xs uppercase tracking-wider text-red-400 mb-1">Provocări</div>
                  <div className="text-sm text-white/85">{meta.challenges}</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#D4A84A]" /> Rutina ta ({template.active_steps.length} pași)
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {template.active_steps.map((step) => (
                  <div key={step} className="flex items-center gap-2 text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#D4A84A] flex-shrink-0" />
                    <span className="capitalize">{step.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="text-center space-y-3">
              <Button size="lg" onClick={activateDirect} disabled={activating}
                className="bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 px-8 text-base w-full md:w-auto">
                {activating ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Se activează...</>
                  : <>Activează-mi rutina Warrior <ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  // ------- Anon user: soft-gate variant -------
  return (
    <>
      <Helmet>
        <title>Ești {meta.name} — Rutina ta Warrior | CEO Mind OS</title>
        <meta name="description" content={`Ești tip ${meta.name}: ${meta.tagline}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
        <header className="p-4 md:p-6 max-w-4xl mx-auto flex items-center gap-2">
          <Sword className="w-5 h-5 text-[#D4A84A]" />
          <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-10">
          {(() => {
            const c = RESULT_CONTENT[warriorType as WarriorType];
            return (
              <>
                {/* 1. HERO — emotional headline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
                    <span className="text-base leading-none">{meta.emoji}</span> Rezultatul tău: {meta.name}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] max-w-3xl mx-auto">
                    {c.heroTitle}
                    <span className="block mt-2 bg-gradient-to-r from-[#D4A84A] to-[#e8c56a] bg-clip-text text-transparent">
                      {c.heroTitleAccent}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">{c.heroSubtitle}</p>
                </motion.div>

                {/* 2. DURERE — specific validation */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="bg-white/5 border-white/10 p-6 md:p-8 space-y-3">
                    {c.pain.map((line, i) => (
                      <p key={i} className={cn(
                        'text-white/90 leading-relaxed',
                        i === c.pain.length - 1 ? 'text-lg font-semibold text-white pt-2 border-t border-white/10' : 'text-base',
                      )}>
                        {line}
                      </p>
                    ))}
                  </Card>
                </motion.div>

                {/* 3. REVELAȚIE */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center space-y-2">
                  <div className="text-xs uppercase tracking-wider text-[#D4A84A]">De ce rutina ta actuală nu funcționează</div>
                  <p className="text-2xl md:text-3xl font-bold leading-snug max-w-2xl mx-auto">
                    {c.revelation}
                  </p>
                </motion.div>

                {/* 4. PREVIEW — what Warrior Routine does */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="bg-gradient-to-br from-[#D4A84A]/8 to-transparent border-[#D4A84A]/20 p-6 md:p-8 space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Sword className="w-5 h-5 text-[#D4A84A]" /> Ce e diferit la Warrior Routine
                    </h3>
                    <p className="text-white/85 leading-relaxed">{c.preview}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-3 mt-3 border-t border-white/10">
                      {previewSteps.map((step) => (
                        <div key={step} className="flex items-center gap-2 text-white/80">
                          <Check className="w-3.5 h-3.5 text-[#D4A84A] flex-shrink-0" />
                          <span className="capitalize">{step.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        </div>
                      ))}
                      {lockedStepsCount > 0 && Array.from({ length: Math.min(lockedStepsCount, 4) }).map((_, i) => (
                        <div key={`locked-${i}`} className="flex items-center gap-2 text-white/30">
                          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="italic">Deblochează în cont</span>
                        </div>
                      ))}
                    </div>
                    {lockedStepsCount > 0 && (
                      <div className="text-xs text-center text-[#D4A84A]/80 pt-1">
                        🔒 {template.active_steps.length} pași personalizați + focus rutină + autosuggestion
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* 5. 3 PAȘI PENTRU AZI — actionable */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-center">
                    Ce faci diferit începând de azi
                  </h2>
                  <div className="space-y-3">
                    {c.steps.map((s) => (
                      <Card key={s.day} className="bg-white/5 border-white/10 p-5 flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#D4A84A]/15 border border-[#D4A84A]/30 text-[#D4A84A] flex items-center justify-center text-xs font-bold uppercase tracking-wider">
                          {s.day.slice(0, 3)}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-[#D4A84A]">→ {s.day} dimineață:</div>
                          <p className="text-white/85 leading-relaxed">{s.text}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                {/* 6. PROOF — testimonial */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="bg-white/5 border-white/10 p-6 md:p-8">
                    <p className="text-lg md:text-xl italic text-white/90 leading-relaxed mb-3">
                      „{c.testimonial.quote}"
                    </p>
                    <p className="text-sm text-[#D4A84A] font-semibold">— {c.testimonial.author}</p>
                  </Card>
                </motion.div>

                {/* 7. CTA PRINCIPAL — email gate + trial */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <Card className="bg-gradient-to-br from-[#D4A84A]/15 to-[#D4A84A]/5 border-[#D4A84A]/40 p-6 md:p-10 space-y-5 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                      Gata să treci de la <span className="text-white/50 line-through">{c.ctaTransition}</span>{' '}
                      la <span className="text-[#D4A84A]">construit</span>?
                    </h2>
                    <p className="text-white/80 max-w-md mx-auto">
                      Activează Warrior Starter. <span className="text-[#D4A84A] font-semibold">7 zile gratis.</span> Vezi diferența înainte să plătești ceva.
                    </p>

                    {!emailSent ? (
                      <form onSubmit={submitEmail} className="space-y-3 max-w-md mx-auto pt-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="adresa@email.com"
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                        />
                        <Button
                          type="submit"
                          size="lg"
                          disabled={emailSubmitting}
                          className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 text-base"
                        >
                          {emailSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Încep acum — 7 zile trial gratuit <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </Button>
                        <p className="text-xs text-white/60">
                          <span className="text-[#D4A84A] font-semibold">7€</span> doar dacă continui. Anulezi oricând, fără întrebări.
                        </p>
                      </form>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="inline-flex items-center gap-2 text-emerald-400 text-sm">
                          <CheckCircle2 className="w-5 h-5" /> Raport trimis pe {email}
                        </div>
                        <Button
                          onClick={goToCheckout}
                          disabled={checkoutLoading}
                          size="lg"
                          className="w-full max-w-md mx-auto flex bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 text-base"
                        >
                          {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <>Activează rutina — 7 zile trial gratuit <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </Button>
                        <p className="text-xs text-white/60">
                          <span className="text-[#D4A84A] font-semibold">7€</span> doar dacă continui. Anulezi oricând, fără întrebări.
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* 8. GARANȚIE */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="bg-emerald-500/5 border-emerald-500/20 p-5 flex items-start gap-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-emerald-400 mb-1">100% garanție 7 zile</div>
                      <p className="text-sm text-white/75 leading-relaxed">
                        Dacă nu simți progres în 7 zile, anulezi și nu plătești nimic. Fără telefon, fără explicații.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </>
            );
          })()}

          <div className="text-center pt-2">
            <Link to="/quiz-rutina" className="text-xs text-white/40 hover:text-white/70">← Refă quiz-ul</Link>
          </div>
        </main>

      </div>
    </>
  );
};

export default QuizRutinaResult;
