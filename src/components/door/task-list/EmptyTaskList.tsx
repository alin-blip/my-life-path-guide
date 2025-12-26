
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
  const { t } = useLanguage();

  return (
    <div className={`text-center text-gray-500 ${isMobile ? 'py-6' : 'py-4'}`}>
      <p className={`${isMobile ? 'text-sm' : ''}`}>
        {activeList === 'hit' 
          ? t('noTasksForDay')
          : t('noDoItemsForDay')
        }
      </p>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
        {t('dragItemsHere')}
      </p>
    </div>
  );
};
