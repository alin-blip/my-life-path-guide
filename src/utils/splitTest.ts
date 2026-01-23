/**
 * Split Test Utility for Warrior Power Lead Magnet
 * 
 * Variants:
 * A (33%): Redirect to /warrior-launch-accelerator
 * B (33%): Show results page (current flow)
 * C (33%): Redirect to / (explore platform)
 */

export type SplitVariant = 'A' | 'B' | 'C';

/**
 * Generate a random split test variant with equal distribution (33/33/33)
 */
export function getRandomVariant(): SplitVariant {
  const random = Math.random();
  if (random < 0.33) return 'A';
  if (random < 0.66) return 'B';
  return 'C';
}

/**
 * Get or assign a variant for a specific email
 * Ensures consistency if user returns to the flow
 */
export function assignWarriorPowerVariant(email: string): SplitVariant {
  const storageKey = `wp_split_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  
  // Check if already assigned
  const existing = localStorage.getItem(storageKey);
  if (existing && ['A', 'B', 'C'].includes(existing)) {
    return existing as SplitVariant;
  }
  
  // Assign new variant
  const variant = getRandomVariant();
  localStorage.setItem(storageKey, variant);
  
  return variant;
}

/**
 * Get or assign a Life Score variant for a specific email
 * Ensures consistency if user returns to the flow
 */
export function assignLifeScoreVariant(email: string): SplitVariant {
  const storageKey = `ls_split_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  
  // Check if already assigned
  const existing = localStorage.getItem(storageKey);
  if (existing && ['A', 'B', 'C'].includes(existing)) {
    return existing as SplitVariant;
  }
  
  // Assign new variant
  const variant = getRandomVariant();
  localStorage.setItem(storageKey, variant);
  
  return variant;
}

/**
 * Get variant display info for Warrior Power analytics/debugging
 */
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
        destination: '/warrior-launch-accelerator'
      };
    case 'B':
      return {
        name: 'Results Page',
        description: 'Show full results with challenge upsell',
        destination: 'results-page'
      };
    case 'C':
      return {
        name: 'Platform Explore',
        description: 'Redirect to homepage to explore',
        destination: '/'
      };
  }
}

/**
 * Get variant display info for Life Score analytics/debugging
 */
export function getLifeScoreVariantInfo(variant: SplitVariant): {
  name: string;
  description: string;
  destination: string;
} {
  switch (variant) {
    case 'A':
      return {
        name: 'Challenge',
        description: 'Redirect to 7-day challenge',
        destination: '/challenge'
      };
    case 'B':
      return {
        name: 'Dashboard',
        description: 'Direct access to app dashboard',
        destination: '/dashboard'
      };
    case 'C':
      return {
        name: 'Warrior Launch Accelerator',
        description: 'Premium offer for business performers',
        destination: '/warrior-launch-accelerator'
      };
  }
}
