import { motion } from 'framer-motion';
import { Sunrise, Sparkles, Heart, Brain, Target, HandHeart, Rocket, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStackPreviewCardProps {
  userName: string;
}

const STACK_SECTIONS = [
  {
    number: 1,
    title: "Trezire & Intenție",
    duration: "2 min",
    icon: Sunrise,
    description: "Îți setezi ziua pe modul 'câștig'",
    color: "text-amber-400"
  },
  {
    number: 2,
    title: "Centrare Spirituală",
    duration: "3 min",
    icon: Sparkles,
    description: "Conectare cu sinele superior și înțelepciunea interioară",
    color: "text-purple-400"
  },
  {
    number: 3,
    title: "Recunoștință",
    duration: "2 min",
    icon: Heart,
    description: "3 lucruri care îți amplifică energia instant",
    color: "text-pink-400"
  },
  {
    number: 4,
    title: "Putere Mentală",
    duration: "3 min",
    icon: Brain,
    description: "Elimini credința limitantă, creezi mantra ta",
    color: "text-blue-400"
  },
  {
    number: 5,
    title: "Obiective & Plan",
    duration: "5 min",
    icon: Target,
    description: "Obiectiv mare + sub-obiective + DE CE-ul tău",
    color: "text-green-400"
  },
  {
    number: 6,
    title: "Rugăciune Divină",
    duration: "1 min",
    icon: HandHeart,
    description: '"Elimină obstacolele, fă calea ușoară"',
    color: "text-indigo-400"
  },
  {
    number: 7,
    title: "Angajament & Lansare",
    duration: "2 min",
    icon: Rocket,
    description: "Nivel de hotărâre 1-10 + START ZI",
    color: "text-orange-400"
  }
];

export function DailyStackPreviewCard({ userName }: DailyStackPreviewCardProps) {
  const totalDuration = STACK_SECTIONS.reduce((sum, s) => sum + parseInt(s.duration), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Daily Master Stack
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">
          De la "Nu Am Chef" la "Sunt Imparabil"
        </h2>
        <p className="text-sm text-muted-foreground">
          Ritual matinal ghidat de AI în doar <span className="text-primary font-semibold">{totalDuration} minute</span>
        </p>
      </div>

      {/* Before/After Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-950/30 via-background to-green-950/30 border border-border"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">😴</div>
            <div className="text-xs text-red-400 font-medium">Înainte</div>
            <div className="text-[10px] text-muted-foreground">"Nu am chef..."</div>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold">{totalDuration} min</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs text-green-400 font-medium">După</div>
            <div className="text-[10px] text-muted-foreground">"Sunt imparabil!"</div>
          </div>
        </div>
      </motion.div>

      {/* Stack Sections */}
      <div className="space-y-2">
        {STACK_SECTIONS.map((section, index) => {
          const Icon = section.icon;

          return (
            <motion.div
              key={section.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover:bg-card/80 transition-colors group"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{section.number}</span>
              </div>

              {/* Icon */}
              <div className={cn("flex-shrink-0", section.color)}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">{section.title}</h4>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {section.duration}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate group-hover:text-clip">
                  {section.description}
                </p>
              </div>

              {/* Checkmark placeholder */}
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-colors" />
            </motion.div>
          );
        })}
      </div>

      {/* Result Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 text-center"
      >
        <div className="text-2xl mb-2">⚡</div>
        <h4 className="font-bold text-foreground mb-1">Rezultat Garantat</h4>
        <p className="text-sm text-muted-foreground">
          Claritate + Energie + Focus înainte de <span className="text-primary font-semibold">7:00 AM</span>
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>🧠 Minte clară</span>
          <span>💪 Corp energizat</span>
          <span>🎯 Zi planificată</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
