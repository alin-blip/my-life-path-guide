import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { MindCoachDemo } from '@/components/mind-coach/MindCoachDemo';
import { ChallengeBonusSection } from '@/components/mind-coach/ChallengeBonusSection';
import { MindCoachPricingCards } from '@/components/mind-coach/MindCoachPricingCards';
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
    subtitle: { ro: 'AI Coaching pentru transformare emoțională în 5 minute', en: 'AI Coaching for emotional transformation in 5 minutes' }
  },
};

export default function MindCoachLanding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pricingRef = useRef<HTMLDivElement>(null);
  
  const emotionParam = searchParams.get('emotion') || 'default';
  const headlines = emotionHeadlines[emotionParam] || emotionHeadlines.default;

  // Force Romanian language
  const lang = 'ro';

  const handleBreakthroughComplete = (data: any) => {
    trackLead();
  };

  return (
    <>
      <Helmet>
        <title>Mind Coach AI - {headlines[lang]} | CEO Mind OS</title>
        <meta name="description" content={headlines.subtitle[lang]} />
      </Helmet>

      <div className="min-h-screen n8n-hero-gradient">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Section with Demo */}
        <section className="relative pt-16 pb-8 md:pt-20 md:pb-12 px-4">
          <div className="container max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 md:space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 n8n-badge">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Mind Coach AI</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  TEST GRATUIT
                </span>
              </div>

              {/* Main headline with n8n gradient */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="n8n-gradient-text">{headlines[lang]}</span>
                <br />
                <span className="text-foreground/90 text-2xl md:text-3xl lg:text-4xl">în doar 5 minute</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {headlines.subtitle[lang]}
              </p>
            </motion.div>

            {/* Demo Container with Glow Effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 md:mt-8"
            >
              <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-cyan-400 via-primary to-purple-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-primary to-purple-500 blur-xl opacity-40" />
                <div className="relative bg-background rounded-2xl overflow-hidden">
                  <MindCoachDemo
                    onComplete={handleBreakthroughComplete}
                    language={lang}
                  />
                </div>
              </div>
            </motion.div>

            {/* Trust line */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-xs md:text-sm text-muted-foreground mt-4 md:mt-6"
            >
              ✓ Fără cont necesar • ✓ Sesiune completă gratuită • ✓ Rezultate în 5 minute
            </motion.p>
          </div>
        </section>

        {/* Cum Funcționează Mind Coach Section */}
        <section className="py-10 md:py-16 px-4 relative">
          <div className="container max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-8"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                <span className="n8n-gradient-text">Cum Funcționează</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                5 pași spre transformare emoțională
              </p>
            </motion.div>

            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {[
                { step: 1, label: 'Identificare', icon: '🎯' },
                { step: 2, label: 'Investigare', icon: '🔍' },
                { step: 3, label: 'Clarificare', icon: '💡' },
                { step: 4, label: 'Transformare', icon: '⚡' },
                { step: 5, label: 'Acțiune', icon: '🚀' },
              ].map((phase, idx) => (
                <motion.div
                  key={phase.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-2 md:p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-border/30 hover:border-primary/50 transition-all hover:bg-background/50"
                >
                  <span className="text-xl md:text-2xl">{phase.icon}</span>
                  <p className="font-medium text-xs md:text-sm mt-1 md:mt-2">{phase.label}</p>
                </motion.div>
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
        <section className="py-8 md:py-12 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-4">
              💡 Mind Coach te ajută să transformi orice emoție în putere și acțiune concretă
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-border/50 hover:border-primary/50"
            >
              Află mai multe despre CEO Mind OS
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
