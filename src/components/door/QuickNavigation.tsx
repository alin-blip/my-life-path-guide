
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Home } from 'lucide-react';
import { format, subDays, getWeek, getYear } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface QuickNavigationProps {
  currentDate: Date;
  onNavigateToYesterday: () => void;
  onNavigateToToday: () => void;
  isMobile?: boolean;
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  currentDate,
  onNavigateToYesterday,
  onNavigateToToday,
  isMobile = false
}) => {
  const { t } = useLanguage();
  
  const today = new Date();
  const yesterday = subDays(today, 1);
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isYesterday = format(currentDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
  
  // Check if yesterday is in a different week
  const todayWeek = `${getYear(today)}-${getWeek(today)}`;
  const yesterdayWeek = `${getYear(yesterday)}-${getWeek(yesterday)}`;
  const currentWeek = `${getYear(currentDate)}-${getWeek(currentDate)}`;
  const isDifferentWeek = yesterdayWeek !== todayWeek;
  
  // Check if we're viewing a different week than current
  const isViewingDifferentWeek = currentWeek !== todayWeek;
  
  if (isToday && !isDifferentWeek) return null; // Don't show if we're already on today
  
  return (
    <div className={`flex flex-col items-center space-y-2 ${isMobile ? 'mb-3' : 'mb-4'}`}>
      {isViewingDifferentWeek && (
        <div className="text-center">
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            currentDate < today 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            📅 Vizualizezi {currentDate < today ? 'o săptămână trecută' : 'o săptămână viitoare'}
          </div>
        </div>
      )}
      
      <div className="flex justify-center space-x-2">
        {isDifferentWeek && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToYesterday}
            className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            Ieri ({format(yesterday, 'dd.MM')})
          </Button>
        )}
        
        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToToday}
            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
          >
            <Home className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            Astăzi ({format(today, 'dd.MM')})
          </Button>
        )}
      </div>
    </div>
  );
};
