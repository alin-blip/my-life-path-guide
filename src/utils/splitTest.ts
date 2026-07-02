/**
 * Split Test Utility for Warrior Power & Life Score Lead Magnets
 *
 * Variants (equal 33/33/33 distribution):
 * Warrior Power:
 *   A → /warrior-launch-accelerator (premium offer)
 *   B → results page (current flow)
 *   C → / (explore platform)
 *
 * Life Score:
 *   A → /challenge
 *   B → /dashboard
 *   C → /warrior-launch-accelerator
 */

export type SplitVariant = 'A' | 'B' | 'C';

/** Random variant with equal distribution (33/33/33). */
export function getRandomVariant(): SplitVariant {
  const r = Math.random();
  if (r < 0.33) return 'A';
  if (r < 0.66) return 'B';
  return 'C';
}

function assignForKey(storageKey: string): SplitVariant {
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing === 'A' || existing === 'B' || existing === 'C') return existing;
  } catch {
    // localStorage unavailable — fall through
  }
  const variant = getRandomVariant();
  try {
    localStorage.setItem(storageKey, variant);
  } catch {
    // ignore write failures
  }
  return variant;
}

function keyFor(prefix: string, email: string): string {
  return `${prefix}_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

/** Sticky variant assignment per email for Warrior Power funnel. */
export function assignWarriorPowerVariant(email: string): SplitVariant {
  return assignForKey(keyFor('wp_split', email));
}

/** Sticky variant assignment per email for Life Score funnel. */
export function assignLifeScoreVariant(email: string): SplitVariant {
  return assignForKey(keyFor('ls_split', email));
}

export function getWarriorPowerVariantInfo(variant: SplitVariant): {
  name: string;
  description: string;
  destination: string;
} {
  switch (variant) {
    case 'A':
      return {
        name: 'Warrior Launch Accelerator',
        description: 'Redirect to premium offer page',
        destination: '/warrior-launch-accelerator',
      };
    case 'B':
      return {
        name: 'Results Page',
        description: 'Show full results with challenge upsell',
        destination: 'results-page',
      };
    case 'C':
      return {
        name: 'Platform Explore',
        description: 'Redirect to homepage to explore',
        destination: '/',
      };
  }
}

export function getLifeScoreVariantInfo(variant: SplitVariant): {
  name: string;
  description: string;
  destination: string;
} {
  switch (variant) {
    case 'A':
      return { name: 'Challenge', description: 'Redirect to 7-day challenge', destination: '/challenge' };
    case 'B':
      return { name: 'Dashboard', description: 'Direct access to app dashboard', destination: '/dashboard' };
    case 'C':
      return {
        name: 'Warrior Launch Accelerator',
        description: 'Premium offer for business performers',
        destination: '/warrior-launch-accelerator',
      };
  }
}
