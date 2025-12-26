import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";

export const PitSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { t } = useLanguage();

  const pitItems = [
    { 
      id: "work", 
      labelKey: "landingPitWorkConstantly",
      consequenceKey: "landingPitWorkConsequence"
    },
    { 
      id: "disconnect", 
      labelKey: "landingPitDisconnected",
      consequenceKey: "landingPitDisconnectedConsequence"
    },
    { 
      id: "body", 
      labelKey: "landingPitBodySuffering",
      consequenceKey: "landingPitBodyConsequence"
    },
    { 
      id: "numb", 
      labelKey: "landingPitNumb",
      consequenceKey: "landingPitNumbConsequence"
    },
    { 
      id: "deserve", 
      labelKey: "landingPitDeserve",
      consequenceKey: "landingPitDeserveConsequence"
    },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {t('landingPitTitle')}
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          {t('landingPitSubtitle')}
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 md:p-12 max-w-3xl mx-auto">
        <div className="space-y-6 mb-8">
          {pitItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => {
                  setCheckedItems(prev => ({
                    ...prev,
                    [item.id]: checked === true
                  }));
                }}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className="cursor-pointer flex-1"
              >
                <div className="text-lg text-slate-900 font-medium mb-1">
                  {t(item.labelKey)}
                </div>
                {checkedItems[item.id] && (
                  <div className="text-sm text-red-600 font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                    {t(item.consequenceKey)}
                  </div>
                )}
              </label>
            </div>
          ))}
        </div>

        {checkedCount >= 2 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-lg text-slate-900 font-bold mb-2">
              {t('landingPitChecked').replace('{count}', String(checkedCount))}
            </p>
            <p className="text-base text-slate-600">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingPitGoodNews')
                  .replace(/<span>/g, '<span class="text-primary font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>
          </div>
        )}

        {checkedCount > 0 && checkedCount < 2 && (
          <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-r-lg">
            <p className="text-base text-slate-600">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingPitCloseToEdge')
                  .replace(/<span>/g, '<span class="text-slate-900 font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>
          </div>
        )}

        {checkedCount === 0 && (
          <div className="bg-green-50 border-l-4 border-accent p-6 rounded-r-lg">
            <p className="text-base text-slate-600">
              <span dangerouslySetInnerHTML={{ 
                __html: t('landingPitExcellent')
                  .replace(/<span>/g, '<span class="text-slate-900 font-bold">')
                  .replace(/<\/span>/g, '</span>')
              }} />
            </p>
          </div>
        )}
      </Card>
    </section>
  );
};