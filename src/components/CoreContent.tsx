import React, { useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Utensils,
  Heart,
  Book,
  Users,
  Compass,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useProgress } from '@/context/ProgressContext';
import { WeeklyProgress } from './WeeklyProgress';

type DayOfWeek = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

interface CoreActivity {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'body' | 'being' | 'balance' | 'business';
}

export const CoreContent: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    selectedDay, 
    setSelectedDay, 
    coreData, 
    updateCoreActivity, 
    getCoreScore,
    getCoreTotalByDay
  } = useProgress();
  
  const baseActivities: CoreActivity[] = [
    { id: 'fitness', name: t('fitness'), icon: <Activity className="h-5 w-5" />, category: 'body' },
    { id: 'fuel', name: t('fuel'), icon: <Utensils className="h-5 w-5" />, category: 'body' },
    { id: 'person1', name: t('person1'), icon: <Users className="h-5 w-5" />, category: 'balance' },
    { id: 'person2', name: t('person2'), icon: <Users className="h-5 w-5" />, category: 'balance' },
    { id: 'meditation', name: t('meditation'), icon: <Heart className="h-5 w-5" />, category: 'being' },
    { id: 'memoirs', name: t('memoirs'), icon: <Book className="h-5 w-5" />, category: 'being' },
    { id: 'discover', name: t('discover'), icon: <Compass className="h-5 w-5" />, category: 'business' },
    { id: 'declare', name: t('declare'), icon: <DollarSign className="h-5 w-5" />, category: 'business' },
  ];
  
  const days: DayOfWeek[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  useEffect(() => {
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    
    if (lastActiveDate) {
      const storedDate = new Date(lastActiveDate);
      const dayOfWeek = storedDate.getDay();
      const dayMap: {[key: number]: DayOfWeek} = {
        0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa'
      };
      setSelectedDay(dayMap[dayOfWeek]);
      
      localStorage.removeItem('lastActiveDate');
    }
  }, []);
  
  const getCompletedCountForSelectedDay = () => {
    return baseActivities.filter(a => coreData[selectedDay]?.[a.id]).length;
  };
  
  const getCompletedByCategory = (category: 'body' | 'being' | 'balance' | 'business') => {
    const activitiesInCategory = baseActivities.filter(a => a.category === category);
    const completedActivities = activitiesInCategory.filter(a => coreData[selectedDay]?.[a.id]);
    return completedActivities.length;
  };
  
  const getCategoryPercentage = (category: 'body' | 'being' | 'balance' | 'business') => {
    const activitiesInCategory = baseActivities.filter(a => a.category === category);
    const completedCount = getCompletedByCategory(category);
    return (completedCount / activitiesInCategory.length) * 100;
  };
  
  const toggleActivity = (id: string) => {
    const isCompleted = !coreData[selectedDay]?.[id];
    updateCoreActivity(selectedDay, id, isCompleted);
    
    const activity = baseActivities.find(a => a.id === id);
    if (activity) {
      toast({
        title: isCompleted 
          ? t('activityCompleted').replace('{activity}', activity.name) 
          : t('activityIncomplete').replace('{activity}', activity.name),
        description: isCompleted 
          ? t('greatJob') 
          : t('progressUpdated'),
      });
    }
  };
  
  const getBodyPose = () => {
    const completedCount = getCompletedCountForSelectedDay();
    
    if (completedCount === 0) return 0;
    if (completedCount === 1) return 1;
    if (completedCount === 2) return 2;
    if (completedCount === 3) return 3;
    if (completedCount === 4) return 4;
    if (completedCount === 5) return 5;
    if (completedCount === 6) return 6;
    if (completedCount === 7) return 7;
    return 8;
  };
  
  const getGlowIntensity = () => {
    const completedCount = getCompletedCountForSelectedDay();
    const percentage = (completedCount / baseActivities.length) * 100;
    return Math.min(percentage + 20, 100);
  };
  
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };
  
  const bodyPose = getBodyPose();
  const glowIntensity = getGlowIntensity();
  const weeklyScore = getCoreScore();
  const totalActivities = baseActivities.length;
  const completedActivities = getCompletedCountForSelectedDay();
  
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
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold uppercase">{t('core')}</h1>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-2 sm:px-4"
          onClick={handleNavigateToDashboard}
        >
          {t('dashboard')}
        </Button>
      </div>
      
      <WeeklyProgress 
        title={t('thisWeek')} 
        currentProgress={weeklyScore} 
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
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
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
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <div className="md:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {[
              { category: 'body', items: baseActivities.filter(a => a.category === 'body') },
              { category: 'being', items: baseActivities.filter(a => a.category === 'being') },
              { category: 'balance', items: baseActivities.filter(a => a.category === 'balance') },
              { category: 'business', items: baseActivities.filter(a => a.category === 'business') }
            ].map((categoryGroup, groupIndex) => (
              <React.Fragment key={categoryGroup.category}>
                {categoryGroup.items.map((activity, activityIndex) => {
                  const isCompleted = coreData[selectedDay]?.[activity.id] || false;
                  return (
                    <Button
                      key={activity.id}
                      className={`h-16 sm:h-20 md:h-24 text-xs sm:text-sm md:text-lg font-bold flex items-center justify-center gap-1 sm:gap-2 ${
                        isCompleted 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                      onClick={() => toggleActivity(activity.id)}
                    >
                      <span className="w-4 h-4 sm:w-5 sm:h-5">{activity.icon}</span>
                      <span className="hidden sm:inline">{activity.name}</span>
                    </Button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-3 flex justify-center items-center">
          <div className="relative">
            <div 
              className="human-body-glow absolute inset-0 rounded-full transition-all duration-500"
              style={{
                background: `radial-gradient(circle, rgba(77, 171, 245, ${glowIntensity / 100}) 0%, transparent 70%)`,
                transform: 'scale(1.5)',
                zIndex: 0
              }}
            ></div>
            
            <div className="relative z-10 w-full flex justify-center items-center">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-full border-2 sm:border-4 border-gray-600"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%' 
                  }}
                ></div>
                
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #4dabf5 0%, #4dabf5 ' + 
                      ((completedActivities / totalActivities) * 100) + '%, transparent ' + 
                      ((completedActivities / totalActivities) * 100) + '%, transparent 100%)',
                    clipPath: 'circle(50% at center)',
                    opacity: 0.5
                  }}
                ></div>
                
                <div className="human-body bg-[#222222] p-2 sm:p-3 md:p-4 rounded-lg">
                  {bodyPose === 0 && (
                    <img 
                      src="/lovable-uploads/5d4df0ba-8e02-4eac-8993-76e703419b48.png" 
                      alt="Human body initial pose" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 1 && (
                    <img 
                      src="/lovable-uploads/a09b8a17-8046-4ed4-9af1-1bc2b170002c.png" 
                      alt="Human body pose 1" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 2 && (
                    <img 
                      src="/lovable-uploads/bcd69726-2bc4-4f9f-bf9e-20c73ceb64ce.png" 
                      alt="Human body pose 2" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 3 && (
                    <img 
                      src="/lovable-uploads/075359e4-f407-471e-9f39-3a53f3bd7793.png" 
                      alt="Human body pose 3" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 4 && (
                    <img 
                      src="/lovable-uploads/3bc032f6-0cc5-427c-b563-11ae4132cf78.png" 
                      alt="Human body pose 4" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 5 && (
                    <img 
                      src="/lovable-uploads/2b0cba15-9d96-460f-8666-82b6b2e83566.png" 
                      alt="Human body pose 5" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose === 6 && (
                    <img 
                      src="/lovable-uploads/7bab07ca-88e3-48e7-b4c0-befaa8178ef7.png" 
                      alt="Human body pose 6" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                  
                  {bodyPose >= 7 && (
                    <img 
                      src="/lovable-uploads/ae7db7c1-bcd9-4b60-a218-392246631e24.png" 
                      alt="Human body final pose" 
                      className="h-48 sm:h-64 md:h-96 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { category: 'body', label: t('body'), color: 'bg-red-500' },
          { category: 'being', label: t('being'), color: 'bg-blue-500' },
          { category: 'balance', label: t('balance'), color: 'bg-green-500' },
          { category: 'business', label: t('business'), color: 'bg-purple-500' }
        ].map(item => {
          const completed = getCompletedByCategory(item.category as 'body' | 'being' | 'balance' | 'business');
          const total = baseActivities.filter(a => a.category === item.category).length;
          const percentage = (completed / total) * 100;
          
          return (
            <Card key={item.category} className="bg-gray-800 border border-gray-700 rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <h3 className="font-semibold text-xs sm:text-sm md:text-base">{item.label}</h3>
                <span className="text-xs sm:text-sm text-gray-400">{completed}/{total}</span>
              </div>
              <div className="h-1 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} transition-all duration-300`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
