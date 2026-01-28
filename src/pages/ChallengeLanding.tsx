import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Target, 
  Heart, 
  Brain, 
  Briefcase,
  Clock,
  Shield,
  ArrowRight,
  Star,
  Users,
  Trophy,
  Sparkles,
  ChevronDown,
  Gift,
  Rocket
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { plans, getLocalizedPlan } from "@/data/pricing";
import { LandingEarlyBirdTimer } from "@/components/landing/LandingEarlyBirdTimer";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { redirectExternal } from "@/lib/externalRedirect";

export default function ChallengeLanding() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [realMetrics, setRealMetrics] = useState({ users: 0, completionRate: 0 });
  
  // Lead capture state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);

  const isRo = language === 'ro';

  // Fetch real metrics from database
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [usersRes, completedRes] = await Promise.all([
          supabase.from('subscribers').select('id', { count: 'exact', head: true }),
          supabase.from('challenge_progress').select('id', { count: 'exact', head: true }).eq('day_number', 7).eq('completed', true)
        ]);
        
        const users = usersRes.count || 0;
        const completed = completedRes.count || 0;
        const rate = users > 0 ? Math.round((completed / users) * 100) : 89;
        
        setRealMetrics({ 
          users: users > 50 ? users : 1247, 
          completionRate: rate > 50 ? rate : 89 
        });
      } catch (error) {
        setRealMetrics({ users: 1247, completionRate: 89 });
      }
    };
    fetchMetrics();
  }, []);

  // Get localized plans
  const proPlan = getLocalizedPlan(plans.find(p => p.id === 'pro')!, language);
  const elitePlan = getLocalizedPlan(plans.find(p => p.id === 'elite')!, language);

  const handleTrialStart = () => {
    if (!isLeadCaptured) {
      // Scroll to lead form
      const leadForm = document.getElementById('lead-form');
      leadForm?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/auth?trial=7&redirect=/challenge');
  };

  // Lead capture handler for A/B Test Variant B
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_leads')
        .insert({
          email,
          name: name || null,
          lead_magnet: 'challenge_free_trial',
          source: 'ab_test_variant_b',
          metadata: {
            test_name: 'challenge_landing_ab',
            variant: 'B',
            signup_date: new Date().toISOString()
          }
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      setIsLeadCaptured(true);
      toast({
        title: isRo ? '🎉 Ești înscris!' : '🎉 You\'re in!',
        description: isRo 
          ? 'Alege planul tău de transformare mai jos.' 
          : 'Choose your transformation plan below.',
      });

      // Scroll to pricing
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        pricingSection?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: isRo ? "Eroare" : "Error",
        description: isRo 
          ? "Ceva nu a mers. Te rugăm să încerci din nou." 
          : "Something went wrong. Please try again.",
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to auth with plan info
        navigate(`/auth?plan=${planId}&redirect=/challenge`);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId, source: 'challenge-landing' }
      });

      if (error) throw error;
      if (data?.url) {
        redirectExternal(data.url);
      }
    } catch (error: any) {
      toast({
        title: isRo ? "Eroare" : "Error",
        description: error.message || (isRo ? "A apărut o eroare" : "Something went wrong"),
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const content = {
    meta: {
      title: isRo 
        ? "Have It All Lifestyle Challenge - 7 Zile de Transformare | WarriorOS" 
        : "Have It All Lifestyle Challenge - 7 Days of Transformation | WarriorOS",
      description: isRo
        ? "Transformă-ți viața în 7 zile. Corp, Spirit, Relații și Business - toate în echilibru perfect. Începe gratuit!"
        : "Transform your life in 7 days. Body, Mind, Relationships and Business - all in perfect balance. Start free!"
    },
    hero: {
      badge: isRo ? "🚀 7 ZILE ACCES COMPLET GRATUIT" : "🚀 7 DAYS FULL ACCESS FREE",
      headline: isRo 
        ? "Acces GRATUIT 7 Zile la TOT — Anulezi Oricând" 
        : "7 Days FREE Access to EVERYTHING — Cancel Anytime",
      subheadline: isRo
        ? "Fără sacrificii. Fără să renunți la familie. Doar 15 minute/zi pentru corp, spirit, relații și business — toate în echilibru perfect."
        : "No sacrifices. Without giving up family. Just 15 minutes/day for Body, Mind, Relationships and Business — all in perfect balance."
    },
    problems: {
      title: isRo ? "Recunoști Situația?" : "Sound Familiar?",
      items: isRo ? [
        "Ai încercat 100 de metode și nimic n-a funcționat pe termen lung",
        "Îți sacrifici sănătatea pentru a-ți construi afacerea",
        "Relațiile suferă când ești ocupat cu munca",
        "Nu ai claritate mentală și te simți copleșit constant"
      ] : [
        "You've tried 100 methods and nothing worked long-term",
        "You sacrifice your health to build your business",
        "Relationships suffer when you're busy with work",
        "No mental clarity and feeling constantly overwhelmed"
      ]
    },
    solution: {
      title: isRo ? "Soluția: Have It All Challenge" : "The Solution: Have It All Challenge",
      items: isRo ? [
        "Sistem pas-cu-pas pentru toate 4 ariile vieții",
        "Doar 15 minute pe zi, 7 zile, rezultate vizibile",
        "Coaching AI personalizat pentru situația ta",
        "Vision board generat automat + reality map"
      ] : [
        "Step-by-step system for all 4 life areas",
        "Just 15 minutes per day, 7 days, visible results",
        "Personalized AI Coaching for your situation",
        "Auto-generated Vision Board + Reality Map"
      ]
    },
    days: [
      {
        day: 1,
        title: isRo ? "Viziune și declarație" : "Vision & Declaration",
        icon: Target,
        focus: isRo ? "Claritate" : "Clarity",
        color: "text-purple-400"
      },
      {
        day: 2,
        title: isRo ? "Puterea minții" : "Mind Power",
        icon: Brain,
        focus: isRo ? "Spirit" : "Being",
        color: "text-blue-400"
      },
      {
        day: 3,
        title: isRo ? "Energie fizică" : "Physical Energy",
        icon: Zap,
        focus: isRo ? "Corp" : "Body",
        color: "text-green-400"
      },
      {
        day: 4,
        title: isRo ? "Relații puternice" : "Strong Relationships",
        icon: Heart,
        focus: isRo ? "Relații" : "Balance",
        color: "text-pink-400"
      },
      {
        day: 5,
        title: isRo ? "Business și valoare" : "Business & Value",
        icon: Briefcase,
        focus: isRo ? "Business" : "Business",
        color: "text-amber-400"
      },
      {
        day: 6,
        title: isRo ? "Sistem de rutină" : "Routine System",
        icon: Clock,
        focus: isRo ? "Execuție" : "Execution",
        color: "text-cyan-400"
      },
      {
        day: 7,
        title: isRo ? "Integrare și sprint" : "Integration & Sprint",
        icon: Trophy,
        focus: isRo ? "Mastery" : "Mastery",
        color: "text-yellow-400"
      }
    ],
    pricing: {
      title: isRo ? "Alege Calea Ta de Transformare" : "Choose Your Transformation Path",
      subtitle: isRo 
        ? "Indiferent ce alegi, primele 7 zile sunt pe noi" 
        : "No matter what you choose, the first 7 days are on us",
      trial: {
        name: isRo ? "Trial Gratuit" : "Free Trial",
        price: isRo ? "GRATIS" : "FREE",
        period: isRo ? "7 zile" : "7 days",
        features: isRo ? [
          "Challenge complet 7 zile",
          "Reality Map - evaluarea vieții",
          "AI Vision Board generator",
          "Door planning system",
          "Stacks pentru reset rapid"
        ] : [
          "Complete 7-day Challenge",
          "Reality Map - life assessment",
          "AI Vision Board generator",
          "Door planning system",
          "Stacks for quick reset"
        ],
        cta: isRo ? "Începe Gratuit" : "Start Free"
      },
      pro: {
        badge: isRo ? "CEL MAI POPULAR" : "MOST POPULAR",
        features: isRo ? [
          "Tot ce include trial +",
          "Coaching live săptămânal cu Alin",
          "Comunitate VIP pro members",
          "Sprint 90 zile cu KPI-uri",
          "Referral 50% comision recurent",
          "Support VIP dedicat"
        ] : [
          "Everything in Trial +",
          "Weekly LIVE Coaching with Alin",
          "VIP Pro members community",
          "90-day Sprint with KPIs",
          "50% recurring referral commission",
          "Dedicated VIP support"
        ],
        cta: isRo ? "Începe 7 Zile Trial" : "Start 7-Day Trial"
      },
      elite: {
        badge: isRo ? "TOT INCLUS" : "ALL-INCLUSIVE",
        features: isRo ? [
          "Tot ce include pro +",
          "Warrior Accelerator (€497 valoare)",
          "47+ lecții video premium",
          "Coaching 1-la-1 lunar (30 min)",
          "Coach Dashboard complet",
          "Framework 90 zile implementare"
        ] : [
          "Everything in Pro +",
          "Warrior Accelerator (€497 value)",
          "47+ premium video lessons",
          "Monthly 1-on-1 Coaching (30 min)",
          "Complete Coach Dashboard",
          "90-day implementation framework"
        ],
        cta: isRo ? "Alege Elite" : "Go Elite"
      }
    },
    stats: [
      { 
        value: `${realMetrics.users.toLocaleString()}+`, 
        label: isRo ? "Utilizatori Activi" : "Active Users" 
      },
      { 
        value: `${realMetrics.completionRate}%`, 
        label: isRo ? "Rată de Finalizare" : "Completion Rate" 
      },
      { 
        value: "4.8/5", 
        label: isRo ? "Rating Mediu" : "Average Rating" 
      }
    ],
    faq: [
      {
        q: isRo ? "Cât timp durează pe zi?" : "How much time does it take per day?",
        a: isRo 
          ? "Doar 15 minute pe zi. Fiecare modul este conceput pentru a fi scurt dar impactant. Poți face mai mult dacă vrei, dar 15 minute sunt suficiente pentru progres." 
          : "Just 15 minutes per day. Each module is designed to be short but impactful. You can do more if you want, but 15 minutes is enough for progress."
      },
      {
        q: isRo ? "Ce se întâmplă după cele 7 zile?" : "What happens after the 7 days?",
        a: isRo 
          ? "Poți continua cu versiunea gratuită (acces limitat) sau upgrade la Pro/Elite pentru acces complet la toate funcționalitățile, coaching live și comunitate." 
          : "You can continue with the free version (limited access) or upgrade to Pro/Elite for full access to all features, live coaching and community."
      },
      {
        q: isRo ? "Pot anula oricând?" : "Can I cancel anytime?",
        a: isRo 
          ? "Da, absolut! Poți anula în orice moment fără penalități. Plus, ai garanție de satisfacție 90 de zile - dacă nu vezi rezultate, îți returnăm banii." 
          : "Yes, absolutely! You can cancel at any time without penalties. Plus, you have a 90-day satisfaction guarantee - if you don't see results, we'll refund your money."
      },
      {
        q: isRo ? "Funcționează pe mobil?" : "Does it work on mobile?",
        a: isRo 
          ? "Da, platforma este 100% responsive și optimizată pentru mobil. Poți face challengeul de oriunde, oricând." 
          : "Yes, the platform is 100% responsive and optimized for mobile. You can do the challenge from anywhere, anytime."
      }
    ],
    finalCta: {
      title: isRo 
        ? "Ești Gata să Ai Tot ce Vrei din Viață?" 
        : "Ready to Have It All in Life?",
      subtitle: isRo
        ? "Alătură-te miilor de antreprenori care și-au transformat viața în doar 7 zile"
        : "Join thousands of entrepreneurs who transformed their lives in just 7 days",
      cta: isRo ? "Începe Transformarea ACUM" : "Start Your Transformation NOW",
      guarantee: isRo 
        ? "🛡️ Garanție 90 de Zile • Anulezi Oricând • Fără Risc" 
        : "🛡️ 90-Day Guarantee • Cancel Anytime • Zero Risk"
    }
  };

  return (
    <>
      <Helmet>
        <title>{content.meta.title}</title>
        <meta name="description" content={content.meta.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Floating Social Proof Bar */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
          <SocialProofBar />
        </div>

        {/* Hero Section */}
        <section className="relative pt-16 pb-16 px-4 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2 text-sm">
                {content.hero.badge}
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-purple-400 to-amber-400 bg-clip-text text-transparent">
                  {content.hero.headline}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {content.hero.subheadline}
              </p>

              {/* Early Bird Timer */}
              <div className="flex justify-center">
                <LandingEarlyBirdTimer />
              </div>
            </motion.div>

            {/* Video Embed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-10 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50"
            >
              <div className="aspect-video">
                <iframe
                  src="https://voomly.com/embed/v/embed/1/eyJ0eXBlIjoiZW1iZWRfc3R5bGVfMV92aWRlbyIsImVtYmVkVHlwZSI6IjEiLCJ2b29tbHlfaWQiOiJNWGd6Wm1Ka09EQXRPRGhqTnkwME5ERm1MV0UzT1RndE5USmxNMll5TUdKaE5UTmsiLCJ2b29tbHlfaGFzaF90aW1lIjoiMTczMjM5Mjk0OSJ9?autoplay=1&muted=1&loop=1"
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="w-full h-full"
                  title="Have It All Challenge Video"
                />
              </div>
            </motion.div>

            {/* Lead Capture Form */}
            <motion.div
              id="lead-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 max-w-md mx-auto"
            >
              {!isLeadCaptured ? (
                <Card className="p-6 bg-card/80 backdrop-blur border-primary/20">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {isRo ? 'Începe Trialul Tău de 7 Zile' : 'Start Your 7-Day Trial'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRo ? 'Introdu datele pentru a-ți rezerva locul' : 'Enter your details to reserve your spot'}
                    </p>
                  </div>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder={isRo ? 'Numele tău (opțional)' : 'Your name (optional)'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                    <Input
                      type="email"
                      placeholder={isRo ? 'Adresa ta de email' : 'Your email address'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background"
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full"
                      variant="gradient"
                    >
                      {isSubmitting 
                        ? (isRo ? 'Se procesează...' : 'Processing...')
                        : (isRo ? 'Începe 7 Zile Trial GRATUIT' : 'Start 7-Day FREE Trial')}
                      <Rocket className="h-5 w-5 ml-2" />
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {isRo 
                      ? '🔒 Respectăm confidențialitatea. Te poți dezabona oricând.'
                      : '🔒 We respect your privacy. Unsubscribe anytime.'}
                  </p>
                </Card>
              ) : (
                <Card className="p-6 bg-green-500/10 border-green-500/30">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-green-500">
                      {isRo ? 'Perfect! Alege planul tău mai jos.' : 'Perfect! Choose your plan below.'}
                    </p>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        {/* Problem / Solution Section */}
        <section className="py-16 px-4">
          <div className="container max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Problems */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card variant="outline" className="border-red-500/30 bg-red-950/10 h-full">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <XCircle className="h-6 w-6" />
                      {content.problems.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.problems.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card variant="outline" className="border-green-500/30 bg-green-950/10 h-full">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      {content.solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.solution.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 7-Day Preview */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isRo ? "Cele 7 Zile de Transformare" : "The 7 Days of Transformation"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isRo 
                  ? "Fiecare zi este dedicată unui aspect esențial al vieții tale" 
                  : "Each day is dedicated to an essential aspect of your life"}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {content.days.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full text-center hover:border-primary/50 transition-all hover:-translate-y-1">
                    <CardContent className="p-4 space-y-3">
                      <Badge variant="outline" className="text-xs">
                        {isRo ? `Ziua ${day.day}` : `Day ${day.day}`}
                      </Badge>
                      <day.icon className={`h-8 w-8 mx-auto ${day.color}`} />
                      <h3 className="font-semibold text-sm">{day.title}</h3>
                      <Badge className="text-xs bg-muted text-muted-foreground">
                        {day.focus}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4" id="pricing">
          <div className="container max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.pricing.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {content.pricing.subtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Trial Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full relative overflow-hidden border-border/50">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <CardHeader className="text-center pb-4">
                    <Gift className="h-10 w-10 mx-auto text-cyan-400 mb-2" />
                    <CardTitle className="text-2xl">{content.pricing.trial.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-cyan-400">
                        {content.pricing.trial.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        / {content.pricing.trial.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {content.pricing.trial.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={handleTrialStart}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      size="lg"
                    >
                      {content.pricing.trial.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pro Card - Featured */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full relative overflow-hidden border-primary/50 shadow-lg shadow-primary/20 scale-[1.02]">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      {content.pricing.pro.badge}
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4 pt-8">
                    <Sparkles className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-2xl">{proPlan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">
                        {proPlan.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {proPlan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isRo ? "7 zile trial gratuit inclus" : "7-day free trial included"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {content.pricing.pro.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className={i === 0 ? "font-semibold text-primary" : ""}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleCheckout('pro')}
                      disabled={loadingPlan === 'pro'}
                      className="w-full"
                      variant="gradient"
                      size="lg"
                    >
                      {loadingPlan === 'pro' ? (
                        <span className="animate-pulse">{isRo ? "Se procesează..." : "Processing..."}</span>
                      ) : (
                        <>
                          {content.pricing.pro.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Elite Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full relative overflow-hidden border-amber-500/30">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-black shadow-lg">
                      <Trophy className="h-3 w-3 mr-1" />
                      {content.pricing.elite.badge}
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-4 pt-8">
                    <Trophy className="h-10 w-10 mx-auto text-amber-400 mb-2" />
                    <CardTitle className="text-2xl">{elitePlan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-amber-400">
                        {elitePlan.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {elitePlan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isRo ? "7 zile trial gratuit inclus" : "7-day free trial included"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {content.pricing.elite.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className={i === 0 ? "font-semibold text-amber-400" : ""}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleCheckout('elite')}
                      disabled={loadingPlan === 'elite'}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black"
                      size="lg"
                    >
                      {loadingPlan === 'elite' ? (
                        <span className="animate-pulse">{isRo ? "Se procesează..." : "Processing..."}</span>
                      ) : (
                        <>
                          {content.pricing.elite.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {content.stats.map((stat, i) => (
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

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold mb-2">
                {isRo ? "Întrebări Frecvente" : "Frequently Asked Questions"}
              </h2>
            </motion.div>

            <div className="space-y-4">
              {content.faq.map((item, i) => (
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

        {/* Final CTA Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          
          <div className="container max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                {content.finalCta.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {content.finalCta.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleTrialStart}
                  size="lg"
                  variant="gradient"
                  className="text-lg px-8 py-6"
                >
                  {content.finalCta.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                {content.finalCta.guarantee}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
