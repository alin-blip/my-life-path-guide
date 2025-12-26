import { Card } from "@/components/ui/card";
import { Dumbbell, Sparkles, Heart, Briefcase, Target } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const UniqueMechanismSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();

  const protocols = [
    {
      number: "1",
      icon: Dumbbell,
      titleKey: "body",
      descriptionKey: "landingBodyDesc",
      resultKey: "landingBodyResult",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300"
    },
    {
      number: "2",
      icon: Sparkles,
      titleKey: "being",
      descriptionKey: "landingBeingDesc",
      resultKey: "landingBeingResult",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300"
    },
    {
      number: "3",
      icon: Heart,
      titleKey: "balance",
      descriptionKey: "landingBalanceDesc",
      resultKey: "landingBalanceResult",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300"
    },
    {
      number: "4",
      icon: Briefcase,
      titleKey: "business",
      descriptionKey: "landingBusinessDesc",
      resultKey: "landingBusinessResult",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    },
    {
      number: "5",
      icon: Target,
      titleKey: "landingDoorTitle",
      descriptionKey: "landingDoorDesc",
      resultKey: "landingDoorResult",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300"
    }
  ];
  
  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t('landing5Pillars')}
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          <span dangerouslySetInnerHTML={{ 
            __html: t('landing5PillarsDesc')
              .replace(/<span>/g, '<span class="text-primary font-bold">')
              .replace(/<\/span>/g, '</span>')
          }} />
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
        {protocols.map((protocol, index) => {
          const Icon = protocol.icon;
          return (
            <Card
              key={index}
              className={`group ${protocol.bgColor} border-2 ${protocol.borderColor} p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-default`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`${protocol.bgColor} border-2 ${protocol.borderColor} rounded-full w-10 h-10 flex items-center justify-center font-bold ${protocol.color} text-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {protocol.number}
                </div>
                <Icon className={`h-8 w-8 ${protocol.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t(protocol.titleKey)}</h3>
              <p className="text-sm text-slate-600 mb-3">{t(protocol.descriptionKey)}</p>
              <div className={`border-t-2 ${protocol.borderColor} pt-3`}>
                <p className={`text-sm font-semibold ${protocol.color}`}>→ {t(protocol.resultKey)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/40 p-8 max-w-4xl mx-auto shadow-xl">
        <p className="text-lg text-slate-900 font-bold text-center mb-2">
          🎯 {t('landingSystemTitle')}
        </p>
        <p className="text-base text-slate-600 text-center">
          <span dangerouslySetInnerHTML={{ 
            __html: t('landingSystemDesc')
              .replace(/<span>/g, '<span class="text-slate-900 font-semibold">')
              .replace(/<\/span>/g, '</span>')
          }} />
        </p>
      </Card>
    </section>
  );
};