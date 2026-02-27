import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTourContext } from '@/context/TourContext';

const TOUR_STORAGE_KEY = 'ceomindos-onboarding-tour-completed';
const TOUR_SKIPPED_KEY = 'ceomindos-onboarding-tour-skipped';

interface UseOnboardingTourReturn {
  isTourOpen: boolean;
  startTour: () => void;
  completeTour: () => void;
  skipTour: () => void;
  resetTour: () => void;
  hasCompletedTour: boolean;
  hasSkippedTour: boolean;
}

export function useOnboardingTour(): UseOnboardingTourReturn {
  const { user } = useAuth();
  const { setIsTourActive } = useTourContext();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [hasSkippedTour, setHasSkippedTour] = useState(false);

  // Check if tour was completed/skipped
  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const completedKey = `${TOUR_STORAGE_KEY}-${userId}`;
    const skippedKey = `${TOUR_SKIPPED_KEY}-${userId}`;

    const completed = localStorage.getItem(completedKey) === 'true';
    const skipped = localStorage.getItem(skippedKey) === 'true';

    setHasCompletedTour(completed);
    setHasSkippedTour(skipped);

    // Auto-start tour for new users (never completed or skipped)
    if (!completed && !skipped) {
      // Delay to let dashboard render
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
    setIsTourActive(true);
  }, [setIsTourActive]);

  const completeTour = useCallback(() => {
    if (user) {
      const completedKey = `${TOUR_STORAGE_KEY}-${user.id}`;
      localStorage.setItem(completedKey, 'true');
      setHasCompletedTour(true);
    }
    setIsTourOpen(false);
    setIsTourActive(false);
  }, [user, setIsTourActive]);

  const skipTour = useCallback(() => {
    if (user) {
      const skippedKey = `${TOUR_SKIPPED_KEY}-${user.id}`;
      localStorage.setItem(skippedKey, 'true');
      setHasSkippedTour(true);
    }
    setIsTourOpen(false);
    setIsTourActive(false);
  }, [user, setIsTourActive]);

  const resetTour = useCallback(() => {
    if (user) {
      const completedKey = `${TOUR_STORAGE_KEY}-${user.id}`;
      const skippedKey = `${TOUR_SKIPPED_KEY}-${user.id}`;
      localStorage.removeItem(completedKey);
      localStorage.removeItem(skippedKey);
      setHasCompletedTour(false);
      setHasSkippedTour(false);
    }
  }, [user]);

  return {
    isTourOpen,
    startTour,
    completeTour,
    skipTour,
    resetTour,
    hasCompletedTour,
    hasSkippedTour
  };
}
