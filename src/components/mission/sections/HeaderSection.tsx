
import React from 'react';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { useCategoryLabel, getCategoryName } from '../utils/categoryUtils';

interface HeaderSectionProps {
  category: MissionCategory;
  onBack: () => void;
  onNext: () => void;
  isImpossibleGame?: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  category,
  onBack,
  onNext,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel(category);
  const categoryName = getCategoryName(category, language);
  
  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800/50">
        <ChevronLeft className="mr-2 h-4 w-4" />
        {language === 'en' ? 'PREVIOUS' : 'ANTERIOR'}
      </Button>
      <h2 className="text-xl font-medium uppercase">
        {isImpossibleGame
          ? (language === 'en' ? `${categoryName} IMPOSSIBLE GAME QUESTIONS` : `ÎNTREBĂRI PENTRU JOCUL IMPOSIBIL ${categoryName}`)
          : (language === 'en' ? `${categoryName} MISSION QUESTIONS` : `ÎNTREBĂRI PENTRU MISIUNEA ${categoryName}`)
        }
      </h2>
      <Button 
        className="px-8 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 flex items-center" 
        onClick={onNext}
      >
        {language === 'en' ? 'NEXT' : 'URMĂTORUL'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
