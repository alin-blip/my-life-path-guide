// Dashboard component with Vision Board integration
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Book, BookOpen, CheckCircle2, Circle, ListTodo, Dumbbell, Heart, Brain, Briefcase, PenLine, MessageSquare, Send, Handshake, ArrowRight, RefreshCw, Compass, DollarSign, Users, Clock, Award, AlertTriangle, Check, Sparkles, Calendar as CalendarIcon, History } from 'lucide-react';
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
import { DailyCompactCard } from './daily/DailyCompactCard';
import { MonthlyMission, MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

// Import directly (avoid barrel export cycles)
import { TransformedWarrior, WarriorBadge } from '@/components/celebrations/TransformedWarrior';
import { MediaMaster, MediaBadge } from '@/components/celebrations/MediaMaster';
import { WarriorPowerCard } from '@/components/celebrations/WarriorPowerCard';
import { MediaMasterCard } from '@/components/celebrations/MediaMasterCard';
import { LevelUpCelebration } from '@/components/xp/LevelUpCelebration';
import { XPPopupContainer } from '@/components/xp/XPPopup';
import { useXPSystem } from '@/hooks/useXPSystem';
import { XPAwardEvent } from '@/services/xpService';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { BADGES, BadgeStats } from '@/components/challenge/badges/badgeDefinitions';
import { StreakMilestoneCelebration } from '@/components/gamification/StreakMilestoneCelebration';
import { BadgeUnlockCelebration } from '@/components/gamification/BadgeUnlockCelebration';
import { RewardsShowcase } from '@/components/gamification/RewardsShowcase';
import { ExplainerModal } from '@/components/dashboard/ExplainerModal';
import { VisionBoardWidget } from '@/components/vision-board/VisionBoardWidget';
import { MorningRoutine } from '@/components/habits/MorningRoutine';
import { ObjectivesCard } from '@/components/dashboard/ObjectivesCard';
export const Dashboard: React.FC = () => {
  const {
    language,
    t
  } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("goddess-tools");
  const [activeLearnCategory, setActiveLearnCategory] = useState<string | null>(null);
  const [activeLearnSubcategory, setActiveLearnSubcategory] = useState<string>("courses");
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Celebration overlays
  const [showWarriorOverlay, setShowWarriorOverlay] = useState(false);
  const [showMediaOverlay, setShowMediaOverlay] = useState(false);
  const [hasShownCoreAnimation, setHasShownCoreAnimation] = useState(false);
  const [hasShownDailyAnimation, setHasShownDailyAnimation] = useState(false);

  // Sound settings
  const {
    playSuccessSound
  } = useSoundSettings();

  // XP System
  const {
    xpData,
    recentXPGain,
    showLevelUp,
    newLevel,
    dismissLevelUp,
    addXP
  } = useXPSystem();

  // Streak tracking
  const {
    streakData
  } = useStreakTracking();

  // Reading progress for badge tracking
  const {
    progress: readingProgress,
    getOverallStats
  } = useReadingProgress();

  // Track if we've awarded XP for Core 4 / Biz 4 today
  const [hasAwardedCoreXP, setHasAwardedCoreXP] = useState(false);
  const [hasAwardedDailyXP, setHasAwardedDailyXP] = useState(false);

  // Gamification celebration states
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [streakMilestoneValue, setStreakMilestoneValue] = useState<7 | 30 | 100 | 365>(7);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<typeof BADGES[0] | null>(null);
  const [previouslyEarnedBadges, setPreviouslyEarnedBadges] = useState<string[]>([]);

  // Explainer modal states
  const [explainerModalType, setExplainerModalType] = useState<'core4' | 'biz4' | 'stack' | null>(null);
  const prevCategoryComplete = useRef<Record<string, boolean>>({
    body: false,
    relationship: false,
    being: false,
    business: false
  });
  const categoryCounts = {
    body: 12,
    balance: 8,
    being: 15,
    business: 10
  };
  const [userProgressData, setUserProgressData] = useState<any>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [visionBoard, setVisionBoard] = useState<any>(null);

  // Calculate badge stats
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

  // Check for new badge unlocks
  const earnedBadges = useMemo(() => {
    return BADGES.filter(badge => badge.requirement(badgeStats));
  }, [badgeStats]);

  // Trigger badge unlock celebration
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

  // Check for streak milestones
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

        // Award XP bonus for milestone
        const xpBonuses: Record<number, number> = {
          7: 100,
          30: 500,
          100: 1000,
          365: 5000
        };
        addXP(xpBonuses[milestone], `Streak Milestone: ${milestone} days`);
      }
    }
  }, [streakData.currentStreak, addXP]);
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

    // Listen for XP award events from xpService
    const handleXPAward = (event: CustomEvent<XPAwardEvent>) => {
      const {
        amount,
        reason
      } = event.detail;
      addXP(amount, reason);
    };
    window.addEventListener('progressUpdated', handleProgressUpdate);
    window.addEventListener('xp-award', handleXPAward as EventListener);
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      window.removeEventListener('xp-award', handleXPAward as EventListener);
    };
  }, [addXP]);
  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      // Check if user is logged in
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
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
        if (statsData) {} else {
          console.log('Fetched user statistics:', statsData);
          setUserStatistics(statsData);
          updateStats();
        }

        // Fetch Vision Board
        const {
          data: visionBoardData
        } = await supabase.from('vision_boards').select('*').eq('user_id', userId).maybeSingle();
        setVisionBoard(visionBoardData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  const [stackCount, setStackCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const loadProgressCounts = async () => {
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setStackCount(0);
        setJournalCount(0);
        return;
      }
      const today = new Date().toISOString().split('T')[0];

      // Check daily_progress table in Supabase
      const {
        data: dailyProgress
      } = await supabase.from('daily_progress').select('progress_data').eq('user_id', session.user.id).eq('date', today).maybeSingle();
      const progressData = dailyProgress?.progress_data as any;

      // Update stack count
      if (progressData?.stack?.completed || userProgressData?.stack_completed) {
        setStackCount(1);
      } else {
        setStackCount(0);
      }

      // Update journal count
      if (progressData?.journal?.completed || userProgressData?.journal_completed) {
        setJournalCount(1);
      } else {
        setJournalCount(0);
      }
    } catch (error) {
      console.error('Error loading progress counts:', error);
      setStackCount(0);
      setJournalCount(0);
    }
  };
  useEffect(() => {
    loadProgressCounts();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      loadProgressCounts();
    };
    window.addEventListener('progressUpdated', handleProgressUpdate);
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [userProgressData]);
  const updateStats = () => {
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
    if (stackCount > 0 && journalCount > 0 && coreScore === 8 && dailyFourScore === 4 && hitList.filter(item => item.completed).length === hitList.filter(item => item.day === activeDay).length && hitList.filter(item => item.day === activeDay).length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setShowConfetti(false);
    }

    // Check category completion for sound effects
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

    // Play sound when a category becomes complete
    if (bodyNowComplete && !prevCategoryComplete.current.body) {
      playSuccessSound();
    }
    if (relationshipNowComplete && !prevCategoryComplete.current.relationship) {
      playSuccessSound();
    }
    if (beingNowComplete && !prevCategoryComplete.current.being) {
      playSuccessSound();
    }
    if (businessNowComplete && !prevCategoryComplete.current.business) {
      playSuccessSound();
    }

    // Update prev state
    prevCategoryComplete.current = {
      body: bodyNowComplete,
      relationship: relationshipNowComplete,
      being: beingNowComplete,
      business: businessNowComplete
    };
  };
  const getCoreItems = () => {
    return [{
      id: 'fitness',
      title: language === 'en' ? '⚡ DISCIPLINE OF THE BODY' : '⚡ DISCIPLINA CORPULUI',
      icon: <Activity className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['fitness'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'fuel',
      title: language === 'en' ? '🍎 FUEL FOR SUBCONSCIOUS' : '🍎 COMBUSTIBIL SUBCONȘTIENT',
      icon: <Activity className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['fuel'] || false,
      color: 'bg-blue-600',
      category: 'body'
    }, {
      id: 'person1',
      title: language === 'en' ? '💝 LAW OF SERVICE #1' : '💝 LEGEA SERVIRII #1',
      icon: <Users className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['person1'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'person2',
      title: language === 'en' ? '💝 LAW OF SERVICE #2' : '💝 LEGEA SERVIRII #2',
      icon: <Users className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['person2'] || false,
      color: 'bg-blue-600',
      category: 'balance'
    }, {
      id: 'meditation',
      title: language === 'en' ? '🧘 AUTOSUGGESTION & FAITH' : '🧘 AUTOSUGESTIE ȘI CREDINȚĂ',
      icon: <Heart className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['meditation'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'memoirs',
      title: language === 'en' ? '✍️ SUBCONSCIOUS PROGRAMMING' : '✍️ PROGRAMARE SUBCONȘTIENT',
      icon: <Book className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['memoirs'] || false,
      color: 'bg-blue-600',
      category: 'being'
    }, {
      id: 'discover',
      title: language === 'en' ? '📚 SPECIALIZED KNOWLEDGE' : '📚 CUNOȘTINȚE SPECIALIZATE',
      icon: <Compass className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['discover'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }, {
      id: 'declare',
      title: language === 'en' ? '💰 ORGANIZED PLANNING' : '💰 PLANIFICARE ORGANIZATĂ',
      icon: <DollarSign className="h-6 w-6 text-white" />,
      completed: coreData[selectedDay]?.['declare'] || false,
      color: 'bg-blue-600',
      category: 'business'
    }];
  };
  const getDailyFourItems = () => {
    return [{
      id: 'video',
      title: 'CONTENT',
      icon: <PenLine className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'video')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'text',
      title: 'ENGAGE',
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'text')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'audio',
      title: 'OUTREACH',
      icon: <Send className="h-6 w-6 text-white" />,
      completed: dailyFourData[selectedDay]?.dailyActivities?.find((a: any) => a.id === 'audio')?.completed || false,
      color: 'bg-blue-600'
    }, {
      id: 'image',
      title: 'CLOSE',
      icon: <Handshake className="h-6 w-6 text-white" />,
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
  const clearCorePair = (activityIds: string[]) => {
    activityIds.forEach(id => updateCoreActivity(selectedDay, id, false));
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
        return 'bg-card';
    }
  };
  const getCategoryIcon = (category: MissionCategory) => {
    switch (category) {
      case 'body':
        return <Dumbbell className="h-4 w-4 text-red-400" />;
      case 'being':
        return <Brain className="h-4 w-4 text-blue-400" />;
      case 'balance':
        return <Heart className="h-4 w-4 text-green-400" />;
      case 'business':
        return <Briefcase className="h-4 w-4 text-purple-400" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };
  const getCategoryColor = (category: MissionCategory) => {
    switch (category) {
      case 'body':
        return 'border-red-500/30 bg-red-500/10';
      case 'being':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'balance':
        return 'border-green-500/30 bg-green-500/10';
      case 'business':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };
  const getCategoryName = (category: MissionCategory) => {
    if (language === 'en') {
      switch (category) {
        case 'body':
          return 'Body';
        case 'being':
          return 'Spirituality';
        case 'balance':
          return 'Relationships';
        case 'business':
          return 'Business';
        default:
          return category;
      }
    } else {
      switch (category) {
        case 'body':
          return 'Corp';
        case 'being':
          return 'Spiritualitate';
        case 'balance':
          return 'Relații';
        case 'business':
          return 'Afaceri';
        default:
          return category;
      }
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

  // Trigger Core 4 celebration and award XP
  useEffect(() => {
    if (hasCompletedCore && !hasShownCoreAnimation) {
      setShowWarriorOverlay(true);
      setHasShownCoreAnimation(true);

      // Award XP for Core 4 completion (once per day)
      if (!hasAwardedCoreXP) {
        addXP(100, 'Core 4 completat');
        setHasAwardedCoreXP(true);
      }
    }
  }, [hasCompletedCore, hasShownCoreAnimation, hasAwardedCoreXP, addXP]);

  // Trigger Daily Four celebration and award XP
  useEffect(() => {
    if (hasCompletedDailyFour && !hasShownDailyAnimation) {
      setShowMediaOverlay(true);
      setHasShownDailyAnimation(true);

      // Award XP for Biz 4 completion (once per day)
      if (!hasAwardedDailyXP) {
        addXP(100, 'Biz 4 completat');
        setHasAwardedDailyXP(true);
      }
    }
  }, [hasCompletedDailyFour, hasShownDailyAnimation, hasAwardedDailyXP, addXP]);

  // Reset animation and XP flags when day changes
  useEffect(() => {
    setHasShownCoreAnimation(hasCompletedCore);
    setHasShownDailyAnimation(hasCompletedDailyFour);
    setHasAwardedCoreXP(hasCompletedCore);
    setHasAwardedDailyXP(hasCompletedDailyFour);
  }, [selectedDay]);
  return <div className="w-full max-w-full py-4 px-2 md:py-8 md:px-4">
      {/* Celebration Overlays */}
      <TransformedWarrior isVisible={showWarriorOverlay} onClose={() => setShowWarriorOverlay(false)} />
      <MediaMaster isVisible={showMediaOverlay} onClose={() => setShowMediaOverlay(false)} />
      <LevelUpCelebration isOpen={showLevelUp} onClose={dismissLevelUp} newLevel={newLevel} />
      <XPPopupContainer recentGain={recentXPGain} />
      
      {/* Gamification Celebrations */}
      <StreakMilestoneCelebration isOpen={showStreakMilestone} onClose={() => setShowStreakMilestone(false)} streakDays={streakData.currentStreak} milestone={streakMilestoneValue} />
      <BadgeUnlockCelebration isOpen={showBadgeUnlock} onClose={() => setShowBadgeUnlock(false)} badge={unlockedBadge} />

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
      
      {/* Objectives Card - Lunar, 90 Zile, Anual */}
      <ObjectivesCard />
      
      <DailyCompactCard />
      
      {/* Morning Routine - Unified Habits + Start Day Flow */}
      <div className="mb-6">
        <MorningRoutine />
      </div>
      
      {/* Vision Board Widget */}
      <div className="mb-6">
        <VisionBoardWidget visionBoard={visionBoard} language={language} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 animate-fade-in" style={{
      animationDelay: '0.2s'
    }}>
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-4 glass-card p-1 rounded-xl">
          <TabsTrigger value="goddess-tools" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
            {language === 'en' ? 'RoWarrior Tools' : 'Unelte RoWarrior'}
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
            {language === 'en' ? 'Courses' : 'Cursuri'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="goddess-tools" className="space-y-6">
          <div className="mb-8">
            
            
            
            
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
              <div>
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-300 bg-clip-text text-transparent">
                    {language === 'en' ? 'HIT LIST' : 'LISTA HIT'}
                  </h3>
                </div>
                <Card className="bg-card border border-green-500/30 dark:border-green-500/20 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all duration-300">
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-2">
                      {hitList.filter(item => item.day === activeDay).length > 0 ? hitList.filter(item => item.day === activeDay).map(item => <div key={item.id} className={`flex items-center p-2 rounded-md transition-all duration-200 ${item.completed ? 'bg-green-500/10' : getPriorityColor(item.priority)}`}>
                            <Button variant="ghost" size="sm" className={`w-6 h-6 rounded-full mr-3 p-0 flex items-center justify-center ${item.completed ? 'bg-green-500 text-white' : 'bg-transparent border border-gray-400 text-gray-400'}`} onClick={() => toggleHitListItemCompletion(item.id)}>
                              {item.completed && <CheckCircle2 className="w-3 h-3" />}
                            </Button>
                            <span className={`flex-grow ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item.text}
                            </span>
                            {!item.completed && getPriorityIcon(item.priority)}
                          </div>) : <div className="text-center text-muted-foreground py-4">
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
              
              
              <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
                
                
                
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <LearnDashboard onCategorySelect={handleLearnCategorySelect} activeCategory={activeLearnCategory} categoryCounts={categoryCounts} onSubcategorySelect={handleLearnSubcategorySelect} activeSubcategory={activeLearnSubcategory} />
        </TabsContent>
      </Tabs>
      
      {/* Explainer Modal */}
      <ExplainerModal open={explainerModalType !== null} onOpenChange={open => !open && setExplainerModalType(null)} type={explainerModalType || 'core4'} />
    </div>;
};