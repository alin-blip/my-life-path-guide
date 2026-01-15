import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Sparkles, Target, TrendingUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealityMapCardProps {
  dimension: 'body' | 'being' | 'balance' | 'business';
  score: number;
  maxScore: number;
  level: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const DIMENSION_ICONS: Record<string, LucideIcon> = {
  body: Shield,
  being: Sparkles,
  balance: Target,
  business: TrendingUp
};

const DIMENSION_COLORS = {
  body: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  being: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  balance: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  business: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    gradient: 'from-green-500/20 to-emerald-500/20'
  }
};

const LEVEL_CONFIG = {
  ADORMIT: { icon: '💤', text: 'text-red-400', bg: 'bg-red-950/60' },
  TREAZ: { icon: '👁️', text: 'text-yellow-400', bg: 'bg-yellow-950/60' },
  ACTIV: { icon: '⚡', text: 'text-blue-400', bg: 'bg-blue-950/60' },
  ACCELERAT: { icon: '🔥', text: 'text-green-400', bg: 'bg-green-950/60' }
};

export const RealityMapCard: React.FC<RealityMapCardProps> = ({
  dimension,
  score,
  maxScore,
  level,
  onClick,
  isSelected = false
}) => {
  const Icon = DIMENSION_ICONS[dimension];
  const colors = DIMENSION_COLORS[dimension];
  const levelConfig = LEVEL_CONFIG[level.toUpperCase() as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.ADORMIT;
  const percentage = (score / maxScore) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "p-5 border-2 transition-all duration-300",
        `bg-gradient-to-br ${colors.gradient}`,
        colors.border,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-2.5 rounded-xl", colors.bg)}>
            <Icon className={cn("w-5 h-5", colors.color)} />
          </div>
          <div>
            <h4 className={cn("font-bold uppercase", colors.color)}>
              {dimension}
            </h4>
            <div className={cn(
              "flex items-center gap-1.5 text-sm",
              levelConfig.text
            )}>
              <span>{levelConfig.icon}</span>
              <span className="font-medium">{level}</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-foreground">{score}</p>
            <p className="text-xs text-muted-foreground">/{maxScore}</p>
          </div>
        </div>

        <Progress value={percentage} className="h-2 bg-muted" />
        
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round(percentage)}% complet
        </p>
      </Card>
    </motion.div>
  );
};
