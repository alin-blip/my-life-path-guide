
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
    if (isCurrentWeek) return { text: t('currentWeek'), color: 'text-green-400' };
    if (todayDate > weekEnd) return { text: t('pastWeek'), color: 'text-yellow-400' };
    return { text: t('futureWeek'), color: 'text-blue-400' };
  };

  const weekStatus = getWeekStatus();

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <header className={`bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-lg p-4 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'}`}>
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                {isMobile ? 'Back' : t('backToDashboard')}
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400`}>
                {t('commandCenter')}
              </h1>
            </div>
          </div>
          
          {/* Right section */}
          <div className="flex items-center space-x-3">
            <DoorDiagnostics />
            <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''} px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20`}>
              {isMobile ? format(new Date(), 'EEE') : `${t('today')}: ${today}`}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Week Navigation */}
      <div className="bg-[#1E293B] rounded-lg p-4 border border-blue-500/20">
        <div className="flex justify-center items-center space-x-6">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-3 rounded-full transition-all"
            onClick={handlePreviousWeek}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex flex-col items-center space-y-1 min-w-[200px]">
            <span className={`text-white ${isMobile ? 'text-base' : 'text-lg'} font-semibold text-center`}>
              {currentDateRange}
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                {t('weekLabel')} {weekNumber.split(' ')[1]}
              </span>
              <span className={`text-xs ${weekStatus.color} font-medium px-2 py-1 rounded ${
                weekStatus.color === 'text-green-400' ? 'bg-green-500/10' :
                weekStatus.color === 'text-yellow-400' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
              }`}>
                • {weekStatus.text}
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 p-3 rounded-full transition-all"
            onClick={handleNextWeek}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Current Week Navigation */}
        {!isCurrentWeek && (
          <div className="flex justify-center mt-4 pt-4 border-t border-gray-600/20">
            <div className="flex flex-col items-center space-y-2">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                todayDate > weekEnd 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {todayDate > weekEnd ? t('viewingPastWeek') : t('viewingFutureWeek')}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="text-blue-400 border-blue-400/50 hover:bg-blue-400 hover:text-white transition-all"
              >
                {t('backToCurrentWeek')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
