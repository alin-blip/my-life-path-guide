import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Sparkles, Target, TrendingUp, 
  RefreshCw, Eye, ChevronRight, Zap,
  Award, Flame, Trophy, ArrowRight, Brain
} from 'lucide-react';
import { mindQuizService, type MindAxisScoreRow } from '@/services/mindQuizService';
import { ALL_MIND_QUIZZES } from '@/data/mind-quizzes';
import { cn } from '@/lib/utils';
import { 
  WarriorPowerScores, 
  getLevelForScore, 
  calculateDimensionScore,
  calculateTotalScore,
  getScorePercentage 
} from '@/data/warriorPowerQuestions';
import { InlineMembershipBanner } from '@/components/membership';

const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    progress: 'bg-red-500'
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    progress: 'bg-yellow-500'
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    progress: 'bg-blue-500'
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-950/60',
    border: 'border-green-500/50',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    progress: 'bg-green-500'
  }
};

const DIMENSION_CONFIG = {
  body: { 
    icon: Shield, 
    color: 'text-red-400', 
    bg: 'bg-red-500/20',
    gradient: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/30',
    title: 'BODY',
    subtitle: 'Corpul Tău',
    sections: ['Fitness', 'Nutriție'],
    scoreKeys: ['body_fitness', 'body_nutrition'] as (keyof WarriorPowerScores)[]
  },
  being: { 
    icon: Sparkles, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    title: 'BEING',
    subtitle: 'Ființa Ta',
    sections: ['Conexiune', 'Certitudine'],
    scoreKeys: ['being_connection', 'being_certainty'] as (keyof WarriorPowerScores)[]
  },
  balance: { 
    icon: Target, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    title: 'BALANCE',
    subtitle: 'Echilibrul Tău',
    sections: ['Relații', 'Familie'],
    scoreKeys: ['balance_relationship', 'balance_family'] as (keyof WarriorPowerScores)[]
  },
  business: { 
    icon: TrendingUp, 
    color: 'text-green-400', 
    bg: 'bg-green-500/20',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    title: 'BUSINESS',
    subtitle: 'Afacerea Ta',
    sections: ['Mecanica', 'Bani'],
    scoreKeys: ['business_mechanics', 'business_money'] as (keyof WarriorPowerScores)[]
  }
};

interface RealityMapDashboardProps {
  scores: WarriorPowerScores;
  onReevaluate: (dimension?: string) => void;
  hasActiveSubscription?: boolean;
}

