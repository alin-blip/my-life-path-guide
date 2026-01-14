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
  Brain,
  Heart,
  Briefcase,
  Dumbbell
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
    { icon: Dumbbell, label: language === 'en' ? 'Body' : 'Corp', color: '#22c55e', emoji: '💪' },
    { icon: Brain, label: language === 'en' ? 'Being' : 'Ființă', color: '#8b5cf6', emoji: '🧘' },
    { icon: Heart, label: language === 'en' ? 'Balance' : 'Echilibru', color: '#ec4899', emoji: '❤️' },
    { icon: Briefcase, label: 'Business', color: '#3b82f6', emoji: '🚀' },
  ];

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Helmet>
          <title>{language === 'en' ? 'Life Score 60s Quiz | LifeOS' : 'Quiz Life Score 60s | LifeOS'}</title>
        </Helmet>
        
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-16">
          <LifeScoreQuiz language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Helmet>
        <title>{language === 'en' ? 'Life Score 60s - Quick Life Assessment | LifeOS' : 'Life Score 60s - Evaluare Rapidă | LifeOS'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Discover your Life Score in just 60 seconds. Quick 5-question quiz to assess your Body, Being, Balance & Business.'
            : 'Descoperă Scorul Vieții tale în doar 60 de secunde. Quiz rapid cu 5 întrebări pentru Corp, Ființă, Echilibru și Business.'} 
        />
      </Helmet>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 text-4xl animate-bounce opacity-50">⚡</div>
        <div className="absolute top-40 right-20 text-3xl animate-pulse opacity-50">🎯</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-bounce opacity-50" style={{ animationDelay: '0.5s' }}>✨</div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 px-5 py-2.5 rounded-full mb-6 border border-amber-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">
                {language === 'en' ? '60 SECONDS • 5 QUESTIONS • FREE' : '60 SECUNDE • 5 ÎNTREBĂRI • GRATUIT'}
              </span>
              <Zap className="w-4 h-4" />
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {language === 'en' 
                ? <>Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Life Score</span> in 60 Seconds</>
                : <>Descoperă <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Scorul Vieții</span> în 60 Secunde</>}
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {language === 'en'
                ? '5 quick questions to reveal where you\'re winning and where you need focus across Body, Being, Balance & Business.'
                : '5 întrebări rapide pentru a dezvălui unde câștigi și unde ai nevoie de focus în Corp, Ființă, Echilibru și Business.'}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                onClick={() => setShowQuiz(true)}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white px-10 py-7 text-xl font-bold shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 group"
              >
                {language === 'en' ? 'Start Now' : 'Începe Acum'}
                <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            {/* Quick stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>{language === 'en' ? 'Instant results' : 'Rezultate instant'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span>{language === 'en' ? 'Personalized insights' : 'Insight-uri personalizate'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{language === 'en' ? 'No signup required' : 'Fără înregistrare'}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4 Pillars Preview */}
      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {language === 'en' ? 'We measure 4 life pillars' : 'Măsurăm 4 piloni ai vieții'}
            </h2>
            <p className="text-slate-600">
              {language === 'en' 
                ? 'One question per pillar + overall satisfaction'
                : 'O întrebare per pilon + satisfacția generală'}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-md border border-slate-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-xl">{pillar.emoji}</span>
                <span className="font-medium" style={{ color: pillar.color }}>
                  {pillar.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  {language === 'en' ? 'Answer 5 Questions' : 'Răspunde la 5 Întrebări'}
                </h3>
                <p className="text-sm text-slate-600">
                  {language === 'en' 
                    ? 'Quick, emoji-based answers. No overthinking needed.'
                    : 'Răspunsuri rapide cu emoji. Fără gândire excesivă.'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  {language === 'en' ? 'Get Your Score' : 'Primește Scorul'}
                </h3>
                <p className="text-sm text-slate-600">
                  {language === 'en' 
                    ? 'See your Life Score percentage and breakdown by pillar.'
                    : 'Vezi procentul Scorului Vieții și defalcarea pe piloni.'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="font-semibold text-slate-900">
                  {language === 'en' ? 'Discover Your Focus' : 'Descoperă Focusul'}
                </h3>
                <p className="text-sm text-slate-600">
                  {language === 'en' 
                    ? 'Learn which life area needs the most attention right now.'
                    : 'Află care arie a vieții are nevoie de cea mai mare atenție acum.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-center text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl opacity-20">⚡</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-20">🎯</div>
              
              <Zap className="w-12 h-12 mx-auto mb-4 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {language === 'en' 
                  ? 'Ready in 60 Seconds?' 
                  : 'Gata în 60 Secunde?'}
              </h2>
              <p className="text-white/80 mb-6">
                {language === 'en'
                  ? 'No signup. No long forms. Just 5 quick questions and instant clarity.'
                  : 'Fără înregistrare. Fără formulare lungi. Doar 5 întrebări rapide și claritate instant.'}
              </p>
              <Button 
                size="lg"
                onClick={() => setShowQuiz(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-bold shadow-lg"
              >
                {language === 'en' ? 'Start My Life Score' : 'Începe Scorul Meu'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LifeScore;
