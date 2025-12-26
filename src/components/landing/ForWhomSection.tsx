import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const ForWhomSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();

  const idealForKeys = [
    "landingIdeal1",
    "landingIdeal2",
    "landingIdeal3",
    "landingIdeal4",
    "landingIdeal5"
  ];

  const notForKeys = [
    "landingNot1",
    "landingNot2",
    "landingNot3",
    "landingNot4",
    "landingNot5"
  ];
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="for-whom"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t('landingForWhomTitle')}
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          <span dangerouslySetInnerHTML={{ 
            __html: t('landingForWhomSubtitle')
              .replace(/<span>/g, '<span class="text-primary font-bold">')
              .replace(/<\/span>/g, '</span>')
          }} />
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Ideal For */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 p-8 shadow-md hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <h3 className="text-2xl font-bold text-slate-900">{t('landingIsForYou')}</h3>
          </div>
          <ul className="space-y-4">
            {idealForKeys.map((key, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-slate-700">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingIdealSummary')
                  .replace(/<span>/g, '<span class="font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>
          </div>
        </Card>

        {/* Not For */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 p-8 shadow-md hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="h-8 w-8 text-red-500 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <h3 className="text-2xl font-bold text-slate-900">{t('landingNotForYou')}</h3>
          </div>
          <ul className="space-y-4">
            {notForKeys.map((key, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-slate-700">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingNotSummary')
                  .replace(/<span>/g, '<span class="font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t('landingForWhomFooter')}
          <span className="block mt-2 text-green-600 font-semibold">{t('landingForWhomFooterHighlight')}</span>
        </p>
      </div>
    </div>
  );
};