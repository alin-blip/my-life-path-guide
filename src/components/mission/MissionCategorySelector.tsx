
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
          ? (language === 'en' ? 'Select Your Divine Awakening Focus' : 'Selectează Focusul Trezirii Divine') 
          : (language === 'en' ? 'Choose Your Sacred Circle' : 'Alege Cercul Tău Sacru')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          className="flex flex-col items-center justify-center bg-gradient-to-br from-feminine-primary/40 to-feminine-rose/40 hover:from-feminine-primary/60 hover:to-feminine-rose/60 p-8 rounded-lg border border-feminine-primary/30"
          onClick={() => handleCategorySelect('body')}
        >
          <div className="text-3xl mb-2">🌺</div>
          <div className="font-bold text-xl">{language === 'en' ? 'SACRED VESSEL' : 'VAS SACRU'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Sacred Body & Divine Energy' : 'Corp Sacru și Energie Divină'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-gradient-to-br from-feminine-purple/40 to-purple-700/40 hover:from-feminine-purple/60 hover:to-purple-700/60 p-8 rounded-lg border border-feminine-purple/30"
          onClick={() => handleCategorySelect('being')}
        >
          <div className="text-3xl mb-2">🧘‍♀️</div>
          <div className="font-bold text-xl">{language === 'en' ? 'DIVINE CONNECTION' : 'CONEXIUNE DIVINĂ'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Inner Goddess & Spiritual Awakening' : 'Zeița Interioară și Trezirea Spirituală'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-gradient-to-br from-pink-600/40 to-feminine-primary/40 hover:from-pink-600/60 hover:to-feminine-primary/60 p-8 rounded-lg border border-pink-500/30"
          onClick={() => handleCategorySelect('balance')}
        >
          <div className="text-3xl mb-2">💖</div>
          <div className="font-bold text-xl">{language === 'en' ? 'SACRED RELATIONSHIPS' : 'RELAȚII SACRE'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Divine Love & Sacred Sisterhood' : 'Iubire Divină și Cercul Surorilor'}
          </div>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-600/40 to-orange-600/40 hover:from-yellow-600/60 hover:to-orange-600/60 p-8 rounded-lg border border-yellow-500/30"
          onClick={() => handleCategorySelect('business')}
        >
          <div className="text-3xl mb-2">👑</div>
          <div className="font-bold text-xl">{language === 'en' ? "QUEEN'S EMPIRE" : 'IMPERIUL REGINEI'}</div>
          <div className="text-sm mt-2 text-gray-300">
            {language === 'en' ? 'Feminine Leadership & Abundant Queendom' : 'Leadership Feminin și Împărăție Abundentă'}
          </div>
        </Button>
      </div>
    </div>
  );
};