export const RealityMapDashboard: React.FC<RealityMapDashboardProps> = ({
  scores,
  onReevaluate,
  hasActiveSubscription = false
}) => {
  const totalScore = calculateTotalScore(scores);
  const totalPercentage = getScorePercentage(scores);
  const overallLevel = getOverallLevel(totalPercentage);
  const overallConfig = LEVEL_CONFIG[overallLevel.toUpperCase() as keyof typeof LEVEL_CONFIG];

  function getOverallLevel(percentage: number): string {
    if (percentage < 30) return 'Adormit';
    if (percentage < 55) return 'Treaz';
    if (percentage < 80) return 'Activ';
    return 'Accelerat';
  }

  const getDimensionData = (dimension: keyof typeof DIMENSION_CONFIG) => {
    const config = DIMENSION_CONFIG[dimension];
    const score1 = scores[config.scoreKeys[0]] || 0;
    const score2 = scores[config.scoreKeys[1]] || 0;
    const totalDimScore = score1 + score2;
    const avgScore = Math.round((score1 + score2) / 2);
    const level = getLevelForScore(avgScore);
    const levelConfig = LEVEL_CONFIG[level.name.toUpperCase() as keyof typeof LEVEL_CONFIG];
    
    return {
      config,
      score1,
      score2,
      totalDimScore,
      avgScore,
      level,
      levelConfig,
      percentage: (totalDimScore / 24) * 100
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-6 sm:py-8 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 overflow-x-hidden">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
            Harta Ta Completă
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Harta Realității
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Vizualizează scorurile tale în cele 5 dimensiuni ale vieții (Minte este fundația) și identifică zonele de îmbunătățire.
          </p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className={cn(
            "p-4 sm:p-6 border-2 bg-gradient-to-br overflow-hidden",
            overallConfig?.bg,
            overallConfig?.border
          )}>
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0",
                  `bg-gradient-to-br ${overallConfig?.gradient}`,
                  "shadow-lg"
                )}>
                  {overallConfig?.icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Nivel General</p>
                  <h2 className={cn("text-2xl sm:text-3xl font-bold", overallConfig?.text)}>
                    {overallLevel.toUpperCase()}
                  </h2>
                </div>
              </div>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-muted-foreground">Scor Total</span>
                  <span className="font-bold text-foreground">{totalScore}/96</span>
                </div>
                <Progress value={totalPercentage} className="h-2.5 sm:h-3 bg-muted" />
                <p className="text-center text-base sm:text-lg font-bold mt-2 text-foreground">
                  {Math.round(totalPercentage)}%
                </p>
              </div>
              
              <Button 
                onClick={() => onReevaluate()}
                className="gap-2 w-full sm:w-auto"
                size="default"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm sm:text-base">Reevaluează Tot</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Dimension Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {(Object.keys(DIMENSION_CONFIG) as (keyof typeof DIMENSION_CONFIG)[]).map((dimension, idx) => {
            const data = getDimensionData(dimension);
            const Icon = data.config.icon;
            
            return (
              <motion.div
                key={dimension}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className={cn(
                  "p-4 sm:p-6 border-2 bg-gradient-to-br hover:shadow-lg transition-all duration-300 overflow-hidden",
                  data.config.gradient,
                  data.config.borderColor
                )}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={cn("p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0", data.config.bg)}>
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", data.config.color)} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={cn("text-base sm:text-xl font-bold truncate", data.config.color)}>
                          {data.config.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{data.config.subtitle}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 whitespace-nowrap",
                      data.levelConfig?.bg,
                      data.levelConfig?.text
                    )}>
                      {data.levelConfig?.icon} <span className="hidden xs:inline">{data.level.name}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-muted-foreground">Scor Dimensiune</span>
                      <span className="font-bold">{data.totalDimScore}/24</span>
                    </div>
                    <Progress 
                      value={data.percentage} 
                      className="h-2 sm:h-2.5 bg-muted"
                    />
                  </div>

                  {/* Section Scores */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {data.config.sections.map((section, sIdx) => {
                      const sectionScore = sIdx === 0 ? data.score1 : data.score2;
                      const sectionLevel = getLevelForScore(sectionScore);
                      const sectionConfig = LEVEL_CONFIG[sectionLevel.name.toUpperCase() as keyof typeof LEVEL_CONFIG];
                      
                      return (
                        <div 
                          key={section}
                          className={cn(
                            "p-2 sm:p-3 rounded-lg border overflow-hidden",
                            sectionConfig?.bg,
                            sectionConfig?.border
                          )}
                        >
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">{section}</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("font-bold text-xs sm:text-sm truncate", sectionConfig?.text)}>
                              {sectionLevel.name}
                            </span>
                            <span className="text-sm sm:text-lg font-bold flex-shrink-0">{sectionScore}/12</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline"
                    onClick={() => onReevaluate(dimension)}
                    className={cn(
                      "w-full gap-1 sm:gap-2 group text-xs sm:text-sm",
                      data.config.borderColor,
                      "hover:bg-primary/10"
                    )}
                    size="sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Reevaluează {data.config.title}</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Button>
                </Card>
              </motion.div>
            );
          })}

          {/* 5th pillar: MINTE — Foundation (data from Brain Map) */}
          <MindDimensionCard />
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-4"
        >
          {[
            { icon: Flame, label: 'Accelerate', value: countLevelDimensions('Accelerat'), color: 'text-green-400' },
            { icon: Zap, label: 'Active', value: countLevelDimensions('Activ'), color: 'text-blue-400' },
            { icon: Eye, label: 'Treze', value: countLevelDimensions('Treaz'), color: 'text-yellow-400' },
            { icon: Award, label: 'Scor Mediu', value: `${Math.round(totalScore / 8)}/12`, color: 'text-primary' }
          ].map((stat, idx) => (
            <Card key={idx} className="p-3 sm:p-4 text-center bg-card/50 border-border/30 overflow-hidden">
              <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2", stat.color)} />
              <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Vision Board CTA */}
        <VisionBoardCTA scores={scores} />

        {/* Inline Membership Banner for non-subscribers */}
        {!hasActiveSubscription && <InlineMembershipBanner />}
      </div>
    </div>
  );

  function countLevelDimensions(levelName: string): number {
    let count = 0;
    const dimensions = ['body', 'being', 'balance', 'business'] as const;
    
    dimensions.forEach(dim => {
      const data = getDimensionData(dim);
      if (data.level.name === levelName) count++;
    });
    
    return count;
  }
};

// Vision Board CTA Component
const VisionBoardCTA: React.FC<{ scores: WarriorPowerScores }> = ({ scores }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mt-6 sm:mt-8"
    >
      <Card className="p-4 sm:p-6 border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-background to-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center">
            <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Definește Obiectivele Tale Anuale</h3>
            <p className="text-xs sm:text-base text-muted-foreground">
              Ai harta realității tale. Acum creează obiectivele imposibile pentru 2026.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate('/door?tab=annual')}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 w-full sm:w-auto text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4" />
              Creează Obiective Anuale
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            >
              Sau începe trial-ul
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// MINTE — 5th pillar, sourced from Brain Map axis scores
const MindDimensionCard: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MindAxisScoreRow[]>([]);
  const [doneCount, setDoneCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mindQuizService.getAxisScores(),
      mindQuizService.getAllLatestResponses(),
    ])
      .then(([axes, latest]) => {
        setRows(axes);
        setDoneCount(Object.keys(latest || {}).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = ALL_MIND_QUIZZES.length;
  const avg = rows.length
    ? Math.round(rows.reduce((s, r) => s + (r.score_healthy || 0), 0) / rows.length)
    : 0;

  const levelName =
    avg >= 75 ? 'Accelerat' : avg >= 55 ? 'Activ' : avg >= 30 ? 'Treaz' : 'Adormit';
  const levelConfig = LEVEL_CONFIG[levelName.toUpperCase() as keyof typeof LEVEL_CONFIG];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card
        className={cn(
          'p-4 sm:p-6 border-2 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden',
        )}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 bg-violet-500/20">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-bold truncate text-violet-400">
                MINTE
                <span className="ml-2 text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 align-middle">
                  FUNDAȚIE
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Tiparele tale de gândire
              </p>
            </div>
          </div>
          <div
            className={cn(
              'px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 whitespace-nowrap',
              levelConfig?.bg,
              levelConfig?.text,
            )}
          >
            {levelConfig?.icon} <span className="hidden xs:inline">{levelName}</span>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span className="text-muted-foreground">Brain Map (0–100)</span>
            <span className="font-bold">{loading ? '—' : `${avg}%`}</span>
          </div>
          <Progress value={avg} className="h-2 sm:h-2.5 bg-muted" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 rounded-lg border bg-violet-950/40 border-violet-500/30 overflow-hidden">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Axe evaluate</p>
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs sm:text-sm text-violet-300">6 axe</span>
              <span className="text-sm sm:text-lg font-bold flex-shrink-0">{rows.length}/6</span>
            </div>
          </div>
          <div className="p-2 sm:p-3 rounded-lg border bg-violet-950/40 border-violet-500/30 overflow-hidden">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Teste făcute</p>
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs sm:text-sm text-violet-300">
                {doneCount === 0 ? 'Niciun test' : doneCount >= total ? 'Complet' : 'În progres'}
              </span>
              <span className="text-sm sm:text-lg font-bold flex-shrink-0">{doneCount}/{total}</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/minte/teste')}
          className="w-full gap-1 sm:gap-2 group text-xs sm:text-sm border-violet-500/30 hover:bg-violet-500/10"
          size="sm"
        >
          <Brain className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{doneCount === 0 ? 'Începe primul test' : 'Continuă testele Minte'}</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </Button>
      </Card>
    </motion.div>
  );
};
