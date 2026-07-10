import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Sword, Loader2, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { WARRIOR_TYPES, WARRIOR_TEMPLATES, getWarriorMeta, type WarriorType } from '@/data/warriorTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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

const RESULT_CONTENT_EN: typeof RESULT_CONTENT = {
  reactor: {
    heroTitle: 'You wake up in a rush',
    heroTitleAccent: 'every single morning.',
    heroSubtitle: 'You\'re the Reactor type. And it sabotages you daily.',
    pain: [
      'Phone, email, news — they all tell you what to do in the first minute.',
      'You react all day because you start reactive.',
      'By the end of the day you\'re drained, but can\'t say what you actually did.',
    ],
    revelation: 'You don\'t need more discipline. You need a transition ritual between sleep and the world.',
    preview: 'Warrior Routine gives you 5 simple steps, 20 minutes, that make the difference between "reactive" and "intentional".',
    steps: [
      { day: 'Today', text: 'Do NOT open your phone first. Sit 5 minutes in silence. Just breathe.' },
      { day: 'Tomorrow', text: 'Drink 500ml of water before anything else. Hydrate the body, not the brain with caffeine.' },
      { day: 'Day 3', text: 'Ask yourself out loud: "How do I want to feel today?" — answer for 2 minutes.' },
    ],
    testimonial: {
      quote: 'I shifted from reactive to intentional. The difference? 45 morning minutes I actually protected.',
      author: 'Dan, SaaS CEO',
    },
    ctaTransition: 'reacting',
  },
  disciplined: {
    heroTitle: 'You do everything perfectly.',
    heroTitleAccent: 'But you don\'t feel like you\'re moving.',
    heroSubtitle: 'You\'re the Disciplined type. And it keeps you stuck.',
    pain: [
      'You have a routine. You follow it daily. You do everything "right".',
      'But at the end of the day, you look back and don\'t feel progress.',
      'It\'s not lack of discipline. It\'s lack of meaning.',
    ],
    revelation: 'Discipline without direction is the hardest kind of fatigue.',
    preview: 'Warrior Routine doesn\'t add steps. It connects the steps you already run to a concrete 90-day vision.',
    steps: [
      { day: 'Today', text: 'Write on paper: "WHY do I run this routine?" Answer honestly, not what you should say.' },
      { day: 'Tomorrow', text: 'Add one element of joy to the routine: music, movement, creation. Discipline doesn\'t have to be rigid.' },
      { day: 'Day 3', text: 'Connect every step to your 90-day vision. If it isn\'t written down, it isn\'t concrete.' },
    ],
    testimonial: {
      quote: 'I went from "ticking tasks" to "building something". Same routine. Different meaning.',
      author: 'Mihai, CEO Mind OS',
    },
    ctaTransition: 'ticking',
  },
  experimenter: {
    heroTitle: 'You\'ve read 10 books on routines,',
    heroTitleAccent: 'but finished none.',
    heroSubtitle: 'You\'re the Experimenter type. And it keeps you stuck.',
    pain: [
      'You\'ve read it all. Miracle Morning, Atomic Habits, The 5AM Club.',
      'You\'ve tested 20 systems. Reset 20 times.',
      'You collect systems. You apply none.',
    ],
    revelation: 'It\'s not an information problem. It\'s an execution problem. Experimenting without commitment is procrastination with a bonus.',
    preview: 'Warrior Routine stops the search. It gives you ONE system specific to your type and keeps you on it for 30 days.',
    steps: [
      { day: 'Today', text: 'Pick ONE system. Run it for 30 days without changing anything.' },
      { day: 'Tomorrow', text: 'Measure ONE thing: "Do I feel better?" Note it on a 1–10 scale.' },
      { day: 'Day 3', text: 'Make a public commitment. Tell someone you respect: "30 days. No exceptions."' },
    ],
    testimonial: {
      quote: 'I stopped searching. I started doing. 30 days. One system. The first time I felt real progress.',
      author: 'Andrei, founder',
    },
    ctaTransition: 'reading',
  },
  warrior: {
    heroTitle: 'You have the discipline.',
    heroTitleAccent: 'You\'re missing the direction.',
    heroSubtitle: 'You\'re the Warrior type. Now you need meaning.',
    pain: [
      'Your routine is solid. You run it daily. You\'re already above 90% of founders.',
      'But something doesn\'t feel like progress. You do it mechanically, without impact.',
      'Power without direction is a treadmill: you tire, but you don\'t arrive.',
    ],
    revelation: 'Vision without power is a dream. Power without vision is a treadmill. You have the power. Now you need direction.',
    preview: 'Warrior Routine connects your routine to a 90-day vision and a weekly review that shows exactly what moves the business and what doesn\'t.',
    steps: [
      { day: 'Today', text: 'Write your 90-day vision. 1 page, 3 paragraphs. No editing.' },
      { day: 'Tomorrow', text: 'Connect every routine step to the vision. If a step serves nothing — remove it.' },
      { day: 'Day 3', text: 'Add a 15-minute Sunday weekly review. What moved? What didn\'t? What do you adjust?' },
    ],
    testimonial: {
      quote: 'I went from execution to construction. Same effort. Different impact. The difference was the weekly review.',
      author: 'Vlad, CEO tech',
    },
    ctaTransition: 'executing',
  },
};

