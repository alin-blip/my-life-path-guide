import { Card } from "@/components/ui/card";
import { Dumbbell, Sparkles, Heart, Briefcase, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const Core4SectionNew = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const pillars = [
    {
      icon: Dumbbell,
      title: "BODY",
      subtitle: language === 'en' ? 'Physical Foundation' : 'Fundația Fizică',
      description: language === 'en' 
        ? 'Energy, health, and vitality. The fuel for everything else.'
        : 'Energie, sănătate și vitalitate. Combustibilul pentru tot restul.',
      result: language === 'en' 
        ? '+3h energy/day, better sleep, mental clarity'
        : '+3h energie/zi, somn mai bun, claritate mentală',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      icon: Sparkles,
      title: "BEING",
      subtitle: language === 'en' ? 'Spiritual Core' : 'Nucleul Spiritual',
      description: language === 'en'
        ? 'Faith, purpose, and inner peace. The compass for decisions.'
        : 'Credință, scop și pace interioară. Busola pentru decizii.',
      result: language === 'en'
        ? 'Reduced anxiety, clearer vision, daily peace'
        : 'Anxietate redusă, viziune clară, pace zilnică',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
    },
    {
      icon: Heart,
      title: "BALANCE",
      subtitle: language === 'en' ? 'Relationships' : 'Relații',
      description: language === 'en'
        ? 'Family, partner, friends. The support system for success.'
        : 'Familie, partener, prieteni. Sistemul de suport pentru succes.',
      result: language === 'en'
        ? 'Deeper connections, quality time, no guilt'
        : 'Conexiuni mai profunde, timp de calitate, fără vinovăție',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    {
      icon: Briefcase,
      title: "BUSINESS",
      subtitle: language === 'en' ? 'Financial Freedom' : 'Libertate Financiară',
      description: language === 'en'
        ? 'Wealth, impact, and legacy. The resources for everything.'
        : 'Bogăție, impact și moștenire. Resursele pentru tot.',
      result: language === 'en'
        ? 'Focused work, higher revenue, more free time'
        : 'Muncă focusată, venituri mai mari, mai mult timp liber',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <section 
      ref={elementRef}
      className={`py-16 md:py-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {language === 'en' 
            ? 'One System for All 4 Life Areas' 
            : 'Un Singur Sistem pentru Toate Cele 4 Arii'
          }
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'en' 
            ? "You don't choose between areas — you build them simultaneously. That's the LifeOS difference."
            : 'Nu alegi între arii — le construiești simultan. Asta e diferența LifeOS.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Card 
              key={index}
              className={`${pillar.bgColor} border-2 ${pillar.borderColor} p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${pillar.bgColor} border ${pillar.borderColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${pillar.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{pillar.subtitle}</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4 mb-4 leading-relaxed">
                {pillar.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <ArrowRight className="h-4 w-4" />
                <span>{pillar.result}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* The Multiplier Effect */}
      <div className="mt-12 max-w-3xl mx-auto">
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-emerald-500/5 border-2 border-primary/20 p-6 md:p-8">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              {language === 'en' ? '⚡ The Multiplier Effect' : '⚡ Efectul Multiplicator'}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {language === 'en' 
                ? 'When Body grows, you have more energy for Being and Business. When Being is strong, you make better decisions. When Balance is solid, you have courage to take risks. When Business thrives, you have resources for all areas.'
                : 'Când Corpul crește, ai mai multă energie pentru Spirit și Business. Când Spiritul e puternic, iei decizii mai bune. Când Relațiile sunt solide, ai curaj să riști. Când Business-ul prosperă, ai resurse pentru toate ariile.'
              }
            </p>
            <p className="text-lg font-bold text-primary">
              {language === 'en' 
                ? "You build them simultaneously. That's the LifeOS philosophy."
                : 'Le construiești simultan. Asta e filozofia LifeOS.'
              }
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
