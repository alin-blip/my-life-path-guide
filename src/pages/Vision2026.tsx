import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { VisionQuiz } from '@/components/vision-quiz/VisionQuiz';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLeadMagnetTracker } from '@/hooks/useLeadMagnetTracker';
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
  TrendingUp,
  XCircle,
  Zap,
  Eye,
  Calendar,
  BarChart3,
  Rocket
} from 'lucide-react';

const Vision2026 = () => {
  const { language } = useLanguage();
  const [showQuiz, setShowQuiz] = useState(false);
  const tracker = useLeadMagnetTracker('vision_2026');
  
  const handleStartQuiz = () => {
    tracker.trackCTAClick('start_assessment');
    tracker.trackQuizStart();
    setShowQuiz(true);
  };

  const problems = [
    {
      icon: Eye,
      title: language === 'en' ? 'Lack of Clarity' : 'Lipsa Clarității',
      description: language === 'en' 
        ? "You don't know exactly where you're losing energy and time"
        : 'Nu știi exact unde pierzi energie și timp'
    },
    {
      icon: Target,
      title: language === 'en' ? 'Too Many Goals' : 'Prea Multe Obiective',
      description: language === 'en'
        ? 'Overloaded with ideas, but no focus on what truly matters'
        : 'Supraîncărcat cu idei, dar fără focus pe ce contează cu adevărat'
    },
    {
      icon: Calendar,
      title: language === 'en' ? 'No System' : 'Fără Sistem',
      description: language === 'en'
        ? 'Motivation fades, goals stay in your journal forever'
        : 'Motivația dispare, obiectivele rămân în jurnal pentru totdeauna'
    },
    {
      icon: BarChart3,
      title: language === 'en' ? 'No Visibility' : 'Fără Vizibilitate',
      description: language === 'en'
        ? "You can't see progress, so you lose direction"
        : 'Nu vezi progresul, așa că pierzi direcția'
    },
  ];

  const pillars = [
    { 
      icon: Dumbbell, 
      title: language === 'en' ? 'Body' : 'Corp',
      description: language === 'en' 
        ? 'Energy, fitness & vitality' 
        : 'Energie, fitness și vitalitate',
      gradient: 'from-green-500 to-emerald-400'
    },
    { 
      icon: Brain, 
      title: language === 'en' ? 'Being' : 'Ființă',
      description: language === 'en' 
        ? 'Clarity, peace & purpose' 
        : 'Claritate, pace și scop',
      gradient: 'from-purple-500 to-violet-400'
    },
    { 
      icon: Heart, 
      title: language === 'en' ? 'Balance' : 'Echilibru',
      description: language === 'en' 
        ? 'Relationships & family' 
        : 'Relații și familie',
      gradient: 'from-pink-500 to-rose-400'
    },
    { 
      icon: Briefcase, 
      title: 'Business',
      description: language === 'en' 
        ? 'Career & finances' 
        : 'Carieră și finanțe',
      gradient: 'from-blue-500 to-cyan-400'
    },
  ];

  const solutionPoints = [
    language === 'en' ? 'Helps you identify exactly where you lose energy' : 'Te ajută să identifici exact unde pierzi energie',
    language === 'en' ? 'Organizes your goals into daily actions' : 'Îți organizează obiectivele în acțiuni zilnice',
    language === 'en' ? 'Shows your progress in real-time' : 'Îți arată progresul în timp real',
    language === 'en' ? 'Keeps you accountable without overwhelm' : 'Te ține accountable fără să te simți copleșit',
  ];

  const steps = [
    {
      number: '01',
      title: language === 'en' ? 'Take the Quiz' : 'Completează Quiz-ul',
      description: language === 'en' ? '3 minutes to discover your gaps' : '3 minute pentru a descoperi lipsurile',
      icon: CheckCircle2
    },
    {
      number: '02',
      title: language === 'en' ? 'Get Your Score' : 'Primește Scorul',
      description: language === 'en' ? 'Personalized analysis across 4 pillars' : 'Analiză personalizată pe 4 piloni',
      icon: BarChart3
    },
    {
      number: '03',
      title: language === 'en' ? 'Implement the Plan' : 'Implementează Planul',
      description: language === 'en' ? 'Daily actions generated automatically' : 'Acțiuni zilnice generate automat',
      icon: Rocket
    },
  ];

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 relative overflow-hidden">
        <Helmet>
          <title>{language === 'en' ? '2026 Vision Quiz | LifeOS' : 'Quiz Viziune 2026 | LifeOS'}</title>
        </Helmet>
        
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
          <VisionQuiz language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white relative overflow-hidden">
      <Helmet>
        <title>{language === 'en' ? '2026 Vision Assessment | LifeOS' : 'Evaluare Viziune 2026 | LifeOS'}</title>
        <meta 
          name="description" 
          content={language === 'en' 
            ? 'Free quiz: Discover where you lose energy in life and create your plan for 2026'
            : 'Quiz gratuit: Descoperă unde pierzi energie în viață și creează planul pentru 2026'} 
        />
      </Helmet>

      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Hero Section - The Problem */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">
                {language === 'en' ? 'FREE Assessment • 3 Minutes' : 'Evaluare GRATUITĂ • 3 Minute'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {language === 'en' 
                ? <>2026 Can Be Your Year of Transformation...<br /><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Or Just Another Year That Passes</span></>
                : <>2026 Poate Fi Anul Tău de Transformare...<br /><span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Sau Doar Încă Un An Care Trece</span></>}
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {language === 'en'
                ? 'Most people set goals at the start of the year. 92% fail before March. The difference? A clear system.'
                : 'Majoritatea oamenilor își stabilesc obiective la început de an. 92% eșuează înainte de Martie. Diferența? Un sistem clar.'}
            </p>

            <Button 
              size="lg" 
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white px-10 py-7 text-lg font-bold shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105 animate-fade-in border-0"
              style={{ animationDelay: '0.3s' }}
            >
              {language === 'en' ? 'Start Free Assessment' : 'Începe Evaluarea Gratuită'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{language === 'en' ? '3 minutes' : '3 minute'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'en' ? '16 questions' : '16 întrebări'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{language === 'en' ? '2,847 taken this week' : '2,847 completat săptămâna asta'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {language === 'en' 
                ? <><span className="text-red-400">Why 92% Fail</span> Before March</> 
                : <><span className="text-red-400">De Ce Eșuează 92%</span> Înainte de Martie</>}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {language === 'en'
                ? "It's not about motivation. It's about these 4 silent killers:"
                : 'Nu e vorba despre motivație. E vorba despre acești 4 ucigași tăcuți:'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <problem.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{problem.title}</h3>
                <p className="text-sm text-white/60">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                {language === 'en' 
                  ? <>What If You Had a <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">System</span> That...</> 
                  : <>Dar Dacă Ai Avea un <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Sistem</span> Care...</>}
              </h2>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12">
              <div className="grid gap-4">
                {solutionPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 animate-fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-white/90">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <Button 
                  size="lg" 
                  onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white px-8 py-6 font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105 border-0"
                >
                  {language === 'en' ? 'Start With the Free Assessment' : 'Începe cu Evaluarea Gratuită'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-amber-400 font-medium mb-2 uppercase tracking-wider text-sm">
              {language === 'en' ? 'Step 1' : 'Pasul 1'}
            </p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {language === 'en' 
                ? 'Find Out Where You Are Now' 
                : 'Află Unde Te Afli Acum'}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              {language === 'en'
                ? 'We measure your life across 4 essential pillars. Neglect one and the others eventually suffer.'
                : 'Măsurăm viața ta pe 4 piloni esențiali. Neglijează unul și ceilalți vor suferi.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {pillars.map((pillar, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 text-center group animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${pillar.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{pillar.title}</h3>
                <p className="text-sm text-white/60">{pillar.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white px-10 py-7 text-lg font-bold shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 border-0"
            >
              {language === 'en' ? 'Take the Free Assessment' : 'Completează Evaluarea Gratuită'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {language === 'en' ? 'How It Works' : 'Cum Funcționează'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-6 text-amber-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'en' 
                  ? '2026 Starts With One Decision' 
                  : '2026 Începe Cu O Decizie'}
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                {language === 'en'
                  ? 'Join thousands who took control of their life. The assessment is free and takes only 3 minutes.'
                  : 'Alătură-te miilor care și-au luat viața în propriile mâini. Evaluarea este gratuită și durează doar 3 minute.'}
              </p>
              <Button 
                size="lg"
                onClick={handleStartQuiz}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-white px-12 py-7 text-lg font-bold shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 border-0"
              >
                {language === 'en' ? 'Start My Free Assessment' : 'Începe Evaluarea Mea Gratuită'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-white/50 text-sm mt-4">
                {language === 'en' 
                  ? '✓ No credit card • ✓ 100% Free • ✓ Instant results' 
                  : '✓ Fără card de credit • ✓ 100% Gratuit • ✓ Rezultate instant'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vision2026;
