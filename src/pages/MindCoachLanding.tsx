import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Zap, Target, Heart, ArrowDown, Shield, Clock, Users } from 'lucide-react';
import { MindCoachDemo } from '@/components/mind-coach/MindCoachDemo';
import { BreakthroughOverlay } from '@/components/mind-coach/BreakthroughOverlay';
import { ChallengeBonusSection } from '@/components/mind-coach/ChallengeBonusSection';
import { MindCoachPricingCards } from '@/components/mind-coach/MindCoachPricingCards';
import { useLanguage } from '@/context/LanguageContext';
import { MindCoachEmotion } from '@/components/mind-coach/ExtendedEmotionPicker';
import { trackLead } from '@/lib/facebook-pixel';

// Dynamic headlines based on URL emotion param
const emotionHeadlines: Record<string, { ro: string; en: string; subtitle: { ro: string; en: string } }> = {
  stuck: {
    ro: 'Deblochează-te în 5 Minute',
    en: 'Get Unstuck in 5 Minutes',
    subtitle: { ro: 'Transformă blocajul în acțiune clară', en: 'Transform blocks into clear action' }
  },
  procrastinating: {
    ro: 'Stop Amânării ACUM',
    en: 'Stop Procrastination NOW',
    subtitle: { ro: 'Începe să acționezi în loc să amâni', en: 'Start acting instead of postponing' }
  },
  anxious: {
    ro: 'Transformă Anxietatea în Curaj',
    en: 'Transform Anxiety Into Courage',
    subtitle: { ro: 'Frica devine combustibil pentru acțiune', en: 'Fear becomes fuel for action' }
  },
  overwhelmed: {
    ro: 'De la Copleșit la Clar în 5 Minute',
    en: 'From Overwhelmed to Clear in 5 Minutes',
    subtitle: { ro: 'Regăsește claritatea și focusul', en: 'Regain clarity and focus' }
  },
  stressed: {
    ro: 'Eliberează-te de Stres',
    en: 'Release Your Stress',
    subtitle: { ro: 'Transformă presiunea în putere', en: 'Transform pressure into power' }
  },
  distracted: {
    ro: 'Recâștigă-ți Focusul',
    en: 'Reclaim Your Focus',
    subtitle: { ro: 'Concentrare maximă, rezultate reale', en: 'Maximum focus, real results' }
  },
  angry: {
    ro: 'Transformă Furia în Determinare',
    en: 'Transform Anger Into Determination',
    subtitle: { ro: 'Energia negativă devine combustibil', en: 'Negative energy becomes fuel' }
  },
  default: {
    ro: 'Transformă Orice Emoție în Putere',
    en: 'Transform Any Emotion Into Power',
    subtitle: { ro: 'Metodologia Tony Robbins pentru breakthrough emoțional', en: 'Tony Robbins methodology for emotional breakthrough' }
  },
};

// Map URL param to MindCoachEmotion
const paramToEmotion: Record<string, MindCoachEmotion> = {
  stuck: 'stuck',
  procrastinating: 'procrastinating',
  anxious: 'anxious',
  overwhelmed: 'overwhelmed',
  stressed: 'stressed',
  distracted: 'distracted',
  angry: 'angry',
};

