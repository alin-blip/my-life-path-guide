
import React, { useEffect } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Video, Text, AudioLines, Image as ImageIcon,
  Podcast, MonitorPlay, ChevronLeft, ChevronRight,
  ArrowLeft, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { WeeklyProgress } from './WeeklyProgress';

type DayOfWeek = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

interface DailyActivity {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface WeeklyActivity {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export const DailyFourContent: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { 
    selectedDay, 
    setSelectedDay, 
    dailyFourData, 
    updateDailyActivity, 
    updateWeeklyActivity,
    getDailyFourScore,
    getWeeklyTwoScore 
  } = useProgress();
  
  const dailyActivities: DailyActivity[] = [
    { id: 'video', title: 'VIDEO', icon: <Video className="h-6 w-6" /> },
    { id: 'text', title: 'TEXT', icon: <Text className="h-6 w-6" /> },
    { id: 'audio', title: 'AUDIO', icon: <AudioLines className="h-6 w-6" /> },
    { id: 'image', title: 'IMAGE', icon: <ImageIcon className="h-6 w-6" /> },
  ];
  
  const weeklyActivities: WeeklyActivity[] = [
    { id: 'podcast', title: 'PODCAST', icon: <Podcast className="h-6 w-6" /> },
    { id: 'webinar', title: 'WEBINAR', icon: <MonitorPlay className="h-6 w-6" /> },
  ];
  
  const days: DayOfWeek[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  useEffect(() => {
    // Check if there's a stored date from Game navigation
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    
    if (lastActiveDate) {
      // Use the stored date
      const storedDate = new Date(lastActiveDate);
      const dayOfWeek = storedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const dayMap: {[key: number]: DayOfWeek} = {
        0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa'
      };
      setSelectedDay(dayMap[dayOfWeek]);
      
      // Clear the stored date after using it
      localStorage.removeItem('lastActiveDate');
    }
  }, [setSelectedDay]);
  
  const getCompletedDailyActivities = () => {
    return dailyActivities.filter(
      activity => dailyFourData[selectedDay]?.dailyActivities?.find(a => a.id === activity.id)?.completed
    ).length;
  };
  
  const getCompletedWeeklyActivities = () => {
    return weeklyActivities.filter(
      activity => dailyFourData[selectedDay]?.weeklyActivities?.find(a => a.id === activity.id)?.completed
    ).length;
  };
  
  const toggleDailyActivity = (id: string) => {
    const activity = dailyFourData[selectedDay]?.dailyActivities?.find(a => a.id === id);
    const isCompleted = activity?.completed || false;
    
    updateDailyActivity(selectedDay, id, !isCompleted);
    
    toast({
      title: !isCompleted 
        ? t('activityCompleted').replace('{activity}', id.toUpperCase()) 
        : t('activityIncomplete').replace('{activity}', id.toUpperCase()),
      description: !isCompleted ? t('greatJob') : t('progressUpdated'),
    });
  };
  
  const toggleWeeklyActivity = (id: string) => {
    const activity = dailyFourData[selectedDay]?.weeklyActivities?.find(a => a.id === id);
    const isCompleted = activity?.completed || false;
    
    updateWeeklyActivity(selectedDay, id, !isCompleted);
    
    toast({
      title: !isCompleted 
        ? t('activityCompleted').replace('{activity}', id.toUpperCase()) 
        : t('activityIncomplete').replace('{activity}', id.toUpperCase()),
      description: !isCompleted ? t('greatJob') : t('progressUpdated'),
    });
  };
  
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };
  
  const dailyFourScore = getDailyFourScore();
  const weeklyTwoScore = getWeeklyTwoScore();
  const totalScore = dailyFourScore + weeklyTwoScore;
  
  // Calculate the percentage completed for progress circles
  const dailyPercentage = getCompletedDailyActivities() / dailyActivities.length * 100;
  const weeklyPercentage = getCompletedWeeklyActivities() / weeklyActivities.length * 100;
  
