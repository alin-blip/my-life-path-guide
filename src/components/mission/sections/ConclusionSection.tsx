
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';

interface ConclusionSectionProps {
  finalThoughts: string;
  primaryLessons: string;
  onFinalThoughtsChange: (value: string) => void;
  onPrimaryLessonsChange: (value: string) => void;
  isImpossibleGame?: boolean;
}

export const ConclusionSection: React.FC<ConclusionSectionProps> = ({
  finalThoughts,
  primaryLessons,
  onFinalThoughtsChange,
  onPrimaryLessonsChange,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  
  return (
    <div className="border-t border-gray-700 pt-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {language === 'en' ? 'REVELATION' : 'REVELAȚIE'}
        </h3>
        <label className="block text-sm text-gray-300 mb-1">
          {language === 'en' 
            ? `What are your FINAL THOUGHTS, INSIGHTS, or REVELATIONS as you complete this domain ${isImpossibleGame ? 'IMPOSSIBLE GAME' : 'MONTHLY MISSION'} MAP?`
            : `Care sunt GÂNDURILE, PERSPECTIVELE sau REVELAȚIILE tale FINALE pe măsură ce completezi această HARTĂ A ${isImpossibleGame ? 'JOCULUI IMPOSIBIL' : 'MISIUNII LUNARE'} pentru acest domeniu?`}
        </label>
        <Textarea
          value={finalThoughts}
          onChange={(e) => onFinalThoughtsChange(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {language === 'en' ? 'LESSONS' : 'LECȚII'}
        </h3>
        <label className="block text-sm text-gray-300 mb-1">
          {language === 'en' 
            ? `What are the primary LESSONS on life you uncovered by completing this ${isImpossibleGame ? 'IMPOSSIBLE GAME' : 'MONTHLY MISSION'} MAP?`
            : `Care sunt LECȚIILE principale despre viață pe care le-ai descoperit completând această HARTĂ A ${isImpossibleGame ? 'JOCULUI IMPOSIBIL' : 'MISIUNII LUNARE'}?`}
        </label>
        <Textarea
          value={primaryLessons}
          onChange={(e) => onPrimaryLessonsChange(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>
    </div>
  );
};
