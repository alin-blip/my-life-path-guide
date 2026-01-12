import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, TrendingUp } from 'lucide-react';
import { useRoutineXP, getLevelTitle, getLevelColor } from '@/hooks/useRoutineXP';

interface LiveXPDisplayProps {
  className?: string;
  compact?: boolean;
}

export function LiveXPDisplay({ className, compact = false }: LiveXPDisplayProps) {
  const { stats, isLoading, recentXPGain } = useRoutineXP();

  if (isLoading || !stats) {
    return null;
  }

  const levelColor = getLevelColor(stats.current_level);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Streak Display */}
      {stats.current_streak > 0 && (
        <motion.div
          className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-orange-300">
            {stats.current_streak}
          </span>
        </motion.div>
      )}

      {/* XP Display */}
      <motion.div
        className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-1 rounded-full relative"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-300">
          {stats.total_xp.toLocaleString()}
        </span>
        
        {/* XP Gain Animation */}
        <AnimatePresence>
          {recentXPGain && (
            <motion.div
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm font-bold text-yellow-400 bg-yellow-500/30 px-2 py-0.5 rounded-full">
                +{recentXPGain.amount} XP
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Level Display */}
      {!compact && (
        <motion.div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full",
            "bg-white/10"
          )}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <TrendingUp className={cn("w-3 h-3", levelColor)} />
          <span className={cn("text-xs font-bold", levelColor)}>
            Lvl {stats.current_level}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Floating XP animation component for step completion
interface XPFloatingAnimationProps {
  amount: number;
  reason: string;
}

export function XPFloatingAnimation({ amount, reason }: XPFloatingAnimationProps) {
  return (
    <motion.div
      className="fixed top-24 right-4 z-50 pointer-events-none"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-yellow-500/30">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-lg">+{amount} XP</span>
        </div>
        <p className="text-xs text-yellow-100 mt-0.5">{reason}</p>
      </div>
    </motion.div>
  );
}
