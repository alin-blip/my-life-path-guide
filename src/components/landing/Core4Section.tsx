import { Card } from "@/components/ui/card";
import { Dumbbell, Sparkles, Heart, Briefcase, ArrowRight, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Core4Section = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  const coreAreas = [
    {
      icon: Dumbbell,
      title: "BODY",
      subtitle: "Physical Foundation",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      description: "Energy, Health, Vitality",
      details: "A body full of energy brings mental clarity and resilience in negotiations. Without health, nothing else matters. 30 minutes daily transforms everything.",
      feeds: "Energy → Mental Clarity → Relationship Strength → Business Resilience"
    },
    {
      icon: Sparkles,
      title: "BEING",
      subtitle: "Spiritual Core",
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      description: "Faith, Purpose, Inner Peace",
      details: "Inner peace reveals opportunities invisible to others. Spiritual clarity sustains relationships and guides business decisions. 10 minutes meditation changes perspective.",
      feeds: "Clarity → Wise Decisions → Authentic Relationships → Purpose-Driven Business"
    },
    {
      icon: Heart,
      title: "BALANCE",
      subtitle: "Relationships",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      description: "Family, Partner, Friends",
      details: "Support from relationships gives you courage to take risks in business. Your network opens doors. Family gives you the motivation to continue.",
      feeds: "Support → Courage → Network → Business Opportunities"
    },
    {
      icon: Briefcase,
      title: "BUSINESS",
      subtitle: "Financial Freedom",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Wealth, Impact, Legacy",
      details: "Resources from business buy you time for body, peace for spirit, and experiences for family. Money amplifies all other areas.",
      feeds: "Resources → Free Time → Better Health → Deeper Relationships"
    }
  ];

  return (
    <section 
      ref={elementRef}
      className={`mb-16 md:mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-8 md:mb-12 px-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">
          The 4 Pillars of the <span className="text-primary">Have It All</span> Lifestyle
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
          True wealth means abundance in ALL areas — not sacrificing one for another. 
          <span className="font-semibold text-slate-800"> CEO Mind OS</span> builds all four simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
        {coreAreas.map((area, index) => {
          const Icon = area.icon;
          return (
            <Card 
              key={index}
              className={`${area.bgColor} border-2 ${area.borderColor} p-5 md:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.02] md:hover:scale-[1.03] hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group`}
            >
              <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                <div className={`${area.bgColor} p-2 md:p-3 rounded-lg border ${area.borderColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-6 w-6 md:h-8 md:w-8 ${area.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-0.5">{area.title}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-1">{area.subtitle}</p>
                  <p className={`text-xs sm:text-sm font-semibold ${area.color}`}>{area.description}</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-2 md:mb-3">
                {area.details}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Zap className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                <span className="text-[10px] md:text-xs">{area.feeds}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ciclul Virtuos - Visual Diagram */}
      <div className="max-w-5xl mx-auto mt-10 md:mt-16 mb-8 md:mb-12 px-2">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-slate-900 mb-4 md:mb-6">
          The Virtuous Cycle: How the 4 Pillars Feed Each Other
        </h3>
        <p className="text-center text-sm md:text-base text-slate-600 mb-6 md:mb-10 max-w-2xl mx-auto">
          You're not building 4 separate things. You're building one engine with 4 cylinders that feed each other.
        </p>

        <div className="relative">
          {/* Circular Flow Diagram */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-12 max-w-3xl mx-auto relative">
            {/* Center Connection Visualization */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full border-4 border-primary/20 animate-pulse" />
            </div>

            {/* Body - Top Left */}
            <Card className="relative bg-emerald-50 border-2 border-emerald-200 p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-emerald-600 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900">Body</h4>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 leading-relaxed">
                Physical Energy → Mental Clarity
              </p>
              <ArrowRight className="absolute -right-2 sm:-right-3 md:-right-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary animate-pulse hidden sm:block" />
            </Card>

            {/* Being - Top Right */}
            <Card className="relative bg-violet-50 border-2 border-violet-200 p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-violet-600 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900">Being</h4>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 leading-relaxed">
                Inner Peace → Wise Decisions
              </p>
              <ArrowRight className="absolute left-1/2 -bottom-2 sm:-bottom-3 md:-bottom-4 -translate-x-1/2 rotate-90 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary animate-pulse hidden sm:block" />
            </Card>

            {/* Balance - Bottom Left */}
            <Card className="relative bg-rose-50 border-2 border-rose-200 p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-rose-600 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900">Balance</h4>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 leading-relaxed">
                Emotional Support → Courage to Risk
              </p>
              <ArrowRight className="absolute left-1/2 -top-2 sm:-top-3 md:-top-4 -translate-x-1/2 -rotate-90 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary animate-pulse hidden sm:block" />
            </Card>

            {/* Business - Bottom Right */}
            <Card className="relative bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900">Business</h4>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 leading-relaxed">
                Financial Resources → Free Time
              </p>
              <ArrowRight className="absolute -left-2 sm:-left-3 md:-left-4 top-1/2 -translate-y-1/2 rotate-180 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary animate-pulse hidden sm:block" />
            </Card>
          </div>

          {/* Flow Description */}
          <div className="mt-8 md:mt-12 text-center max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-emerald-50 via-violet-50 to-blue-50 border-2 border-primary/30 p-5 md:p-8">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                  The Multiplier Effect
                </h4>
              </div>
              <p className="text-sm md:text-base lg:text-lg text-slate-700 leading-relaxed mb-3 md:mb-4">
                <span className="font-bold text-emerald-600">When Body grows</span>, you have more energy for Being and Business. 
                <span className="font-bold text-violet-600"> When Being is strong</span>, you make better decisions in Business and Balance. 
                <span className="font-bold text-rose-600"> When Balance is solid</span>, you have courage to take risks in Business. 
                <span className="font-bold text-blue-600"> When Business thrives</span>, you have resources for all other areas.
              </p>
              <p className="text-sm md:text-lg font-bold text-slate-900">
                You don't choose between areas — you build them simultaneously. 
                <span className="text-primary"> That's the CEO Mind OS difference.</span>
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-emerald-50 via-violet-50 to-blue-50 border-2 border-primary/40 p-5 md:p-8 max-w-4xl mx-auto mt-6 md:mt-8 shadow-lg">
        <p className="text-base md:text-lg text-slate-900 font-bold text-center mb-2 md:mb-3">
          🦅 The CEO Mind OS Philosophy: SIMULTANEOUS Progress in All 4 Pillars
        </p>
        <p className="text-sm md:text-base text-slate-600 text-center leading-relaxed">
          <span className="text-slate-900 font-semibold">Don't sacrifice body for money.</span> Don't sacrifice family for success. 
          <span className="text-primary font-bold"> Build everything at the same time</span> — 
          balanced, sustainable, lasting.
        </p>
      </Card>
    </section>
  );
};
