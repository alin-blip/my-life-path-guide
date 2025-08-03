
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MissionCategory } from '@/types/mission';
import { useLanguage } from '@/context/LanguageContext';

interface MissionCategorySelectorProps {
  onSelect?: (category: MissionCategory) => void;
  isImpossibleGame?: boolean;
}

export const MissionCategorySelector: React.FC<MissionCategorySelectorProps> = ({
  onSelect,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const handleCategorySelect = (category: MissionCategory) => {
    if (onSelect) {
      onSelect(category);
    } else {
      navigate(`/fact-maps/monthly-mission?category=${category}${isImpossibleGame ? '&isImpossible=true' : ''}`);
    }
  };
  
  return (
    <div className="text-white">
      <h3 className="text-xl font-bold mb-6 text-center">
        {isImpossibleGame 
          ? (language === 'en' ? 'Select Impossible Game Category' : 'Selectează Categoria Jocului Imposibil') 
          : (language === 'en' ? 'Select Mission Category' : 'Selectează Categoria Misiunii')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          className="flex flex-col items-center justify-center bg-blue-900/50 hover:bg-blue-900/70 p-8 rounded-lg"
          onClick={() => handleCategorySelect('body')}
        >
          <div className="text-2xl mb-2">🏋️</div>
          <div className="font-bold text-xl">{language === 'en' ? 'BODY' : 'CORP'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Physical Health & Fitness' : 'Sănătate Fizică și Fitness'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-blue-900/50 hover:bg-blue-900/70 p-8 rounded-lg"
          onClick={() => handleCategorySelect('being')}
        >
          <div className="text-2xl mb-2">🧠</div>
          <div className="font-bold text-xl">{language === 'en' ? 'BEING' : 'FIINȚĂ'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Mental & Spiritual Growth' : 'Creștere Mentală și Spirituală'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-blue-900/50 hover:bg-blue-900/70 p-8 rounded-lg"
          onClick={() => handleCategorySelect('balance')}
        >
          <div className="text-2xl mb-2">❤️</div>
          <div className="font-bold text-xl">{language === 'en' ? 'BALANCE' : 'ECHILIBRU'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Relationships & Connections' : 'Relații și Conexiuni'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-blue-900/50 hover:bg-blue-900/70 p-8 rounded-lg"
          onClick={() => handleCategorySelect('business')}
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-bold text-xl">{language === 'en' ? 'BUSINESS' : 'AFACERE'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Career & Financial Growth' : 'Creștere Profesională și Financiară'}
          </div>
        </Button>
      </div>
    </div>
  );
};
