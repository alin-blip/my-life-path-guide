import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSION_INFO } from '@/data/warriorPowerQuestions';

interface TransformationMirrorCardProps {
  weakestDimension: string;
  weakestScore: number;
  totalScore: number;
  userName: string;
}

const CASCADE_EFFECTS: Record<string, {
  current: {
    primary: string;
    cascadeEffects: { area: string; icon: string; effect: string }[];
    bottomLine: string;
  };
  possible: {
    primary: string;
    cascadeEffects: { area: string; icon: string; effect: string }[];
    bottomLine: string;
  };
}> = {
  body: {
    current: {
      primary: "Oboseală cronică și lipsă de energie",
      cascadeEffects: [
        { area: "Minte", icon: "🧘", effect: "Claritate mentală redusă, decizii impulsive" },
        { area: "Relații", icon: "⚖️", effect: "Iritabilitate cu partenerul, tensiuni zilnice" },
        { area: "Business", icon: "💼", effect: "Productivitate scăzută, deadline-uri ratate" }
      ],
      bottomLine: "Corpul epuizat îți sabotează TOTUL"
    },
    possible: {
      primary: "Energie abundentă de la 5:00 AM",
      cascadeEffects: [
        { area: "Minte", icon: "🧘", effect: "Focus laser, decizii clare și rapide" },
        { area: "Relații", icon: "⚖️", effect: "Prezent și răbdător cu familia" },
        { area: "Business", icon: "💼", effect: "Output dublu în jumătate din timp" }
      ],
      bottomLine: "Corpul puternic AMPLIFICĂ totul"
    }
  },
  being: {
    current: {
      primary: "Anxietate și incertitudine constantă",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Cortizol ridicat, somn perturbat" },
        { area: "Relații", icon: "⚖️", effect: "Distanță emoțională în căsătorie" },
        { area: "Business", icon: "💼", effect: "Paralizie în fața deciziilor mari" }
      ],
      bottomLine: "Mintea haotică creează haos în tot"
    },
    possible: {
      primary: "Claritate și încredere în fiecare zi",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Somn profund, recuperare optimă" },
        { area: "Relații", icon: "⚖️", effect: "Conexiune profundă cu partenerul" },
        { area: "Business", icon: "💼", effect: "Viziune clară, execuție rapidă" }
      ],
      bottomLine: "Mintea clară creează armonie în tot"
    }
  },
  balance: {
    current: {
      primary: "Tensiune și conflict în relații",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Stres cronic, sistem imunitar slăbit" },
        { area: "Minte", icon: "🧘", effect: "Vinovăție și regret constant" },
        { area: "Business", icon: "💼", effect: "Focus scăzut, erori costisitoare" }
      ],
      bottomLine: "Relațiile toxice te consumă complet"
    },
    possible: {
      primary: "Armonie și susținere reciprocă",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Relaxare, energie regenerată" },
        { area: "Minte", icon: "🧘", effect: "Pace interioară, încredere" },
        { area: "Business", icon: "💼", effect: "Suport de acasă, focus total la muncă" }
      ],
      bottomLine: "Relațiile puternice te propulsează"
    }
  },
  business: {
    current: {
      primary: "Stagnare financiară și frustrare",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Neglijarea sănătății pentru 'muncă'" },
        { area: "Minte", icon: "🧘", effect: "Anxietate financiară permanentă" },
        { area: "Relații", icon: "⚖️", effect: "Absent de acasă, certuri despre bani" }
      ],
      bottomLine: "Business-ul eșuat îți fură viața"
    },
    possible: {
      primary: "Creștere predictibilă și libertate",
      cascadeEffects: [
        { area: "Corp", icon: "💪", effect: "Timp pentru sport și recuperare" },
        { area: "Minte", icon: "🧘", effect: "Siguranță și claritate financiară" },
        { area: "Relații", icon: "⚖️", effect: "Prezent pentru cei dragi, fără griji" }
      ],
      bottomLine: "Business-ul te eliberează să trăiești"
    }
  }
};

