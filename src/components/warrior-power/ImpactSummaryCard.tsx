import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSION_INFO, type WarriorPowerScores } from '@/data/warriorPowerQuestions';

interface ImpactSummaryCardProps {
  scores: {
    body: number;
    being: number;
    balance: number;
    business: number;
  };
  userName: string;
}

const LOSS_MULTIPLIERS = {
  body: 15,
  being: 20,
  balance: 25,
  business: 35
};

const GAIN_LABELS: Record<string, string> = {
  body: 'ACTIV',
  being: 'CLAR',
  balance: 'ARMONIE',
  business: 'CREȘTERE'
};

export function ImpactSummaryCard({ scores, userName }: ImpactSummaryCardProps) {
  // Calculate total loss and gain
  let totalLoss = 0;
  const dimensions = Object.entries(scores) as [keyof typeof scores, number][];
  
  dimensions.forEach(([dim, score]) => {
    const percentage = (score / 24) * 100;
    const gap = 100 - percentage;
    totalLoss += Math.round(gap * LOSS_MULTIPLIERS[dim]);
  });
  
  const totalGain = Math.round(totalLoss * 1.5);
  
  // Find weakest dimension
  const sortedDims = dimensions.sort(([, a], [, b]) => a - b);
  const weakestDim = sortedDims[0][0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
    >
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* LEFT: Current State (Pain) */}
        <div className="p-4 md:p-6 bg-red-500/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Acum
            </span>
          </div>
          
          <div className="space-y-2">
            {(Object.entries(DIMENSION_INFO) as [string, { name: string; icon: string }][]).map(([key, info]) => {
              const score = scores[key as keyof typeof scores];
              const isWeakest = key === weakestDim;
              
              return (
                <div 
                  key={key}
                  className={cn(
                    "flex items-center justify-between text-sm",
                    isWeakest && "text-red-400 font-semibold"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{info.icon}</span>
                    <span className="text-muted-foreground text-xs">{info.name}</span>
                  </span>
                  <span className={cn(
                    "font-mono",
                    isWeakest ? "text-red-400" : "text-muted-foreground"
                  )}>
                    {score}/24
                    {isWeakest && <span className="ml-1 text-[10px]">⚠️</span>}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Total Loss */}
          <div className="mt-4 pt-3 border-t border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-lg font-bold">-€{totalLoss.toLocaleString()}/lună</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Potențial pierdut
            </p>
          </div>
        </div>
        
        {/* RIGHT: After State (Gain) */}
        <div className="p-4 md:p-6 bg-green-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">
              După 7 Zile
            </span>
          </div>
          
          <div className="space-y-2">
            {(Object.entries(DIMENSION_INFO) as [string, { name: string; icon: string }][]).map(([key, info]) => {
              const gainLabel = GAIN_LABELS[key];
              
              return (
                <div 
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{info.icon}</span>
                    <span className="text-muted-foreground text-xs">{info.name}</span>
                  </span>
                  <span className="font-semibold text-green-400 text-xs">
                    {gainLabel}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Total Gain */}
          <div className="mt-4 pt-3 border-t border-green-500/20">
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">+€{totalGain.toLocaleString()}/lună</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Potențial deblocat
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
