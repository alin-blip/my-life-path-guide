import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Book, BookOpen, CheckCircle2, Circle, ListTodo, Dumbbell, Heart, Brain, Briefcase, Video, Text, AudioLines, Image as ImageIcon, ArrowRight, RefreshCw, Compass, DollarSign, Users, Clock, Award, AlertTriangle, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDoorContent } from '@/hooks/useDoorContent';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { LearnDashboard } from './LearnDashboard';
import { WeeklyProgress } from './WeeklyProgress';
import { MonthlyObjectives } from './MonthlyObjectives';
import { useProgress } from '@/context/ProgressContext';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { TaskPriority } from '@/types/door';
import { QuoteDisplay } from './QuoteDisplay';
import { MonthlyMission, MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';

export const Dashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    language,
    t
  } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("goddess-tools");
  const [activeLearnCategory, setActiveLearnCategory] = useState<string | null>(null);
  const [activeLearnSubcategory, setActiveLearnSubcategory] = useState<string>("courses");
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    hitList,
    activeDay,
    toggleHitListItemCompletion
  } = useDoorContent();
  const {
    selectedDay,
    setSelectedDay,
    coreData,
    dailyFourData,
    syncData,
    getCoreScore,
    getDailyFourScore,
    getWeeklyTwoScore,
    updateCoreActivity,
    updateDailyActivity,
    updateWeeklyActivity
  } = useProgress();
  
  const [monthlyMissions, setMonthlyMissions] = useState<MonthlyMission[]>([]);
  const [categoryMissions, setCategoryMissions] = useState<Record<MissionCategory, MonthlyMission | null>>({
    body: null,
    being: null,
    balance: null,
    business: null
  });
  
  const [streaks, setStreaks] = useState({
    stack: 0,
    core: 0,
    dailyFour: 0,
    door: 0
  });
  
  const [totals, setTotals] = useState({
    stack: 0,
    core: 0,
    dailyFour: 0,
    door: 0
  });

  const [showConfetti, setShowConfetti] = useState(false);

  const categoryCounts = {
    body: 12,
    balance: 8,
    being: 15,
    business: 10
  };

  const [userProgressData, setUserProgressData] = useState<any>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);

  useEffect(() => {
    syncData();
    updateStats();
    fetchUserData();
    
    // Listen for daily progress updates
    const handleDailyProgressUpdate = () => {
      updateStats();
      fetchUserData();
    };
    
    window.addEventListener('daily-progress-updated', handleDailyProgressUpdate);
    
    return () => {
      window.removeEventListener('daily-progress-updated', handleDailyProgressUpdate);
    };
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userId = session.user.id;
        
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // TODO: Implement proper user progress tracking with authentication
        // For now, using local storage until authentication is implemented
        const progressKey = `userProgress_${today}`;
        const savedProgress = localStorage.getItem(progressKey);
        const progressData = savedProgress ? JSON.parse(savedProgress) : null;
        setUserProgressData(progressData);
        
        // TODO: Implement proper user statistics tracking
        const statsKey = 'userStatistics';
        const savedStats = localStorage.getItem(statsKey);
        const statsData = savedStats ? JSON.parse(savedStats) : null;
        
        if (statsData) {
        } else {
          console.log('Fetched user statistics:', statsData);
          setUserStatistics(statsData);
          updateStats();
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getStackCount = () => {
    // First check Supabase data if available
    if (userProgressData?.stack_completed) {
      return 1;
    }
    
    // Check if stack was completed today through daily progress
    const today = new Date().toISOString().split('T')[0];
    const dailyProgressKey = `daily-progress-${today}`;
    const dailyProgress = JSON.parse(localStorage.getItem(dailyProgressKey) || "{}");
    
    if (dailyProgress.stack === true) {
      return 1; // At least one stack was completed today
    }
    
    return 0; // No stack completed today
  };

  const getJournalCount = () => {
    // First check Supabase data if available
    if (userProgressData?.journal_completed) {
      return 1;
    }
    
    // Check if journal was completed today through daily progress
    const today = new Date().toISOString().split('T')[0];
    const dailyProgressKey = `daily-progress-${today}`;
    const dailyProgress = JSON.parse(localStorage.getItem(dailyProgressKey) || "{}");
    
    return dailyProgress.journal === true ? 1 : 0;
  };

  const updateStats = () => {
    const stackCount = getStackCount();
    const journalCount = getJournalCount();
    const coreScore = getCoreScore();
    const dailyFourScore = getDailyFourScore();
    const weeklyTwoScore = getWeeklyTwoScore();
    const doorScore = hitList.filter(item => item.completed).length;
    
    console.log(`Updating stats - Stack: ${stackCount}, Journal: ${journalCount}, Core: ${coreScore}, Daily: ${dailyFourScore}, Door: ${doorScore}`);
    
    // Calculate streaks based on data
    // For a real implementation, you'd need to fetch a history of completions
    // from Supabase to calculate accurate streaks
    setStreaks({
      stack: userStatistics?.total_stacks || (stackCount > 0 ? Math.max(3, userStatistics?.total_stacks || 0) : 0),
      core: coreScore > 0 ? Math.max(5, userStatistics?.total_daily_points || 0) : 0,
      dailyFour: userStatistics?.total_journals || (dailyFourScore > 0 ? Math.max(2, userStatistics?.total_journals || 0) : 0),
      door: doorScore > 0 ? 4 : 0
    });
    
    // Calculate totals
    setTotals({
      stack: userStatistics?.total_stacks || (stackCount > 0 ? 1 : 0),
      core: userStatistics?.total_daily_points || (coreScore > 0 ? coreScore : 0),
      dailyFour: userStatistics?.total_journals || (journalCount > 0 ? 1 : 0),
      door: doorScore > 0 ? doorScore : 0
    });
    
    // Check if all activities are completed to show confetti
    if (stackCount > 0 && 
        journalCount > 0 && 
        coreScore === 8 && 
        dailyFourScore === 4 && 
        hitList.filter(item => item.completed).length === hitList.filter(item => item.day === activeDay).length && 
        hitList.filter(item => item.day === activeDay).length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setShowConfetti(false);
    }
  };

  const getCoreItems = () => {
    return [{
      id: 'fitness',
      title: language === 'en' ? 'FITNESS' : 'FITNESS',
      icon: <Activity className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['fitness'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'fuel',
      title: language === 'en' ? 'FUEL' : 'ALIMENTAȚIE',
      icon: <Activity className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['fuel'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'person1',
      title: language === 'en' ? 'PERSON 1' : 'PERSOANA 1',
      icon: <Users className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['person1'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'person2',
      title: language === 'en' ? 'PERSON 2' : 'PERSOANA 2',
      icon: <Users className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['person2'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'meditation',
      title: language === 'en' ? 'MEDITATION' : 'MEDITAȚIE',
      icon: <Heart className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['meditation'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'memoirs',
      title: language === 'en' ? 'MEMOIRS' : 'MEMORII',
      icon: <Book className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['memoirs'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'discover',
      title: language === 'en' ? 'DISCOVER' : 'DESCOPERĂ',
      icon: <Compass className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['discover'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }, {
      id: 'declare',
      title: language === 'en' ? 'DECLARE' : 'DECLARĂ',
      icon: <DollarSign className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: coreData[selectedDay]?.['declare'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }];
  };

  const getDailyFourItems = () => {
    return [{
      id: 'video',
      title: 'VIDEO',
      icon: <Video className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'video')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'text',
      title: 'TEXT',
      icon: <Text className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'text')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'audio',
      title: 'AUDIO',
      icon: <AudioLines className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'audio')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'image',
      title: 'IMAGE',
      icon: <ImageIcon className={`h-4 w-4 sm:h-6 sm:w-6 text-white`} />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'image')?.completed || false,
      color: 'bg-blue-600'
    }];
  };

  const getWeeklyItems = () => {
    return [{
      id: 'podcast',
      title: 'PODCAST',
      completed: dailyFourData[selectedDay]?.weeklyActivities?.find((a: any) => a.id === 'podcast')?.completed || false
    }, {
      id: 'webinar',
      title: 'WEBINAR',
      completed: dailyFourData[selectedDay]?.weeklyActivities?.find((a: any) => a.id === 'webinar')?.completed || false
    }];
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const handleLearnCategorySelect = (category: string) => {
    setActiveLearnCategory(category);
  };

  const handleLearnSubcategorySelect = (subcategory: string) => {
    setActiveLearnSubcategory(subcategory);
  };

  const handleToggleCoreActivity = (activityId: string) => {
    const isCurrentlyCompleted = coreData[selectedDay]?.[activityId] || false;
    updateCoreActivity(selectedDay, activityId, !isCurrentlyCompleted);
    toast({
      title: !isCurrentlyCompleted ? t('activityCompleted').replace('{activity}', activityId.charAt(0).toUpperCase() + activityId.slice(1)) : t('activityIncomplete').replace('{activity}', activityId.charAt(0).toUpperCase() + activityId.slice(1)),
      description: !isCurrentlyCompleted ? t('greatJob') : t('progressUpdated')
    });
  };

  const handleToggleDailyActivity = (activityId: string) => {
    const activity = dailyFourData[selectedDay]?.dailyActivities?.find(a => a.id === activityId);
    const isCurrentlyCompleted = activity?.completed || false;
    updateDailyActivity(selectedDay, activityId, !isCurrentlyCompleted);
    toast({
      title: !isCurrentlyCompleted ? t('activityCompleted').replace('{activity}', activityId.toUpperCase()) : t('activityIncomplete').replace('{activity}', activityId.toUpperCase()),
      description: !isCurrentlyCompleted ? t('greatJob') : t('progressUpdated')
    });
  };

  const handleToggleWeeklyActivity = (activityId: string) => {
    const activity = dailyFourData[selectedDay]?.weeklyActivities?.find(a => a.id === activityId);
    const isCurrentlyCompleted = activity?.completed || false;
    updateWeeklyActivity(selectedDay, activityId, !isCurrentlyCompleted);
    toast({
      title: !isCurrentlyCompleted ? t('activityCompleted').replace('{activity}', activityId.toUpperCase()) : t('activityIncomplete').replace('{activity}', activityId.toUpperCase()),
      description: !isCurrentlyCompleted ? t('greatJob') : t('progressUpdated')
    });
  };

  const coreItems = getCoreItems();
  const dailyFourItems = getDailyFourItems();
  const weeklyItems = getWeeklyItems();
  const coreScore = getCoreScore();
  const dailyFourScore = getDailyFourScore();
  const weeklyTwoScore = getWeeklyTwoScore();
  const doorScore = hitList.filter(item => item.completed).length;

  const getPriorityIcon = (priority?: TaskPriority) => {
    switch (priority) {
      case 'urgent-important':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'urgent':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'important':
        return <Award className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'urgent-important':
        return 'bg-red-500/10 border-red-500/30';
      case 'urgent':
        return 'bg-orange-500/10 border-orange-500/30';
      case 'important':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-[#222233]';
    }
  };

  const getCategoryIcon = (category: MissionCategory) => {
    switch(category) {
      case 'body': return <Dumbbell className="h-4 w-4 text-red-400" />;
      case 'being': return <Brain className="h-4 w-4 text-blue-400" />;
      case 'balance': return <Heart className="h-4 w-4 text-green-400" />;
      case 'business': return <Briefcase className="h-4 w-4 text-purple-400" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };
  
  const getCategoryColor = (category: MissionCategory) => {
    switch(category) {
      case 'body': return 'border-red-500/30 bg-red-500/10';
      case 'being': return 'border-blue-500/30 bg-blue-500/10';
      case 'balance': return 'border-green-500/30 bg-green-500/10';
      case 'business': return 'border-purple-500/30 bg-purple-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };
  
  const getCategoryName = (category: MissionCategory) => {
    if (language === 'en') {
      switch(category) {
        case 'body': return 'Body';
        case 'being': return 'Spirituality';
        case 'balance': return 'Relationships';
        case 'business': return 'Business';
        default: return category;
      }
    } else {
      switch(category) {
        case 'body': return 'Corp';
        case 'being': return 'Spiritualitate';
        case 'balance': return 'Relații';
        case 'business': return 'Afaceri';
        default: return category;
      }
    }
  };

  const hasStack = getStackCount() > 0 || getJournalCount() > 0;
  const stackToCoreLine = hasStack ? 100 : 0;
  const totalCoreItems = 8;
  const completedCoreItems = Object.keys(coreData[selectedDay] || {}).filter(key => coreData[selectedDay][key]).length;
  const hasCompletedCore = completedCoreItems >= totalCoreItems;

  const totalDailyItems = 4;
  const completedDailyItems = dailyFourData[selectedDay]?.dailyActivities?.filter(a => a.completed).length || 0;
  const hasCompletedDailyFour = completedDailyItems >= totalDailyItems;

  const totalDoorItems = hitList.filter(item => item.day === activeDay).length;
  const doorProgress = totalDoorItems > 0 ? hitList.filter(item => item.day === activeDay && item.completed).length / totalDoorItems * 100 : 0;
  const hasCompletedDoor = totalDoorItems > 0 && hitList.filter(item => item.day === activeDay && item.completed).length === totalDoorItems;

  const coreProgress = Math.min(completedCoreItems / totalCoreItems * 100, 100);
  const dailyProgress = Math.min(completedDailyItems / totalDailyItems * 100, 100);
  const coreToDaily = hasStack ? coreProgress : 0;
  const dailyToDoor = hasStack && coreProgress > 0 ? dailyProgress : 0;

  return <div className="w-full max-w-full py-4 px-2 sm:px-4 sm:py-8 bg-gradient-to-b from-[#0B0D17] to-[#111827] overflow-hidden min-w-0">
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse"></div>
          <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
          <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500 animate-pulse"></div>
          
          {Array.from({
        length: 50
      }).map((_, i) => <div key={i} className="absolute animate-float" style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`
      }}>
              <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-purple-400 to-pink-500" style={{
          boxShadow: '0 0 10px rgba(219, 39, 119, 0.5)'
        }}></div>
            </div>)}
        </div>}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {language === 'en' ? 'My Daily' : 'Zilnica mea'}
        </h1>
        
      </div>
      
      <QuoteDisplay appName="GODDESS" />
      
      <div className="mb-6 sm:mb-8 bg-[#1A1F2C] p-3 sm:p-4 rounded-lg">
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {language === 'en' ? 'Goddess Journey' : 'Călătoria Zeitei'}
        </h2>
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className="flex flex-col items-center z-10 relative">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative
            ${hasStack ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-gray-600 bg-gray-800/50 text-gray-400'}`} style={{
            border: hasStack ? '4px solid #22c55e' : '4px solid rgba(75, 85, 99, 0.6)',
            boxShadow: hasStack ? '0 0 15px rgba(34, 197, 94, 0.5)' : 'none'
          }}>
              {hasStack ? <>
                  <Book className="w-6 h-6 sm:w-8 sm:h-8" />
                  <Check className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 text-white rounded-full p-1" />
                </> : <Button className="absolute inset-0 m-auto rounded-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-800 text-white text-xs flex items-center justify-center" style={{
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)'
            }} onClick={() => navigateTo('/stack')}>
                  {language === 'en' ? 'START' : 'START'}
                </Button>}
            </div>
            <span className="mt-2 text-xs text-center text-gray-300">STACK</span>
          </div>
          
          {!isMobile && (
            <div className="flex-grow mx-2 relative">
              <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000 ease-in-out ${hasStack ? 'animate-progress-line' : ''}`} style={{
                width: `${stackToCoreLine}%`
              }}></div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedCore ? 'bg-blue-500/20 text-blue-400' : hasStack ? 'bg-blue-800/20 text-blue-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '4px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedCore ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none',
            position: 'relative'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-4px] rounded-full z-0" style={{
              background: hasStack ? `conic-gradient(#3b82f6 ${coreProgress}%, rgba(75, 85, 99, 0.6) 0%)` : 'rgba(75, 85, 99, 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
              {hasCompletedCore && <Check className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-2 text-xs text-center text-gray-300">CORE</span>
          </div>
          
          {!isMobile && (
            <div className="flex-grow mx-2 relative">
              <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-in-out ${coreProgress > 0 ? 'animate-progress-line' : ''}`} style={{
                width: `${coreToDaily}%`
              }}></div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedDailyFour ? 'bg-purple-500/20 text-purple-400' : hasCompletedCore ? 'bg-purple-800/20 text-purple-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '4px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedDailyFour ? '0 0 15px rgba(168, 85, 247, 0.5)' : 'none'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-4px] rounded-full z-0" style={{
              background: coreProgress > 0 ? `conic-gradient(#a855f7 ${dailyProgress}%, rgba(75, 85, 99, 0.6) 0%)` : 'rgba(75, 85, 99, 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <Video className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
              {hasCompletedDailyFour && <Check className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-2 text-xs text-center text-gray-300">DAILY</span>
          </div>
          
          {!isMobile && (
            <div className="flex-grow mx-2 relative">
              <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-in-out ${dailyProgress > 0 ? 'animate-progress-line' : ''}`} style={{
                width: `${dailyToDoor}%`
              }}></div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedDoor ? 'bg-pink-500/20 text-pink-400' : hasCompletedDailyFour ? 'bg-pink-800/20 text-pink-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '4px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedDoor ? '0 0 15px rgba(236, 72, 153, 0.5)' : 'none'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-4px] rounded-full z-0" style={{
              background: dailyProgress > 0 ? `conic-gradient(#ec4899 ${doorProgress}%, rgba(75, 85, 99, 0.6) 0%)` : 'rgba(75, 85, 99, 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <ListTodo className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
              {hasCompletedDoor && <Check className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-2 text-xs text-center text-gray-300">DOOR</span>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 w-full sm:w-[400px] mb-4 bg-[#1A1F2C]">
          <TabsTrigger value="goddess-tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-feminine-primary data-[state=active]:to-feminine-purple text-xs sm:text-sm">
            {language === 'en' ? 'Goddess Tools' : 'Unelte Zeițe'}
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 text-xs sm:text-sm">
            {language === 'en' ? 'Courses' : 'Cursuri'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="goddess-tools" className="space-y-4 sm:space-y-6">
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8 mb-8 sm:mb-12 relative overflow-hidden">
              {/* Stack and Journal Column */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#1C1E33] rounded-lg p-4 sm:p-6 border border-[#30336B]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white">{t('stackAndJournal')}</h3>
                    <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigateTo('/stack')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {language === 'en' ? 'Complete Stack' : 'Completează Stack'}
                    </Button>
                    <Button 
                      onClick={() => navigateTo('/journal')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-sm sm:text-base"
                    >
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {language === 'en' ? 'Write in Journal' : 'Scrie în Jurnal'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Goddess Journey Progress */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#1C1E33] rounded-lg p-4 sm:p-6 border border-[#30336B]">
                  <h3 className="text-lg sm:text-xl font-bold text-center text-white mb-4 sm:mb-6">GODDESS JOURNEY</h3>
                  
                  <div className="relative flex flex-col lg:flex-col items-center space-y-4 lg:space-y-8 lg:space-x-0">
                    {/* Stack Progress Circle */}
                    <div className="relative">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center ${hasStack ? 'border-green-500 bg-green-500/20' : 'border-gray-500 bg-gray-500/10'}`}>
                        <Circle className={`w-4 h-4 sm:w-6 sm:h-6 ${hasStack ? 'text-green-500' : 'text-gray-500'}`} />
                      </div>
                      <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">STACK</span>
                    </div>

                    {/* Connection Line */}
                    <div className="w-1 h-8 sm:h-12 bg-gray-600 relative">
                      <div 
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-green-500 to-blue-500 transition-all duration-1000 ease-in-out"
                        style={{ height: `${stackToCoreLine}%` }}
                      />
                    </div>

                    {/* Core Progress Circle */}
                    <div className="relative">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center ${hasCompletedCore ? 'border-blue-500 bg-blue-500/20' : 'border-gray-500 bg-gray-500/10'}`}>
                        <Circle className={`w-4 h-4 sm:w-6 sm:h-6 ${hasCompletedCore ? 'text-blue-500' : 'text-gray-500'}`} />
                      </div>
                      <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">CORE</span>
                    </div>

                    {/* Connection Line */}
                    <div className="w-1 h-8 sm:h-12 bg-gray-600 relative">
                      <div 
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-in-out"
                        style={{ height: `${coreToDaily}%` }}
                      />
                    </div>

                    {/* Daily Four Progress Circle */}
                    <div className="relative">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center ${hasCompletedDailyFour ? 'border-purple-500 bg-purple-500/20' : 'border-gray-500 bg-gray-500/10'}`}>
                        <Circle className={`w-4 h-4 sm:w-6 sm:h-6 ${hasCompletedDailyFour ? 'text-purple-500' : 'text-gray-500'}`} />
                      </div>
                      <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">DAILY</span>
                    </div>

                    {/* Connection Line */}
                    <div className="w-1 h-8 sm:h-12 bg-gray-600 relative">
                      <div 
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-500 to-pink-500 transition-all duration-1000 ease-in-out"
                        style={{ height: `${dailyToDoor}%` }}
                      />
                    </div>

                    {/* Door Progress Circle */}
                    <div className="relative">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center ${hasCompletedDoor ? 'border-pink-500 bg-pink-500/20' : 'border-gray-500 bg-gray-500/10'}`}>
                        <Circle className={`w-4 h-4 sm:w-6 sm:h-6 ${hasCompletedDoor ? 'text-pink-500' : 'text-gray-500'}`} />
                      </div>
                      <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">DOOR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Statistics */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#1C1E33] rounded-lg p-4 sm:p-6 border border-[#30336B]">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Weekly Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Score</span>
                      <span className="text-lg font-bold text-yellow-400">{coreScore + dailyFourScore + doorScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Streak</span>
                      <span className="text-lg font-bold text-green-400">{Math.max(streaks.core, streaks.dailyFour)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Total</span>
                      <span className="text-lg font-bold text-blue-400">{totals.core + totals.dailyFour + totals.door}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {language === 'en' ? 'My Weekly' : 'Săptămânal'}
            </h2>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase">{language === 'en' ? 'THE SCORE' : 'SCORUL'}</h3>
                <div className="flex-grow mx-4">
                  <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 h-1 w-full rounded-full"></div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase">{language === 'en' ? 'THE STREAKS' : 'SERIILE'}</h3>
                <div className="flex-grow mx-4">
                  <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 h-1 w-full rounded-full"></div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase">{language === 'en' ? 'THE TOTALS' : 'TOTALURILE'}</h3>
              </div>
            </div>
            
            <WeeklyProgress />
          </div>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4 sm:space-y-6">
          <LearnDashboard 
            onCategorySelect={handleLearnCategorySelect}
            onSubcategorySelect={handleLearnSubcategorySelect}
            activeCategory={activeLearnCategory}
            activeSubcategory={activeLearnSubcategory}
          />
        </TabsContent>
      </Tabs>
    </div>;
};