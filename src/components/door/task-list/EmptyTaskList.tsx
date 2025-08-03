
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface EmptyTaskListProps {
  activeList: 'hit' | 'do';
  isMobile?: boolean;
}

export const EmptyTaskList: React.FC<EmptyTaskListProps> = ({
  activeList,
  isMobile = false
}) => {
  const { language, t } = useLanguage();

  return (
    <div className={`text-center text-gray-500 ${isMobile ? 'py-6' : 'py-4'}`}>
      <p className={`${isMobile ? 'text-sm' : ''}`}>
        {activeList === 'hit' 
          ? t('noTasksForDay')
          : (language === 'en' ? 'No DO items for this day' : 'Nu există elemente DO pentru această zi')
        }
      </p>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
        {t('dragItemsHere')}
      </p>
    </div>
  );
};
