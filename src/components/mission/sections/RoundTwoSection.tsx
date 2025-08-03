
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { useCategoryLabel } from '../utils/categoryUtils';

interface RoundTwoSectionProps {
  category: MissionCategory;
  obstacles: string;
  opportunities: string;
  talents: string;
  onObstaclesChange: (value: string) => void;
  onOpportunitiesChange: (value: string) => void;
  onTalentsChange: (value: string) => void;
  isImpossibleGame?: boolean;
}

export const RoundTwoSection: React.FC<RoundTwoSectionProps> = ({
  category,
  obstacles,
  opportunities,
  talents,
  onObstaclesChange,
  onOpportunitiesChange,
  onTalentsChange,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel(category);
  
  return (
    <div className="border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'en' ? 'ROUND #2 QUESTIONS...' : 'RUNDA #2 ÎNTREBĂRI...'}
      </h3>
      
      <p className="mb-4">
        {language === 'en' 
          ? `Now with the answers to the first round, it is time to go deeper and get even more specific about the GAP and the FRAME that sits between you and the measurable Impossible Freedom you are committed to hunting down In ${categoryLabel}.`
          : `Acum, cu răspunsurile la prima rundă, este timpul să mergem mai adânc și să devenim și mai specifici despre GOLUL și CADRUL care se află între tine și Libertatea Imposibilă măsurabilă pe care ești hotărât să o vânezi în ${categoryLabel}.`}
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What are the OBSTACLES you can see already in the way of obtaining your Impossible Freedom in ${categoryLabel}?`
              : `Care sunt OBSTACOLELE pe care le poți vedea deja în calea obținerii Libertății tale Imposibile în ${categoryLabel}?`}
          </label>
          <Textarea
            value={obstacles}
            onChange={(e) => onObstaclesChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What OPPORTUNITIES can you see before you that you must capitalize on to obtain your Impossible Freedom in ${categoryLabel}?`
              : `Ce OPORTUNITĂȚI poți vedea în fața ta pe care trebuie să le valorifici pentru a obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={opportunities}
            onChange={(e) => onOpportunitiesChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What TALENTS, ABILITIES, and STRENGTHS can you count on to obtain your Impossible Freedom in ${categoryLabel}?`
              : `Pe ce TALENTE, ABILITĂȚI și PUNCTE FORTE te poți baza pentru a obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={talents}
            onChange={(e) => onTalentsChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};