export default function MindCoachLanding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const pricingRef = useRef<HTMLDivElement>(null);
  
  const emotionParam = searchParams.get('emotion') || 'default';
  const initialEmotion = paramToEmotion[emotionParam];
  
  const headlines = emotionHeadlines[emotionParam] || emotionHeadlines.default;
  
  const [showBreakthroughOverlay, setShowBreakthroughOverlay] = useState(false);
  const [breakthroughData, setBreakthroughData] = useState<any>(null);

  const handleBreakthroughComplete = (data: any) => {
    setBreakthroughData(data);
    setShowBreakthroughOverlay(true);
    
    // Track lead event
    trackLead();
  };

  const handleOverlayContinue = () => {
    setShowBreakthroughOverlay(false);
    // Scroll to pricing
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const lang = language === 'ro' ? 'ro' : 'en';

  return (
    <>
      <Helmet>
        <title>Mind Coach AI - {headlines[lang]} | WarriorOS</title>
        <meta name="description" content={headlines.subtitle[lang]} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Mind Coach AI</span>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                  {lang === 'ro' ? 'TEST GRATUIT' : 'FREE TEST'}
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {headlines[lang]}
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {headlines.subtitle[lang]}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {[
                  { icon: Target, label: lang === 'ro' ? 'Identifică blocajul' : 'Identify the block' },
                  { icon: Sparkles, label: lang === 'ro' ? 'Fapte vs Povești' : 'Facts vs Stories' },
                  { icon: Zap, label: lang === 'ro' ? 'Transformă în putere' : 'Transform into power' },
                  { icon: Heart, label: lang === 'ro' ? 'Acțiune concretă' : 'Concrete action' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
                    <feature.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-6">
                <Button
                  size="lg"
                  onClick={scrollToDemo}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/30 text-lg px-8"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {lang === 'ro' ? 'ÎNCEPE TESTUL GRATUIT' : 'START FREE TEST'}
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  ✓ {lang === 'ro' ? 'Fără cont necesar' : 'No account needed'} • 
                  ✓ {lang === 'ro' ? 'Sesiune completă gratuită' : 'Complete free session'} • 
                  ✓ {lang === 'ro' ? 'Rezultate în 5 minute' : 'Results in 5 minutes'}
                </p>
              </div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-8 flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Tony Robbins Method Section */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {lang === 'ro' ? 'Metodologia Tony Robbins în 5 Pași' : 'Tony Robbins 5-Step Methodology'}
              </h2>
              <p className="text-muted-foreground">
                {lang === 'ro' 
                  ? 'Aceeași metodă folosită de milioane de oameni pentru transformare emoțională'
                  : 'The same method used by millions of people for emotional transformation'}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { step: 1, label: lang === 'ro' ? 'Identificare' : 'Identification', icon: '🎯' },
                { step: 2, label: lang === 'ro' ? 'Investigare' : 'Investigation', icon: '🔍' },
                { step: 3, label: lang === 'ro' ? 'Clarificare' : 'Clarification', icon: '💡' },
                { step: 4, label: lang === 'ro' ? 'Transformare' : 'Transformation', icon: '⚡' },
                { step: 5, label: lang === 'ro' ? 'Acțiune' : 'Action', icon: '🚀' },
              ].map((phase, idx) => (
                <motion.div
                  key={phase.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <span className="text-2xl">{phase.icon}</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'ro' ? 'Pas' : 'Step'} {phase.step}
                  </p>
                  <p className="font-medium text-sm mt-1">{phase.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" className="py-16 px-4">
          <div className="container max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {lang === 'ro' ? '🧪 Testează GRATUIT Acum' : '🧪 Test FREE Now'}
              </h2>
              <p className="text-muted-foreground">
                {lang === 'ro' 
                  ? 'O sesiune completă de transformare - fără cont, fără card'
                  : 'One complete transformation session - no account, no card'}
              </p>
            </motion.div>

            <MindCoachDemo
              initialEmotion={initialEmotion}
              onComplete={handleBreakthroughComplete}
              language={lang}
            />

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: Shield, text: lang === 'ro' ? '100% Privat' : '100% Private' },
                { icon: Clock, text: lang === 'ro' ? '5 min' : '5 min' },
                { icon: Users, text: lang === 'ro' ? '10,000+ utilizatori' : '10,000+ users' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <badge.icon className="h-4 w-4" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Challenge Bonus Section */}
        <ChallengeBonusSection language={lang} />

        {/* Pricing Section */}
        <div ref={pricingRef}>
          <MindCoachPricingCards language={lang} source="mind-coach-transform" />
        </div>

        {/* Footer CTA */}
        <section className="py-12 px-4 bg-gradient-to-t from-primary/10 to-transparent">
          <div className="container max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              {lang === 'ro'
                ? '💡 Mind Coach folosește metodologia Tony Robbins pentru transformare emoțională în 5 pași'
                : '💡 Mind Coach uses Tony Robbins methodology for emotional transformation in 5 steps'}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              {lang === 'ro' ? 'Află mai multe despre WarriorOS' : 'Learn more about WarriorOS'}
            </Button>
          </div>
        </section>
      </div>

      {/* Breakthrough Overlay */}
      <BreakthroughOverlay
        isVisible={showBreakthroughOverlay}
        breakthroughData={breakthroughData}
        onContinue={handleOverlayContinue}
        language={lang}
      />
    </>
  );
}
