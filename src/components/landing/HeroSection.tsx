import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Play, Check, Sparkles, Brain, Target, Users } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const { t, language } = useLanguage();

  const keyFeatures = [
    { icon: Brain, text: language === 'en' ? '4 AI Coaches (Body, Mindset, Relationships, Business)' : '4 Coachi AI (Corp, Mindset, Relații, Business)' },
    { icon: Sparkles, text: language === 'en' ? 'Warrior Routine - 30 min/day that changes everything' : 'Rutina Războinicului - 30 min/zi care schimbă totul' },
    { icon: Target, text: language === 'en' ? 'The Door - Intelligent weekly planning system' : 'The Door - Sistem de planificare săptămânală inteligent' },
  ];

  return (
    <section className="relative py-8 md:py-16 -mx-4 px-4 bg-gradient-to-b from-primary/5 via-background to-background rounded-3xl overflow-hidden" id="top">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8 md:mb-12">
          <img
            src="/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png"
            alt="WarriorOS logo"
            loading="eager"
            className="h-10 md:h-14 w-auto"
          />
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link to="/auth">{language === 'en' ? 'Login' : 'Autentificare'}</Link>
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              {language === 'en' ? 'Start Free Trial' : 'Încearcă Gratuit'}
            </Button>
          </div>
        </nav>

        {/* Main Hero Content */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight animate-fade-in">
            <span className="text-primary">{language === 'en' ? 'Success' : 'Succes'}</span> {language === 'en' ? 'Without' : 'Fără'}{' '}
            <span className="text-primary">{language === 'en' ? 'Sacrifice' : 'Sacrificiu'}</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {language === 'en' 
              ? 'The complete AI system for entrepreneurs who want it ALL: healthy body, strong relationships, inner peace AND profitable business.'
              : 'Sistemul AI complet pentru antreprenori care vor TOT: corp sănătos, relații puternice, claritate interioară ȘI business profitabil.'
            }
          </p>

          {/* Key Features Pills */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 md:gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full text-sm font-medium text-foreground shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all ring-4 ring-primary/20"
            >
              🚀 {language === 'en' ? 'Start 3-Day Free Trial' : 'Încearcă 3 Zile Gratuit'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-6 text-lg font-medium border-2"
            >
              {language === 'en' ? 'See How It Works' : 'Vezi Cum Funcționează'}
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-muted-foreground animate-fade-in text-sm" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{language === 'en' ? '4 Life Areas Integrated' : '4 Arii de Viață Integrate'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{language === 'en' ? '90-Day Guarantee' : 'Garanție 90 Zile'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{language === 'en' ? 'Cancel Anytime' : 'Anulezi Oricând'}</span>
            </div>
          </div>
        </div>

        {/* App Screenshot / Video */}
        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-card hover:shadow-3xl transition-shadow duration-500 cursor-pointer group"
            onClick={() => setVideoPlaying(true)}
          >
            {!videoPlaying && (
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-foreground/60 via-transparent to-transparent flex items-center justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground fill-primary-foreground ml-1" />
                </div>
              </div>
            )}
            
            <div className="aspect-video">
              {videoPlaying ? (
                <iframe
                  src="https://www.youtube.com/embed/sfuey_WNODs?rel=0&modestbranding=1&autoplay=1"
                  title="WarriorOS - Success Without Sacrifice"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <img 
                  src="https://img.youtube.com/vi/sfuey_WNODs/maxresdefault.jpg"
                  alt="WarriorOS Video Preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {language === 'en' ? '🎬 Watch: How WarriorOS transforms entrepreneurs in 90 days' : '🎬 Vezi: Cum WarriorOS transformă antreprenorii în 90 de zile'}
          </p>
        </div>

        {/* Micro Social Proof */}
        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Users className="h-4 w-4" />
          <span>{language === 'en' ? 'Used by entrepreneurs in E-commerce, SaaS, Consulting, Real Estate' : 'Folosit de antreprenori din E-commerce, SaaS, Consulting, Imobiliare'}</span>
        </div>
      </div>
    </section>
  );
};
