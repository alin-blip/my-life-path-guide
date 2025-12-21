import { BookOpen, Flame, Trophy, Star, Award, Target, Zap, Crown, Medal, Sparkles, Heart, Rocket, Shield, Brain, Eye, Dumbbell, Users } from 'lucide-react';

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
  // New stats for Have It All areas
  bodyActivitiesCompleted?: number;
  beingActivitiesCompleted?: number;
  balanceActivitiesCompleted?: number;
  businessActivitiesCompleted?: number;
  challengeDaysCompleted?: number;
}

export const BADGES: Badge[] = [
  // ============ HAVE IT ALL CHALLENGE BADGES ============
  {
    id: 'have_it_all_starter',
    name: { en: 'Have It All Starter', ro: 'Start Have It All' },
    description: { en: 'Complete Day 1 of the Challenge', ro: 'Completează Ziua 1 a Provocării' },
    icon: 'Rocket',
    color: 'text-orange-500',
    tier: 'bronze',
    requirement: (stats) => (stats.challengeDaysCompleted || 0) >= 1,
    progress: (stats) => ({ current: Math.min(stats.challengeDaysCompleted || 0, 1), target: 1 })
  },
  {
    id: 'have_it_all_master',
    name: { en: 'Have It All Master', ro: 'Maestru Have It All' },
    description: { en: 'Complete the full 7-Day Challenge', ro: 'Completează întreaga Provocare de 7 Zile' },
    icon: 'Crown',
    color: 'text-amber-500',
    tier: 'platinum',
    requirement: (stats) => (stats.challengeDaysCompleted || 0) >= 7,
    progress: (stats) => ({ current: Math.min(stats.challengeDaysCompleted || 0, 7), target: 7 })
  },
  
  // ============ BODY BADGES ============
  {
    id: 'body_warrior_3',
    name: { en: 'Body Warrior', ro: 'Războinic Corporal' },
    description: { en: '3 days of physical activity', ro: '3 zile de activitate fizică' },
    icon: 'Dumbbell',
    color: 'text-green-500',
    tier: 'bronze',
    requirement: (stats) => (stats.bodyActivitiesCompleted || 0) >= 3,
    progress: (stats) => ({ current: Math.min(stats.bodyActivitiesCompleted || 0, 3), target: 3 })
  },
  {
    id: 'body_warrior_7',
    name: { en: 'Body Champion', ro: 'Campion Corporal' },
    description: { en: '7 days of physical activity', ro: '7 zile de activitate fizică' },
    icon: 'Dumbbell',
    color: 'text-green-600',
    tier: 'silver',
    requirement: (stats) => (stats.bodyActivitiesCompleted || 0) >= 7,
    progress: (stats) => ({ current: Math.min(stats.bodyActivitiesCompleted || 0, 7), target: 7 })
  },
  {
    id: 'body_warrior_30',
    name: { en: 'Body Master', ro: 'Maestru Corporal' },
    description: { en: '30 days of physical activity', ro: '30 zile de activitate fizică' },
    icon: 'Dumbbell',
    color: 'text-green-700',
    tier: 'gold',
    requirement: (stats) => (stats.bodyActivitiesCompleted || 0) >= 30,
    progress: (stats) => ({ current: Math.min(stats.bodyActivitiesCompleted || 0, 30), target: 30 })
  },
  
  // ============ BEING (SOUL) BADGES ============
  {
    id: 'soul_seeker_3',
    name: { en: 'Soul Seeker', ro: 'Căutător Spiritual' },
    description: { en: '3 meditation sessions', ro: '3 sesiuni de meditație' },
    icon: 'Sparkles',
    color: 'text-purple-500',
    tier: 'bronze',
    requirement: (stats) => (stats.beingActivitiesCompleted || 0) >= 3,
    progress: (stats) => ({ current: Math.min(stats.beingActivitiesCompleted || 0, 3), target: 3 })
  },
  {
    id: 'soul_seeker_7',
    name: { en: 'Inner Peace', ro: 'Pace Interioară' },
    description: { en: '7 meditation sessions', ro: '7 sesiuni de meditație' },
    icon: 'Sparkles',
    color: 'text-purple-600',
    tier: 'silver',
    requirement: (stats) => (stats.beingActivitiesCompleted || 0) >= 7,
    progress: (stats) => ({ current: Math.min(stats.beingActivitiesCompleted || 0, 7), target: 7 })
  },
  {
    id: 'soul_seeker_30',
    name: { en: 'Enlightened', ro: 'Iluminat' },
    description: { en: '30 meditation sessions', ro: '30 sesiuni de meditație' },
    icon: 'Eye',
    color: 'text-purple-700',
    tier: 'gold',
    requirement: (stats) => (stats.beingActivitiesCompleted || 0) >= 30,
    progress: (stats) => ({ current: Math.min(stats.beingActivitiesCompleted || 0, 30), target: 30 })
  },
  
  // ============ BALANCE (RELATIONSHIPS) BADGES ============
  {
    id: 'relationship_builder_3',
    name: { en: 'Relationship Builder', ro: 'Constructor de Relații' },
    description: { en: 'Add value to others 3 times', ro: 'Adaugă valoare altora de 3 ori' },
    icon: 'Heart',
    color: 'text-pink-500',
    tier: 'bronze',
    requirement: (stats) => (stats.balanceActivitiesCompleted || 0) >= 3,
    progress: (stats) => ({ current: Math.min(stats.balanceActivitiesCompleted || 0, 3), target: 3 })
  },
  {
    id: 'relationship_builder_7',
    name: { en: 'Love Ambassador', ro: 'Ambasador al Dragostei' },
    description: { en: 'Add value to others 7 times', ro: 'Adaugă valoare altora de 7 ori' },
    icon: 'Heart',
    color: 'text-pink-600',
    tier: 'silver',
    requirement: (stats) => (stats.balanceActivitiesCompleted || 0) >= 7,
    progress: (stats) => ({ current: Math.min(stats.balanceActivitiesCompleted || 0, 7), target: 7 })
  },
  {
    id: 'relationship_builder_30',
    name: { en: 'Connection Master', ro: 'Maestru al Conexiunilor' },
    description: { en: 'Add value to others 30 times', ro: 'Adaugă valoare altora de 30 ori' },
    icon: 'Users',
    color: 'text-pink-700',
    tier: 'gold',
    requirement: (stats) => (stats.balanceActivitiesCompleted || 0) >= 30,
    progress: (stats) => ({ current: Math.min(stats.balanceActivitiesCompleted || 0, 30), target: 30 })
  },
  
  // ============ BUSINESS BADGES ============
  {
    id: 'knowledge_seeker_3',
    name: { en: 'Knowledge Seeker', ro: 'Căutător de Cunoștințe' },
    description: { en: '3 business learning sessions', ro: '3 sesiuni de învățare business' },
    icon: 'BookOpen',
    color: 'text-blue-500',
    tier: 'bronze',
    requirement: (stats) => (stats.businessActivitiesCompleted || 0) >= 3,
    progress: (stats) => ({ current: Math.min(stats.businessActivitiesCompleted || 0, 3), target: 3 })
  },
  {
    id: 'knowledge_seeker_7',
    name: { en: 'Business Student', ro: 'Student Business' },
    description: { en: '7 business learning sessions', ro: '7 sesiuni de învățare business' },
    icon: 'BookOpen',
    color: 'text-blue-600',
    tier: 'silver',
    requirement: (stats) => (stats.businessActivitiesCompleted || 0) >= 7,
    progress: (stats) => ({ current: Math.min(stats.businessActivitiesCompleted || 0, 7), target: 7 })
  },
  {
    id: 'knowledge_seeker_30',
    name: { en: 'Business Master', ro: 'Maestru Business' },
    description: { en: '30 business learning sessions', ro: '30 sesiuni de învățare business' },
    icon: 'Brain',
    color: 'text-blue-700',
    tier: 'gold',
    requirement: (stats) => (stats.businessActivitiesCompleted || 0) >= 30,
    progress: (stats) => ({ current: Math.min(stats.businessActivitiesCompleted || 0, 30), target: 30 })
  },
  
  // ============ READING MILESTONES ============
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
  
  // ============ STREAK BADGES ============
  {
    id: 'streak_3',
    name: { en: 'Getting Started', ro: 'La Început' },
    description: { en: '3 day streak', ro: 'Streak de 3 zile' },
    icon: 'Flame',
    color: 'text-orange-400',
    tier: 'bronze',
    requirement: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 3), target: 3 })
  },
  {
    id: 'streak_7',
    name: { en: 'Week Achiever', ro: 'Realizator Săptămânal' },
    description: { en: '7 day streak', ro: 'Streak de 7 zile' },
    icon: 'Flame',
    color: 'text-orange-500',
    tier: 'silver',
    requirement: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 7), target: 7 })
  },
  {
    id: 'streak_30',
    name: { en: 'Monthly Master', ro: 'Maestru Lunar' },
    description: { en: '30 day streak', ro: 'Streak de 30 zile' },
    icon: 'Flame',
    color: 'text-orange-600',
    tier: 'gold',
    requirement: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 30), target: 30 })
  },
  {
    id: 'streak_100',
    name: { en: 'Unstoppable', ro: 'De Neoprit' },
    description: { en: '100 day streak', ro: 'Streak de 100 zile' },
    icon: 'Zap',
    color: 'text-yellow-500',
    tier: 'platinum',
    requirement: (stats) => stats.currentStreak >= 100 || stats.longestStreak >= 100,
    progress: (stats) => ({ current: Math.min(Math.max(stats.currentStreak, stats.longestStreak), 100), target: 100 })
  },
  
  // ============ ACTION BADGES ============
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
  
  // ============ PRINCIPLE BADGES ============
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
    name: { en: 'Success Principles Master', ro: 'Maestru Success Principles' },
    description: { en: 'Master all 13 principles', ro: 'Stăpânește toate 13 principiile' },
    icon: 'Crown',
    color: 'text-purple-600',
    tier: 'platinum',
    requirement: (stats) => stats.principlesMastered >= 13,
    progress: (stats) => ({ current: Math.min(stats.principlesMastered, 13), target: 13 })
  },
  
  // ============ SPECIAL BADGES ============
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
