
import React from 'react';
import { Button } from '@/components/ui/button';
import { DayOfWeek } from '@/types/door';
import { useLanguage } from '@/context/LanguageContext';

interface DayNavigationProps {
  activeDay: DayOfWeek;
  selectDayOfWeek: (day: DayOfWeek) => void;
  isMobile?: boolean;
}

export const DayNavigation: React.FC<DayNavigationProps> = ({
  activeDay,
  selectDayOfWeek,
  isMobile = false
}) => {
  const { language, t } = useLanguage();
  
  const daysOfWeek: DayOfWeek[] = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  const dayTranslations = {
    'M': language === 'en' ? t('mondayShort') : t('mondayShort'),
    'T': language === 'en' ? t('tuesdayShort') : t('tuesdayShort'), 
    'W': language === 'en' ? t('wednesdayShort') : t('wednesdayShort'),
    'Th': language === 'en' ? t('thursdayShort') : t('thursdayShort'),
    'F': language === 'en' ? t('fridayShort') : t('fridayShort'),
    'Sa': language === 'en' ? t('saturdayShort') : t('saturdayShort'),
    'Su': language === 'en' ? t('sundayShort') : t('sundayShort')
  };
  
  const getCurrentDayAbbr = (): DayOfWeek => {
    const dayOfWeek = new Date().getDay();
    const dayMap: {[key: number]: DayOfWeek} = {
      0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa'
    };
    return dayMap[dayOfWeek] || 'M';
  };
  
  const todayAbbr = getCurrentDayAbbr();

  return (
    <div className={`flex justify-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
      <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-1'} bg-gray-100 rounded-md p-1`}>
        {daysOfWeek.map(day => (
          <button
            key={day}
            className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded transition-colors ${
              activeDay === day 
                ? 'bg-white text-gray-900 shadow-sm' 
                : day === todayAbbr 
                  ? 'text-blue-600 hover:bg-white/50'
                  : 'text-gray-600 hover:bg-white/50'
            }`}
            onClick={() => selectDayOfWeek(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};
