/**
 * Single source of truth for tier-based route access.
 * Consumed by ProtectedRoute (enforcement) and SideMenu / TierLock (UI hints).
 */

export type Tier = 'free' | 'basic' | 'pro' | 'elite';

export const TIER_LEVEL: Record<Tier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

// Routes available for FREE tier (habits, challenges, lead-magnet pages, public marketing)
export const FREE_TIER_ROUTES: string[] = [
  '/dashboard',
  '/habits',
  '/challenge',
  '/challenge-7-zile',
  '/challenge-upsell',
  '/settings',
  '/profile',
  '/fact-maps',
  '/game-objectives',
  '/game',
  '/vibe-canvas',
  '/warriors-way',
  '/programs',
  '/messages',
  '/groups',
];

// Routes available for BASIC tier (full platform except LIVE / VIP / Elite)
export const BASIC_ROUTES: string[] = [
  ...FREE_TIER_ROUTES,
  '/door',
  '/champion-routine',
  '/stacks',
  '/journal',
  '/insights',
  '/focus',
  '/clarity',
  '/anger',
  '/daily-flow',
  '/nutrition',
  '/activity',
  '/workouts',
  '/meditation',
  '/breathing',
  '/visualization',
  '/autosuggestion',
  '/gratitude',
  '/learn',
  '/apply',
  '/reading',
  '/evening',
  '/ai-coaching',
  '/lifebook',
  '/tools',
  '/stack',
  '/stack-library',
  '/master-plan',
  '/core',
  '/daily-four',
  '/library',
  '/notes',
  '/business',
  '/voice-analysis',
  '/daily-timeline',
  '/empowerment-meditation',
  '/biz4-report',
  '/champion-routine-history',
  '/workout',
  '/workout-history',
  '/relationships',
  '/widget-dashboard',
  '/leaderboard',
  '/achievements',
  '/emotional-tracker',
  '/time-tracker',
  '/accountability-coach',
  '/quick-quiz',
  '/coach',
  '/personal-power',
  '/ultimate-you',
  '/mind-coach',
  '/mind-shifting',
  '/minte',
  '/credinte',
  '/biblioteca-credintelor',
  '/marriage',
  '/marriage-quiz',
  '/parenting',
  '/support',
  '/dashboard/settings',
  '/warrior-accelerator-thank-you',
  '/vision-2026',
  '/vision-board',
];

// Routes that require PRO tier (LIVE coaching, VIP community)
export const PRO_REQUIRED_ROUTES: string[] = [
  '/brotherhood',
  '/live-coaching',
];

// Routes that require ELITE tier
export const ELITE_ONLY_ROUTES: string[] = [
  '/warrior-launch-accelerator',
];

/**
 * Returns the minimum tier required to access a given path.
 * Longest-prefix match wins so `/coach/live` beats `/coach`.
 */
export function getRequiredTier(pathname: string): Tier {
  const path = (pathname || '').split('?')[0];
  if (!path) return 'free';

  const match = (route: string) => path === route || path.startsWith(route + '/') || path.startsWith(route);

  // Order matters: check highest tier first, then longest prefix wins within.
  const eliteHit = ELITE_ONLY_ROUTES.filter(match).sort((a, b) => b.length - a.length)[0];
  if (eliteHit) return 'elite';

  const proHit = PRO_REQUIRED_ROUTES.filter(match).sort((a, b) => b.length - a.length)[0];
  if (proHit) return 'pro';

  const freeHit = FREE_TIER_ROUTES.filter(match).sort((a, b) => b.length - a.length)[0];
  const basicHit = BASIC_ROUTES.filter(match).sort((a, b) => b.length - a.length)[0];

  // If both match, the longer / more specific one wins.
  if (freeHit && (!basicHit || freeHit.length >= basicHit.length)) return 'free';
  if (basicHit) return 'basic';

  // Unknown protected route → require basic by default (safer than free).
  return 'basic';
}
