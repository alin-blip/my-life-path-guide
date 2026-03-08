import React from 'react';
import { Check } from 'lucide-react';

interface ValueStackProps {
  language: 'ro' | 'en';
}

const items = {
  ro: [
    { name: 'Audiobook complet (2+ ore, vocea autorului)', value: '149 lei' },
    { name: 'Challenge 90 de Zile (ghid de implementare)', value: '249 lei' },
    { name: 'Template-uri și Worksheet-uri printabile', value: '99 lei' },
    { name: 'Acces Comunitate Privată (30 zile)', value: '97 lei' },
  ],
  en: [
    { name: 'Complete Audiobook (1h 20min, professional narration)', value: '$39' },
    { name: '90-Day Challenge (implementation guide)', value: '$59' },
    { name: 'Printable Templates & Worksheets', value: '$29' },
    { name: 'Private Community Access (30 days)', value: '$19' },
  ],
};

export const ValueStack: React.FC<ValueStackProps> = ({ language }) => {
  const t = language === 'ro'
    ? { title: 'Tot ce primești:', total: 'VALOARE TOTALĂ', price: 'Prețul tău astăzi:', save: 'Economisești 495 lei. Ofertă disponibilă DOAR acum, pe această pagină.' }
    : { title: 'Everything you get:', total: 'TOTAL VALUE', price: 'Your price today:', save: 'You save $117. Offer available ONLY now, on this page.' };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-white mb-6 text-center">{t.title}</h3>
      
      <div className="space-y-3 mb-6">
        {items[language].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-white/80 text-sm">{item.name}</span>
            </div>
            <span className="text-white/50 text-sm line-through">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-3 border-b-2 border-amber-400/50 mb-8">
        <span className="text-amber-400 font-bold uppercase tracking-wider text-sm">{t.total}</span>
        <span className="text-white/50 line-through font-bold">{language === 'ro' ? '594 lei' : '$146'}</span>
      </div>

      <div className="text-center mb-4">
        <p className="text-white/60 text-sm mb-2">{t.price}</p>
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-white/40 line-through text-2xl">{language === 'ro' ? '594 lei' : '$146'}</span>
          <span className="text-5xl font-bold text-amber-400">{language === 'ro' ? '99 lei' : '$29'}</span>
        </div>
      </div>

      <p className="text-center text-white/40 text-xs">{t.save}</p>
    </div>
  );
};
