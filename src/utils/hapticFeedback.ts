/**
 * Haptic feedback utility using Web Vibration API
 * Works on mobile browsers, desktop may not support it
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'celebration';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,           // Light tap
  medium: 20,          // Standard click
  heavy: 50,           // Long press
  success: [10, 50, 10],  // Double tap
  error: [50, 100, 50],   // Longer vibration
  warning: [20, 40, 20],  // Distinct pattern
  celebration: [10, 30, 10, 30, 50]  // Celebratory vibration
};

export class HapticFeedback {
  private static isSupported(): boolean {
    return 'vibrate' in navigator;
  }

  /**
   * Trigger haptic feedback with specified pattern
   */
  static trigger(pattern: HapticPattern = 'medium'): void {
    if (!this.isSupported()) {
      console.debug('Vibration API not supported');
      return;
    }

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('Failed to trigger haptic feedback:', error);
    }
  }

  /**
   * Trigger custom haptic pattern
   */
  static custom(duration: number | number[]): void {
    if (!this.isSupported()) return;

    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('Failed to trigger custom haptic:', error);
    }
  }

  /**
   * Stop all vibrations
   */
  static stop(): void {
    if (!this.isSupported()) return;

    try {
      navigator.vibrate(0);
    } catch (error) {
      console.warn('Failed to stop vibration:', error);
    }
  }
}

// Convenience exports
export const haptic = {
  light: () => HapticFeedback.trigger('light'),
  medium: () => HapticFeedback.trigger('medium'),
  heavy: () => HapticFeedback.trigger('heavy'),
  success: () => HapticFeedback.trigger('success'),
  error: () => HapticFeedback.trigger('error'),
  warning: () => HapticFeedback.trigger('warning'),
  celebration: () => HapticFeedback.trigger('celebration'),
  custom: (pattern: number | number[]) => HapticFeedback.custom(pattern),
  stop: () => HapticFeedback.stop()
};
