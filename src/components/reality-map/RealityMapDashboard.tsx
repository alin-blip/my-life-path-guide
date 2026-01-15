import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Sparkles, Target, TrendingUp, 
  RefreshCw, Eye, ChevronRight, Zap,
  Award, Flame, Trophy, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  WarriorPowerScores, 
  getLevelForScore, 
  calculateDimensionScore,
  calculateTotalScore,
  getScorePercentage 
} from '@/data/warriorPowerQuestions';

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
}

export const RealityMapDashboard: React.FC<RealityMapDashboardProps> = ({
  scores,
  onReevaluate
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Harta Ta Completă
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Harta Realității
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vizualizează scorurile tale în cele 4 dimensiuni ale vieții și identifică zonele de îmbunătățire.
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
            "p-6 border-2 bg-gradient-to-br",
            overallConfig?.bg,
            overallConfig?.border
          )}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl",
                  `bg-gradient-to-br ${overallConfig?.gradient}`,
                  "shadow-lg"
                )}>
                  {overallConfig?.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nivel General</p>
                  <h2 className={cn("text-3xl font-bold", overallConfig?.text)}>
                    {overallLevel.toUpperCase()}
                  </h2>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Scor Total</span>
                  <span className="font-bold text-foreground">{totalScore}/96</span>
                </div>
                <Progress value={totalPercentage} className="h-3 bg-muted" />
                <p className="text-center text-lg font-bold mt-2 text-foreground">
                  {Math.round(totalPercentage)}%
                </p>
              </div>
              
              <Button 
                onClick={() => onReevaluate()}
                className="gap-2"
                size="lg"
              >
                <RefreshCw className="w-4 h-4" />
                Reevaluează Tot
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Dimension Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
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
                  "p-6 border-2 bg-gradient-to-br hover:shadow-lg transition-all duration-300",
                  data.config.gradient,
                  data.config.borderColor
                )}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-3 rounded-xl", data.config.bg)}>
                        <Icon className={cn("w-6 h-6", data.config.color)} />
                      </div>
                      <div>
                        <h3 className={cn("text-xl font-bold", data.config.color)}>
                          {data.config.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{data.config.subtitle}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-bold",
                      data.levelConfig?.bg,
                      data.levelConfig?.text
                    )}>
                      {data.levelConfig?.icon} {data.level.name}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Scor Dimensiune</span>
                      <span className="font-bold">{data.totalDimScore}/24</span>
                    </div>
                    <Progress 
                      value={data.percentage} 
                      className="h-2.5 bg-muted"
                    />
                  </div>

                  {/* Section Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {data.config.sections.map((section, sIdx) => {
                      const sectionScore = sIdx === 0 ? data.score1 : data.score2;
                      const sectionLevel = getLevelForScore(sectionScore);
                      const sectionConfig = LEVEL_CONFIG[sectionLevel.name.toUpperCase() as keyof typeof LEVEL_CONFIG];
                      
                      return (
                        <div 
                          key={section}
                          className={cn(
                            "p-3 rounded-lg border",
                            sectionConfig?.bg,
                            sectionConfig?.border
                          )}
                        >
                          <p className="text-xs text-muted-foreground mb-1">{section}</p>
                          <div className="flex items-center justify-between">
                            <span className={cn("font-bold", sectionConfig?.text)}>
                              {sectionLevel.name}
                            </span>
                            <span className="text-lg font-bold">{sectionScore}/12</span>
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
                      "w-full gap-2 group",
                      data.config.borderColor,
                      "hover:bg-primary/10"
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    Reevaluează {data.config.title}
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Flame, label: 'Dimensiuni Accelerate', value: countLevelDimensions('Accelerat'), color: 'text-green-400' },
            { icon: Zap, label: 'Dimensiuni Active', value: countLevelDimensions('Activ'), color: 'text-blue-400' },
            { icon: Eye, label: 'Dimensiuni Treze', value: countLevelDimensions('Treaz'), color: 'text-yellow-400' },
            { icon: Award, label: 'Scor Mediu', value: `${Math.round(totalScore / 8)}/12`, color: 'text-primary' }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 text-center bg-card/50 border-border/30">
              <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Vision Board CTA */}
        <VisionBoardCTA scores={scores} />
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
      className="mt-8"
    >
      <Card className="p-6 border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-background to-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Transformă Scorurile în Viziune</h3>
            <p className="text-muted-foreground">
              Ai harta realității tale. Acum creează imaginea destinației 
              cu Vision Board 2026 — obiective vizuale pentru fiecare dimensiune.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/vision-board-2026', { state: { fromRealityMap: true, scores } })}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" />
              Creează Vision Board
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/pricing')}
              className="text-muted-foreground hover:text-foreground"
            >
              Sau începe trial-ul
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
