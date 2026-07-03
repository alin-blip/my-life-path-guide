import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Target, Sparkles, Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WARRIOR_POWER_QUESTIONS, WarriorPowerScores, getLevelForScore } from '@/data/warriorPowerQuestions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    hoverGlow: 'hover:shadow-red-500/40',
    range: [1, 2, 3]
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    hoverGlow: 'hover:shadow-yellow-500/40',
    range: [4, 5, 6]
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    hoverGlow: 'hover:shadow-blue-500/40',
    range: [7, 8, 9]
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-950/60',
    border: 'border-green-500/50',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    hoverGlow: 'hover:shadow-green-500/40',
    range: [10, 11, 12]
  }
};

const DIMENSION_CONFIG = {
  body: { 
    icon: Shield, 
    color: 'text-red-400', 
    bg: 'bg-red-500/20',
    gradient: 'from-red-500/20 to-orange-500/20',
    title: 'BODY',
    subtitle: 'Corpul Tău'
  },
  being: { 
    icon: Sparkles, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20',
    gradient: 'from-purple-500/20 to-pink-500/20',
    title: 'BEING',
    subtitle: 'Ființa Ta'
  },
  balance: { 
    icon: Target, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    title: 'BALANCE',
    subtitle: 'Echilibrul Tău'
  },
  business: { 
    icon: TrendingUp, 
    color: 'text-green-400', 
    bg: 'bg-green-500/20',
    gradient: 'from-green-500/20 to-emerald-500/20',
    title: 'BUSINESS',
    subtitle: 'Afacerea Ta'
  }
};

interface RealityMapQuizProps {
  onComplete: (scores: WarriorPowerScores) => void;
  existingScores?: Partial<WarriorPowerScores>;
}

