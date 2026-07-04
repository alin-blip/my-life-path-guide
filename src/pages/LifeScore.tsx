import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { LifeScoreQuiz } from '@/components/life-score/LifeScoreQuiz';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  Zap, 
  Clock, 
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Play
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

const LifeScore = () => {
  const { language } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const originalTheme = theme;
    if (theme === 'dark') {
      toggleTheme();
    }
    return () => {
      if (originalTheme === 'dark' && theme === 'light') {
        toggleTheme();
      }
    };
  }, []);

  const pillars = [
    { label: language === 'en' ? 'Body' : 'Corp', emoji: '💪', gradient: 'from-emerald-500 to-teal-500' },
    { label: language === 'en' ? 'Being' : 'Ființă', emoji: '🧘', gradient: 'from-violet-500 to-purple-500' },
    { label: language === 'en' ? 'Balance' : 'Echilibru', emoji: '❤️', gradient: 'from-rose-500 to-pink-500' },
    { label: 'Business', emoji: '🚀', gradient: 'from-blue-500 to-indigo-500' },
  ];

  const benefits = [
    { 
      icon: Clock, 
      text: language === 'en' ? 'Only 60 seconds' : 'Doar 60 secunde',
      subtext: language === 'en' ? '5 quick questions' : '5 întrebări rapide'
    },
    { 
      icon: Target, 
      text: language === 'en' ? 'Instant clarity' : 'Claritate instant',
      subtext: language === 'en' ? 'Know your focus area' : 'Află aria de focus'
    },
    { 
      icon: TrendingUp, 
      text: language === 'en' ? 'Free forever' : 'Gratuit pentru totdeauna',
      subtext: language === 'en' ? 'No signup needed' : 'Fără înregistrare'
    },
  ];

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        <Helmet>
          <title>{language === 'en' ? 'Life Score 60s Quiz | CEO Mind OS' : 'Quiz Life Score 60s | CEO Mind OS'}</title>
        </Helmet>
        
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <LifeScoreQuiz language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 overflow-hidden">
      <Helmet>
        <title>{language === 'en' ? 'Life Score 60s - Quick Life Assessment | CEO Mind OS' : 'Life Score 60s - Evaluare Rapidă | CEO Mind OS'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Discover your Life Score in just 60 seconds. Quick 5-question quiz to assess your Body, Being, Balance & Business.'
            : 'Descoperă Scorul Vieții tale în doar 60 de secunde. Quiz rapid cu 5 întrebări pentru Corp, Ființă, Echilibru și Business.'} 
        />
      </Helmet>

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Top Badge */}
            <motion.div 
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white/90 px-6 py-3 rounded-full mb-8 border border-white/20 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">60s</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <span className="text-sm font-medium">
                {language === 'en' ? '5 Questions • 100% Free' : '5 Întrebări • 100% Gratuit'}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {language === 'en' 
                ? <>Discover Your <br/><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Life Score</span></>
                : <>Descoperă-ți <br/><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Scorul Vieții</span></>}
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {language === 'en'
                ? 'Find out where you\'re thriving and where you need focus — in just 60 seconds.'
                : 'Află unde excelezi și unde ai nevoie de focus — în doar 60 de secunde.'}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={() => setShowQuiz(true)}
                className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-[0_20px_60px_rgba(251,146,60,0.4)] hover:shadow-[0_25px_70px_rgba(251,146,60,0.5)] transition-all duration-300 hover:scale-105 group border-0"
              >
                <Play className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" />
                {language === 'en' ? 'Start Free Quiz' : 'Începe Quiz-ul Gratuit'}
                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            {/* 4 Pillars */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {pillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-2 bg-gradient-to-r ${pillar.gradient} px-5 py-2.5 rounded-full text-white font-medium shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <span className="text-lg">{pillar.emoji}</span>
                  <span>{pillar.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits Row */}
            <motion.div 
              className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{benefit.text}</h3>
                  <p className="text-white/70 text-sm">{benefit.subtext}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex flex-col items-center gap-2 text-white/70">
            <span className="text-xs uppercase tracking-widest">
              {language === 'en' ? 'Learn more' : 'Află mai mult'}
            </span>
            <motion.div 
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-1.5 h-3 bg-white/50 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'en' ? 'How It Works' : 'Cum Funcționează'}
            </h2>
            <p className="text-white/60 text-lg">
              {language === 'en' 
                ? 'Three simple steps to clarity'
                : 'Trei pași simpli către claritate'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: language === 'en' ? 'Answer 5 Questions' : 'Răspunde la 5 Întrebări',
                description: language === 'en' 
                  ? 'Quick, emoji-based answers. One per life pillar. No overthinking.'
                  : 'Răspunsuri rapide cu emoji. Una per pilon. Fără gândire excesivă.',
                icon: '🎯'
              },
              {
                step: '02',
                title: language === 'en' ? 'Get Your Score' : 'Primești Scorul',
                description: language === 'en' 
                  ? 'See your overall Life Score percentage and breakdown by category.'
                  : 'Vezi procentul Scorului Vieții și defalcarea pe categorii.',
                icon: '📊'
              },
              {
                step: '03',
                title: language === 'en' ? 'Know Your Focus' : 'Află-ți Focusul',
                description: language === 'en' 
                  ? 'Discover which area of your life needs the most attention right now.'
                  : 'Descoperă care arie a vieții are nevoie de cea mai mare atenție.',
                icon: '🎯'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center group hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  {item.step}
                </div>
                <span className="text-5xl mb-6 block">{item.icon}</span>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">5,000+</div>
              <div className="text-white/70 text-sm">{language === 'en' ? 'Quizzes taken' : 'Quiz-uri completate'}</div>
            </div>
            <div className="w-px h-12 bg-white/20 hidden md:block" />
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">60s</div>
              <div className="text-white/70 text-sm">{language === 'en' ? 'Average time' : 'Timp mediu'}</div>
            </div>
            <div className="w-px h-12 bg-white/20 hidden md:block" />
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">4.9★</div>
              <div className="text-white/70 text-sm">{language === 'en' ? 'User rating' : 'Rating utilizatori'}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] p-10 md:p-12">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_10px_40px_rgba(251,146,60,0.4)]"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {language === 'en' 
                  ? 'Ready in 60 Seconds?' 
                  : 'Gata în 60 Secunde?'}
              </h2>
              <p className="text-white/70 text-lg mb-8">
                {language === 'en'
                  ? 'No signup. No payment. Just quick clarity on where you stand.'
                  : 'Fără înregistrare. Fără plată. Doar claritate rapidă despre unde te afli.'}
              </p>

              <div className="space-y-4">
                <Button 
                  size="lg"
                  onClick={() => setShowQuiz(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white px-10 py-7 text-lg font-bold rounded-xl shadow-[0_15px_50px_rgba(251,146,60,0.3)] hover:shadow-[0_20px_60px_rgba(251,146,60,0.4)] transition-all hover:scale-105"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Start My Life Score' : 'Începe Scorul Meu'}
                </Button>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Free forever' : 'Gratuit mereu'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'No signup' : 'Fără înregistrare'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Instant results' : 'Rezultate instant'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LifeScore;