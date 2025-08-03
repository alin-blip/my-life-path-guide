
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { useCategoryLabel } from '../utils/categoryUtils';

interface RoundOneSectionProps {
  category: MissionCategory;
  impossibleFruits: string[];
  stopDoing: string;
  sustainDoing: string;
  startDoing: string;
  onFruitChange: (index: number, value: string) => void;
  onStopDoingChange: (value: string) => void;
  onSustainDoingChange: (value: string) => void;
  onStartDoingChange: (value: string) => void;
  isImpossibleGame?: boolean;
}

export const RoundOneSection: React.FC<RoundOneSectionProps> = ({
  category,
  impossibleFruits,
  stopDoing,
  sustainDoing,
  startDoing,
  onFruitChange,
  onStopDoingChange,
  onSustainDoingChange,
  onStartDoingChange,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel(category);
  
  return (
    <div className="border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'en' ? 'ROUND #1 QUESTIONS...' : 'RUNDA #1 ÎNTREBĂRI...'}
      </h3>
      
      <p className="mb-4">
        {language === 'en' 
          ? 'Before you can even dive into the GAP details between where you are and where you desire to go, let\'s knock out a few easy questions to get you started.'
          : 'Înainte de a putea intra în detaliile GOLULUI dintre locul în care te afli și locul în care dorești să ajungi, să rezolvăm câteva întrebări simple pentru a începe.'}
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">
            {language === 'en' 
              ? `What are your measurable Impossible Freedom Targets in ${categoryLabel}?`
              : `Care sunt Țintele tale măsurabile de Libertate Imposibilă în ${categoryLabel}?`}
          </h4>
          
          {[1, 2, 3, 4].map((num, index) => (
            <div key={`fruit-${num}`} className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">
                {language === 'en' ? `Impossible Fruit #${num}:` : `Fruct Imposibil #${num}:`}
              </label>
              <Textarea
                value={impossibleFruits[index]}
                onChange={(e) => onFruitChange(index, e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          ))}
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What do you believe you must STOP DOING in ${categoryLabel} moving forward and why?`
              : `Ce crezi că trebuie să ÎNCETEZI SĂ MAI FACI în ${categoryLabel} de acum înainte și de ce?`}
          </label>
          <Textarea
            value={stopDoing}
            onChange={(e) => onStopDoingChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What do you believe you must SUSTAIN DOING in ${categoryLabel} moving forward and why?`
              : `Ce crezi că trebuie să CONTINUI SĂ FACI în ${categoryLabel} de acum înainte și de ce?`}
          </label>
          <Textarea
            value={sustainDoing}
            onChange={(e) => onSustainDoingChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What do you believe you must START DOING in ${categoryLabel} moving forward and why?`
              : `Ce crezi că trebuie să ÎNCEPI SĂ FACI în ${categoryLabel} de acum înainte și de ce?`}
          </label>
          <Textarea
            value={startDoing}
            onChange={(e) => onStartDoingChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};
