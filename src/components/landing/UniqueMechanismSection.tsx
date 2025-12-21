import { Card } from "@/components/ui/card";
import { Dumbbell, Sparkles, Heart, Briefcase, Target } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const UniqueMechanismSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  const protocols = [
    {
      number: "1",
      icon: Dumbbell,
      title: "Body",
      description: "Daily movement & nutrition rituals",
      result: "Energy, strength, vitality",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300"
    },
    {
      number: "2",
      icon: Sparkles,
      title: "Being",
      description: "Meditation, Stack & inner clarity",
      result: "Peace, purpose, mental power",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300"
    },
    {
      number: "3",
      icon: Heart,
      title: "Balance",
      description: "Adding value to relationships daily",
      result: "Deep connections, love, legacy",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-300"
    },
    {
      number: "4",
      icon: Briefcase,
      title: "Business",
      description: "Strategic learning & application",
      result: "Growth, income, impact",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    },
    {
      number: "5",
      icon: Target,
      title: "The Door",
      description: "Weekly planning & execution",
      result: "Focus on what truly matters",
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
          The 5 Pillars of Freedom
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          This isn't a productivity tool. It's a <span className="text-primary font-bold">complete life system</span> that integrates Body, Being, Balance, and Business into one unified framework.
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">{protocol.title}</h3>
              <p className="text-sm text-slate-600 mb-3">{protocol.description}</p>
              <div className={`border-t-2 ${protocol.borderColor} pt-3`}>
                <p className={`text-sm font-semibold ${protocol.color}`}>→ {protocol.result}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/40 p-8 max-w-4xl mx-auto shadow-xl">
        <p className="text-lg text-slate-900 font-bold text-center mb-2">
          🎯 Works Together as ONE SYSTEM
        </p>
        <p className="text-base text-slate-600 text-center">
          Each pillar connects with the others. Body gives you energy. Being gives you clarity. 
          Balance keeps you grounded. Business drives growth. The Door keeps you focused weekly. 
          <span className="text-slate-900 font-semibold"> One without the others leads to imbalance.</span>
        </p>
      </Card>
    </section>
  );
};