const UI = {
  ro: {
    resultBadge: 'Rezultatul tău',
    whyLabel: 'De ce rutina ta actuală nu funcționează',
    whatDifferent: 'Ce e diferit la Warrior Routine',
    unlockInAccount: 'Deblochează în cont',
    lockedNote: (n: number) => `🔒 ${n} pași personalizați + focus rutină + autosuggestion`,
    changeToday: 'Ce faci diferit începând de azi',
    morningLabel: (day: string) => `→ ${day} dimineață:`,
    ctaTitleA: 'Gata să treci de la',
    ctaTitleB: 'la',
    ctaBuilt: 'construit',
    ctaBody1: 'Activează Warrior Starter.',
    ctaFreeDays: '7 zile gratis.',
    ctaBody2: 'Vezi diferența înainte să plătești ceva.',
    emailPh: 'adresa@email.com',
    startNow: 'Încep acum — 7 zile trial gratuit',
    priceNote1: 'doar dacă continui. Anulezi oricând, fără întrebări.',
    price: '7€',
    reportSent: (e: string) => `Raport trimis pe ${e}`,
    activateRoutine: 'Activează rutina — 7 zile trial gratuit',
    guarantee: '100% garanție 7 zile',
    guaranteeBody: 'Dacă nu simți progres în 7 zile, anulezi și nu plătești nimic. Fără telefon, fără explicații.',
    retake: '← Refă quiz-ul',
    invalidEmail: 'Email invalid',
    reportOk: 'Raportul a fost trimis pe email 📧',
    reportErr: 'Nu am putut trimite raportul. Încearcă din nou.',
    checkoutErr: 'Nu am putut porni checkout-ul. Încearcă din nou.',
    activating: 'Se activează...',
    activateBtn: 'Activează-mi rutina Warrior',
    activateOk: 'Rutina Warrior a fost activată! ⚔️',
    activateErr: 'Nu am putut activa rutina. Încearcă din nou.',
    stepsHeader: (n: number) => `Rutina ta (${n} pași)`,
    strengths: 'Puncte forte',
    challenges: 'Provocări',
    youAre: 'Ești',
  },
  en: {
    resultBadge: 'Your result',
    whyLabel: 'Why your current routine doesn\'t work',
    whatDifferent: 'What\'s different about Warrior Routine',
    unlockInAccount: 'Unlock inside account',
    lockedNote: (n: number) => `🔒 ${n} personalized steps + routine focus + autosuggestion`,
    changeToday: 'What you do differently starting today',
    morningLabel: (day: string) => `→ ${day} morning:`,
    ctaTitleA: 'Ready to go from',
    ctaTitleB: 'to',
    ctaBuilt: 'built',
    ctaBody1: 'Activate Warrior Starter.',
    ctaFreeDays: '7 days free.',
    ctaBody2: 'See the difference before you pay anything.',
    emailPh: 'you@example.com',
    startNow: 'Start now — 7-day free trial',
    priceNote1: 'only if you continue. Cancel anytime, no questions.',
    price: '€7',
    reportSent: (e: string) => `Report sent to ${e}`,
    activateRoutine: 'Activate my routine — 7-day free trial',
    guarantee: '100% guarantee — 7 days',
    guaranteeBody: 'If you don\'t feel progress in 7 days, cancel and pay nothing. No call, no explanations.',
    retake: '← Retake the quiz',
    invalidEmail: 'Invalid email',
    reportOk: 'Report sent to your email 📧',
    reportErr: 'We couldn\'t send the report. Please try again.',
    checkoutErr: 'We couldn\'t start checkout. Please try again.',
    activating: 'Activating...',
    activateBtn: 'Activate my Warrior routine',
    activateOk: 'Warrior routine activated! ⚔️',
    activateErr: 'We couldn\'t activate the routine. Please try again.',
    stepsHeader: (n: number) => `Your routine (${n} steps)`,
    strengths: 'Strengths',
    challenges: 'Challenges',
    youAre: 'You are',
  },
} as const;


const QuizRutinaResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const u = isEn ? UI.en : UI.ro;
  const langPrefix = ''; // BrowserRouter basename handles /en prefix

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

  const rawMeta = warriorType ? WARRIOR_TYPES[warriorType] : null;
  const meta = rawMeta ? getWarriorMeta(rawMeta, isEn ? 'en' : 'ro') : null;
  const template = warriorType ? WARRIOR_TEMPLATES[warriorType] : null;
  const resultContent = isEn ? RESULT_CONTENT_EN : RESULT_CONTENT;

  // Preview: show only first 3 steps in the soft-gate variant
  const previewSteps = useMemo(() => template?.active_steps.slice(0, 3) ?? [], [template]);
  const lockedStepsCount = (template?.active_steps.length ?? 0) - previewSteps.length;


  useEffect(() => {
    if (!warriorType || !WARRIOR_TYPES[warriorType]) {
      navigate(`${langPrefix}/quiz-rutina`, { replace: true });
    }
  }, [warriorType, navigate, langPrefix]);


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
      if (!data?.success) throw new Error(data?.error || 'Error');
      toast.success(u.activateOk);
      navigate(data.redirect_url || `${langPrefix}/daily-flow?new=1`);
    } catch (e) {
      console.error(e);
      toast.error(u.activateErr);
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
            language: isEn ? 'en' : 'ro',

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
      toast.error(u.invalidEmail);
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
          language: isEn ? 'en' : 'ro',
          utm: { ...utm, source },
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Error');
      setLeadId(data.lead_id);
      setEmailSent(true);
      toast.success(u.reportOk);
    } catch (err) {
      console.error(err);
      toast.error(u.reportErr);
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
          language: isEn ? 'en' : 'ro',
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
      toast.error(u.checkoutErr);
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
          <html lang={isEn ? 'en' : 'ro'} />
          <title>{`${u.youAre} ${meta.name} — Warrior Routine | CEO Mind OS`}</title>
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
                {u.youAre} <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', meta.color)}>{meta.name}</span>
              </h1>
              <p className="text-xl text-white/80 max-w-xl mx-auto">{meta.tagline}</p>
            </motion.div>
            <Card className="bg-white/5 border-white/10 p-6 space-y-4">
              <p className="text-white/90 leading-relaxed">{meta.description}</p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 mb-1">{u.strengths}</div>
                  <div className="text-sm text-white/85">{meta.strengths}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="text-xs uppercase tracking-wider text-red-400 mb-1">{u.challenges}</div>
                  <div className="text-sm text-white/85">{meta.challenges}</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-[#D4A84A]" /> {u.stepsHeader(template.active_steps.length)}
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
                {activating ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> {u.activating}</>
                  : <>{u.activateBtn} <ArrowRight className="ml-2 w-4 h-4" /></>}
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
        <html lang={isEn ? 'en' : 'ro'} />
        <title>{`${u.youAre} ${meta.name} — Warrior Routine | CEO Mind OS`}</title>
        <meta name="description" content={`${u.youAre} ${meta.name}: ${meta.tagline}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#0B1733] via-[#0f1e42] to-[#0B1733] text-white">
        <header className="p-4 md:p-6 max-w-4xl mx-auto flex items-center gap-2">
          <Sword className="w-5 h-5 text-[#D4A84A]" />
          <span className="font-semibold text-sm tracking-wide">CEO MIND OS</span>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-10">
          {(() => {
            const c = resultContent[warriorType as WarriorType];

            return (
              <>
                {/* 1. HERO — emotional headline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A84A]/10 border border-[#D4A84A]/30 text-[#D4A84A] text-xs uppercase tracking-wider">
                    <span className="text-base leading-none">{meta.emoji}</span> {u.resultBadge}: {meta.name}

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
                  <div className="text-xs uppercase tracking-wider text-[#D4A84A]">{u.whyLabel}</div>
                  <p className="text-2xl md:text-3xl font-bold leading-snug max-w-2xl mx-auto">
                    {c.revelation}
                  </p>
                </motion.div>

                {/* 4. PREVIEW — what Warrior Routine does */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="bg-gradient-to-br from-[#D4A84A]/8 to-transparent border-[#D4A84A]/20 p-6 md:p-8 space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Sword className="w-5 h-5 text-[#D4A84A]" /> {u.whatDifferent}
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
                          <span className="italic">{u.unlockInAccount}</span>
                        </div>
                      ))}
                    </div>
                    {lockedStepsCount > 0 && (
                      <div className="text-xs text-center text-[#D4A84A]/80 pt-1">
                        {u.lockedNote(template.active_steps.length)}
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* 5. 3 PAȘI PENTRU AZI — actionable */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-center">
                    {u.changeToday}
                  </h2>

                  <div className="space-y-3">
                    {c.steps.map((s) => (
                      <Card key={s.day} className="bg-white/5 border-white/10 p-5 flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#D4A84A]/15 border border-[#D4A84A]/30 text-[#D4A84A] flex items-center justify-center text-xs font-bold uppercase tracking-wider">
                          {s.day.slice(0, 3)}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-[#D4A84A]">{u.morningLabel(s.day)}</div>
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
                      {u.ctaTitleA} <span className="text-white/50 line-through">{c.ctaTransition}</span>{' '}
                      {u.ctaTitleB} <span className="text-[#D4A84A]">{u.ctaBuilt}</span>?
                    </h2>
                    <p className="text-white/80 max-w-md mx-auto">
                      {u.ctaBody1} <span className="text-[#D4A84A] font-semibold">{u.ctaFreeDays}</span> {u.ctaBody2}
                    </p>


                    {!emailSent ? (
                      <form onSubmit={submitEmail} className="space-y-3 max-w-md mx-auto pt-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder={u.emailPh}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                        />
                        <Button
                          type="submit"
                          size="lg"
                          disabled={emailSubmitting}
                          className="w-full bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 text-base"
                        >
                          {emailSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{u.startNow} <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </Button>
                        <p className="text-xs text-white/60">
                          <span className="text-[#D4A84A] font-semibold">{u.price}</span> {u.priceNote1}
                        </p>

                      </form>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="inline-flex items-center gap-2 text-emerald-400 text-sm">
                          <CheckCircle2 className="w-5 h-5" /> {u.reportSent(email)}
                        </div>
                        <Button
                          onClick={goToCheckout}
                          disabled={checkoutLoading}
                          size="lg"
                          className="w-full max-w-md mx-auto flex bg-[#D4A84A] hover:bg-[#c4993d] text-[#0B1733] font-semibold h-14 text-base"
                        >
                          {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <>{u.activateRoutine} <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </Button>
                        <p className="text-xs text-white/60">
                          <span className="text-[#D4A84A] font-semibold">{u.price}</span> {u.priceNote1}
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
                      <div className="font-semibold text-emerald-400 mb-1">{u.guarantee}</div>
                      <p className="text-sm text-white/75 leading-relaxed">
                        {u.guaranteeBody}
                      </p>

                    </div>
                  </Card>
                </motion.div>
              </>
            );
          })()}

          <div className="text-center pt-2">
            <Link to={`${langPrefix}/quiz-rutina`} className="text-xs text-white/40 hover:text-white/70">{u.retake}</Link>
          </div>
        </main>

      </div>
    </>
  );
};

export default QuizRutinaResult;
