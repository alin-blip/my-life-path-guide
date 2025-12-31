import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { VisionQuiz } from '@/components/vision-quiz/VisionQuiz';
import { LanguageSelector } from '@/components/LanguageSelector';
import { 
  Sparkles, 
  Target, 
  Heart, 
  Brain, 
  Briefcase, 
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Vision2026 = () => {
  const { language } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const originalTheme = theme;
    if (theme === 'dark') {
      toggleTheme(); // Switch to light
    }
    return () => {
      if (originalTheme === 'dark' && theme === 'light') {
        toggleTheme(); // Restore to dark
      }
    };
  }, []);

  const pillars = [
    { 
      icon: Dumbbell, 
      title: language === 'en' ? 'Body' : 'Corp',
      description: language === 'en' 
        ? 'Energy, fitness & vitality' 
        : 'Energie, fitness și vitalitate',
      color: 'text-green-500 bg-green-500/10'
    },
    { 
      icon: Brain, 
      title: language === 'en' ? 'Being' : 'Ființă',
      description: language === 'en' 
        ? 'Clarity, peace & purpose' 
        : 'Claritate, pace și scop',
      color: 'text-purple-500 bg-purple-500/10'
    },
    { 
      icon: Heart, 
      title: language === 'en' ? 'Balance' : 'Echilibru',
      description: language === 'en' 
        ? 'Relationships & family' 
        : 'Relații și familie',
      color: 'text-pink-500 bg-pink-500/10'
    },
    { 
      icon: Briefcase, 
      title: 'Business',
      description: language === 'en' 
        ? 'Career & finances' 
        : 'Carieră și finanțe',
      color: 'text-blue-500 bg-blue-500/10'
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: language === 'en' ? 'Identify Your Gaps' : 'Identifică Lipsurile',
      description: language === 'en' 
        ? 'Discover which life areas need the most attention in 2026'
        : 'Descoperă ce arii din viață necesită cea mai mare atenție în 2026'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Get Your Score' : 'Primește Scorul',
      description: language === 'en'
        ? 'See exactly where you stand across Body, Being, Balance & Business'
        : 'Vezi exact unde te afli în Corp, Ființă, Echilibru și Business'
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Personalized Plan' : 'Plan Personalizat',
      description: language === 'en'
        ? 'Get a customized 2026 action plan based on your unique results'
        : 'Primește un plan de acțiune 2026 personalizat pe baza rezultatelor tale'
    },
  ];

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Helmet>
          <title>{language === 'en' ? '2026 Vision Quiz | LifeOS' : 'Quiz Viziune 2026 | LifeOS'}</title>
        </Helmet>
        
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-16">
          <VisionQuiz language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Helmet>
        <title>{language === 'en' ? '2026 Vision Assessment | LifeOS' : 'Evaluare Viziune 2026 | LifeOS'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Free quiz: Discover where you lose energy in life and create your plan for 2026'
            : 'Quiz gratuit: Descoperă unde pierzi energie în viață și creează planul pentru 2026'} 
        />
      </Helmet>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'FREE Assessment • 3 Minutes' : 'Evaluare GRATUITĂ • 3 Minute'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {language === 'en' 
                ? <>Discover Where You <span className="text-primary">Lose Energy</span> in Life</>
                : <>Descoperă Unde <span className="text-primary">Pierzi Energie</span> în Viață</>}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {language === 'en'
                ? 'Take our free 16-question assessment and get a personalized plan to dominate 2026 across Body, Being, Balance & Business.'
                : 'Completează evaluarea gratuită cu 16 întrebări și primește un plan personalizat pentru a domina 2026 în Corp, Ființă, Echilibru și Business.'}
            </p>

            <Button 
              size="lg" 
              onClick={() => setShowQuiz(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              {language === 'en' ? 'Start Free Assessment' : 'Începe Evaluarea Gratuită'}
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                <Clock className="w-4 h-4" />
                <span>{language === 'en' ? '3 minutes' : '3 minute'}</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'en' ? '16 questions' : '16 întrebări'}</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                <span>{language === 'en' ? '2,847 taken this week' : '2,847 completat săptămâna asta'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {language === 'en' 
                ? 'The 4 Pillars We Measure' 
                : 'Cei 4 Piloni pe Care Îi Măsurăm'}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'True success comes from balance. Neglect one pillar and the others eventually suffer.'
                : 'Succesul adevărat vine din echilibru. Neglijează un pilon și ceilalți vor suferi.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {pillars.map((pillar, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-full ${pillar.color} flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110`}>
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{pillar.title}</h3>
                <p className="text-sm text-slate-500">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {language === 'en' 
                ? 'What You\'ll Get' 
                : 'Ce Vei Primi'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center text-white">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {language === 'en' 
                  ? 'Ready to Design Your Best 2026?' 
                  : 'Gata să Proiectezi Cel Mai Bun 2026?'}
              </h2>
              <p className="text-white/80 mb-6">
                {language === 'en'
                  ? 'Join thousands of entrepreneurs who started 2026 with clarity and a plan.'
                  : 'Alătură-te miilor de antreprenori care au început 2026 cu claritate și un plan.'}
              </p>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => setShowQuiz(true)}
                className="px-8"
              >
                {language === 'en' ? 'Take the Free Assessment' : 'Completează Evaluarea Gratuită'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vision2026;
