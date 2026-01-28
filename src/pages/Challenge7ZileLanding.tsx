import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  Rocket, ArrowRight, CheckCircle2, Dumbbell, Brain, 
  Heart, Crown, Users, Sparkles, Gift,
  Star, Target, Calendar, Map, Bell, Trophy
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useChallengeStats } from '@/hooks/useChallengeStats';
import { AnimatedChallengeCard } from '@/components/challenge/AnimatedChallengeCard';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { MembershipUpsellCards } from '@/components/membership/MembershipUpsellCards';

// FB Pixel Lead tracking is now centralized in AuthContext

interface LifeScoreData {
  totalScore: number;
  categoryScores: Record<string, number>;
  answers: Record<string, number>;
  timestamp: number;
}

const Challenge7ZileLanding = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { totalParticipants, getCompletionsForDay, loading: statsLoading } = useChallengeStats();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lifeScoreData, setLifeScoreData] = useState<LifeScoreData | null>(null);
  const [showMemberships, setShowMemberships] = useState(false);

  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const source = searchParams.get('source') || '';

  // Check for life score data from quiz
  useEffect(() => {
    const stored = localStorage.getItem('lifeScoreData');
    if (stored && source === 'life-score') {
      try {
        const data: LifeScoreData = JSON.parse(stored);
        // Valid for 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setLifeScoreData(data);
          setShowMemberships(true);
        } else {
          localStorage.removeItem('lifeScoreData');
        }
      } catch (e) {
        console.error('Failed to parse life score data:', e);
        localStorage.removeItem('lifeScoreData');
      }
    }
  }, [source]);

  // Helper function to find weakest dimension
  const findWeakestDimension = (categoryScores: Record<string, number>): string => {
    const dimensions: Record<string, string[]> = {
      body: ['body'],
      being: ['being'],
      balance: ['balance'],
      business: ['business']
    };
    
    let weakest = 'body';
    let minScore = Infinity;
    
    for (const [dim, categories] of Object.entries(dimensions)) {
      const score = categories.reduce((sum, cat) => sum + (categoryScores[cat] || 0), 0);
      if (score < minScore) {
        minScore = score;
        weakest = dim;
      }
    }
    
    return weakest;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_leads')
        .insert({
          email,
          name: name || null,
          lead_magnet: 'challenge_7_zile',
          source: utmSource || 'direct',
          metadata: {
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            signup_date: new Date().toISOString()
          }
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      // FB Pixel Lead is now tracked centrally in AuthContext on SIGNED_IN

      setIsSubscribed(true);
      toast({
        title: language === 'en' ? '🎉 You\'re in!' : '🎉 Ești înscris!',
        description: language === 'en' 
          ? 'Redirecting to your challenge...' 
          : 'Te redirecționăm către challenge...',
      });

      setTimeout(() => {
        navigate('/challenge');
      }, 1500);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Something went wrong. Please try again.' 
          : 'Ceva nu a mers. Te rugăm să încerci din nou.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const challengeDays = [
    {
      day: 1,
      icon: Map,
      titleEn: "Platform Tour",
      titleRo: "Tour Platformă",
      descEn: "Discover all the tools at your disposal",
      descRo: "Descoperă toate instrumentele disponibile",
      color: "from-purple-500 to-indigo-500",
      isFree: true
    },
    {
      day: 2,
      icon: Target,
      titleEn: "Body + Being",
      titleRo: "Corp + Spirit",
      descEn: "Set objectives for health & inner peace",
      descRo: "Obiective pentru sănătate și spirit",
      color: "from-green-500 to-purple-500",
      isFree: true
    },
    {
      day: 3,
      icon: Target,
      titleEn: "Balance + Business",
      titleRo: "Relații + Business",
      descEn: "Set objectives for relationships & career",
      descRo: "Obiective pentru relații și carieră",
      color: "from-pink-500 to-blue-500",
      isFree: false
    },
    {
      day: 4,
      icon: Crown,
      titleEn: "Champion Routine",
      titleRo: "Rutina Campionului",
      descEn: "Configure your winning morning routine",
      descRo: "Configurează rutina matinală câștigătoare",
      color: "from-amber-500 to-orange-500",
      isFree: false
    },
    {
      day: 5,
      icon: Sparkles,
      titleEn: "AI Vision",
      titleRo: "Viziune AI",
      descEn: "Generate images & personalized meditation",
      descRo: "Generează imagini și meditație personalizată",
      color: "from-cyan-500 to-blue-500",
      isFree: false
    },
    {
      day: 6,
      icon: Bell,
      titleEn: "Accountability",
      titleRo: "Accountability",
      descEn: "Set up your notification system",
      descRo: "Configurează sistemul de notificări",
      color: "from-red-500 to-pink-500",
      isFree: false
    },
    {
      day: 7,
      icon: Trophy,
      titleEn: "Putting It All Together",
      titleRo: "Punem Totul Împreună",
      descEn: "Complete recap + Premium upgrade",
      descRo: "Recapitulare completă + Upgrade Premium",
      color: "from-amber-500 to-yellow-600",
      isFree: false
    }
  ];

  const pillars = [
    { 
      icon: Dumbbell, 
      labelEn: 'Body', 
      labelRo: 'Corp',
      descEn: 'Physical health & energy',
      descRo: 'Sănătate fizică și energie',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: Brain, 
      labelEn: 'Being', 
      labelRo: 'Spirit',
      descEn: 'Purpose & inner peace',
      descRo: 'Scop și pace interioară',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: Heart, 
      labelEn: 'Balance', 
      labelRo: 'Relații',
      descEn: 'Love & connection',
      descRo: 'Dragoste și conexiune',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10'
    },
    { 
      icon: Target, 
      labelEn: 'Business', 
      labelRo: 'Business',
      descEn: 'Financial & career success',
      descRo: 'Succes financiar și profesional',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10'
    }
  ];

  const benefits = [
    { 
      icon: Target, 
      textEn: 'Clear annual objectives for 2026', 
      textRo: 'Obiective anuale clare pentru 2026' 
    },
    { 
      icon: Calendar, 
      textEn: 'Structured 90-day action plan', 
      textRo: 'Plan de acțiune structurat pe 90 de zile' 
    },
    { 
      icon: Sparkles, 
      textEn: 'Personalized AI meditations', 
      textRo: 'Meditații personalizate cu AI' 
    },
    { 
      icon: Star, 
      textEn: 'Champion morning routine', 
      textRo: 'Rutină matinală de campion' 
    },
    { 
      icon: Users, 
      textEn: 'Community of high performers', 
      textRo: 'Comunitate de performeri' 
    },
    { 
      icon: Gift, 
      textEn: '100% FREE — no credit card', 
      textRo: '100% GRATUIT — fără card bancar' 
    }
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Transform Your Life in 7 Days | Free Challenge' : 'Transformă-ți Viața în 7 Zile | Challenge Gratuit'}</title>
        <meta name="description" content={language === 'en' 
          ? 'Join the free 7-day Have It All challenge. Master Body, Being, Balance & Business in just one week.'
          : 'Alătură-te challenge-ului gratuit de 7 zile Have It All. Stăpânește Corpul, Spiritul, Relațiile și Business-ul într-o săptămână.'
        } />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Floating Social Proof Bar */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
          <SocialProofBar />
        </div>

        {/* Hero Section */}
        <section className="relative pt-16 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="max-w-4xl mx-auto text-center relative">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/30 px-4 py-1.5">
              <Gift className="h-4 w-4 mr-1.5 inline" />
              {language === 'en' ? '2 DAYS FREE • 5 DAYS TRIAL' : '2 ZILE GRATUIT • 5 ZILE TRIAL'}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              {language === 'en' 
                ? 'Start Your FREE 2-Day Challenge' 
                : 'Începe Challenge-ul GRATUIT de 2 Zile'}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {language === 'en'
                ? 'After 2 days, unlock 5 extra days with FREE trial + 50% Early Bird discount!'
                : 'După 2 zile, deblochează 5 zile extra cu trial GRATUIT + Early Bird 50%!'}
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
            >
              <Users className="h-4 w-4" />
              <span>
                {statsLoading 
                  ? (language === 'en' ? 'Loading...' : 'Se încarcă...')
                  : (language === 'en' 
                      ? `${Math.max(2500, totalParticipants).toLocaleString()}+ people joined` 
                      : `${Math.max(2500, totalParticipants).toLocaleString()}+ persoane înscrise`
                    )
                }
              </span>
            </motion.div>

            {/* Lead Capture Form (only if NOT from life-score quiz) */}
            {!showMemberships && !isSubscribed ? (
              <Card className="max-w-md mx-auto p-6 bg-card/80 backdrop-blur border-primary/20">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder={language === 'en' ? 'Your name (optional)' : 'Numele tău (opțional)'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    type="email"
                    placeholder={language === 'en' ? 'Your email address' : 'Adresa ta de email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg py-6"
                  >
                    {isSubmitting 
                      ? (language === 'en' ? 'Starting...' : 'Se pornește...')
                      : (language === 'en' ? 'Start FREE Challenge' : 'Începe Challenge-ul GRATUIT')}
                    <Rocket className="h-5 w-5 ml-2" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {language === 'en' 
                    ? '🔒 We respect your privacy. Unsubscribe anytime.'
                    : '🔒 Respectăm confidențialitatea. Te poți dezabona oricând.'}
                </p>
              </Card>
            ) : isSubscribed ? (
              <Card className="max-w-md mx-auto p-6 bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium text-green-500">
                  {language === 'en' ? 'You\'re in! Redirecting...' : 'Ești înscris! Se redirecționează...'}
                </p>
              </Card>
            ) : null}

            {/* Voomly Video Embed */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 max-w-3xl mx-auto"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-primary/20 shadow-2xl">
                <iframe 
                  src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=Q2rPQbpGVI3G3AQChBI7EptvcVsWzFtGMVz09Gu8CDoxI1d3P&videoRatio=1.777778&type=v&skinColor=%232758EB" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  width="100%" 
                  height="100%"
                  className="absolute inset-0"
                />
              </div>
              
              {/* Button after video - scrolls to memberships */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Button 
                  size="lg"
                  onClick={() => {
                    const membershipSection = document.getElementById('membership-section');
                    membershipSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8 py-6"
                >
                  {language === 'en' ? 'See Subscription Plans' : 'Vezi Planurile de Abonament'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4 Pillars Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {language === 'en' ? 'The 4 Pillars of Success' : 'Cei 4 Piloni ai Succesului'}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              {language === 'en'
                ? 'True success means thriving in ALL areas of life, not just one.'
                : 'Succesul adevărat înseamnă să prosperi în TOATE ariile vieții, nu doar una.'}
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
              {language === 'en' ? 'Your 7-Day Journey' : 'Călătoria ta de 7 Zile'}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Each day builds on the previous one, creating unstoppable momentum.'
                : 'Fiecare zi construiește pe cea anterioară, creând un impuls de neoprit.'}
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

        {/* Membership Cards Section - After 7-day journey */}
        <section id="membership-section" className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              {language === 'en' ? 'Choose Your Transformation Plan' : 'Alege Planul Tău de Transformare'}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Start with 2 FREE days, then continue with a 5-day trial. Cancel anytime.'
                : 'Începe cu 2 zile GRATUIT, apoi continuă cu 5 zile trial. Anulezi oricând.'}
            </p>
            
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-xl border border-border/50">
              <MembershipUpsellCards 
                source="challenge-7-zile"
                totalScore={lifeScoreData?.totalScore}
                weakestDimension={lifeScoreData ? findWeakestDimension(lifeScoreData.categoryScores) : undefined}
                onContinueFree={() => {
                  // Clear data and navigate to challenge
                  localStorage.removeItem('lifeScoreData');
                  navigate('/challenge');
                }}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-muted/30">
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

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {language === 'en' 
                ? 'Ready to Transform Your Life?' 
                : 'Gata să-ți Transformi Viața?'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {language === 'en'
                ? 'Join thousands who are already living the Have It All lifestyle.'
                : 'Alătură-te miilor care trăiesc deja stilul de viață Have It All.'}
            </p>
            
            <Button 
              size="lg"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null;
                emailInput?.focus();
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8 py-6"
            >
              {language === 'en' ? 'Start Your FREE Challenge Now' : 'Începe Challenge-ul GRATUIT Acum'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              {language === 'en' 
                ? '✨ 100% FREE • No credit card required • Start immediately'
                : '✨ 100% GRATUIT • Fără card bancar • Începe imediat'}
            </p>
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