export const RealityMapQuiz: React.FC<RealityMapQuizProps> = ({ 
  onComplete,
  existingScores 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { language } = useLanguage();
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>(existingScores || {});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreSelector, setShowScoreSelector] = useState(false);

  const totalQuestions = WARRIOR_POWER_QUESTIONS.length;
  const currentQuestion = WARRIOR_POWER_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;
  
  const dimensionConfig = DIMENSION_CONFIG[currentQuestion.dimension];
  const DimensionIcon = dimensionConfig.icon;

  // Load existing score for current question
  useEffect(() => {
    const scoreKey = currentQuestion.id as keyof WarriorPowerScores;
    const existingScore = scores[scoreKey];
    if (existingScore) {
      const levelName = getLevelForScore(existingScore).name;
      setSelectedLevel(levelName);
      setSelectedScore(existingScore);
      setShowScoreSelector(true);
    } else {
      setSelectedLevel(null);
      setSelectedScore(null);
      setShowScoreSelector(false);
    }
  }, [currentQuestionIndex, scores, currentQuestion.id]);

  const handleLevelSelect = (levelName: string) => {
    setSelectedLevel(levelName);
    setShowScoreSelector(true);
    const levelKey = levelName.toUpperCase() as keyof typeof LEVEL_CONFIG;
    const config = LEVEL_CONFIG[levelKey];
    if (config) {
      setSelectedScore(config.range[1]); // Default to middle score
    }
  };

  const handleScoreSelect = (score: number, levelName: string) => {
    setSelectedLevel(levelName);
    setSelectedScore(score);
    
    // Auto-advance after selection
    setTimeout(() => {
      const scoreKey = currentQuestion.id as keyof WarriorPowerScores;
      setScores(prev => ({
        ...prev,
        [scoreKey]: score
      }));

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedLevel(null);
        setSelectedScore(null);
        setShowScoreSelector(false);
      } else {
        // Complete on last question
        const finalScores = {
          ...scores,
          [scoreKey]: score
        };
        onComplete(finalScores as WarriorPowerScores);
      }
    }, 300);
  };

  const handleNext = () => {
    if (selectedScore !== null) {
      const scoreKey = currentQuestion.id as keyof WarriorPowerScores;
      setScores(prev => ({
        ...prev,
        [scoreKey]: selectedScore
      }));

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedLevel(null);
        setSelectedScore(null);
        setShowScoreSelector(false);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (selectedScore === null) return;
    
    setIsSubmitting(true);
    const finalScores: WarriorPowerScores = {
      body_fitness: scores.body_fitness || 0,
      body_nutrition: scores.body_nutrition || 0,
      being_connection: scores.being_connection || 0,
      being_certainty: scores.being_certainty || 0,
      balance_relationship: scores.balance_relationship || 0,
      balance_family: scores.balance_family || 0,
      business_mechanics: scores.business_mechanics || 0,
      business_money: scores.business_money || 0,
      [currentQuestion.id]: selectedScore
    } as WarriorPowerScores;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if record exists
        const { data: existing } = await supabase
          .from('fact_maps')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('category', 'reality-scores')
          .maybeSingle();

        if (existing) {
          // Update existing
          await supabase
            .from('fact_maps')
            .update({
              title: 'Reality Map Scores',
              items: JSON.parse(JSON.stringify(finalScores)),
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Insert new
          await supabase
            .from('fact_maps')
            .insert([{
              user_id: session.user.id,
              category: 'reality-scores',
              title: 'Reality Map Scores',
              items: JSON.parse(JSON.stringify(finalScores))
            }]);
        }
      }
      
      toast({
        title: "Evaluare Completă! 🎯",
        description: "Scorurile tale au fost salvate cu succes."
      });
      
      onComplete(finalScores);
    } catch (error) {
      console.error('Error saving scores:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut salva scorurile. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-6 sm:py-8 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 overflow-x-hidden">
        {/* Header with Progress */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={cn("p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0", dimensionConfig.bg)}>
                <DimensionIcon className={cn("w-5 h-5 sm:w-6 sm:h-6", dimensionConfig.color)} />
              </div>
              <div className="min-w-0">
                <h2 className={cn("text-lg sm:text-xl font-bold truncate", dimensionConfig.color)}>
                  {dimensionConfig.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{dimensionConfig.subtitle}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-foreground">{currentQuestionIndex + 1}</span>
              <span className="text-muted-foreground text-sm sm:text-base">/{totalQuestions}</span>
            </div>
          </div>
          
          <Progress value={progress} className="h-1.5 sm:h-2 bg-muted" />
          
          <div className="flex justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
            <span>Progres Evaluare</span>
            <span>{Math.round(progress)}% Complet</span>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn(
              "p-4 sm:p-6 mb-4 sm:mb-6 border-2 bg-gradient-to-br overflow-hidden",
              dimensionConfig.gradient,
              "border-border/50"
            )}>
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-1">
                  {language === 'ro' ? currentQuestion.section : currentQuestion.sectionEn}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentQuestion.sectionDescription[language]}
                </p>
              </div>

              {/* Level Cards with inline score buttons */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {currentQuestion.levels.map((level, idx) => {
                  const levelKey = level.name.toUpperCase() as keyof typeof LEVEL_CONFIG;
                  const config = LEVEL_CONFIG[levelKey];
                  if (!config) return null;
                  const isSelected = selectedLevel === level.name;
                  const currentScoreValue = scores[currentQuestion.id as keyof WarriorPowerScores];
                  const hasScoreInThisLevel = currentScoreValue && config.range.includes(currentScoreValue);
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300",
                        hasScoreInThisLevel || isSelected ? [
                          config.bg,
                          config.border,
                          "shadow-lg",
                          config.glow
                        ] : [
                          "bg-card/50",
                          "border-border/30",
                          "hover:border-border"
                        ]
                      )}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <span className={cn(
                              "font-bold text-base sm:text-lg",
                              hasScoreInThisLevel || isSelected ? config.text : "text-foreground"
                            )}>
                              {level.name}
                            </span>
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {config.range[0]}-{config.range[2]} pts
                            </span>
                            {hasScoreInThisLevel && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                ✓ {currentScoreValue}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs sm:text-sm font-medium mb-1 sm:mb-2",
                            hasScoreInThisLevel || isSelected ? config.text : "text-foreground/80"
                          )}>
                            {level.title[language]}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
                            {level.description[language]}
                          </p>
                          
                          {/* Inline Score Buttons - Always visible */}
                          <div className="flex flex-wrap items-center gap-2">
                            {config.range.map((score) => (
                              <motion.button
                                key={score}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScoreSelect(score, level.name);
                                }}
                                className={cn(
                                  "h-10 sm:h-11 px-4 sm:px-5 rounded-xl border-2 font-bold text-sm sm:text-base transition-all duration-200",
                                  (selectedScore === score && selectedLevel === level.name) || currentScoreValue === score ? [
                                    `bg-gradient-to-r ${config.gradient}`,
                                    "border-transparent",
                                    "text-white",
                                    "shadow-lg",
                                    config.glow
                                  ] : [
                                    config.bg,
                                    config.border,
                                    config.text,
                                    "hover:brightness-110"
                                  ]
                                )}
                              >
                                {score}
                              </motion.button>
                            ))}
                            <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                              — selectează nivelul tău
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="gap-1 sm:gap-2 px-3 sm:px-4"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Înapoi</span>
          </Button>

          {selectedScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:block"
            >
              {(() => {
                const levelKey = selectedLevel?.toUpperCase() as keyof typeof LEVEL_CONFIG;
                const config = selectedLevel ? LEVEL_CONFIG[levelKey] : null;
                
                return config ? (
                  <div className={cn(
                    "inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-full border-2",
                    config.bg,
                    config.border
                  )}>
                    <span className="text-xl sm:text-2xl">{config.icon}</span>
                    <div className="text-sm sm:text-base">
                      <span className={cn("font-bold", config.text)}>
                        {selectedLevel}
                      </span>
                      <span className="text-muted-foreground mx-1.5 sm:mx-2">•</span>
                      <span className="font-bold text-foreground">Scor: {selectedScore}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>
          )}

          <Button
            onClick={handleNext}
            disabled={selectedScore === null || isSubmitting}
            className={cn(
              "gap-1 sm:gap-2 bg-gradient-to-r from-primary to-primary/80 px-3 sm:px-4",
              "hover:from-primary/90 hover:to-primary/70"
            )}
            size="sm"
          >
            <span className="text-sm">
              {currentQuestionIndex === totalQuestions - 1 ? (
                isSubmitting ? 'Salvare...' : 'Finalizează'
              ) : (
                'Continuă'
              )}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
