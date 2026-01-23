import { motion } from 'framer-motion';
import { Calendar, Target, Heart, Trophy, Sparkles, Bell, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIMENSION_INFO } from '@/data/warriorPowerQuestions';

interface ChallengeBreakdownCardProps {
  scores: {
    body: number;
    being: number;
    balance: number;
    business: number;
  };
  userName: string;
  weakestDimension: string;
}

const CHALLENGE_DAYS = [
  {
    day: 1,
    title: "DECLARAȚIA TA",
    subtitle: "Stil Napoleon Hill",
    icon: Target,
    description: "Scrii viziunea ta clară pentru toate 4 ariile vieții tale",
    details: [
      "Viziune Corp: Ce vrei să simți fizic",
      "Viziune Being: Starea mentală ideală",
      "Viziune Balance: Relațiile visate",
      "Viziune Business: Obiectivele financiare"
    ],
    color: "primary"
  },
  {
    day: 2,
    title: "CORP + SPIRIT",
    subtitle: "Obiective Clare",
    icon: Sparkles,
    description: "Setezi obiective măsurabile pentru primele 2 dimensiuni",
    details: [
      "Plan specific pentru energie și fitness",
      "Rutină de claritate mentală",
      "Metrici de progres zilnic"
    ],
    color: "blue"
  },
  {
    day: 3,
    title: "RELAȚII + BUSINESS",
    subtitle: "Completare Viziune",
    icon: Heart,
    description: "Finalizezi planul cu ultimele 2 arii",
    details: [
      "Acțiuni zilnice pentru relații",
      "Obiective de business concrete",
      "Integrare cu primele 2 arii"
    ],
    color: "pink"
  },
  {
    day: 4,
    title: "RUTINA CAMPIONULUI",
    subtitle: "Daily Master Stack",
    icon: Trophy,
    description: "Configurezi rutina matinală care schimbă totul",
    details: [
      "7 secțiuni ghidate AI în 20 min",
      "De la 'nu am chef' → motivație pură",
      "Automatizare completă"
    ],
    color: "yellow"
  },
  {
    day: 5,
    title: "VIZIUNE AI",
    subtitle: "Vision Board + Meditație",
    icon: Sparkles,
    description: "Creezi vizualizări puternice cu AI",
    details: [
      "Vision board personalizat",
      "Meditație ghidată pentru viziune",
      "Ancorare emoțională"
    ],
    color: "purple"
  },
  {
    day: 6,
    title: "ACCOUNTABILITY",
    subtitle: "Sistemul Care Te Ține",
    icon: Bell,
    description: "Activezi sistemul de responsabilitate",
    details: [
      "Remindere inteligente",
      "Tracking progres",
      "Comunitate de suport"
    ],
    color: "orange"
  },
  {
    day: 7,
    title: "INTEGRARE",
    subtitle: "Totul Împreună",
    icon: Zap,
    description: "Unești toate piesele în sistemul complet",
    details: [
      "Review și optimizare",
      "Plan pe termen lung",
      "Upgrade la nivel următor"
    ],
    color: "green"
  }
];

const colorClasses = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  green: "border-green-500/30 bg-green-500/10 text-green-400"
};

export function ChallengeBreakdownCard({ scores, userName, weakestDimension }: ChallengeBreakdownCardProps) {
  const weakestInfo = DIMENSION_INFO[weakestDimension as keyof typeof DIMENSION_INFO];
  const weakestScore = scores[weakestDimension as keyof typeof scores];
  const weakestPct = Math.round((weakestScore / 24) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Challenge-ul Tău de 7 Zile
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">
          Personalizat pentru {userName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Focus principal: <span className="text-primary font-semibold">{weakestInfo?.name}</span> ({weakestPct}%) → 
          Transformare în toate ariile
        </p>
      </div>

      {/* Days Grid */}
      <div className="grid gap-3">
        {CHALLENGE_DAYS.map((day, index) => {
          const Icon = day.icon;
          const colors = colorClasses[day.color as keyof typeof colorClasses];

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "rounded-xl border p-4 transition-all hover:scale-[1.01]",
                colors
              )}
            >
              <div className="flex items-start gap-4">
                {/* Day Number */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg",
                    colors.replace('border-', 'bg-').replace('/30', '/20')
                  )}>
                    {day.day}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <h3 className="font-bold text-sm">{day.title}</h3>
                    <span className="text-[10px] opacity-70">({day.subtitle})</span>
                  </div>
                  <p className="text-xs opacity-80 mb-2">{day.description}</p>
                  
                  {/* Details as chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {day.details.map((detail, i) => (
                      <div 
                        key={i}
                        className="flex items-center gap-1 text-[10px] bg-background/50 px-2 py-0.5 rounded-full"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalization badge for weakest dim */}
                {(day.day === 1 || day.day === 4) && (
                  <div className="flex-shrink-0">
                    <div className="text-[9px] bg-primary/20 text-primary px-2 py-1 rounded-full font-semibold">
                      🎯 Focus: {weakestInfo?.icon}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center"
      >
        <p className="text-xs text-muted-foreground">
          ⚡ Totul ghidat pas-cu-pas, personalizat pe scorurile tale
        </p>
      </motion.div>
    </motion.div>
  );
}
