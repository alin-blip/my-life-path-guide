import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Target, Sparkles, Shield, TrendingUp, Share2, ExternalLink, Check, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WARRIOR_POWER_QUESTIONS, WarriorPowerScores, getLevelForScore } from '@/data/warriorPowerQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';

const LEVEL_CONFIG = {
  ADORMIT: {
    icon: '💤',
    gradient: 'from-red-600 to-red-800',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    range: [1, 2, 3]
  },
  TREAZ: {
    icon: '👁️',
    gradient: 'from-yellow-500 to-orange-600',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    range: [4, 5, 6]
  },
  ACTIV: {
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    range: [7, 8, 9]
  },
  ACCELERAT: {
    icon: '🔥',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-950/60',
    border: 'border-green-500/50',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    range: [10, 11, 12]
  }
};

const DIMENSION_CONFIG = {
  body: { 
    icon: Shield, 
    color: 'text-red-400', 
    bg: 'bg-red-500/20',
    title: 'BODY',
    titleRo: 'CORP',
    subtitle: 'Corpul Tău',
    subtitleEn: 'Your Body'
  },
  being: { 
    icon: Sparkles, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20',
    title: 'BEING',
    titleRo: 'SPIRIT',
    subtitle: 'Ființa Ta',
    subtitleEn: 'Your Being'
  },
  balance: { 
    icon: Target, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20',
    title: 'BALANCE',
    titleRo: 'RELAȚII',
    subtitle: 'Echilibrul Tău',
    subtitleEn: 'Your Balance'
  },
  business: { 
    icon: TrendingUp, 
    color: 'text-green-400', 
    bg: 'bg-green-500/20',
    title: 'BUSINESS',
    titleRo: 'BUSINESS',
    subtitle: 'Afacerea Ta',
    subtitleEn: 'Your Business'
  }
};

interface Day1RealityCheckProps {
  onComplete: (scores: WarriorPowerScores) => void;
  onPostScore?: (message: string) => Promise<void>;
  existingScores?: Partial<WarriorPowerScores>;
}

