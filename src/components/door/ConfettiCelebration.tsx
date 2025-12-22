import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { haptic } from '@/utils/hapticFeedback';

interface ConfettiCelebrationProps {
  totalTasks: number;
  completedTasks: number;
  enabled?: boolean;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  totalTasks,
  completedTasks,
  enabled = true
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const hasTriggeredRef = useRef(false);
  const prevCompletedRef = useRef(completedTasks);

  const triggerConfetti = useCallback(() => {
    // Fire confetti from both sides
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });
      
      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });
    }, 250);

    // Big burst in center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
      zIndex: 9999
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
    const justCompleted = completedTasks > prevCompletedRef.current;

    // Trigger when all tasks are completed for the first time
    if (allCompleted && justCompleted && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      // Haptic feedback
      haptic.success();
      
      // Trigger confetti
      triggerConfetti();

      // Show celebration toast
      toast({
        title: language === 'en' ? '🎉 All tasks completed!' : '🎉 Toate sarcinile completate!',
        description: language === 'en' 
          ? 'Amazing work! You crushed it today!' 
          : 'Muncă extraordinară! Ai reușit azi!',
      });
    }

    // Reset when tasks change (new day or tasks added)
    if (!allCompleted && hasTriggeredRef.current) {
      hasTriggeredRef.current = false;
    }

    prevCompletedRef.current = completedTasks;
  }, [totalTasks, completedTasks, enabled, triggerConfetti, toast, language]);

  return null; // This component doesn't render anything
};

// Hook version for use in other components
export const useConfettiCelebration = () => {
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      });
    }, 250);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
      zIndex: 9999
    });

    haptic.success();
  }, []);

  const triggerSmallCelebration = useCallback(() => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#FFD700', '#00CED1'],
      zIndex: 9999
    });
    haptic.light();
  }, []);

  return { triggerConfetti, triggerSmallCelebration };
};
