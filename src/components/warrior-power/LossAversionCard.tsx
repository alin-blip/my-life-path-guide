import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSION_INFO } from '@/data/warriorPowerQuestions';

interface LossAversionCardProps {
  weakestDimension: string;
  weakestScore: number;
  totalScore: number;
  userName: string;
}

const DIMENSION_LOSSES: Record<string, { 
  energyLoss: string;
  opportunityCost: string;
  burnoutRisk: string;
  consequence: string;
}> = {
  body: {
    energyLoss: '2-3 ore/zi de productivitate scăzută',
    opportunityCost: '€500-1500/lună în energie neexploatată',
    burnoutRisk: '3-6 luni până la epuizare fizică',
    consequence: 'fără energie constantă, toate celelalte arii suferă'
  },
  being: {
    energyLoss: 'Claritate mentală redusă cu 40%',
    opportunityCost: '€800-2000/lună în decizii proaste',
    burnoutRisk: '2-4 luni până la burnout mental',
    consequence: 'anxietatea și lipsa focusului îți sabotează succesul'
  },
  balance: {
    energyLoss: 'Relații deteriorate progresiv',
    opportunityCost: '€1000-3000/lună în conflict și stres',
    burnoutRisk: '6-12 luni până la criză relațională',
    consequence: 'succesul fără armonie nu aduce împlinire'
  },
  business: {
    energyLoss: 'Revenue potențial pierdut zilnic',
    opportunityCost: '€2000-5000/lună în oportunități ratate',
    burnoutRisk: '4-8 luni până la stagnare totală',
    consequence: 'fără strategie clară, efortul nu se transformă în rezultate'
  }
};

export function LossAversionCard({ 
  weakestDimension, 
  weakestScore,
  totalScore,
  userName 
}: LossAversionCardProps) {
  const dimensionInfo = DIMENSION_INFO[weakestDimension as keyof typeof DIMENSION_INFO];
  const losses = DIMENSION_LOSSES[weakestDimension] || DIMENSION_LOSSES.body;
  const weakPercentage = Math.round((weakestScore / 24) * 100);
  
  // Calculate estimated monthly loss based on score
  const estimatedLoss = Math.round((100 - (totalScore / 96 * 100)) * 25);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 via-background to-orange-500/5"
    >
      {/* Warning Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border-b border-red-500/20">
        <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
        <span className="font-bold text-red-400 uppercase tracking-wider text-sm">
          Costul Inacțiunii
        </span>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Main Warning Message */}
        <div className="text-center">
          <p className="text-lg md:text-xl font-bold text-foreground">
            {userName}, cu <span className="text-primary">{dimensionInfo?.name}</span> la {weakPercentage}%:
          </p>
        </div>

        {/* Loss Metrics Grid */}
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <TrendingDown className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{losses.energyLoss}</p>
              <p className="text-xs text-muted-foreground">Impact zilnic</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <DollarSign className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{losses.opportunityCost}</p>
              <p className="text-xs text-muted-foreground">Oportunități pierdute estimat</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <Clock className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{losses.burnoutRisk}</p>
              <p className="text-xs text-muted-foreground">Risc la nivelul actual</p>
            </div>
          </div>
        </div>

        {/* Bottom Warning */}
        <div className="relative p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-foreground">Adevărul dur:</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Dacă nu acționezi <strong className="text-foreground">ACUM</strong>, peste 90 de zile vei fi 
            în <strong className="text-red-400">aceeași situație</strong> - sau mai rău - pentru că {losses.consequence}.
          </p>
          
          <div className="mt-3 pt-3 border-t border-red-500/20">
            <p className="text-xs text-center text-muted-foreground">
              Estimare pierdere lunară la scorul actual: 
              <span className="font-bold text-red-400 ml-1">~€{estimatedLoss}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
