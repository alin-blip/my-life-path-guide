import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepCompletionAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function StepCompletionAnimation({ show, onComplete }: StepCompletionAnimationProps) {
  useEffect(() => {
    if (show) {
      // Mini confetti burst
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        scalar: 0.8,
        gravity: 1.2,
      });

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-green-500/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0] }}
              transition={{ duration: 1 }}
            />
            
            {/* Main checkmark */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>

            {/* Sparkles around */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-3"
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
