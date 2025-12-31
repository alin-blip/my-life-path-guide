import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Clock, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const FinalCTA = () => {
  const navigate = useNavigate();
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();

  return (
    <section 
      ref={elementRef}
      className={`mb-12 md:mb-16 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
            {t('landingFinalCTATitle')}
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            {t('landingFinalCTASubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">{t('landing15MinSetup')}</p>
                <p className="text-slate-500 text-xs sm:text-sm">{t('landingQuickOnboarding')}</p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">{t('landingResultsIn48h')}</p>
                <p className="text-slate-500 text-xs sm:text-sm">{t('landingClarityFirstWins')}</p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center sm:mb-3 shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left sm:text-center">
                <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0 sm:mb-1">{t('landingZeroRiskGuarantee')}</p>
                <p className="text-slate-500 text-xs sm:text-sm">{t('landing7DayTrialCancelFree')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/vision-2026')}
            >
              🎯 {t('landingPlanYour2026') || 'Planifică-ți 2026 GRATUIT'}
            </Button>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/auth')}
            >
              <Rocket className="w-5 h-5 mr-2" />
              {t('landingStartFreeTrial')}
            </Button>
          </div>

          <p className="text-slate-500 text-xs sm:text-sm mt-4 md:mt-6">
            {t('landingMembersStats')}
          </p>
        </div>
      </div>
    </section>
  );
};