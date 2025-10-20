
import React, { useState, useEffect } from 'react';
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
import { WeeklyObjectives } from './WeeklyObjectives';
import { useProgress } from '@/context/ProgressContext';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { TaskPriority } from '@/types/door';
import { QuoteDisplay } from './QuoteDisplay';
import { MonthlyMission, MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';

export const Dashboard: React.FC = () => {
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
    
    // Listen for progress updates
    const handleProgressUpdate = (event: any) => {
      console.log('Progress updated:', event.detail);
      updateStats();
      fetchUserData();
    };
    
    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
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
    
    if (dailyProgress.stack?.completed === true) {
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
    
    return dailyProgress.journal?.completed === true ? 1 : 0;
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
      icon: <Activity className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['fitness'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'fuel',
      title: language === 'en' ? 'FUEL' : 'ALIMENTAȚIE',
      icon: <Activity className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['fuel'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'person1',
      title: language === 'en' ? 'PERSON 1' : 'PERSOANA 1',
      icon: <Users className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['person1'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'person2',
      title: language === 'en' ? 'PERSON 2' : 'PERSOANA 2',
      icon: <Users className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['person2'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'meditation',
      title: language === 'en' ? 'MEDITATION' : 'MEDITAȚIE',
      icon: <Heart className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['meditation'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'memoirs',
      title: language === 'en' ? 'MEMOIRS' : 'MEMORII',
      icon: <Book className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['memoirs'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'discover',
      title: language === 'en' ? 'DISCOVER' : 'DESCOPERĂ',
      icon: <Compass className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['discover'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }, {
      id: 'declare',
      title: language === 'en' ? 'DECLARE' : 'DECLARĂ',
      icon: <DollarSign className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['declare'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }];
  };

  const getDailyFourItems = () => {
    return [{
      id: 'video',
      title: 'VIDEO',
      icon: <Video className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'video')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'text',
      title: 'TEXT',
      icon: <Text className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'text')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'audio',
      title: 'AUDIO',
      icon: <AudioLines className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'audio')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'image',
      title: 'IMAGE',
      icon: <ImageIcon className="h-6 w-6 text-white" />,
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

  return <div className="w-full max-w-full py-4 px-2 md:py-8 md:px-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))]">
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
      
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {language === 'en' ? 'My Daily' : 'Zilnica mea'}
        </h1>
        
      </div>
      
      <QuoteDisplay appName="GODDESS" />
      
      <div className="mb-6 md:mb-8 bg-card p-3 md:p-4 rounded-lg">
        <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {language === 'en' ? 'Warrior’s Path' : 'Calea Războinicului'}
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center z-10 relative">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center relative
            ${hasStack ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-gray-600 bg-gray-800/50 text-gray-400'}`} style={{
            border: hasStack ? '3px solid hsl(var(--accent))' : '3px solid hsl(var(--muted-foreground) / 0.6)',
            boxShadow: hasStack ? '0 0 15px hsl(var(--accent) / 0.5)' : 'none'
          }}>
              {hasStack ? <>
                  <Book className="w-5 h-5 md:w-8 md:h-8" />
                  <Check className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 text-white rounded-full p-1" />
                </> : <Button className="absolute inset-0 m-auto rounded-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-800 text-white text-xs flex items-center justify-center" style={{
              width: 'calc(100% - 6px)',
              height: 'calc(100% - 6px)'
            }} onClick={() => navigateTo('/stack')}>
                  {language === 'en' ? 'START' : 'START'}
                </Button>}
            </div>
            <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">{t('stack')}</span>
          </div>
          
          <div className="flex-grow mx-2 relative">
            <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000 ease-in-out ${hasStack ? 'animate-progress-line' : ''}`} style={{
              width: `${stackToCoreLine}%`
            }}></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedCore ? 'bg-blue-500/20 text-blue-400' : hasStack ? 'bg-blue-800/20 text-blue-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedCore ? '0 0 15px hsl(var(--primary) / 0.5)' : 'none',
            position: 'relative'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-3px] rounded-full z-0" style={{
              background: hasStack ? `conic-gradient(hsl(var(--primary)) ${coreProgress}%, hsl(var(--muted-foreground) / 0.6) 0%)` : 'hsl(var(--muted-foreground) / 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <Activity className="w-5 h-5 md:w-8 md:h-8 relative z-10" />
              {hasCompletedCore && <Check className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-blue-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">CORE</span>
          </div>
          
          <div className="flex-grow mx-2 relative">
            <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-in-out ${coreProgress > 0 ? 'animate-progress-line' : ''}`} style={{
              width: `${coreToDaily}%`
            }}></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedDailyFour ? 'bg-purple-500/20 text-purple-400' : hasCompletedCore ? 'bg-purple-800/20 text-purple-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedDailyFour ? '0 0 15px hsl(var(--accent) / 0.5)' : 'none'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-3px] rounded-full z-0" style={{
              background: coreProgress > 0 ? `conic-gradient(hsl(var(--accent)) ${dailyProgress}%, hsl(var(--muted-foreground) / 0.6) 0%)` : 'hsl(var(--muted-foreground) / 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <Video className="w-5 h-5 md:w-8 md:h-8 relative z-10" />
              {hasCompletedDailyFour && <Check className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-purple-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">DAILY</span>
          </div>
          
          <div className="flex-grow mx-2 relative">
            <div className="h-2 bg-gray-700 rounded-full w-full relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-in-out ${dailyProgress > 0 ? 'animate-progress-line' : ''}`} style={{
              width: `${dailyToDoor}%`
            }}></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center z-10">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center relative
            ${hasCompletedDoor ? 'bg-pink-500/20 text-pink-400' : hasCompletedDailyFour ? 'bg-pink-800/20 text-pink-300/70' : 'bg-gray-800/50 text-gray-400'}`} style={{
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: hasCompletedDoor ? '0 0 15px hsl(var(--goddess-gold) / 0.5)' : 'none'
          }}>
              {/* The circular progress track */}
              <div className="absolute inset-[-3px] rounded-full z-0" style={{
              background: dailyProgress > 0 ? `conic-gradient(hsl(var(--goddess-gold)) ${doorProgress}%, hsl(var(--muted-foreground) / 0.6) 0%)` : 'hsl(var(--muted-foreground) / 0.6)',
              clipPath: 'circle(50%)'
            }}></div>
              <ListTodo className="w-5 h-5 md:w-8 md:h-8 relative z-10" />
              {hasCompletedDoor && <Check className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-pink-500 text-white rounded-full p-1 z-20" />}
            </div>
            <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">GATEWAY</span>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-4 bg-card">
          <TabsTrigger value="goddess-tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-feminine-primary data-[state=active]:to-feminine-purple">
            {language === 'en' ? 'RoWarrior Tools' : 'Unelte RoWarrior'}
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
            {language === 'en' ? 'Courses' : 'Cursuri'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="goddess-tools" className="space-y-6">
          <div className="mb-8">
            
            
            
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg uppercase text-indigo-500 font-extrabold">{language === 'en' ? 'CORE & DAILY ACTIVITIES' : 'CORE & DAILY FOUR'}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 p-3 md:p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">{language === 'en' ? 'CORE 4' : 'CORE 4'}</h3>
                      <Button variant="outline" className="bg-blue-600/20 border-blue-500/50 hover:bg-blue-700/30 text-white text-xs md:text-sm" onClick={() => navigateTo('/core')}>
                        {language === 'en' ? 'VIEW' : 'VIZUALIZEAZĂ'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                      {coreItems.map(item => {
                      const isCompleted = coreData[selectedDay]?.[item.id] || false;
                      return <Card key={item.id} className={`${isCompleted ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-card hover:bg-muted'} 
                            border ${isCompleted ? 'border-blue-400/50' : 'border-blue-900/50'} 
                            shadow-md p-2 md:p-3 flex flex-col items-center justify-center cursor-pointer 
                            transition-colors duration-200 hover:shadow-blue-500/10`} onClick={() => handleToggleCoreActivity(item.id)}>
                            <div className="relative flex items-center justify-center">
                              <Activity className="h-4 w-4 md:h-6 md:w-6 text-white" />
                              {isCompleted && <div className="absolute -top-1 -right-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
                                </div>}
                            </div>
                            <div className="mt-1 md:mt-2 text-xs text-center text-white font-medium">{item.title}</div>
                          </Card>;
                    })}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 p-3 md:p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300">{language === 'en' ? 'Biz 4' : 'Biz 4'}</h3>
                      <Button variant="outline" className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-700/30 text-white text-xs md:text-sm" onClick={() => navigateTo('/daily-four')}>
                        {language === 'en' ? 'VIEW' : 'VIZUALIZEAZĂ'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2 mb-3 md:mb-4">
                      {dailyFourItems.map(item => {
                      const isCompleted = item.completed;
                       return <Card key={item.id} className={`${isCompleted ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-card hover:bg-muted'} 
                            border ${isCompleted ? 'border-purple-400/50' : 'border-purple-900/50'} 
                            shadow-md p-2 md:p-3 flex flex-col items-center justify-center cursor-pointer
                            transition-colors duration-200 hover:shadow-purple-500/10`} onClick={() => handleToggleDailyActivity(item.id)}>
                            <div className="relative flex items-center justify-center">
                              <Video className="h-4 w-4 md:h-6 md:w-6 text-white" />
                              {isCompleted && <div className="absolute -top-1 -right-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
                                </div>}
                            </div>
                            <div className="mt-1 md:mt-2 text-xs text-center text-white font-medium">{item.title}</div>
                          </Card>;
                    })}
                    </div>
                    
                    <h3 className="text-xs md:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-2">{language === 'en' ? 'WEEKLY TWO' : 'WEEKLY TWO'}</h3>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                      {weeklyItems.map(item => {
                      const isCompleted = item.completed;
                       return <Card key={item.id} className={`${isCompleted ? 'bg-gradient-to-br from-pink-600 to-pink-800' : 'bg-card hover:bg-muted'} 
                            border ${isCompleted ? 'border-pink-400/50' : 'border-pink-900/50'} 
                            shadow-md p-2 md:p-3 flex items-center justify-center cursor-pointer
                            transition-colors duration-200 hover:shadow-pink-500/10`} onClick={() => handleToggleWeeklyActivity(item.id)}>
                            <div className="relative flex items-center justify-center">
                              <div className="text-xs text-center text-white font-medium">{item.title}</div>
                              {isCompleted && <div className="absolute -top-1 -right-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
                                </div>}
                            </div>
                          </Card>;
                    })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
              <div>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{language === 'en' ? 'HIT LIST' : 'LISTA HIT'}</h3>
                </div>
                <Card className="bg-card border border-green-500/20 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all duration-300">
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-2">
                      {hitList.filter(item => item.day === activeDay).length > 0 ? hitList.filter(item => item.day === activeDay).map(item => <div key={item.id} className={`flex items-center p-2 rounded-md transition-all duration-200 ${item.completed ? 'bg-green-500/10' : getPriorityColor(item.priority)}`}>
                            <Button variant="ghost" size="sm" className={`w-6 h-6 rounded-full mr-3 p-0 flex items-center justify-center ${item.completed ? 'bg-green-500 text-white' : 'bg-transparent border border-gray-400 text-gray-400'}`} onClick={() => toggleHitListItemCompletion(item.id)}>
                              {item.completed && <CheckCircle2 className="w-3 h-3" />}
                            </Button>
                            <span className={`flex-grow ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                              {item.text}
                            </span>
                            {!item.completed && getPriorityIcon(item.priority)}
                          </div>) : <div className="text-center text-gray-500 py-4">
                          <p>{language === 'en' ? 'No HIT items for today' : 'Nu există elemente HIT pentru astăzi'}</p>
                        </div>}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button variant="outline" onClick={() => navigateTo('/door')} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                        {language === 'en' ? 'VIEW' : 'VIZUALIZEAZĂ'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <WeeklyObjectives />
                </div>
                <div>
                  <MonthlyObjectives />
                </div>
              </div>
            </div>
          </div>
          
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {language === 'en' ? 'My Weekly' : 'Săptămânal'}
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex justify-between items-center overflow-x-auto">
                  <h3 className="text-sm md:text-lg font-bold text-white uppercase whitespace-nowrap">{language === 'en' ? 'THE SCORE' : 'SCORUL'}</h3>
                  <div className="flex-grow mx-2 md:mx-4">
                    <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 h-0.5 md:h-1 w-full rounded-full"></div>
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-white uppercase whitespace-nowrap">{language === 'en' ? 'THE STREAKS' : 'SERIILE'}</h3>
                  <div className="flex-grow mx-2 md:mx-4">
                    <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 h-0.5 md:h-1 w-full rounded-full"></div>
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-white uppercase whitespace-nowrap">{language === 'en' ? 'THE TOTAL' : 'TOTALUL'}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                  <Card className="bg-card border border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 p-3 md:p-4">
                  <div className="flex flex-col items-center">
                    <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                      {coreScore + dailyFourScore + weeklyTwoScore + doorScore}
                    </h3>
                    <div className="mt-6 space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Circle className="w-3 h-3 mr-2 text-blue-500 fill-blue-500" />
                          <span className="text-sm text-gray-300">{t('stack')}</span>
                        </div>
                        <span className="text-sm text-gray-300">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Circle className="w-3 h-3 mr-2 text-purple-500 fill-purple-500" />
                          <span className="text-sm text-gray-300">CORE</span>
                        </div>
                        <span className="text-sm text-gray-300">{coreScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Circle className="w-3 h-3 mr-2 text-amber-500 fill-amber-500" />
                          <span className="text-sm text-gray-300">DAILY</span>
                        </div>
                        <span className="text-sm text-gray-300">{dailyFourScore + weeklyTwoScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Circle className="w-3 h-3 mr-2 text-green-500 fill-green-500" />
                          <span className="text-sm text-gray-300">GATEWAY</span>
                        </div>
                        <span className="text-sm text-gray-300">{doorScore}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                  <Card className="bg-card border border-purple-500/20 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 p-3 md:p-4">
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-blue-500/50 rounded-full flex items-center justify-center">
                        <span className="text-sm md:text-xl font-bold text-blue-400">{streaks.stack}</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">{t('stack')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-purple-500/50 rounded-full flex items-center justify-center">
                        <span className="text-sm md:text-xl font-bold text-purple-400">{streaks.core}</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">CORE</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-pink-500/50 rounded-full flex items-center justify-center">
                        <span className="text-sm md:text-xl font-bold text-pink-400">{streaks.dailyFour}</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">DAILY</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 md:w-16 md:h-16 border-2 md:border-4 border-green-500/50 rounded-full flex items-center justify-center">
                        <span className="text-sm md:text-xl font-bold text-green-400">{streaks.door}</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-xs text-center text-gray-300">GATEWAY</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-card border border-pink-500/20 shadow-lg hover:shadow-pink-500/10 transition-all duration-300 p-3 md:p-4">
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Circle className="w-3 h-3 md:w-4 md:h-4 text-blue-500 fill-blue-500" />
                        <span className="text-xs md:text-sm text-gray-300">{t('stack')}</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-lg md:text-2xl font-bold text-blue-400">{totals.stack}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Circle className="w-3 h-3 md:w-4 md:h-4 text-purple-500 fill-purple-500" />
                        <span className="text-xs md:text-sm text-gray-300">CORE</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-lg md:text-2xl font-bold text-purple-400">{totals.core}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Circle className="w-3 h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs md:text-sm text-gray-300">DAILY</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-lg md:text-2xl font-bold text-amber-400">{totals.dailyFour}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Circle className="w-3 h-3 md:w-4 md:h-4 text-green-500 fill-green-500" />
                        <span className="text-xs md:text-sm text-gray-300">GATEWAY</span>
                      </div>
                      <span className="mt-1 md:mt-2 text-lg md:text-2xl font-bold text-green-400">{totals.door}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <LearnDashboard onCategorySelect={handleLearnCategorySelect} activeCategory={activeLearnCategory} categoryCounts={categoryCounts} onSubcategorySelect={handleLearnSubcategorySelect} activeSubcategory={activeLearnSubcategory} />
        </TabsContent>
      </Tabs>
    </div>;
};
