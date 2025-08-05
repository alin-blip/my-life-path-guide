
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Info } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { DoorDiagnostics } from './DoorDiagnostics';

interface DoorHeaderProps {
  currentDateRange: string;
  currentDate?: Date;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  isMobile?: boolean;
}

export const DoorHeader: React.FC<DoorHeaderProps> = ({
  currentDateRange,
  currentDate = new Date(),
  handlePreviousWeek,
  handleNextWeek,
  isMobile = false
}) => {
  const { language, t } = useLanguage();
  const fullDate = format(currentDate, 'MMMM do yyyy');
  const weekNumber = format(currentDate, "'Week' w, yyyy");
  const today = format(new Date(), 'EEEE');

  // Check if current week contains today
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // Friday
  
  const todayDate = new Date();
  const isCurrentWeek = todayDate >= weekStart && todayDate <= weekEnd;
  
  // Get week status
  const getWeekStatus = () => {
    if (isCurrentWeek) return { text: 'Săptămâna curentă', color: 'text-green-400' };
    if (todayDate > weekEnd) return { text: 'Săptămână trecută', color: 'text-yellow-400' };
    return { text: 'Săptămână viitoare', color: 'text-blue-400' };
  };

  const weekStatus = getWeekStatus();

  return (
    <>
      <header className={`flex justify-between items-center ${isMobile ? 'mb-3 flex-col space-y-2 px-1' : 'mb-6'}`}>
        <div className={`flex items-center ${isMobile ? 'w-full justify-between' : 'space-x-4'}`}>
          <Button variant="outline" size={isMobile ? "sm" : "sm"} asChild className={isMobile ? 'mr-1 px-2 py-1 text-xs' : 'mr-2'}>
            <Link to="/dashboard">
              <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {isMobile ? 'Back' : t('backToDashboard')}
            </Link>
          </Button>
          <h1 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold tracking-widest text-center`}>
            REFUGIUL TĂU
          </h1>
          <Calendar className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'} text-blue-500`} />
        </div>
        <div className={`flex items-center ${isMobile ? 'w-full justify-between text-xs' : 'space-x-4'}`}>
          <div className="flex items-center space-x-1">
            <DoorDiagnostics />
            <Info 
              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 cursor-pointer`} 
              aria-label={t('autoSaveInfo')}
            />
            <span className={`text-gray-300 ${isMobile ? 'text-xs' : ''}`}>
              {isMobile ? format(new Date(), 'EEE') : `${t('today')}: ${today}`}
            </span>
          </div>
          <div className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} rounded-full bg-blue-500 flex items-center justify-center`}>
            <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>JD</span>
          </div>
        </div>
      </header>

      <div className={`flex justify-center items-center mb-6 space-x-4 ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <Button 
          variant="ghost" 
          className="text-gray-400 p-2"
          onClick={handlePreviousWeek}
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </Button>
        
        <div className="flex flex-col items-center">
          <span className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-lg'} text-center`}>
            {currentDateRange}
          </span>
          <div className="flex items-center space-x-2">
            <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              {t('weekLabel')} {weekNumber.split(' ')[1]}
            </span>
            <span className={`${isMobile ? 'text-xs' : 'text-xs'} ${weekStatus.color} font-medium`}>
              • {weekStatus.text}
            </span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-gray-400 p-2"
          onClick={handleNextWeek}
          size={isMobile ? "sm" : "default"}
        >
          <ArrowRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </Button>
      </div>

      {/* Quick navigation buttons */}
      <div className={`flex justify-center items-center mb-6 space-x-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        {!isCurrentWeek && (
          <div className="flex flex-col items-center space-y-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              todayDate > weekEnd 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              ⚠️ Vizualizezi o {todayDate > weekEnd ? 'săptămână trecută' : 'săptămână viitoare'}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Navigate to current week - this should be replaced with proper navigation
                window.location.reload();
              }}
              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
            >
              🏠 Înapoi la săptămâna curentă
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
