import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSION_INFO } from '@/data/warriorPowerQuestions';

interface FullCycleAnalysisCardProps {
  scores: {
    body: number;
    being: number;
    balance: number;
    business: number;
  };
  userName: string;
}

// Personalized copy based on score level
const DIMENSION_COPY = {
  body: {
    critical: {
      pain: "Epuizat cronic → nu ai energie pentru nimic",
      gain: "Energie de la 5 AM → totul devine posibil"
    },
    medium: {
      pain: "Energie inconsistentă → zile bune și proaste",
      gain: "Energie stabilă → performanță constantă"
    },
    good: {
      pain: "Energie bună dar ținută înapoi de celelalte",
      gain: "Energie optimizată → amplifică tot restul"
    }
  },
  being: {
    critical: {
      pain: "Minte încețoșată → decizii impulsive, regrete",
      gain: "Claritate cristalină → decizii rapide și corecte"
    },
    medium: {
      pain: "Momente de claritate dar și confuzie",
      gain: "Focus consistent → productivitate dublă"
    },
    good: {
      pain: "Mintea clară dar blocată de alte arii",
      gain: "Minte optimizată → viziune strategică"
    }
  },
  balance: {
    critical: {
      pain: "Tensiuni zilnice → certuri, distanță emoțională",
      gain: "Armonie acasă → suport și conexiune profundă"
    },
    medium: {
      pain: "Relații ok dar lipsește profunzimea",
      gain: "Conexiuni autentice → fundație solidă"
    },
    good: {
      pain: "Relații bune dar afectate de stres din alte arii",
      gain: "Relații înfloritoare → echipă de suport"
    }
  },
  business: {
    critical: {
      pain: "Stagnare → oportunități ratate, frustrare financiară",
      gain: "Creștere predictibilă → libertate financiară"
    },
    medium: {
      pain: "Progres lent → potențial neexploatat",
      gain: "Accelerare → rezultate exponențiale"
    },
    good: {
      pain: "Business ok dar fără energie pentru next level",
      gain: "Business optimizat → scalare și libertate"
    }
  }
};

// Base multipliers for loss calculation per dimension
const LOSS_MULTIPLIERS = {
  body: 15,
  being: 20,
  balance: 25,
  business: 35
};

function getDimensionCopy(dim: string, score: number) {
  const percentage = (score / 24) * 100;
  const copy = DIMENSION_COPY[dim as keyof typeof DIMENSION_COPY];
  
  if (percentage <= 33) return copy.critical;
  if (percentage <= 66) return copy.medium;
  return copy.good;
}

function calculateDimensionLoss(dim: string, score: number) {
  const percentage = (score / 24) * 100;
  const gap = 100 - percentage;
  return Math.round(gap * LOSS_MULTIPLIERS[dim as keyof typeof LOSS_MULTIPLIERS]);
}

function getScoreColor(score: number) {
  const pct = (score / 24) * 100;
  if (pct <= 33) return { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
  if (pct <= 66) return { text: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
  return { text: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" };
}

export function FullCycleAnalysisCard({ scores, userName }: FullCycleAnalysisCardProps) {
  const dimensions = ['body', 'being', 'balance', 'business'] as const;
  
  const totalLoss = dimensions.reduce((sum, dim) => sum + calculateDimensionLoss(dim, scores[dim]), 0);
  const totalGain = Math.round(totalLoss * 1.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Analiza Completă a Ciclului Tău
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {userName}, Iată Cum Fiecare Arie Îți Afectează Viața
        </h2>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* LEFT - Toxic Cycle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-950/30 to-red-900/10 p-4 md:p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <h3 className="font-bold text-red-400">❌ CICLUL TOXIC ACTUAL</h3>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim, index) => {
              const info = DIMENSION_INFO[dim];
              const copy = getDimensionCopy(dim, scores[dim]);
              const colors = getScoreColor(scores[dim]);
              const isLast = index === dimensions.length - 1;

              return (
                <div key={dim}>
                  <div className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    colors.bg,
                    colors.border
                  )}>
                    <span className="text-xl">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm">{info.name}</span>
                        <span className={cn("text-xs font-bold", colors.text)}>
                          {scores[dim]}/24 ({Math.round((scores[dim]/24)*100)}%)
                        </span>
                      </div>
                      <p className="text-xs text-red-300/80 leading-relaxed">
                        {copy.pain}
                      </p>
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className="flex justify-center py-1">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <ArrowDown className="h-4 w-4 text-red-400/60" />
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Loop back arrow */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-red-500/20">
            <div className="flex items-center gap-2 text-red-400/80">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">Ciclul se repetă zilnic</span>
            </div>
          </div>

          {/* Total Loss */}
          <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-center">
            <div className="text-xs text-red-300/80 mb-1">Cost Total Estimat</div>
            <div className="text-xl font-black text-red-400">
              ~€{totalLoss.toLocaleString()}/lună
            </div>
            <div className="text-[10px] text-red-300/60 mt-1">în potențial neexploatat</div>
          </div>
        </motion.div>

        {/* RIGHT - Virtuous Cycle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-950/30 to-emerald-900/10 p-4 md:p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-bold text-green-400">✅ CICLUL VIRTUOS POSIBIL</h3>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim, index) => {
              const info = DIMENSION_INFO[dim];
              const copy = getDimensionCopy(dim, scores[dim]);
              const isLast = index === dimensions.length - 1;

              return (
                <div key={dim}>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-green-500/10 border-green-500/20">
                    <span className="text-xl">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-green-300">{info.name}</span>
                        <span className="text-xs font-bold text-green-400">ACCELERAT</span>
                      </div>
                      <p className="text-xs text-green-300/80 leading-relaxed">
                        {copy.gain}
                      </p>
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className="flex justify-center py-1">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <ArrowUp className="h-4 w-4 text-green-400/60" />
                      </motion.div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Loop back arrow */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-green-500/20">
            <div className="flex items-center gap-2 text-green-400/80">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">Ciclul se amplifică zilnic</span>
            </div>
          </div>

          {/* Total Gain */}
          <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
            <div className="text-xs text-green-300/80 mb-1">Potențial Deblocat</div>
            <div className="text-xl font-black text-green-400">
              +€{totalGain.toLocaleString()}/lună
            </div>
            <div className="text-[10px] text-green-300/60 mt-1">cu ciclul virtuos activat</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