  return (
    <div className="w-full max-w-full px-2 sm:px-4 md:px-6 min-h-screen rounded-lg py-4 sm:py-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-1 text-xs sm:text-sm"
            onClick={handleNavigateToDashboard}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            {t('dashboard')}
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold uppercase">{t('dailyFour')}</h1>
        </div>
        <Button 
          className="bg-warrior-accent hover:bg-warrior-accent/90 text-white text-xs sm:text-sm px-2 sm:px-4"
          onClick={handleNavigateToDashboard}
        >
          {t('dashboard')}
        </Button>
      </div>
      
      <WeeklyProgress 
        title={t('thisWeek')} 
        currentProgress={totalScore} 
        maxPoints={28}
      />
      
      <div className="my-6">
        <div className="flex items-center space-x-1 justify-center">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-1">
            {days.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "ghost"}
                className={`rounded-full w-10 h-10 p-0 ${
                  selectedDay === day 
                  ? "bg-warrior-accent text-white" 
                  : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
          
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
        <div>
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 p-3 sm:p-4 md:p-6 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">
                {t('dailyFour')}
              </h2>
              <div className="text-xs sm:text-sm text-purple-300">
                {getCompletedDailyActivities()}/{dailyActivities.length}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {dailyActivities.map(activity => {
                const isCompleted = dailyFourData[selectedDay]?.dailyActivities?.find(a => a.id === activity.id)?.completed || false;
                
                return (
                  <Card 
                    key={activity.id} 
                    className={`
                      ${isCompleted ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-[#1A1F2C] hover:bg-[#272e3e]'} 
                      border ${isCompleted ? 'border-purple-400/50' : 'border-purple-900/50'} 
                      shadow-md p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center cursor-pointer
                      transition-all duration-200 hover:shadow-purple-500/10
                    `}
                    onClick={() => toggleDailyActivity(activity.id)}
                  >
                    <div className="relative mb-2 sm:mb-3">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 block">
                        {React.cloneElement(activity.icon as React.ReactElement, { 
                          className: "w-full h-full" 
                        })}
                      </span>
                      {isCompleted && (
                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-white font-medium text-xs sm:text-sm">{activity.title}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gradient-to-r from-pink-900/50 to-pink-800/30 p-3 sm:p-4 md:p-6 rounded-lg backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300">
                {t('weeklyTwo')}
              </h2>
              <div className="text-xs sm:text-sm text-pink-300">
                {getCompletedWeeklyActivities()}/{weeklyActivities.length}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {weeklyActivities.map(activity => {
                const isCompleted = dailyFourData[selectedDay]?.weeklyActivities?.find(a => a.id === activity.id)?.completed || false;
                
                return (
                  <Card 
                    key={activity.id} 
                    className={`
                      ${isCompleted ? 'bg-gradient-to-br from-pink-600 to-pink-800' : 'bg-[#1A1F2C] hover:bg-[#272e3e]'} 
                      border ${isCompleted ? 'border-pink-400/50' : 'border-pink-900/50'} 
                      shadow-md p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center cursor-pointer
                      transition-all duration-200 hover:shadow-pink-500/10
                    `}
                    onClick={() => toggleWeeklyActivity(activity.id)}
                  >
                    <div className="relative mb-2 sm:mb-3">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 block">
                        {React.cloneElement(activity.icon as React.ReactElement, { 
                          className: "w-full h-full" 
                        })}
                      </span>
                      {isCompleted && (
                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-white font-medium text-xs sm:text-sm">{activity.title}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('explanation')}</h3>
        <p className="text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
          {language === 'en' 
            ? 'Daily Four is a system designed to help you create and share content consistently in four different formats.'
            : 'Daily Four este un sistem conceput pentru a te ajuta să creezi și să împărtășești conținut în mod consecvent în patru formate diferite.'}
        </p>
        <p className="text-gray-300 text-sm sm:text-base">
          {language === 'en'
            ? 'Complete the four daily activities and two weekly activities to maximize your impact and reach your audience through multiple mediums.'
            : 'Completează cele patru activități zilnice și două activități săptămânale pentru a-ți maximiza impactul și a-ți atinge audiența prin multiple mijloace.'}
        </p>
      </div>
    </div>
  );
};
