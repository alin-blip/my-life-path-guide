
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TaskListHeaderProps {
  activeList: 'hit' | 'do';
  setActiveList: (list: 'hit' | 'do') => void;
  hitStats: string;
  doStats: string;
  isMobile?: boolean;
}

export const TaskListHeader: React.FC<TaskListHeaderProps> = ({
  activeList,
  setActiveList,
  hitStats,
  doStats,
  isMobile = false
}) => {
  const { t } = useLanguage();

  return (
    <>
      <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-lg'} font-semibold tracking-wider`}>
          {t('tasks')}
        </h2>
        <div className="flex items-center">
          <Info className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`} />
        </div>
      </div>
      
      <div className={`flex justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className="flex bg-[#232B3C] rounded-md">
          <Button
            variant="ghost"
            className={`${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
              activeList === 'hit' ? 'bg-blue-500 text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveList('hit')}
          >
            HIT {hitStats}
          </Button>
          <Button
            variant="ghost"
            className={`${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
              activeList === 'do' ? 'bg-blue-500 text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveList('do')}
          >
            DO {doStats}
          </Button>
        </div>
      </div>
    </>
  );
};
