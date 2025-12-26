import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Brain, Heart, Briefcase, AlertTriangle, Flame, ArrowRight, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const UrgencySection = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();

  const costsPerDay = [
    {
      icon: Dumbbell,
      areaKey: "body",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      costKey: "landingBodyCost"
    },
    {
      icon: Brain,
      areaKey: "being",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      costKey: "landingBeingCost"
    },
    {
      icon: Heart,
      areaKey: "balance",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      costKey: "landingBalanceCost"
    },
    {
      icon: Briefcase,
      areaKey: "business",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      costKey: "landingBusinessCost"
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
            <span className="text-sm font-medium">{t('landingCostOfWaiting')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('landingEveryDayWithout')}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {t('landingWhileYouHesitate')}
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
                    <h3 className={`text-xl font-bold mb-2 ${item.color}`}>{t(item.areaKey)}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {t(item.costKey)}
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
            <h3 className="text-xl md:text-2xl font-bold">{t('landing30DaysFromNow')}</h3>
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            {t('landing30DaysDesc')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-400">+15%</p>
              <p className="text-xs text-slate-400">{t('landingEnergyLevel')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-400">+30</p>
              <p className="text-xs text-slate-400">{t('landingMindfulMinutes')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-pink-400">+7</p>
              <p className="text-xs text-slate-400">{t('landingQualityMoments')}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-400">+22%</p>
              <p className="text-xs text-slate-400">{t('landingProductivity')}</p>
            </div>
          </div>

          <Button 
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg font-bold"
            onClick={() => navigate('/auth')}
          >
            {t('landingStartTransformation')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('landingAverageSetupTime')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};