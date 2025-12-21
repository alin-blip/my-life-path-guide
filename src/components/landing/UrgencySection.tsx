import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Brain, Heart, Briefcase, AlertTriangle, Flame, ArrowRight, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const UrgencySection = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();

  const costsPerDay = [
    {
      icon: Dumbbell,
      area: "Body",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      cost: "-0.5% energy & vitality each day you skip your health routine"
    },
    {
      icon: Brain,
      area: "Being",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      cost: "-1 moment of inner peace lost to stress and mental fog"
    },
    {
      icon: Heart,
      area: "Balance",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      cost: "-1 meaningful connection with loved ones you'll never get back"
    },
    {
      icon: Briefcase,
      area: "Business",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      cost: "-$50-500 potential revenue from missed opportunities and chaos"
    }
  ];

  return (
    <section 
      ref={elementRef}
      className={`mb-12 md:mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
      id="urgency"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-full mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">The Cost of Waiting</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Every Day Without a System Costs You
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            While you hesitate, life keeps moving. Here's what you lose with each passing day:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8 md:mb-12">
          {costsPerDay.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                className={`${item.bgColor} border-2 ${item.borderColor} p-6 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.bgColor} p-3 rounded-lg border ${item.borderColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className={`h-8 w-8 ${item.color} transition-transform duration-300 group-hover:scale-110`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${item.color}`}>{item.area}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.cost}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-center text-white mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl md:text-2xl font-bold">30 Days From Now</h3>
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            You can either be 30 days into your transformation, experiencing more energy, clarity, 
            better relationships, and growing income... or still wondering "what if?"
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-400">+15%</p>
              <p className="text-xs text-slate-400">Energy Level</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-400">+30</p>
              <p className="text-xs text-slate-400">Mindful Minutes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-pink-400">+7</p>
              <p className="text-xs text-slate-400">Quality Moments</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-400">+22%</p>
              <p className="text-xs text-slate-400">Productivity</p>
            </div>
          </div>

          <Button 
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg font-bold"
            onClick={() => navigate('/auth')}
          >
            Start My Transformation Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Average setup time: 15 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};
