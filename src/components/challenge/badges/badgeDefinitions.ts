import { BookOpen, Flame, Trophy, Star, Award, Target, Zap, Crown, Medal, Sparkles, Heart, Rocket, Shield, Brain, Eye } from 'lucide-react';

export interface Badge {
  id: string;
  name: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: string;
  color: string;
  requirement: (stats: BadgeStats) => boolean;
  progress: (stats: BadgeStats) => { current: number; target: number };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface BadgeStats {
  totalPagesRead: number;
  totalActionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  principlesStarted: number;
  principlesMastered: number;
  totalDaysActive: number;
}

export const BADGES: Badge[] = [
  // Reading Milestones
  {
    id: 'first_page',
    name: { en: 'First Step', ro: 'Primul Pas' },
    description: { en: 'Read your first page', ro: 'Citește prima ta pagină' },
    icon: 'BookOpen',
    color: 'text-blue-500',
    tier: 'bronze',
    requirement: (stats) => stats.totalPagesRead >= 1,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 1), target: 1 })
  },
  {
    id: 'reader_10',
    name: { en: 'Dedicated Reader', ro: 'Cititor Dedicat' },
    description: { en: 'Read 10 pages', ro: 'Citește 10 pagini' },
    icon: 'BookOpen',
    color: 'text-blue-500',
    tier: 'bronze',
    requirement: (stats) => stats.totalPagesRead >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 10), target: 10 })
  },
  {
    id: 'reader_50',
    name: { en: 'Avid Reader', ro: 'Cititor Avid' },
    description: { en: 'Read 50 pages', ro: 'Citește 50 pagini' },
    icon: 'BookOpen',
    color: 'text-blue-600',
    tier: 'silver',
    requirement: (stats) => stats.totalPagesRead >= 50,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 50), target: 50 })
  },
  {
    id: 'reader_100',
    name: { en: 'Century Reader', ro: 'Centenar' },
    description: { en: 'Read 100 pages', ro: 'Citește 100 pagini' },
    icon: 'Medal',
    color: 'text-amber-500',
    tier: 'gold',
    requirement: (stats) => stats.totalPagesRead >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 100), target: 100 })
  },
  {
    id: 'reader_365',
    name: { en: 'Year Master', ro: 'Maestru Anual' },
    description: { en: 'Complete all 365 pages', ro: 'Completează toate 365 pagini' },
    icon: 'Crown',
    color: 'text-purple-500',
    tier: 'platinum',
    requirement: (stats) => stats.totalPagesRead >= 365,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 365), target: 365 })
  },
  
  // Streak Badges
  {
    id: 'streak_3',
    name: { en: 'Getting Started', ro: 'La Început' },
    description: { en: '3 day reading streak', ro: 'Streak de 3 zile' },
    icon: 'Flame',
    color: 'text-orange-400',
    tier: 'bronze',
    requirement: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 3), target: 3 })
  },
  {
    id: 'streak_7',
    name: { en: 'Week Warrior', ro: 'Războinic Săptămânal' },
    description: { en: '7 day reading streak', ro: 'Streak de 7 zile' },
    icon: 'Flame',
    color: 'text-orange-500',
    tier: 'silver',
    requirement: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 7), target: 7 })
  },
  {
    id: 'streak_30',
    name: { en: 'Monthly Master', ro: 'Maestru Lunar' },
    description: { en: '30 day reading streak', ro: 'Streak de 30 zile' },
    icon: 'Flame',
    color: 'text-orange-600',
    tier: 'gold',
    requirement: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 30), target: 30 })
  },
  {
    id: 'streak_100',
    name: { en: 'Unstoppable', ro: 'De Neoprit' },
    description: { en: '100 day reading streak', ro: 'Streak de 100 zile' },
    icon: 'Zap',
    color: 'text-yellow-500',
    tier: 'platinum',
    requirement: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 100), target: 100 })
  },
  
  // Action Badges
  {
    id: 'action_5',
    name: { en: 'Action Taker', ro: 'Om de Acțiune' },
    description: { en: 'Complete 5 daily actions', ro: 'Completează 5 acțiuni zilnice' },
    icon: 'Target',
    color: 'text-green-500',
    tier: 'bronze',
    requirement: (stats) => stats.totalActionsCompleted >= 5,
    progress: (stats) => ({ current: Math.min(stats.totalActionsCompleted, 5), target: 5 })
  },
  {
    id: 'action_25',
    name: { en: 'Consistent Actor', ro: 'Actor Consistent' },
    description: { en: 'Complete 25 daily actions', ro: 'Completează 25 acțiuni zilnice' },
    icon: 'Target',
    color: 'text-green-600',
    tier: 'silver',
    requirement: (stats) => stats.totalActionsCompleted >= 25,
    progress: (stats) => ({ current: Math.min(stats.totalActionsCompleted, 25), target: 25 })
  },
  {
    id: 'action_100',
    name: { en: 'Action Master', ro: 'Maestru al Acțiunii' },
    description: { en: 'Complete 100 daily actions', ro: 'Completează 100 acțiuni zilnice' },
    icon: 'Award',
    color: 'text-green-700',
    tier: 'gold',
    requirement: (stats) => stats.totalActionsCompleted >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalActionsCompleted, 100), target: 100 })
  },
  
  // Principle Badges
  {
    id: 'principle_1',
    name: { en: 'Principle Explorer', ro: 'Explorator de Principii' },
    description: { en: 'Master 1 principle (80%+)', ro: 'Stăpânește 1 principiu (80%+)' },
    icon: 'Star',
    color: 'text-amber-400',
    tier: 'bronze',
    requirement: (stats) => stats.principlesMastered >= 1,
    progress: (stats) => ({ current: Math.min(stats.principlesMastered, 1), target: 1 })
  },
  {
    id: 'principle_5',
    name: { en: 'Wisdom Seeker', ro: 'Căutător de Înțelepciune' },
    description: { en: 'Master 5 principles', ro: 'Stăpânește 5 principii' },
    icon: 'Brain',
    color: 'text-amber-500',
    tier: 'silver',
    requirement: (stats) => stats.principlesMastered >= 5,
    progress: (stats) => ({ current: Math.min(stats.principlesMastered, 5), target: 5 })
  },
  {
    id: 'principle_10',
    name: { en: 'Near Enlightenment', ro: 'Aproape de Iluminare' },
    description: { en: 'Master 10 principles', ro: 'Stăpânește 10 principii' },
    icon: 'Eye',
    color: 'text-amber-600',
    tier: 'gold',
    requirement: (stats) => stats.principlesMastered >= 10,
    progress: (stats) => ({ current: Math.min(stats.principlesMastered, 10), target: 10 })
  },
  {
    id: 'principle_13',
    name: { en: 'Napoleon Hill Master', ro: 'Maestru Napoleon Hill' },
    description: { en: 'Master all 13 principles', ro: 'Stăpânește toate 13 principiile' },
    icon: 'Crown',
    color: 'text-purple-600',
    tier: 'platinum',
    requirement: (stats) => stats.principlesMastered >= 13,
    progress: (stats) => ({ current: Math.min(stats.principlesMastered, 13), target: 13 })
  },
  
  // Special Badges
  {
    id: 'balanced',
    name: { en: 'Balanced Learner', ro: 'Învățăcel Echilibrat' },
    description: { en: 'Start all 13 principles', ro: 'Începe toate 13 principiile' },
    icon: 'Sparkles',
    color: 'text-pink-500',
    tier: 'silver',
    requirement: (stats) => stats.principlesStarted >= 13,
    progress: (stats) => ({ current: Math.min(stats.principlesStarted, 13), target: 13 })
  },
  {
    id: 'dedication',
    name: { en: 'True Dedication', ro: 'Dedicație Adevărată' },
    description: { en: 'Be active for 30 days total', ro: 'Fii activ 30 zile în total' },
    icon: 'Heart',
    color: 'text-red-500',
    tier: 'silver',
    requirement: (stats) => stats.totalDaysActive >= 30,
    progress: (stats) => ({ current: Math.min(stats.totalDaysActive, 30), target: 30 })
  },
  {
    id: 'rocket',
    name: { en: 'Fast Starter', ro: 'Start Rapid' },
    description: { en: 'Read 10 pages in your first week', ro: 'Citește 10 pagini în prima săptămână' },
    icon: 'Rocket',
    color: 'text-indigo-500',
    tier: 'silver',
    requirement: (stats) => stats.totalPagesRead >= 10 && stats.totalDaysActive <= 7,
    progress: (stats) => ({ current: Math.min(stats.totalPagesRead, 10), target: 10 })
  }
];

export const TIER_COLORS = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-purple-400 to-indigo-600'
};

export const TIER_BG = {
  bronze: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
  silver: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/30',
  gold: 'bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-800/30',
  platinum: 'bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-800/30'
};
