import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { BurnoutQuiz } from '@/components/burnout-test/BurnoutQuiz';
import { BurnoutSEO } from '@/components/burnout-test/BurnoutSEO';
import { Flame, Clock, Target, ArrowRight, Play, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const BurnoutTest = () => {
  const { language: ctxLanguage, setLanguage } = useLanguage();
  const { pathname } = useLocation();
  const forceEn = pathname.includes('-en');
  const language: 'ro' | 'en' = forceEn ? 'en' : ctxLanguage;
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (forceEn && ctxLanguage !== 'en') {
      setLanguage('en');
    }
  }, [forceEn, ctxLanguage, setLanguage]);

  const pillars = [
    { label: language === 'en' ? 'Body' : 'Corp', emoji: '💪', gradient: 'from-emerald-500 to-teal-500' },
    { label: language === 'en' ? 'Mind' : 'Minte', emoji: '🧘', gradient: 'from-violet-500 to-purple-500' },
    { label: language === 'en' ? 'Balance' : 'Echilibru', emoji: '❤️', gradient: 'from-rose-500 to-pink-500' },
    { label: 'Business', emoji: '🚀', gradient: 'from-blue-500 to-indigo-500' },
  ];

  const benefits = [
    {
      icon: Clock,
      text: language === 'en' ? 'Only 5 minutes' : 'Doar 5 minute',
      subtext: language === 'en' ? '20 targeted questions' : '20 întrebări țintite',
    },
    {
      icon: Target,
      text: language === 'en' ? 'Radar chart results' : 'Rezultate grafic radar',
      subtext: language === 'en' ? 'Visual burnout map' : 'Hartă vizuală a burnout-ului',
    },
    {
      icon: TrendingUp,
      text: language === 'en' ? '100% Free quiz' : 'Quiz 100% gratuit',
      subtext: language === 'en' ? 'Personalized tips' : 'Sfaturi personalizate',
    },
  ];

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <BurnoutSEO language={language} />
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <BurnoutQuiz language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 overflow-hidden">
      <BurnoutSEO language={language} />

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white/90 px-6 py-3 rounded-full mb-8 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">
                {language === 'en' ? '5 min' : '5 min'}
              </span>
              <div className="w-px h-4 bg-white/30" />
              <span className="text-sm font-medium">
                {language === 'en' ? '12 Questions • Free' : '12 Întrebări • Gratuit'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {language === 'en' ? (
                <>Are You <br /><span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">Burning Out?</span></>
              ) : (
                <>Ești în <br /><span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">Burnout?</span></>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {language === 'en'
                ? 'Find out your burnout level across Body, Mind, Balance & Business — in just 5 minutes.'
                : 'Află nivelul tău de burnout pe Corp, Minte, Echilibru și Business — în doar 5 minute.'}
            </motion.p>

            {/* CTA */}
            <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Button
                size="lg"
                onClick={() => setShowQuiz(true)}
                className="relative bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:via-orange-600 hover:to-amber-600 text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-[0_20px_60px_rgba(239,68,68,0.4)] hover:shadow-[0_25px_70px_rgba(239,68,68,0.5)] transition-all duration-300 hover:scale-105 group border-0"
              >
                <Play className="w-6 h-6 mr-3" />
                {language === 'en' ? 'Start Free Test' : 'Începe Testul Gratuit'}
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Pillars */}
            <motion.div className="flex flex-wrap justify-center gap-3 mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {pillars.map((pillar, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-2 bg-gradient-to-r ${pillar.gradient} px-5 py-2.5 rounded-full text-white font-medium shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <span className="text-lg">{pillar.emoji}</span>
                  <span>{pillar.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits */}
            <motion.div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              {benefits.map((b, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                    <b.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{b.text}</h3>
                  <p className="text-white/70 text-sm">{b.subtext}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-2xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] p-10 md:p-12">
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-[0_10px_40px_rgba(239,68,68,0.4)]">
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {language === 'en' ? 'Ready in 5 Minutes?' : 'Gata în 5 Minute?'}
              </h2>
              <p className="text-white/70 text-lg mb-8">
                {language === 'en'
                  ? '20 questions. Radar chart. Personalized recovery recommendations.'
                  : '20 întrebări. Grafic radar. Recomandări personalizate de recuperare.'}
              </p>
              <Button
                size="lg"
                onClick={() => setShowQuiz(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:via-orange-600 hover:to-amber-600 text-white px-10 py-7 text-lg font-bold rounded-xl shadow-[0_15px_50px_rgba(239,68,68,0.3)] transition-all hover:scale-105"
              >
                <Flame className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Start Burnout Test' : 'Începe Testul de Burnout'}
              </Button>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70 mt-6">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Free quiz' : 'Quiz gratuit'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Radar chart' : 'Grafic radar'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Recovery tips' : 'Sfaturi de recuperare'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BurnoutTest;
