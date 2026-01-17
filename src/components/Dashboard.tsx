// Dashboard component with Vision Board integration
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Book, BookOpen, CheckCircle2, Circle, ListTodo, Dumbbell, Heart, Brain, Briefcase, PenLine, MessageSquare, Send, Handshake, ArrowRight, RefreshCw, Compass, DollarSign, Users, Clock, Award, AlertTriangle, Check, Sparkles, Calendar as CalendarIcon, History } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDoor } from '@/context/DoorContext';
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
// StreakMilestoneCelebration removed
import { BadgeUnlockCelebration } from '@/components/gamification/BadgeUnlockCelebration';
import { RewardsShowcase } from '@/components/gamification/RewardsShowcase';
import { ExplainerModal } from '@/components/dashboard/ExplainerModal';

import { MorningRoutine } from '@/components/habits/MorningRoutine';
import { ObjectivesCard } from '@/components/dashboard/ObjectivesCard';
import { EveningRoutineCard } from '@/components/dashboard/EveningRoutineCard';
import { DailyHabitsSection } from '@/components/habits/DailyHabitsSection';
import { SundayPlanningModal } from '@/components/dashboard/SundayPlanningModal';

// Onboarding components
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { FoundationNotifications } from '@/components/onboarding/FoundationNotifications';
import { WeeklyPlanningNotification } from '@/components/door/WeeklyPlanningNotification';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { WidgetGrid, WidgetSelector, DailyCommandCenterWidget } from '@/components/dashboard/widgets';
import { ChampionRoutineWidget } from '@/components/dashboard/widgets/ChampionRoutineWidget';
import { VisionDeclarationWidget } from '@/components/dashboard/widgets/VisionDeclarationWidget';

import { EmpowermentMeditationCard } from '@/components/dashboard/EmpowermentMeditationCard';
import { AcceleratorBanner } from '@/components/dashboard/AcceleratorBanner';

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
  } = useDoor();
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

  // Gamification celebration states (streak milestone removed)
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<typeof BADGES[0] | null>(null);

  // Sunday Planning Modal
  const [showSundayPlanning, setShowSundayPlanning] = useState(false);

  // Onboarding Wizard
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const foundationStatus = useFoundationStatus();

  // Dashboard Widgets
  const { 
    widgets, 
    customWidgets,
    toggleWidget, 
    toggleCustomWidgetOnDashboard,
    reorderWidgets, 
    resizeWidget, 
    getEnabledWidgets,
    getActiveCustomWidgets 
  } = useDashboardWidgets();

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

  // Badge unlock celebration disabled to prevent popup spam
  const previouslyEarnedBadgesRef = useRef<string[]>([]);
  useEffect(() => {
    const earnedIds = earnedBadges.map((b) => b.id);
    previouslyEarnedBadgesRef.current = earnedIds;
  }, [earnedBadges]);

  // Streak milestone celebration removed
  // Initial data fetch - runs only once on mount
  useEffect(() => {
    syncData();
    updateStats();
    fetchUserData();

    // Check if it's Sunday and we haven't shown the planning modal this week
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const shownWeek = localStorage.getItem('sundayPlanningShown');
    const currentWeek = `${today.getFullYear()}-${String(Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}`;
    
    if (isSunday && shownWeek !== currentWeek) {
      setShowSundayPlanning(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Daily popup - shows once per day if there are pending items
  useEffect(() => {
    if (foundationStatus.isLoading) return;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const shownToday = localStorage.getItem('onboarding-wizard-shown-today');
    
    if (shownToday !== today && !foundationStatus.isFoundationComplete) {
      const timer = setTimeout(() => {
        setShowOnboardingWizard(true);
        localStorage.setItem('onboarding-wizard-shown-today', today);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [foundationStatus.isLoading, foundationStatus.isFoundationComplete]);

  // Listen for progress updates and XP events
  useEffect(() => {
    const handleProgressUpdate = (event: any) => {
      console.log('Progress updated:', event.detail);
      updateStats();
      fetchUserData();
    };

    // Listen for XP award events from xpService
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
      
      {/* Badge Unlock Celebration */}
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
      
      {/* Accelerator Upsell Banner - FIRST */}
      <AcceleratorBanner />
      
      {/* Objectives Card - Lunar, 90 Zile, Anual */}
      <ObjectivesCard />
      
      {/* Daily Command Center - Main Score Widget */}
      <div className="mb-6">
        <DailyCommandCenterWidget />
      </div>
      
      {/* Vision Declaration Widget - Napoleon Hill */}
      <div className="mb-6">
        <VisionDeclarationWidget />
      </div>
      
      {/* Empowerment Meditation Card */}
      <div className="mb-6">
        <EmpowermentMeditationCard />
      </div>
      <DailyCompactCard />
      
      {/* Widgets section removed */}
      
      
      {/* Evening Routine Card */}
      <div className="mb-6">
        <EveningRoutineCard />
      </div>
      
      {/* Sunday Planning Modal */}
      <SundayPlanningModal 
        isOpen={showSundayPlanning} 
        onClose={() => setShowSundayPlanning(false)} 
      />
      
      {/* Weekly Planning Notification (Monday) */}
      <WeeklyPlanningNotification />
      
      {/* Onboarding Wizard */}
      <OnboardingWizard 
        isOpen={showOnboardingWizard} 
        onClose={() => setShowOnboardingWizard(false)} 
      />
      
      {/* Foundation Notifications (corner) */}
      <FoundationNotifications onOpenWizard={() => setShowOnboardingWizard(true)} />
      
      {/* Explainer Modal */}
      <ExplainerModal open={explainerModalType !== null} onOpenChange={open => !open && setExplainerModalType(null)} type={explainerModalType || 'core4'} />
    </div>;
};