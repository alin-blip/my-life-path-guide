
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
    <div className={`flex justify-between ${isMobile ? 'mb-4 overflow-x-auto pb-2' : 'mb-6'}`}>
      <div className={`flex ${isMobile ? 'space-x-1 min-w-max' : 'space-x-2'}`}>
        {daysOfWeek.map(day => (
          <Button
            key={day}
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            className={`${isMobile ? 'px-1 py-1 text-xs min-w-[36px]' : 'px-3 py-2 text-sm'} ${
              activeDay === day 
                ? 'bg-blue-500 text-white' 
                : day === todayAbbr 
                  ? 'bg-blue-500 bg-opacity-30 text-blue-300' 
                  : 'text-gray-400'
            }`}
            onClick={() => selectDayOfWeek(day)}
          >
            <span className="block">
              {dayTranslations[day]}
            </span>
            {day === todayAbbr && (
              <span className={`block ${isMobile ? 'text-xs' : 'text-xs'} opacity-75`}>
                {t('todayLabel')}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
