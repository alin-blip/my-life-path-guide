
import React from 'react';
import { MissionCategory } from '@/types/mission';
import { useLanguage } from '@/context/LanguageContext';
import { useCategoryLabel, getCategoryName } from '../utils/categoryUtils';

interface IntroductionSectionProps {
  category: MissionCategory;
  isImpossibleGame?: boolean;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({ 
  category,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel(category);
  const categoryName = getCategoryName(category, language);

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-300">
        {isImpossibleGame 
          ? (language === 'en' 
            ? `Complete these questions to define your Impossible Game for the ${categoryName} category.` 
            : `Completează aceste întrebări pentru a-ți defini Jocul Imposibil pentru categoria ${categoryName}.`)
          : (language === 'en' 
            ? `Complete these questions to create your Monthly Mission for the ${categoryName} category.` 
            : `Completează aceste întrebări pentru a-ți crea Misiunea Lunară pentru categoria ${categoryName}.`)
        }
      </p>
      <p className="text-center text-gray-300">
        {isImpossibleGame
          ? (language === 'en' 
            ? "Your answers will guide the development of an impossible but achievable long-term goal." 
            : "Răspunsurile tale vor ghida dezvoltarea unui obiectiv imposibil dar realizabil pe termen lung.")
          : (language === 'en' 
            ? "Your answers will guide the development of your monthly plan." 
            : "Răspunsurile tale vor ghida dezvoltarea planului tău lunar.")
        }
      </p>
    </div>
  );
};
