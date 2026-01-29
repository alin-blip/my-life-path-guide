import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface BreakthroughCelebrationProps {
  isVisible: boolean;
  emotionBefore: string;
  emotionAfter: string;
  insight?: string;
  actionCommitted?: string;
  onClose: () => void;
  onAddToHitList?: (action: string) => void;
}

export function BreakthroughCelebration({
  isVisible,
  emotionBefore,
  emotionAfter,
  insight,
  actionCommitted,
  onClose,
  onAddToHitList,
}: BreakthroughCelebrationProps) {
  const [showAddButton, setShowAddButton] = useState(!!actionCommitted);

  useEffect(() => {
    if (isVisible) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1']
        });
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const handleAddToHitList = () => {
    if (actionCommitted && onAddToHitList) {
      onAddToHitList(actionCommitted);
      setShowAddButton(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 border border-primary/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            {/* Trophy animation */}
            <motion.div 
              className="flex justify-center mb-4"
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <Trophy className="w-16 h-16 text-yellow-500" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              🎉 Transformare Completă!
            </h2>

            {/* Transformation summary */}
            <div className="bg-card/50 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{emotionBefore}</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Zap className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <span className="text-2xl">{emotionAfter}</span>
              </div>
              
              {insight && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Insight:</p>
                  <p className="text-sm font-medium italic">"{insight}"</p>
                </div>
              )}
            </div>

            {/* Action committed */}
            {actionCommitted && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Angajament:
                  </span>
                </div>
                <p className="text-sm">{actionCommitted}</p>
                
                {showAddButton && onAddToHitList && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full border-green-500/50 text-green-600 hover:bg-green-500/10"
                    onClick={handleAddToHitList}
                  >
                    + Adaugă în HIT List
                  </Button>
                )}
              </div>
            )}

            {/* Close button */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              Continuă Ziua în Putere! 💪
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
