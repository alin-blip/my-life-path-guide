import { getStoredUtm } from '@/hooks/useUtmCapture';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  Rocket, ArrowRight, Dumbbell, Brain, 
  Heart, Crown, Users, Sparkles, Gift,
  Star, Target, Map, Bell, Trophy, ChevronDown
} from 'lucide-react';
import { trackCheckoutInitiated, trackViewContent } from '@/lib/facebook-pixel';
import { preOpenWindow, redirectExternal } from '@/lib/externalRedirect';
import { Helmet } from 'react-helmet-async';
import { useChallengeStats } from '@/hooks/useChallengeStats';
import { AnimatedChallengeCard } from '@/components/challenge/AnimatedChallengeCard';
import { LandingEarlyBirdTimer } from '@/components/landing/LandingEarlyBirdTimer';

import { ChallengePremiumOffer } from '@/components/challenge/ChallengePremiumOffer';

const Challenge7ZileLanding = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { totalParticipants, getCompletionsForDay, loading: statsLoading } = useChallengeStats();
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [realMetrics, setRealMetrics] = useState({ users: 0, completionRate: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [hasChallengeProgress, setHasChallengeProgress] = useState<boolean | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Fetch real metrics from database (no fake fallbacks)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [leadsRes, startedRes, completedRes] = await Promise.all([
          supabase.from('email_leads').select('id', { count: 'exact', head: true }).ilike('source', 'challenge%'),
          supabase.from('challenge_progress').select('user_id', { count: 'exact', head: true }),
          supabase.from('challenge_progress').select('id', { count: 'exact', head: true }).eq('day_number', 7).eq('completed', true),
        ]);
        const leads = leadsRes.count || 0;
        const started = startedRes.count || 0;
        const completed = completedRes.count || 0;
        const rate = started > 0 ? Math.round((completed / started) * 100) : 0;
        setRealMetrics({ users: leads, completionRate: rate });
      } catch (error) {
        // Fail silently — UI will hide the block via guards
        setRealMetrics({ users: 0, completionRate: 0 });
      }
    };
    fetchMetrics();
  }, []);

  // Meta Pixel ViewContent on landing mount
  useEffect(() => {
    trackViewContent('challenge_7_zile_landing', 'lead_magnet');
  }, []);

  // Detect authenticated users without challenge progress to show a strong "continue" CTA.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setIsAuthed(!!session);
      if (!session?.user) { setHasChallengeProgress(false); return; }
      const { count } = await supabase
        .from('challenge_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      if (!cancelled) setHasChallengeProgress((count || 0) > 0);
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-trigger checkout if user just came back from auth with a pending plan
  useEffect(() => {
    const resumePendingCheckout = async () => {
      const pending = localStorage.getItem('pending_challenge_plan');
      if (!pending) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // User is authenticated and has a pending plan
      localStorage.removeItem('pending_challenge_plan');
      const { planId, value } = JSON.parse(pending);

      setCheckoutLoading(true);
      trackCheckoutInitiated(planId, value);

      try {
        const preOpened = preOpenWindow();
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan: planId, source: 'challenge-7-zile', utm: getStoredUtm() || undefined }
        });

        if (error) { if (preOpened) preOpened.close(); throw error; }
        if (data?.url) {
          redirectExternal(data.url, preOpened);
        } else {
          if (preOpened) preOpened.close();
        }
      } catch (error) {
        console.error('Auto-checkout error:', error);
        toast({
          title: language === 'ro' ? 'Eroare la checkout' : 'Checkout error',
          description: language === 'ro' ? 'Te rugăm să încerci din nou.' : 'Please try again.',
          variant: 'destructive'
        });
      } finally {
        setCheckoutLoading(false);
      }
    };

    resumePendingCheckout();
  }, []);


  const challengeDays = [
    {
      day: 1,
      icon: Map,
      titleEn: "Vision & Declaration",
      titleRo: "Viziune & Declarație",
      descEn: "Napoleon Hill vision + Join community + Invite friends",
      descRo: "Viziune Napoleon Hill + Join comunitate + Invită prieteni",
      color: "from-purple-500 to-indigo-500",
      isFree: true
    },
    {
      day: 2,
      icon: Target,
      titleEn: "Body + Spirit + Relationships",
      titleRo: "Corp + Spirit + Relații",
      descEn: "Set objectives for all 3 personal areas",
      descRo: "Obiective pentru toate cele 3 arii personale",
      color: "from-green-500 to-purple-500",
      isFree: true
    },
    {
      day: 3,
      icon: Target,
      titleEn: "Business + Domino Door",
      titleRo: "Business + Domino Door",
      descEn: "Business vision + 90 days + Monthly + Weekly Door",
      descRo: "Viziune business + 90 zile + Lunar + Door săptămânal",
      color: "from-blue-500 to-cyan-500",
      isFree: false
    },
    {
      day: 4,
      icon: Crown,
      titleEn: "Warrior Routine + Vision AI",
      titleRo: "Rutina Warrior + Vision AI",
      descEn: "Daily flow + AI images + Personalized meditation",
      descRo: "Flow zilnic + Imagini AI + Meditație personalizată",
      color: "from-amber-500 to-orange-500",
      isFree: false
    },
    {
      day: 5,
      icon: Sparkles,
      titleEn: "Accountability + Mind Coach",
      titleRo: "Accountability + Mind Coach",
      descEn: "Status check + Transform emotions into power",
      descRo: "Status check + Transformă emoțiile în putere",
      color: "from-cyan-500 to-blue-500",
      isFree: false
    },
    {
      day: 6,
      icon: Bell,
      titleEn: "Idea List (Strategic Filter)",
      titleRo: "Lista de Idei (Filtru Strategic)",
      descEn: "Control impulse + Eisenhower classification",
      descRo: "Controlul impulsului + Clasificare Eisenhower",
      color: "from-red-500 to-pink-500",
      isFree: false
    },
    {
      day: 7,
      icon: Trophy,
      titleEn: "Membership + Continuity",
      titleRo: "Membership + Continuitate",
      descEn: "Recap + Upgrade + Final referral push",
      descRo: "Recapitulare + Upgrade + Invitații finale",
      color: "from-amber-500 to-yellow-600",
      isFree: false
    }
  ];

  const pillars = [
    { 
      icon: Dumbbell, 
      labelEn: 'Body', 
      labelRo: 'Corp',
      descEn: 'Stop chronic fatigue & reclaim your energy',
      descRo: 'Oprește oboseala cronică și recapătă energia',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: Brain, 
      labelEn: 'Being', 
      labelRo: 'Spirit',
      descEn: 'Regain inner peace & mental clarity',
      descRo: 'Recapătă pacea interioară și claritatea mentală',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: Heart, 
      labelEn: 'Balance', 
      labelRo: 'Relații',
      descEn: 'Rebuild neglected connections',
      descRo: 'Reconstruiește conexiunile neglijate',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      icon: Target, 
      labelEn: 'Business', 
      labelRo: 'Business',
      descEn: 'From overwhelm to focused execution',
      descRo: 'De la haos la execuție focusată',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10'
    }
  ];

  const benefits = [
    {
      icon: Target,
      textEn: 'Break the procrastination cycle',
      textRo: 'Oprești ciclul procrastinării'
    },
    {
      icon: Rocket,
      textEn: 'Strategic burnout recovery plan',
      textRo: 'Ieși din burnout strategic'
    },
    {
      icon: Sparkles,
      textEn: 'Reclaim your energy & focus',
      textRo: 'Recapătă energia și focusul'
    },
    {
      icon: Star,
      textEn: 'Build daily momentum',
      textRo: 'Construiești momentum zilnic'
    },
    {
      icon: Users,
      textEn: 'Community that holds you accountable',
      textRo: 'Comunitate care te ține responsabil'
    },
    {
      icon: Shield,
      textEn: '7-day free trial — cancel anytime',
      textRo: '7 zile trial gratuit — anulezi oricând'
    }
  ];

  const faqItems = [
    {
      q: language === 'en' ? 'What happens after the 7 days?' : 'Ce se întâmplă după cele 7 zile?',
      a: language === 'en'
        ? 'If you don\'t cancel, it becomes €49/month. You can cancel anytime from your account, without explanations.'
        : 'Dacă nu anulezi, devine 249 LEI/lună (€49). Poți anula oricând din contul tău, fără explicații.'
    },
    {
      q: language === 'en' ? 'Do I need a card to start?' : 'Trebuie card pentru a începe?',
      a: language === 'en'
        ? 'Yes. A card is required to start. We don\'t charge anything in the first 7 days. Charging begins automatically after 7 days, only if you don\'t cancel.'
        : 'Da. Cardul e necesar ca să începi. Nu taxăm nimic în primele 7 zile. Taxarea începe automat după 7 zile, doar dacă nu anulezi.'
    },
    {
      q: language === 'en' ? 'When is the first charge?' : 'Când se face prima taxare?',
      a: language === 'en'
        ? 'After 7 days. You\'ll get an email 2 days before, so nothing is a surprise.'
        : 'După 7 zile. Primești email cu 2 zile înainte, ca să nu fie surprinzător.'
    },
    {
      q: language === 'en' ? 'How do I cancel?' : 'Cum anulez?',
      a: language === 'en'
        ? 'From your account → Settings → Subscription → Cancel. Done. No phone calls, no explanations.'
        : 'Din contul tău → Setări → Abonament → Anulează. Gata. Fără telefon, fără explicații.'
    },
    {
      q: language === 'en' ? 'How much time does it take per day?' : 'Cât timp durează pe zi?',
      a: language === 'en'
        ? '30–45 minutes in the morning for the Warrior Routine. The rest of the day is normal execution.'
        : '30-45 minute dimineața pentru Warrior Routine. Restul zilei e execuție normală.'
    },
    {
      q: language === 'en' ? 'Does it work on mobile?' : 'Funcționează pe mobil?',
      a: language === 'en'
        ? 'Yes. Everything works on mobile, including AI Coach and meditations.'
        : 'Da. Totul e pe mobil, inclusiv AI Coach și meditațiile.'
    },
    {
      q: language === 'en' ? 'What if I\'m too busy?' : 'Ce se întâmplă dacă sunt prea ocupat?',
      a: language === 'en'
        ? 'Warrior Routine is built for 45 min in the morning. In a busy stretch, shrink it to 20 min. Just don\'t skip two days in a row.'
        : 'Warrior Routine e gândită pentru 45 min dimineața. Dacă ești într-o perioadă aglomerată, redu la 20 min. Doar să nu sari 2 zile la rând.'
    }
  ];


  const stats = realMetrics.users > 0 ? [
    {
      value: `${realMetrics.users.toLocaleString()}+`,
      label: language === 'en' ? "Signups" : "Înscrieri"
    },
    {
      value: realMetrics.completionRate > 0 ? `${realMetrics.completionRate}%` : '—',
      label: language === 'en' ? "Day 7 Completion" : "Finalizare Ziua 7"
    },
    {
      value: "4.8/5",
      label: language === 'en' ? "Average Rating" : "Rating Mediu"
    }
  ] : [];

  if (checkoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            {language === 'ro' ? 'Se pregătește checkout-ul...' : 'Preparing checkout...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Break Free from Burnout in 7 Days | Free Challenge' : 'Ieși din Burnout în 7 Zile | Challenge Gratuit'}</title>
        <meta name="description" content={language === 'en' 
          ? 'Stop procrastination, break free from burnout and build real momentum in 7 days. Free challenge.'
          : 'Oprești procrastinarea, ieși din burnout și construiești momentum real în 7 zile. Challenge gratuit.'
        } />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">


        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-20 flex gap-1 bg-background/80 backdrop-blur border border-border rounded-full p-1">
          <button
            onClick={() => setLanguage('ro')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'ro' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Română"
          >
            🇷🇴 RO
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="English"
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative pt-20 pb-20 px-4 md:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
          <div className="max-w-6xl mx-auto text-center relative">
            <Badge className="mb-6 bg-green-500/10 text-green-600 border-green-500/30 px-4 py-1.5">
              <Gift className="h-4 w-4 mr-1.5 inline" />
              {language === 'en' ? '🎁 100% FREE - INSTANT ACCOUNT' : '🎁 100% GRATUIT - CONT INSTANT'}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-foreground leading-tight">
              {language === 'en' 
                ? 'From burnout & blockage to clarity, results & momentum in body, spirit, relationships & business in 7 days' 
                : 'De la blocaj și epuizare la claritate, rezultate și momentum în corp, spiritualitate, relații și business în 7 zile'}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {language === 'en'
                ? "The world's first operating system for an abundant and balanced life. Built in Romania."
                : 'Primul sistem de operare pentru o viață abundentă și echilibrată din lume. Construit în România.'}
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
            >
              <Users className="h-4 w-4" />
              <span>
                {statsLoading || totalParticipants < 10
                  ? null
                  : (language === 'en' 
                      ? `${totalParticipants.toLocaleString()}+ people joined` 
                      : `${totalParticipants.toLocaleString()}+ persoane înscrise`)
                }
              </span>
            </motion.div>

            {/* Continue CTA for authenticated users without progress */}
            {isAuthed && hasChallengeProgress === false && !localStorage.getItem('pending_challenge_plan') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-8 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/40"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {language === 'en' ? '🎯 Your challenge is waiting' : '🎯 Challenge-ul tău te așteaptă'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? 'You have an account but haven\'t started Day 1 yet.' : 'Ai deja cont, dar nu ai început Ziua 1.'}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => navigate('/challenge/1')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 whitespace-nowrap"
                  >
                    {language === 'en' ? 'Continue to Day 1' : 'Continuă la Ziua 1'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {isAuthed && hasChallengeProgress === true && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/challenge')}
                  className="w-full border-amber-500/50"
                >
                  {language === 'en' ? 'Continue where you left off →' : 'Continuă de unde ai rămas →'}
                </Button>
              </motion.div>
            )}

            {/* Early Bird Timer */}
            <div className="flex justify-center mb-6">
              <LandingEarlyBirdTimer />
            </div>

            {/* Voomly Video Embed - Same as Homepage with Cyan Glow */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-3xl mx-auto"
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.3),0_0_100px_rgba(34,211,238,0.2)] animate-pulse-glow">
                <iframe 
                  src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=a1UxQlSF_zsIRg949UdpevBeG3kFJw9e8Ddw8GgXOiKdfh4tG&videoRatio=1.777778&type=v&skinColor=%232758EB" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* Premium Plans - immediately after video */}
            <motion.div
              id="plans-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <ChallengePremiumOffer />
            </motion.div>
          </div>
        </section>

        {/* 4 Pillars Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {language === 'en' ? 'Why Are You Stuck? Imbalance in 4 Areas' : 'De Ce Ești Blocat? Lipsa Echilibrului în 4 Arii'}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              {language === 'en'
                ? "Burnout happens when one area is neglected. That's exactly what we fix."
                : 'Burnout-ul vine când una din arii e neglijată. Fix asta reparăm.'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.labelEn} className={`p-6 text-center ${pillar.bgColor} border-0`}>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${pillar.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">
                      {language === 'en' ? pillar.labelEn : pillar.labelRo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? pillar.descEn : pillar.descRo}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7 Days Preview */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {language === 'en' ? 'Your 7-Step Anti-Burnout Plan' : 'Planul Tău Anti-Burnout în 7 Pași'}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Each day pulls you further from the fog and closer to clarity.'
                : 'Fiecare zi te scoate mai mult din ceață și te mută spre claritate.'}
            </p>
            
            <div className="space-y-3">
              {challengeDays.map((day) => (
                <AnimatedChallengeCard
                  key={day.day}
                  day={day.day}
                  icon={day.icon}
                  titleEn={day.titleEn}
                  titleRo={day.titleRo}
                  descEn={day.descEn}
                  descRo={day.descRo}
                  color={day.color}
                  completions={getCompletionsForDay(day.day)}
                  language={language}
                  isFree={day.isFree}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section — hidden until we have real data */}
        {stats.length > 0 && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
              {language === 'en' ? 'What You\'ll Get' : 'Ce Vei Obține'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">
                      {language === 'en' ? benefit.textEn : benefit.textRo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-2">
                {language === 'en' ? "Frequently Asked Questions" : "Întrebări Frecvente"}
              </h2>
            </motion.div>

            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold pr-4">{item.q}</h3>
                        <ChevronDown 
                          className={`h-5 w-5 shrink-0 transition-transform ${
                            openFaq === i ? "rotate-180" : ""
                          }`} 
                        />
                      </div>
                      {openFaq === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-muted-foreground mt-3 text-sm"
                        >
                          {item.a}
                        </motion.p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {language === 'en' 
                ? 'Ready for Momentum?' 
                : 'Gata de Momentum?'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {language === 'en'
                ? 'Break the burnout cycle. The first 2 steps are free.'
                : 'Oprește ciclul burnout-ului. Primii 2 pași sunt gratuit.'}
            </p>
            
            <Button 
              size="lg"
              onClick={() => {
                document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8 py-6"
            >
              {language === 'en' ? 'Choose Your Plan' : 'Alege Abonamentul'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Have It All Lifestyle. {language === 'en' ? 'All rights reserved.' : 'Toate drepturile rezervate.'}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Challenge7ZileLanding;