export const Day1RealityCheck: React.FC<Day1RealityCheckProps> = ({ 
  onComplete,
  onPostScore,
  existingScores 
}) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Partial<WarriorPowerScores>>(existingScores || {});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScores, setFinalScores] = useState<WarriorPowerScores | null>(null);
  const [scorePosted, setScorePosted] = useState(false);

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
    } else {
      setSelectedLevel(null);
      setSelectedScore(null);
    }
  }, [currentQuestionIndex, scores, currentQuestion.id]);

  const handleScoreSelect = (score: number, levelName: string) => {
    setSelectedLevel(levelName);
    setSelectedScore(score);
    
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
      } else {
        handleComplete(score);
      }
    }, 300);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async (lastScore: number) => {
    setIsSubmitting(true);
    const completeScores: WarriorPowerScores = {
      body_fitness: scores.body_fitness || 0,
      body_nutrition: scores.body_nutrition || 0,
      being_connection: scores.being_connection || 0,
      being_certainty: scores.being_certainty || 0,
      balance_relationship: scores.balance_relationship || 0,
      balance_family: scores.balance_family || 0,
      business_mechanics: scores.business_mechanics || 0,
      business_money: scores.business_money || 0,
      [currentQuestion.id]: lastScore
    } as WarriorPowerScores;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: existing } = await supabase
          .from('fact_maps')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('category', 'reality-scores')
          .maybeSingle();

        if (existing) {
          await supabase
            .from('fact_maps')
            .update({
              title: 'Reality Map Scores',
              items: JSON.parse(JSON.stringify(completeScores)),
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('fact_maps')
            .insert([{
              user_id: session.user.id,
              category: 'reality-scores',
              title: 'Reality Map Scores',
              items: JSON.parse(JSON.stringify(completeScores))
            }]);
        }
      }
      
      setFinalScores(completeScores);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error saving scores:', error);
      toast({
        title: isRo ? "Eroare" : "Error",
        description: isRo ? "Nu am putut salva scorurile." : "Could not save scores.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatScoreMessage = (scores: WarriorPowerScores): string => {
    const bodyTotal = scores.body_fitness + scores.body_nutrition;
    const beingTotal = scores.being_connection + scores.being_certainty;
    const balanceTotal = scores.balance_relationship + scores.balance_family;
    const businessTotal = scores.business_mechanics + scores.business_money;
    const total = bodyTotal + beingTotal + balanceTotal + businessTotal;
    const percentage = Math.round((total / 96) * 100);
    
    const getLevelEmoji = (score: number) => {
      if (score <= 6) return '💤';
      if (score <= 12) return '👁️';
      if (score <= 18) return '⚡';
      return '🔥';
    };
    
    return `🎯 ${isRo ? 'HARTA MEA DE START - Ziua 1' : 'MY STARTING MAP - Day 1'}

💪 ${isRo ? 'Corp' : 'Body'}: ${bodyTotal}/24 ${getLevelEmoji(bodyTotal)}
✨ ${isRo ? 'Spirit' : 'Being'}: ${beingTotal}/24 ${getLevelEmoji(beingTotal)}
💕 ${isRo ? 'Relații' : 'Balance'}: ${balanceTotal}/24 ${getLevelEmoji(balanceTotal)}
💼 Business: ${businessTotal}/24 ${getLevelEmoji(businessTotal)}

📊 ${isRo ? 'Scor Total' : 'Total Score'}: ${total}/96 (${percentage}%)

${isRo ? 'Aceasta este realitatea mea de astăzi. În 7 zile, voi progresa!' : 'This is my reality today. In 7 days, I will progress!'} 💪`;
  };

  const handlePostToComments = async () => {
    if (!finalScores || !onPostScore) return;
    const message = formatScoreMessage(finalScores);
    await onPostScore(message);
    setScorePosted(true);
    toast({
      title: isRo ? '🎉 Distribuit!' : '🎉 Shared!',
      description: isRo 
        ? 'Scorul tău a fost postat în comunitate!' 
        : 'Your score has been posted to the community!',
    });
  };

  const handleContinue = () => {
    if (finalScores) {
      onComplete(finalScores);
    }
  };

  // Show summary card after completion
  if (quizCompleted && finalScores) {
    const bodyTotal = finalScores.body_fitness + finalScores.body_nutrition;
    const beingTotal = finalScores.being_connection + finalScores.being_certainty;
    const balanceTotal = finalScores.balance_relationship + finalScores.balance_family;
    const businessTotal = finalScores.business_mechanics + finalScores.business_money;
    const total = bodyTotal + beingTotal + balanceTotal + businessTotal;
    const percentage = Math.round((total / 96) * 100);

    const dimensionScores = [
      { key: 'body', score: bodyTotal, max: 24, icon: '💪', label: isRo ? 'Corp' : 'Body', color: 'from-red-500 to-orange-500' },
      { key: 'being', score: beingTotal, max: 24, icon: '✨', label: isRo ? 'Spirit' : 'Being', color: 'from-purple-500 to-pink-500' },
      { key: 'balance', score: balanceTotal, max: 24, icon: '💕', label: isRo ? 'Relații' : 'Balance', color: 'from-blue-500 to-cyan-500' },
      { key: 'business', score: businessTotal, max: 24, icon: '💼', label: 'Business', color: 'from-green-500 to-emerald-500' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary Header */}
        <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 mx-auto mb-4">
              <Map className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isRo ? '🎯 HARTA REALITĂȚII TALE' : '🎯 YOUR REALITY MAP'}
            </h2>
            <p className="text-muted-foreground">
              {isRo 
                ? 'Aceasta este punctul tău de plecare. În 7 zile, vei vedea progresul!' 
                : 'This is your starting point. In 7 days, you will see progress!'}
            </p>
          </div>

          {/* Total Score */}
          <div className="text-center mb-6 p-4 rounded-xl bg-background/50 border">
            <div className="text-4xl font-bold text-primary mb-1">{total}/96</div>
            <div className="text-lg text-muted-foreground">{percentage}%</div>
          </div>

          {/* Dimension Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {dimensionScores.map((dim) => (
              <div 
                key={dim.key}
                className={`p-4 rounded-xl bg-gradient-to-br ${dim.color} bg-opacity-10 border`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{dim.icon}</span>
                  <span className="font-semibold text-foreground">{dim.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{dim.score}/{dim.max}</div>
                <Progress value={(dim.score / dim.max) * 100} className="h-2 mt-2" />
              </div>
            ))}
          </div>

          {/* Post to Community Button */}
          {!scorePosted ? (
            <Button
              onClick={handlePostToComments}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 mb-3"
              size="lg"
            >
              <Share2 className="h-5 w-5 mr-2" />
              {isRo ? 'Postează Scorul în Comunitate' : 'Post Score to Community'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">
                {isRo ? 'Scorul a fost postat!' : 'Score posted!'}
              </span>
            </div>
          )}

          {/* Link to Full Map */}
          <Link 
            to="/fact-maps"
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Map className="h-4 w-4" />
            <span>{isRo ? 'Explorează Harta Completă' : 'Explore Full Map'}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          size="lg"
        >
          {isRo ? 'Continuă la Declarația Viziunii →' : 'Continue to Vision Declaration →'}
        </Button>
      </motion.div>
    );
  }

  // Quiz UI
  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("p-2 rounded-lg flex-shrink-0", dimensionConfig.bg)}>
              <DimensionIcon className={cn("w-5 h-5", dimensionConfig.color)} />
            </div>
            <div className="min-w-0">
              <h2 className={cn("text-lg font-bold truncate", dimensionConfig.color)}>
                {isRo ? dimensionConfig.titleRo : dimensionConfig.title}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {isRo ? dimensionConfig.subtitle : dimensionConfig.subtitleEn}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-foreground">{currentQuestionIndex + 1}</span>
            <span className="text-muted-foreground text-sm">/{totalQuestions}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2 bg-muted" />
        <p className="text-xs text-muted-foreground mt-2">
          {isRo ? 'Evaluare Harta Realității' : 'Reality Map Assessment'}
        </p>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 border-2 bg-card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-primary mb-1">
                {isRo ? currentQuestion.section : currentQuestion.sectionEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.sectionDescription[language]}
              </p>
            </div>

            {/* Level Cards */}
            <div className="space-y-3">
              {currentQuestion.levels.map((level, idx) => {
                const levelKey = level.name.toUpperCase() as keyof typeof LEVEL_CONFIG;
                const config = LEVEL_CONFIG[levelKey];
                if (!config) return null;
                
                const currentScoreValue = scores[currentQuestion.id as keyof WarriorPowerScores];
                const hasScoreInThisLevel = currentScoreValue && config.range.includes(currentScoreValue);
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all duration-300",
                      hasScoreInThisLevel ? [config.bg, config.border, "shadow-lg", config.glow] : 
                        ["bg-card/50", "border-border/30", "hover:border-border"]
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn("font-bold text-base", hasScoreInThisLevel ? config.text : "text-foreground")}>
                            {level.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {config.range[0]}-{config.range[2]} pts
                          </span>
                        </div>
                        <p className={cn("text-sm font-medium mb-1", hasScoreInThisLevel ? config.text : "text-foreground/80")}>
                          {level.title[language]}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                          {level.description[language]}
                        </p>
                        
                        {/* Inline Score Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {config.range.map((score) => (
                            <motion.button
                              key={score}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleScoreSelect(score, level.name)}
                              className={cn(
                                "h-10 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200",
                                (selectedScore === score && selectedLevel === level.name) || currentScoreValue === score ? [
                                  `bg-gradient-to-r ${config.gradient}`,
                                  "border-transparent",
                                  "text-white",
                                  "shadow-lg"
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
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {isRo ? 'Înapoi' : 'Back'}
        </Button>

        {/* Link to Full Map */}
        <Link 
          to="/fact-maps"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">{isRo ? 'Harta Completă' : 'Full Map'}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};
