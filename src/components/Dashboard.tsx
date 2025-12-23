
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Book, BookOpen, CheckCircle2, Circle, ListTodo, Dumbbell, Heart, Brain, Briefcase, Video, Text, AudioLines, Image as ImageIcon, ArrowRight, RefreshCw, Compass, DollarSign, Users, Clock, Award, AlertTriangle, Check, Sparkles, Calendar as CalendarIcon, History } from 'lucide-react';
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
import { DailyBookPage } from './challenge/DailyBookPage';
import { MonthlyMission, MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { TransformedWarrior, WarriorBadge, MediaMaster, MediaBadge, WarriorPowerCard, MediaMasterCard } from '@/components/celebrations';
import { XPProgressBar, LevelUpCelebration, XPPopupContainer } from '@/components/xp';
import { useXPSystem } from '@/hooks/useXPSystem';
import { XPAwardEvent } from '@/services/xpService';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { BADGES, BadgeStats } from '@/components/challenge/badges/badgeDefinitions';
import { 
  StreakMilestoneCelebration, 
  BadgeUnlockCelebration, 
  DailyChallenges, 
  SmartNotifications, 
  RewardsShowcase 
} from '@/components/gamification';

export const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("goddess-tools");
  const [activeLearnCategory, setActiveLearnCategory] = useState<string | null>(null);
  const [activeLearnSubcategory, setActiveLearnSubcategory] = useState<string>("courses");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hitList, activeDay, toggleHitListItemCompletion } = useDoorContent();
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
  
  const [streaks, setStreaks] = useState({ stack: 0, core: 0, dailyFour: 0, door: 0 });
  const [totals, setTotals] = useState({ stack: 0, core: 0, dailyFour: 0, door: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [showWarriorOverlay, setShowWarriorOverlay] = useState(false);
  const [showMediaOverlay, setShowMediaOverlay] = useState(false);
  const [hasShownCoreAnimation, setHasShownCoreAnimation] = useState(false);
  const [hasShownDailyAnimation, setHasShownDailyAnimation] = useState(false);
  
  const { playSuccessSound } = useSoundSettings();
  const { xpData, recentXPGain, showLevelUp, newLevel, dismissLevelUp, addXP } = useXPSystem();
  const { streakData } = useStreakTracking();
  const { progress: readingProgress, getOverallStats } = useReadingProgress();
  
  const [hasAwardedCoreXP, setHasAwardedCoreXP] = useState(false);
  const [hasAwardedDailyXP, setHasAwardedDailyXP] = useState(false);
  
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [streakMilestoneValue, setStreakMilestoneValue] = useState<7 | 30 | 100 | 365>(7);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<typeof BADGES[0] | null>(null);
  const [previouslyEarnedBadges, setPreviouslyEarnedBadges] = useState<string[]>([]);
  
  const prevCategoryComplete = useRef<Record<string, boolean>>({
    body: false,
    relationship: false,
    being: false,
    business: false
  });

  const categoryCounts = { body: 12, balance: 8, being: 15, business: 10 };
  const [userProgressData, setUserProgressData] = useState<any>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  
  const badgeStats: BadgeStats = useMemo(() => {
    const stats = getOverallStats();
    const uniqueDays = new Set(readingProgress.map(p => new Date(p.read_at).toDateString())).size;
    return {
      totalPagesRead: stats.totalPagesRead,
      totalActionsCompleted: stats.totalActionsCompleted,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      principlesStarted: stats.principlesStarted,
      principlesMastered: stats.principlesMastered,
      totalDaysActive: uniqueDays
    };
  }, [readingProgress, getOverallStats, streakData]);
  
  const earnedBadges = useMemo(() => BADGES.filter(badge => badge.requirement(badgeStats)), [badgeStats]);
  
  useEffect(() => {
    const earnedIds = earnedBadges.map(b => b.id);
    const newBadges = earnedIds.filter(id => !previouslyEarnedBadges.includes(id));
    if (newBadges.length > 0 && previouslyEarnedBadges.length > 0) {
      const newBadge = BADGES.find(b => b.id === newBadges[0]);
      if (newBadge) {
        setUnlockedBadge(newBadge);
        setShowBadgeUnlock(true);
      }
    }
    setPreviouslyEarnedBadges(earnedIds);
  }, [earnedBadges]);
  
  useEffect(() => {
    const checkMilestone = (streak: number): 7 | 30 | 100 | 365 | null => {
      if (streak === 365) return 365;
      if (streak === 100) return 100;
      if (streak === 30) return 30;
      if (streak === 7) return 7;
      return null;
    };
    const milestone = checkMilestone(streakData.currentStreak);
    if (milestone) {
      const shownKey = `streakMilestone_${milestone}_shown`;
      const alreadyShown = localStorage.getItem(shownKey);
      if (!alreadyShown) {
        setStreakMilestoneValue(milestone);
        setShowStreakMilestone(true);
        localStorage.setItem(shownKey, 'true');
        const xpBonuses: Record<number, number> = { 7: 100, 30: 500, 100: 1000, 365: 5000 };
        addXP(xpBonuses[milestone], `Streak Milestone: ${milestone} days`);
      }
    }
  }, [streakData.currentStreak, addXP]);

  useEffect(() => {
    syncData();
    updateStats();
    fetchUserData();
    
    const handleProgressUpdate = (event: any) => {
      updateStats();
      fetchUserData();
    };
    const handleXPAward = (event: CustomEvent<XPAwardEvent>) => {
      const { amount, reason } = event.detail;
      addXP(amount, reason);
    };
    
    window.addEventListener('progressUpdated', handleProgressUpdate);
    window.addEventListener('xp-award', handleXPAward as EventListener);
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      window.removeEventListener('xp-award', handleXPAward as EventListener);
    };
  }, [addXP]);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const today = new Date().toISOString().split('T')[0];
        const progressKey = `userProgress_${today}`;
        const savedProgress = localStorage.getItem(progressKey);
        const progressData = savedProgress ? JSON.parse(savedProgress) : null;
        setUserProgressData(progressData);
        
        const statsKey = 'userStatistics';
        const savedStats = localStorage.getItem(statsKey);
        const statsData = savedStats ? JSON.parse(savedStats) : null;
        if (statsData) {
          setUserStatistics(statsData);
          updateStats();
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const [stackCount, setStackCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);

  const loadProgressCounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStackCount(0);
        setJournalCount(0);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyProgress } = await supabase
        .from('daily_progress')
        .select('progress_data')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .maybeSingle();
      const progressData = dailyProgress?.progress_data as any;
      setStackCount(progressData?.stack?.completed || userProgressData?.stack_completed ? 1 : 0);
      setJournalCount(progressData?.journal?.completed || userProgressData?.journal_completed ? 1 : 0);
    } catch (error) {
      console.error('Error loading progress counts:', error);
      setStackCount(0);
      setJournalCount(0);
    }
  };

  useEffect(() => {
    loadProgressCounts();
    const handleProgressUpdate = () => loadProgressCounts();
    window.addEventListener('progressUpdated', handleProgressUpdate);
    return () => window.removeEventListener('progressUpdated', handleProgressUpdate);
  }, [userProgressData]);

  const updateStats = () => {
    const coreScore = getCoreScore();
    const dailyFourScore = getDailyFourScore();
    const weeklyTwoScore = getWeeklyTwoScore();
    const doorScore = hitList.filter(item => item.completed).length;
    
    setStreaks({
      stack: userStatistics?.total_stacks || (stackCount > 0 ? Math.max(3, userStatistics?.total_stacks || 0) : 0),
      core: coreScore > 0 ? Math.max(5, userStatistics?.total_daily_points || 0) : 0,
      dailyFour: userStatistics?.total_journals || (dailyFourScore > 0 ? Math.max(2, userStatistics?.total_journals || 0) : 0),
      door: doorScore > 0 ? 4 : 0
    });
    
    setTotals({
      stack: userStatistics?.total_stacks || (stackCount > 0 ? 1 : 0),
      core: userStatistics?.total_daily_points || (coreScore > 0 ? coreScore : 0),
      dailyFour: userStatistics?.total_journals || (journalCount > 0 ? 1 : 0),
      door: doorScore > 0 ? doorScore : 0
    });
    
    if (stackCount > 0 && journalCount > 0 && coreScore === 8 && dailyFourScore === 4 && 
        hitList.filter(item => item.completed).length === hitList.filter(item => item.day === activeDay).length && 
        hitList.filter(item => item.day === activeDay).length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setShowConfetti(false);
    }
    
    const fitnessCompleted = coreData[selectedDay]?.['fitness'] || false;
    const fuelCompleted = coreData[selectedDay]?.['fuel'] || false;
    const bodyNowComplete = fitnessCompleted && fuelCompleted;
    
    const person1Completed = coreData[selectedDay]?.['person1'] || false;
    const person2Completed = coreData[selectedDay]?.['person2'] || false;
    const relationshipNowComplete = person1Completed && person2Completed;
    
    const meditationCompleted = coreData[selectedDay]?.['meditation'] || false;
    const memoirsCompleted = coreData[selectedDay]?.['memoirs'] || false;
    const beingNowComplete = meditationCompleted && memoirsCompleted;
    
    const discoverCompleted = coreData[selectedDay]?.['discover'] || false;
    const declareCompleted = coreData[selectedDay]?.['declare'] || false;
    const businessNowComplete = discoverCompleted && declareCompleted;
    
    if (bodyNowComplete && !prevCategoryComplete.current.body) playSuccessSound();
    if (relationshipNowComplete && !prevCategoryComplete.current.relationship) playSuccessSound();
    if (beingNowComplete && !prevCategoryComplete.current.being) playSuccessSound();
    if (businessNowComplete && !prevCategoryComplete.current.business) playSuccessSound();
    
    prevCategoryComplete.current = {
      body: bodyNowComplete,
      relationship: relationshipNowComplete,
      being: beingNowComplete,
      business: businessNowComplete
    };
  };

  const getCoreItems = () => [
    { id: 'fitness', title: language === 'en' ? 'Discipline of the Body' : 'Disciplina Corpului', icon: <Activity className="h-5 w-5" />, completed: coreData[selectedDay]?.['fitness'] || false, category: 'body' },
    { id: 'fuel', title: language === 'en' ? 'Fuel for Subconscious' : 'Combustibil Subconștient', icon: <Activity className="h-5 w-5" />, completed: coreData[selectedDay]?.['fuel'] || false, category: 'body' },
    { id: 'person1', title: language === 'en' ? 'Law of Service #1' : 'Legea Servirii #1', icon: <Users className="h-5 w-5" />, completed: coreData[selectedDay]?.['person1'] || false, category: 'balance' },
    { id: 'person2', title: language === 'en' ? 'Law of Service #2' : 'Legea Servirii #2', icon: <Users className="h-5 w-5" />, completed: coreData[selectedDay]?.['person2'] || false, category: 'balance' },
    { id: 'meditation', title: language === 'en' ? 'Autosuggestion & Faith' : 'Autosugestie și Credință', icon: <Heart className="h-5 w-5" />, completed: coreData[selectedDay]?.['meditation'] || false, category: 'being' },
    { id: 'memoirs', title: language === 'en' ? 'Subconscious Programming' : 'Programare Subconștient', icon: <Book className="h-5 w-5" />, completed: coreData[selectedDay]?.['memoirs'] || false, category: 'being' },
    { id: 'discover', title: language === 'en' ? 'Specialized Knowledge' : 'Cunoștințe Specializate', icon: <Compass className="h-5 w-5" />, completed: coreData[selectedDay]?.['discover'] || false, category: 'business' },
    { id: 'declare', title: language === 'en' ? 'Organized Planning' : 'Planificare Organizată', icon: <DollarSign className="h-5 w-5" />, completed: coreData[selectedDay]?.['declare'] || false, category: 'business' }
  ];

  const getDailyFourItems = () => [
    { id: 'video', title: 'Video', icon: <Video className="h-5 w-5" />, completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'video')?.completed || false },
    { id: 'text', title: 'Text', icon: <Text className="h-5 w-5" />, completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'text')?.completed || false },
    { id: 'audio', title: 'Audio', icon: <AudioLines className="h-5 w-5" />, completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'audio')?.completed || false },
    { id: 'image', title: 'Image', icon: <ImageIcon className="h-5 w-5" />, completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'image')?.completed || false }
  ];

  const getWeeklyItems = () => [
    { id: 'podcast', title: 'Podcast', completed: dailyFourData[selectedDay]?.weeklyActivities?.find((a: any) => a.id === 'podcast')?.completed || false },
    { id: 'webinar', title: 'Webinar', completed: dailyFourData[selectedDay]?.weeklyActivities?.find((a: any) => a.id === 'webinar')?.completed || false }
  ];

  const navigateTo = (path: string) => navigate(path);
  const handleLearnCategorySelect = (category: string) => setActiveLearnCategory(category);
  const handleLearnSubcategorySelect = (subcategory: string) => setActiveLearnSubcategory(subcategory);

  const handleToggleCoreActivity = (activityId: string) => {
    const isCurrentlyCompleted = coreData[selectedDay]?.[activityId] || false;
    updateCoreActivity(selectedDay, activityId, !isCurrentlyCompleted);
    toast({
      title: !isCurrentlyCompleted ? t('activityCompleted').replace('{activity}', activityId.charAt(0).toUpperCase() + activityId.slice(1)) : t('activityIncomplete').replace('{activity}', activityId.charAt(0).toUpperCase() + activityId.slice(1)),
      description: !isCurrentlyCompleted ? t('greatJob') : t('progressUpdated')
    });
  };

  const clearCorePair = (activityIds: string[]) => {
    activityIds.forEach((id) => updateCoreActivity(selectedDay, id, false));
    toast({
      title: language === 'en' ? 'Reset' : 'Reset',
      description: language === 'en' ? 'Category cleared.' : 'Categoria a fost resetată.'
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
      case 'urgent-important': return <AlertTriangle className="h-3 w-3 text-destructive" />;
      case 'urgent': return <Clock className="h-3 w-3 text-orange-500" />;
      case 'important': return <Award className="h-3 w-3 text-primary" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case 'urgent-important': return 'bg-destructive/10 border-destructive/30';
      case 'urgent': return 'bg-orange-500/10 border-orange-500/30';
      case 'important': return 'bg-primary/10 border-primary/30';
      default: return 'bg-card';
    }
  };

  const hasStack = stackCount > 0 || journalCount > 0;
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

  useEffect(() => {
    if (hasCompletedCore && !hasShownCoreAnimation) {
      setShowWarriorOverlay(true);
      setHasShownCoreAnimation(true);
      if (!hasAwardedCoreXP) {
        addXP(100, 'Core 4 completat');
        setHasAwardedCoreXP(true);
      }
    }
  }, [hasCompletedCore, hasShownCoreAnimation, hasAwardedCoreXP, addXP]);

  useEffect(() => {
    if (hasCompletedDailyFour && !hasShownDailyAnimation) {
      setShowMediaOverlay(true);
      setHasShownDailyAnimation(true);
      if (!hasAwardedDailyXP) {
        addXP(100, 'Biz 4 completat');
        setHasAwardedDailyXP(true);
      }
    }
  }, [hasCompletedDailyFour, hasShownDailyAnimation, hasAwardedDailyXP, addXP]);

  useEffect(() => {
    setHasShownCoreAnimation(hasCompletedCore);
    setHasShownDailyAnimation(hasCompletedDailyFour);
    setHasAwardedCoreXP(hasCompletedCore);
    setHasAwardedDailyXP(hasCompletedDailyFour);
  }, [selectedDay]);

  return (
    <div className="w-full max-w-full py-6 px-4 md:py-10 md:px-6 lg:px-8 bg-background min-h-screen">
      {/* Celebration Overlays */}
      <TransformedWarrior isVisible={showWarriorOverlay} onClose={() => setShowWarriorOverlay(false)} />
      <MediaMaster isVisible={showMediaOverlay} onClose={() => setShowMediaOverlay(false)} />
      <LevelUpCelebration isOpen={showLevelUp} onClose={dismissLevelUp} newLevel={newLevel} />
      <XPPopupContainer recentGain={recentXPGain} />
      <StreakMilestoneCelebration isOpen={showStreakMilestone} onClose={() => setShowStreakMilestone(false)} streakDays={streakData.currentStreak} milestone={streakMilestoneValue} />
      <BadgeUnlockCelebration isOpen={showBadgeUnlock} onClose={() => setShowBadgeUnlock(false)} badge={unlockedBadge} />

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          {language === 'en' ? 'My Daily' : 'Zilnica mea'}
        </h1>
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden md:inline">{format(selectedCalendarDate, 'dd MMM yyyy')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedCalendarDate(date);
                    const dayMap: Record<number, 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su'> = {
                      0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa'
                    };
                    setSelectedDay(dayMap[date.getDay()]);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => navigateTo('/daily-timeline')} className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden md:inline">{language === 'en' ? 'Timeline' : 'Istoric'}</span>
          </Button>
        </div>
      </div>
      
      <DailyBookPage />
      
      {/* Smart Notifications */}
      <div className="mb-4">
        <SmartNotifications
          currentStreak={streakData.currentStreak}
          lastActivityDate={streakData.lastActivityDate}
          xpToNextLevel={xpData.xpToNextLevel - xpData.xpInCurrentLevel}
          totalXP={xpData.totalXP}
          currentLevel={xpData.currentLevel}
          hasCompletedTodayStack={stackCount > 0}
          onAction={(id) => {
            if (id === 'morning_motivation' || id === 'streak_reminder' || id === 'comeback') {
              navigateTo('/stack');
            }
          }}
        />
      </div>
      
      <XPProgressBar className="mb-6" />
      
      <div className="mb-6">
        <DailyChallenges
          stackCompleted={stackCount > 0}
          core4Score={completedCoreItems}
          biz4Score={completedDailyItems}
          pagesReadToday={badgeStats.totalPagesRead}
          actionsCompletedToday={badgeStats.totalActionsCompleted}
        />
      </div>
      
      {/* Progress Path - Clean Design */}
      <div className="mb-8 bg-card rounded-2xl border border-border p-5 md:p-6">
        <h2 className="text-lg font-medium text-foreground mb-5">
          {language === 'en' ? 'Progress Path' : 'Calea Progresului'}
        </h2>
        <div className="flex items-center justify-between gap-2">
          {/* Stack */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative border-2 transition-all duration-300
              ${hasStack ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/30 bg-muted text-muted-foreground'}`}>
              {hasStack ? (
                <>
                  <Book className="w-6 h-6" />
                  <Check className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full p-0.5" />
                </>
              ) : (
                <Button size="sm" className="absolute inset-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs" onClick={() => navigateTo('/stack')}>
                  Start
                </Button>
              )}
            </div>
            <span className="mt-2 text-xs text-muted-foreground font-medium">{t('stack')}</span>
          </div>
          
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${stackToCoreLine}%` }} />
          </div>
          
          {/* Core */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative border-2 transition-all duration-300
              ${hasCompletedCore ? 'border-primary bg-primary/10 text-primary' : hasStack ? 'border-primary/40 bg-muted text-primary/60' : 'border-muted-foreground/30 bg-muted text-muted-foreground'}`}>
              <Activity className="w-6 h-6" />
              {hasCompletedCore && <Check className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full p-0.5" />}
            </div>
            <span className="mt-2 text-xs text-muted-foreground font-medium">Core</span>
          </div>
          
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${coreToDaily}%` }} />
          </div>
          
          {/* Daily */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative border-2 transition-all duration-300
              ${hasCompletedDailyFour ? 'border-accent bg-accent/10 text-accent' : hasCompletedCore ? 'border-accent/40 bg-muted text-accent/60' : 'border-muted-foreground/30 bg-muted text-muted-foreground'}`}>
              <Video className="w-6 h-6" />
              {hasCompletedDailyFour && <Check className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full p-0.5" />}
            </div>
            <span className="mt-2 text-xs text-muted-foreground font-medium">Daily</span>
          </div>
          
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-700 ease-out" style={{ width: `${dailyToDoor}%` }} />
          </div>
          
          {/* Gateway */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative border-2 transition-all duration-300
              ${hasCompletedDoor ? 'border-accent bg-accent/10 text-accent' : hasCompletedDailyFour ? 'border-accent/40 bg-muted text-accent/60' : 'border-muted-foreground/30 bg-muted text-muted-foreground'}`}>
              <ListTodo className="w-6 h-6" />
              {hasCompletedDoor && <Check className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full p-0.5" />}
            </div>
            <span className="mt-2 text-xs text-muted-foreground font-medium">Gateway</span>
          </div>
        </div>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="goddess-tools" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            {language === 'en' ? 'RoWarrior Tools' : 'Unelte RoWarrior'}
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            {language === 'en' ? 'Courses' : 'Cursuri'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="goddess-tools" className="space-y-8">
          {/* Core & Daily Activities */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-6">
              {language === 'en' ? 'Core & Daily Activities' : 'Activități Core & Zilnice'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Core 4 Section */}
              <Card className="border border-border bg-card/50 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-foreground">Core 4</h4>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigateTo('/core')}>
                    {language === 'en' ? 'View' : 'Vezi'}
                  </Button>
                </div>
                
                {hasCompletedCore && hasShownCoreAnimation ? (
                  <WarriorPowerCard />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {coreItems.map(item => {
                      const isCompleted = coreData[selectedDay]?.[item.id] || false;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleCoreActivity(item.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border
                            ${isCompleted 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'bg-muted/50 border-border hover:bg-muted text-foreground'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                              {isCompleted ? <Check className="w-4 h-4" /> : item.icon}
                            </div>
                            <span className="text-xs font-medium truncate">{item.id.charAt(0).toUpperCase() + item.id.slice(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
              
              {/* Biz 4 Section */}
              <Card className="border border-border bg-card/50 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-foreground">Biz 4</h4>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigateTo('/daily-four')}>
                    {language === 'en' ? 'View' : 'Vezi'}
                  </Button>
                </div>
                
                {hasCompletedDailyFour && hasShownDailyAnimation ? (
                  <MediaMasterCard />
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {dailyFourItems.map(item => {
                      const isCompleted = item.completed;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleDailyActivity(item.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border
                            ${isCompleted 
                              ? 'bg-accent/10 border-accent/30 text-accent' 
                              : 'bg-muted/50 border-border hover:bg-muted text-foreground'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${isCompleted ? 'bg-accent text-accent-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                              {isCompleted ? <Check className="w-4 h-4" /> : item.icon}
                            </div>
                            <span className="text-xs font-medium">{item.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Weekly Two */}
                <div className="pt-4 border-t border-border">
                  <h5 className="text-sm font-medium text-muted-foreground mb-3">Weekly Two</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {weeklyItems.map(item => {
                      const isCompleted = item.completed;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleWeeklyActivity(item.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border
                            ${isCompleted 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'bg-muted/50 border-border hover:bg-muted text-foreground'}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isCompleted && <Check className="w-4 h-4" />}
                            <span className="text-xs font-medium">{item.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Hit List & Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border bg-card/50 p-5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-medium text-foreground">
                  {language === 'en' ? 'Hit List' : 'Lista Hit'}
                </h4>
                <Button variant="ghost" size="sm" onClick={() => navigateTo('/door')} className="text-muted-foreground hover:text-foreground">
                  {language === 'en' ? 'View' : 'Vezi'}
                </Button>
              </div>
              <div className="space-y-2">
                {hitList.filter(item => item.day === activeDay).length > 0 ? (
                  hitList.filter(item => item.day === activeDay).map(item => (
                    <div key={item.id} className={`flex items-center p-3 rounded-lg transition-all duration-200 ${item.completed ? 'bg-primary/10' : getPriorityColor(item.priority)}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-6 h-6 rounded-full mr-3 p-0 flex items-center justify-center ${item.completed ? 'bg-primary text-primary-foreground' : 'bg-transparent border border-muted-foreground/40'}`}
                        onClick={() => toggleHitListItemCompletion(item.id)}
                      >
                        {item.completed && <Check className="w-3 h-3" />}
                      </Button>
                      <span className={`flex-grow text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {item.text}
                      </span>
                      {!item.completed && getPriorityIcon(item.priority)}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <p className="text-sm">{language === 'en' ? 'No HIT items for today' : 'Nu există elemente HIT pentru astăzi'}</p>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyObjectives />
              <MonthlyObjectives />
            </div>
          </div>
          
          {/* Weekly Stats */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-6">
              {language === 'en' ? 'Weekly Stats' : 'Statistici Săptămânale'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Score Card */}
              <Card className="border border-border bg-card/50 p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">{language === 'en' ? 'Score' : 'Scor'}</h4>
                <div className="text-center">
                  <span className="text-4xl font-bold text-primary">{coreScore + dailyFourScore + weeklyTwoScore + doorScore}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('stack')}</span>
                    <span className="text-foreground">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Core</span>
                    <span className="text-foreground">{coreScore}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily</span>
                    <span className="text-foreground">{dailyFourScore + weeklyTwoScore}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gateway</span>
                    <span className="text-foreground">{doorScore}</span>
                  </div>
                </div>
              </Card>
              
              {/* Streaks Card */}
              <Card className="border border-border bg-card/50 p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">{language === 'en' ? 'Streaks' : 'Serii'}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t('stack'), value: streaks.stack },
                    { label: 'Core', value: streaks.core },
                    { label: 'Daily', value: streaks.dailyFour },
                    { label: 'Gateway', value: streaks.door }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                        <span className="text-lg font-semibold text-foreground">{item.value}</span>
                      </div>
                      <span className="mt-2 text-xs text-muted-foreground text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Totals Card */}
              <Card className="border border-border bg-card/50 p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">{language === 'en' ? 'Totals' : 'Totaluri'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('stack'), value: totals.stack },
                    { label: 'Core', value: totals.core },
                    { label: 'Daily', value: totals.dailyFour },
                    { label: 'Gateway', value: totals.door }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-foreground">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Rewards Showcase */}
            <div className="mt-6">
              <RewardsShowcase 
                currentLevel={xpData.currentLevel}
                onEquip={(rewardId) => {
                  const equippedKey = `equipped_${rewardId.split('_')[0]}`;
                  localStorage.setItem(equippedKey, rewardId);
                }}
                equippedRewards={{
                  theme: localStorage.getItem('equipped_theme') || undefined,
                  avatar: localStorage.getItem('equipped_avatar') || undefined,
                  frame: localStorage.getItem('equipped_frame') || undefined
                }}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <LearnDashboard 
            onCategorySelect={handleLearnCategorySelect} 
            activeCategory={activeLearnCategory} 
            categoryCounts={categoryCounts} 
            onSubcategorySelect={handleLearnSubcategorySelect} 
            activeSubcategory={activeLearnSubcategory} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
