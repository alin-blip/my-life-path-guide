import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const FounderSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="founder"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t('landingFounderTitle')}
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          {t('landingFounderSubtitle')}
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image Placeholder */}
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <Quote className="h-16 w-16 text-primary/40" />
            </div>
            <div className="mt-4 text-center">
              <div className="font-bold text-slate-900 text-lg">{t('landingFounderName')}</div>
              <div className="text-sm text-slate-500">{t('landingFounderRole')}</div>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 space-y-4 text-slate-600">
            <p className="text-lg leading-relaxed font-semibold text-slate-900">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderYears')
                  .replace(/<span>/g, '<span class="text-red-500">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderStory1')
                  .replace(/<span>/g, '<span class="text-red-600 font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderStory2')
                  .replace(/<span>/g, '<span class="text-red-600 font-semibold italic">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderStory3')
                  .replace(/<span>/g, '<span class="text-slate-900 font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderStory4')
                  .replace(/<span>/g, '<span class="text-primary font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r">
              <p className="text-slate-900 font-bold mb-2">{t('landingFounderResultsTitle')}</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ {t('landingFounderResult1')}</li>
                <li>✓ {t('landingFounderResult2')}</li>
                <li>✓ {t('landingFounderResult3')}</li>
                <li>✓ {t('landingFounderResult4')}</li>
                <li>✓ {t('landingFounderResult5')}</li>
              </ul>
            </div>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderConclusion1')
                  .replace(/<span>/g, '<span class="text-primary font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <p className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingFounderConclusion2')
                  .replace(/<span>/g, '<span class="text-slate-900 font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <p className="text-slate-900 font-bold">
                {t('landingFounderStats')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};