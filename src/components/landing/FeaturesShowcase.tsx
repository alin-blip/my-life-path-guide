import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Dumbbell, 
  Heart, 
  Briefcase, 
  Sparkles, 
  CalendarDays, 
  Library, 
  Target,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const FeaturesShowcase = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: language === 'en' ? '4 AI Coaches' : '4 Coachi AI',
      description: language === 'en' 
        ? 'Personalized coaching for Body, Mindset, Relationships & Business. Available 24/7.'
        : 'Coaching personalizat pentru Corp, Mindset, Relații & Business. Disponibil 24/7.',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Warrior Routine' : 'Rutina Războinicului',
      description: language === 'en'
        ? 'Customizable morning routine with meditation, breathing, visualization, and exercise.'
        : 'Rutină de dimineață configurabilă cu meditație, respirație, vizualizare și exerciții.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: CalendarDays,
      title: language === 'en' ? 'The Door' : 'The Door',
      description: language === 'en'
        ? 'Weekly war planning system. Hit List, Hot List, Do List. Never lose focus.'
        : 'Sistem de planificare săptămânală. Hit List, Hot List, Do List. Nu pierzi niciodată focusul.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Library,
      title: language === 'en' ? 'Stack Library' : 'Biblioteca de Stack-uri',
      description: language === 'en'
        ? '100+ guided protocols: meditations, breathing exercises, visualizations, affirmations.'
        : '100+ protocoale ghidate: meditații, exerciții de respirație, vizualizări, afirmații.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Target,
      title: language === 'en' ? 'Vision Board AI' : 'Vision Board AI',
      description: language === 'en'
        ? 'Create powerful vision boards with AI-generated images. See your future clearly.'
        : 'Creează vision board-uri puternice cu imagini generate de AI. Vezi-ți viitorul clar.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Progress Tracking' : 'Tracking Progres',
      description: language === 'en'
        ? 'XP system, streaks, achievements. Gamified progress that keeps you motivated.'
        : 'Sistem XP, streak-uri, achievements. Progres gamificat care te ține motivat.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: MessageSquare,
      title: language === 'en' ? 'Divine Coaching' : 'Coaching Divin',
      description: language === 'en'
        ? 'Deep introspection sessions with AI. Uncover blind spots and breakthrough barriers.'
        : 'Sesiuni de introspecție profundă cu AI. Descoperă punctele oarbe și depășește barierele.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Heart,
      title: language === 'en' ? 'Relationship Actions' : 'Acțiuni pentru Relații',
      description: language === 'en'
        ? 'Daily prompts to nurture your most important relationships. Never neglect loved ones.'
        : 'Prompturi zilnice pentru a-ți cultiva cele mai importante relații. Nu-ți mai neglija apropiații.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
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
          {language === 'en' ? 'Everything You Get in the Platform' : 'Tot Ce Primești în Platformă'}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'en' 
            ? 'A complete ecosystem designed to help you thrive in all areas of life.'
            : 'Un ecosistem complet conceput să te ajute să prosperi în toate ariile vieții.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className={`${feature.bgColor} border-2 border-transparent hover:border-primary/20 p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          {language === 'en' 
            ? '...and many more features added every month'
            : '...și multe alte funcționalități adăugate în fiecare lună'
          }
        </p>
      </div>
    </section>
  );
};
