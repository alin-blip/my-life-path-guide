import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock, Heart, Brain } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const ProblemSectionNew = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { language } = useLanguage();

  const problems = [
    {
      icon: Clock,
      title: language === 'en' ? 'Working 60+ hours/week' : 'Lucrezi 60+ ore/săptămână',
      description: language === 'en' 
        ? 'Business grows, but you have no time for yourself, family, or health.'
        : 'Business-ul crește, dar nu ai timp pentru tine, familie sau sănătate.',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Heart,
      title: language === 'en' ? 'Relationships suffer' : 'Relațiile suferă',
      description: language === 'en'
        ? 'Your partner feels neglected. Kids grow up without you. Friends disappear.'
        : 'Partenerul se simte neglijat. Copiii cresc fără tine. Prietenii dispar.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
    {
      icon: Brain,
      title: language === 'en' ? 'Burnout approaching' : 'Burnout-ul se apropie',
      description: language === 'en'
        ? 'Exhausted mornings. Sleepless nights. Anxiety about the future.'
        : 'Dimineți epuizate. Nopți fără somn. Anxietate despre viitor.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: AlertTriangle,
      title: language === 'en' ? 'Health on second plan' : 'Sănătatea pe planul 2',
      description: language === 'en'
        ? 'Skipped workouts. Fast food. "I\'ll take care of myself when I have time."'
        : 'Antrenamente sárite. Fast food. "Mă ocup de mine când am timp."',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
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
          {language === 'en' ? 'Do You Recognize This Pattern?' : 'Recunoști Acest Pattern?'}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Most entrepreneurs sacrifice one area of life for another. The result? Imbalance and eventual collapse.'
            : 'Majoritatea antreprenorilor sacrifică o arie a vieții pentru alta. Rezultatul? Dezechilibru și colaps eventual.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
        {problems.map((problem, index) => {
          const Icon = problem.icon;
          return (
            <Card 
              key={index}
              className={`${problem.bgColor} border-2 border-transparent hover:border-primary/20 p-6 transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${problem.bgColor}`}>
                  <Icon className={`h-6 w-6 ${problem.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Burnout Cycle Visual */}
      <div className="mt-12 max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-6 md:p-8">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground mb-2">
              {language === 'en' ? '🔄 The Burnout Cycle' : '🔄 Ciclul Burnout-ului'}
            </p>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Work more → Less time for health → Less energy → Need to work harder → Repeat'
                : 'Muncești mai mult → Mai puțin timp pentru sănătate → Mai puțină energie → Trebuie să muncești mai mult → Repetă'
              }
            </p>
            <p className="text-primary font-bold">
              {language === 'en' 
                ? 'There IS a way to break this cycle. ↓'
                : 'EXISTĂ o cale să rupi acest ciclu. ↓'
              }
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
