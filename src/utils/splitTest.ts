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
 * Get variant display info for analytics/debugging
 */
export function getVariantInfo(variant: SplitVariant): {
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