export function TransformationMirrorCard({ 
  weakestDimension, 
  weakestScore,
  totalScore,
  userName 
}: TransformationMirrorCardProps) {
  const dimensionInfo = DIMENSION_INFO[weakestDimension as keyof typeof DIMENSION_INFO];
  const effects = CASCADE_EFFECTS[weakestDimension] || CASCADE_EFFECTS.body;
  const weakPercentage = Math.round((weakestScore / 24) * 100);
  const estimatedLoss = Math.round((100 - (totalScore / 96 * 100)) * 25);
  const estimatedGain = Math.round((totalScore / 96 * 100) * 30);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-1">
          🔍 Oglinda Transformării Tale
        </h2>
        <p className="text-sm text-muted-foreground">
          {userName}, iată ce se întâmplă când <span className="text-primary font-medium">{dimensionInfo?.name}</span> rămâne la {weakPercentage}%
        </p>
      </div>

      {/* Mirror Cards Container */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* LEFT: Current Reality (Pain) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-background to-orange-500/5"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/15 border-b border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="font-bold text-red-400 uppercase tracking-wider text-xs">
              Realitatea Ta Actuală
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Primary Problem */}
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl mb-1">{dimensionInfo?.icon}</div>
              <p className="text-xs text-red-400 font-medium uppercase tracking-wide mb-1">
                {dimensionInfo?.name} la {weakPercentage}%
              </p>
              <p className="text-sm font-medium text-foreground">
                {effects.current.primary}
              </p>
            </div>

            {/* Cascade Effects */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-400 font-medium uppercase tracking-wide">
                <ArrowDown className="h-3 w-3" />
                <span>Efect Cascadă</span>
              </div>
              
              {effects.current.cascadeEffects.map((effect, index) => (
                <motion.div
                  key={effect.area}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border"
                >
                  <span className="text-lg flex-shrink-0">{effect.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{effect.area}</p>
                    <p className="text-xs text-foreground">{effect.effect}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Line */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/15 to-orange-500/10 border border-red-500/20">
              <p className="text-xs text-center font-bold text-red-400">
                🔥 {effects.current.bottomLine}
              </p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Cost estimat: <span className="font-bold text-red-400">~€{estimatedLoss}/lună</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: What's Possible (Solution) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-xl border-2 border-green-500/40 bg-gradient-to-br from-green-500/10 via-background to-emerald-500/5"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-green-500/15 border-b border-green-500/20">
            <Sparkles className="h-5 w-5 text-green-400" />
            <span className="font-bold text-green-400 uppercase tracking-wider text-xs">
              Ce Devine Posibil în 7 Zile
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Primary Possibility */}
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl mb-1">{dimensionInfo?.icon}</div>
              <p className="text-xs text-green-400 font-medium uppercase tracking-wide mb-1">
                {dimensionInfo?.name} ACCELERAT
              </p>
              <p className="text-sm font-medium text-foreground">
                {effects.possible.primary}
              </p>
            </div>

            {/* Amplification Effects */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-green-400 font-medium uppercase tracking-wide">
                <ArrowUp className="h-3 w-3" />
                <span>Efect Amplificare</span>
              </div>
              
              {effects.possible.cascadeEffects.map((effect, index) => (
                <motion.div
                  key={effect.area}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border"
                >
                  <span className="text-lg flex-shrink-0">{effect.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{effect.area}</p>
                    <p className="text-xs text-foreground">{effect.effect}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Line */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20">
              <p className="text-xs text-center font-bold text-green-400">
                ⚡ {effects.possible.bottomLine}
              </p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Potențial: <span className="font-bold text-green-400">+€{estimatedGain}/lună</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Solution Bridge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/5"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary uppercase tracking-wider text-sm">
              Soluția Ta
            </span>
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-foreground font-medium mb-2">
            Challenge-ul de 7 Zile transformă <span className="text-primary">{dimensionInfo?.name}</span> din{' '}
            <span className="text-red-400">obstacol</span> în{' '}
            <span className="text-green-400">armă</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-card border border-border">
              ✓ Zi 1-2: Activare {dimensionInfo?.name}
            </span>
            <span className="px-2 py-1 rounded-full bg-card border border-border">
              ✓ Zi 3-4: Integrare celelalte arii
            </span>
            <span className="px-2 py-1 rounded-full bg-card border border-border">
              ✓ Zi 5-7: Accelerare sistem complet
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
