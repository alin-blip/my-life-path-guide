import { Card } from "@/components/ui/card";
import { Target, Play, TrendingUp, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const HowItWorks = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: Target,
      title: language === 'en' ? 'Define' : 'Definește',
      subtitle: language === 'en' ? 'Your Vision' : 'Viziunea Ta',
      description: language === 'en'
        ? 'Create your 2026 vision with AI guidance. Set clear goals for all 4 life areas: Body, Being, Balance, Business.'
        : 'Creează-ți viziunea pentru 2026 cu ghidare AI. Setează obiective clare pentru toate cele 4 arii: Corp, Spirit, Relații, Business.',
      color: 'from-primary to-primary/70',
      time: language === 'en' ? '~30 minutes (one-time setup)' : '~30 minute (setup inițial)',
    },
    {
      number: "02",
      icon: Play,
      title: language === 'en' ? 'Execute' : 'Execută',
      subtitle: language === 'en' ? 'Champion Routine' : 'Rutina de Campion',
      description: language === 'en'
        ? 'Follow your personalized daily routine. Morning rituals, focused work, evening reflection. 30 minutes that transform your day.'
        : 'Urmează rutina ta zilnică personalizată. Ritualuri de dimineață, muncă focusată, reflecție seara. 30 minute care îți transformă ziua.',
      color: 'from-accent to-accent/70',
      time: language === 'en' ? '30 min/day' : '30 min/zi',
    },
    {
      number: "03",
      icon: TrendingUp,
      title: language === 'en' ? 'Evolve' : 'Evoluează',
      subtitle: language === 'en' ? 'AI Coaching' : 'Coaching AI',
      description: language === 'en'
        ? 'Track your progress. Get personalized AI insights. Adjust your strategy. Celebrate wins and learn from setbacks.'
        : 'Urmărește-ți progresul. Primești insights AI personalizate. Ajustezi strategia. Celebrezi victoriile și înveți din eșecuri.',
      color: 'from-emerald-500 to-emerald-400',
      time: language === 'en' ? 'Continuous improvement' : 'Îmbunătățire continuă',
    },
  ];

  return (
    <section 
      id="how-it-works"
      ref={elementRef}
      className={`py-16 md:py-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {language === 'en' ? 'How It Works' : 'Cum Funcționează'}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Three simple steps to transform your life without sacrificing what matters most.'
            : 'Trei pași simpli pentru a-ți transforma viața fără să sacrifici ce contează cel mai mult.'
          }
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connection line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-emerald-500 -translate-y-1/2 z-0" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative z-10">
                <Card className="bg-card border-2 border-border hover:border-primary/30 p-6 md:p-8 transition-all duration-300 hover:shadow-xl h-full">
                  {/* Step Number */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-primary-foreground font-bold text-lg mb-4 mx-auto md:mx-0`}>
                    {step.number}
                  </div>

                  <div className="text-center md:text-left">
                    {/* Icon and Title */}
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    
                    <p className="text-sm font-medium text-primary mb-3">{step.subtitle}</p>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      <span>⏱️</span>
                      <span>{step.time}</span>
                    </div>
                  </div>
                </Card>

                {/* Arrow between cards on mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 md:hidden">
                    <ArrowRight className="h-6 w-6 text-primary rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
