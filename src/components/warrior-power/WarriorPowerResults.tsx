import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, ArrowRight, Sword, Shield, Flame, Crown, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DIMENSION_INFO,
  WARRIOR_POWER_QUESTIONS,
  calculateDimensionScore,
  calculateTotalScore,
  getScorePercentage,
  getOverallLevel,
  getLevelForScore,
  type WarriorPowerScores
} from '@/data/warriorPowerQuestions';

interface WarriorPowerResultsProps {
  scores: WarriorPowerScores;
  userName: string;
}

// Warrior Level definitions with icons and colors
const WARRIOR_LEVELS = [
  { 
    range: [1, 3], 
    name: 'ADORMIT',
    icon: '💤',
    color: 'from-red-600 to-red-800',
    bgColor: 'bg-red-950/50',
    borderColor: 'border-red-600/50',
    textColor: 'text-red-400',
    description: 'Corpul tău este irelevant pentru tine'
  },
  { 
    range: [4, 6], 
    name: 'TREAZ',
    icon: '👁️',
    color: 'from-yellow-600 to-orange-700',
    bgColor: 'bg-yellow-950/50',
    borderColor: 'border-yellow-600/50',
    textColor: 'text-yellow-400',
    description: 'Corpul tău este un obstacol pentru tine'
  },
  { 
    range: [7, 9], 
    name: 'ACTIV',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-950/50',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    description: 'Corpul tău este un sprijin pentru tine'
  },
  { 
    range: [10, 12], 
    name: 'ACCELERAT',
    icon: '🔥',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-950/50',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    description: 'Corpul tău este o armă pentru tine'
  },
];

const LEVEL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  body: {
    ADORMIT: 'Ești ignorant și leneș când vine vorba de exerciții fizice. Nu știi cum funcționează corpul tău și ignori complet realitatea legată de fitness. Nici măcar nu îți amintești ultima dată când ai fost la sală sau ai încercat măcar să transpiri. Nu ai acordat aproape deloc atenție modului în care corpul tău îți afectează viața, așa că fitness-ul nu face parte din realitatea ta. Ești supraponderal și/sau complet ieșit din formă și, sincer, nici nu-ți mai pasă de asta.',
    TREAZ: 'Ești conștient și apreciezi ideea și beneficiile fitness-ului. Mergi la sală de câteva ori pe lună, dar fără o strategie reală care să îți transforme corpul. Știi că de mult îți afectează corpul viața și îți dai seama că trebuie să îți îmbunătățești condiția fizică. Ai gânduri frecvente despre cum să îți îmbunătățești forma fizică, dar faci puțin pentru a schimba lucrurile. Te antrenezi din când în când, dar corpul tău nu se schimbă, ceea ce te dezamăgit.',
    ACTIV: 'Ești foarte bine informat și activ în ceea ce privește fitness-ul. Ești consecvent în antrenamentele tale și te antrenezi între 3-5 ori pe săptămână de ani de zile pentru a-ți menține aspectul fizic actual. Ești extrem de conștient de impactul corpului tău asupra vieții tale și ai făcut o treabă bună menținându-ți fizicul an de an. Îți amintești vremurile când forțai progresul, dar în acest moment fitness-ul este un sprijin zilnic, nu o provocare.',
    ACCELERAT: 'Te antrenezi ca un atlet, cu pasiune și un scop clar. Nu doar că te antrenezi constant... Tu TE ANTRENEZI CU INTENSITATE. Te vezi pe tine ca pe un atlet, iar corpul tău este o armă prin care experimentezi viața. Îți impui provocări zilnice, săptămânale, lunare și trimestriale care îți împing corpul la un nou nivel, indiferent de vârstă. Pentru tine, competiția și fitness-ul sunt una și aceeași.',
  },
  being: {
    ADORMIT: 'Nu ai nicio practică spirituală sau de mindfulness. Starea ta emoțională este haotică și reactivă. Te simți deconectat de tine însuți și de cei din jur.',
    TREAZ: 'Ai început să explorezi practici de mindfulness sau spiritualitate. Ocazional meditezi sau reflectezi asupra vieții tale. Încerci să fii mai prezent, dar încă te lupți cu gândurile negative.',
    ACTIV: 'Ai o practică consistentă de meditație sau reflecție. Ești conștient de starea ta emoțională și lucrezi activ la echilibrul interior. Te simți conectat cu scopul tău.',
    ACCELERAT: 'Ai o practică spirituală profundă și zilnică. Ești în armonie cu tine însuți și radiezi calm și claritate. Îți folosești energia interioară pentru a-i inspira pe alții.',
  },
  balance: {
    ADORMIT: 'Relațiile tale sunt neglijate sau toxice. Nu investești timp în familie sau prieteni. Te simți izolat și singur în cele mai multe zile.',
    TREAZ: 'Încerci să menții relații, dar adesea te simți copleșit. Ai momente bune cu cei dragi, dar și conflicte frecvente. Cauți echilibrul între muncă și viața personală.',
    ACTIV: 'Ai relații sănătoase și nutritive. Investești timp de calitate cu familia și prietenii. Ai găsit un echilibru bun între responsabilități și timp personal.',
    ACCELERAT: 'Relațiile tale sunt o sursă de energie și inspirație. Ești un lider în familia ta și un prieten de încredere. Creezi armonie oriunde mergi.',
  },
  business: {
    ADORMIT: 'Cariera ta stagnează sau ești nemulțumit de munca ta. Nu ai obiective clare financiare sau profesionale. Te simți blocat fără direcție.',
    TREAZ: 'Ai obiective vagi pentru carieră și finanțe. Lucrezi, dar fără o strategie clară de creștere. Visezi la mai mult, dar nu acționezi constant.',
    ACTIV: 'Ai obiective clare și lucrezi strategic spre ele. Venitul tău crește constant și ai o direcție profesională clară. Ești respectat în domeniul tău.',
    ACCELERAT: 'Ești un lider în domeniul tău cu un impact major. Ai multiple surse de venit și libertate financiară. Creezi valoare și inspiri pe alții să facă la fel.',
  },
};

export function WarriorPowerResults({ scores, userName }: WarriorPowerResultsProps) {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>('body');
  
  const totalScore = calculateTotalScore(scores);
  const percentage = getScorePercentage(scores);
  const overallLevel = getOverallLevel(scores);

  const dimensionScores = {
    body: calculateDimensionScore(scores, 'body'),
    being: calculateDimensionScore(scores, 'being'),
    balance: calculateDimensionScore(scores, 'balance'),
    business: calculateDimensionScore(scores, 'business')
  };

  // Get current level for dimension
  const getCurrentLevelForDimension = (dimension: string) => {
    const score = dimensionScores[dimension as keyof typeof dimensionScores];
    const avgScore = Math.round(score / 2); // Convert 24 to 12 scale
    return WARRIOR_LEVELS.find(l => avgScore >= l.range[0] && avgScore <= l.range[1]) || WARRIOR_LEVELS[0];
  };

  const currentDimensionLevel = getCurrentLevelForDimension(selectedDimension);

  // Find weakest and strongest dimensions
  const sortedDimensions = Object.entries(dimensionScores)
    .sort(([, a], [, b]) => a - b);
  const weakestDimension = sortedDimensions[0];
  const strongestDimension = sortedDimensions[sortedDimensions.length - 1];

  const handleLevelClick = (levelIndex: number) => {
    setSelectedLevel(selectedLevel === levelIndex ? null : levelIndex);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hero Result - Warrior Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Sword className="h-6 w-6 text-primary" />
          <span className="text-sm uppercase tracking-widest text-primary font-bold">Warrior Power Assessment</span>
          <Sword className="h-6 w-6 text-primary transform scale-x-[-1]" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {userName}, Iată Nivelul Tău de Warrior
        </h1>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className={cn(
            "relative px-8 py-4 rounded-lg border-2 backdrop-blur-sm",
            percentage <= 25 ? "border-red-500 bg-red-500/10" :
            percentage <= 50 ? "border-yellow-500 bg-yellow-500/10" :
            percentage <= 75 ? "border-blue-500 bg-blue-500/10" :
            "border-green-500 bg-green-500/10"
          )}>
            <div className="text-5xl font-black">{totalScore}<span className="text-2xl text-muted-foreground">/96</span></div>
            <div className={cn(
              "text-lg font-bold uppercase tracking-wider mt-1",
              percentage <= 25 ? "text-red-400" :
              percentage <= 50 ? "text-yellow-400" :
              percentage <= 75 ? "text-blue-400" :
              "text-green-400"
            )}>
              {overallLevel.name}
            </div>
            <Flame className={cn(
              "absolute -top-3 -right-3 h-8 w-8",
              percentage <= 25 ? "text-red-500" :
              percentage <= 50 ? "text-yellow-500" :
              percentage <= 75 ? "text-blue-500" :
              "text-green-500"
            )} />
          </div>
        </div>
      </motion.div>

      {/* Dimension Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {(Object.entries(DIMENSION_INFO) as [string, { name: string; icon: string }][]).map(([key, info]) => {
          const isActive = selectedDimension === key;
          const dimScore = dimensionScores[key as keyof typeof dimensionScores];
          const pct = (dimScore / 24) * 100;
          
          return (
            <button
              key={key}
              onClick={() => setSelectedDimension(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-300",
                isActive 
                  ? "border-primary bg-primary/20 scale-105" 
                  : "border-border bg-card/50 hover:border-primary/50 hover:bg-card",
                pct <= 25 ? "text-red-400" :
                pct <= 50 ? "text-yellow-400" :
                pct <= 75 ? "text-blue-400" :
                "text-green-400"
              )}
            >
              <span className="text-2xl">{info.icon}</span>
              <div className="text-left">
                <div className="font-bold text-foreground">{info.name}</div>
                <div className="text-sm font-semibold">{dimScore}/24</div>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Interactive Level Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-10"
      >
        {WARRIOR_LEVELS.map((level, idx) => {
          const isCurrentLevel = currentDimensionLevel.name === level.name;
          const isSelected = selectedLevel === idx;
          const dimScore = dimensionScores[selectedDimension as keyof typeof dimensionScores];
          const avgScore = Math.round(dimScore / 2);
          const isInRange = avgScore >= level.range[0] && avgScore <= level.range[1];
          
          return (
            <motion.div
              key={level.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <button
                onClick={() => handleLevelClick(idx)}
                className={cn(
                  "w-full text-left rounded-xl border-2 transition-all duration-300 overflow-hidden",
                  isCurrentLevel 
                    ? `${level.borderColor} ${level.bgColor} ring-2 ring-offset-2 ring-offset-background ring-${level.textColor.replace('text-', '')}` 
                    : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {/* Level Range Badge */}
                    <div className={cn(
                      "flex items-center justify-center w-20 h-14 rounded-lg font-black text-lg",
                      isCurrentLevel 
                        ? `bg-gradient-to-br ${level.color} text-white` 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      [{level.range[0]}, {level.range[1]}]
                    </div>
                    
                    {/* Level Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{level.icon}</span>
                        <span className={cn(
                          "font-bold text-lg uppercase tracking-wider",
                          isCurrentLevel ? level.textColor : "text-muted-foreground"
                        )}>
                          {level.name}
                        </span>
                        {isCurrentLevel && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            TU EȘTI AICI
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mt-1",
                        isCurrentLevel ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {level.description}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className={cn(
                    "h-6 w-6 transition-transform",
                    isSelected && "rotate-90",
                    isCurrentLevel ? level.textColor : "text-muted-foreground"
                  )} />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className={cn(
                        "p-4 pt-0 border-t",
                        isCurrentLevel ? `border-${level.borderColor.replace('border-', '')}` : "border-border/30"
                      )}>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                          {LEVEL_DESCRIPTIONS[selectedDimension]?.[level.name] || level.description}
                        </p>
                        
                        {isCurrentLevel && (
                          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                              <Zap className="h-4 w-4" />
                              Aceasta este poziția ta actuală
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Scorul tău în {DIMENSION_INFO[selectedDimension as keyof typeof DIMENSION_INFO]?.name}: {dimScore}/24 puncte
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        <Card className="border-red-500/30 bg-gradient-to-br from-red-950/50 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <h4 className="font-bold text-red-400">Punctul Tău Slab</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground text-lg">
                {DIMENSION_INFO[weakestDimension[0] as keyof typeof DIMENSION_INFO].icon} {DIMENSION_INFO[weakestDimension[0] as keyof typeof DIMENSION_INFO].name}
              </strong>
              <br />
              Scor: {weakestDimension[1]}/24 — Concentrează-te aici pentru cel mai mare impact.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-gradient-to-br from-green-950/50 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Crown className="h-5 w-5 text-green-400" />
              </div>
              <h4 className="font-bold text-green-400">Punctul Tău Forte</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground text-lg">
                {DIMENSION_INFO[strongestDimension[0] as keyof typeof DIMENSION_INFO].icon} {DIMENSION_INFO[strongestDimension[0] as keyof typeof DIMENSION_INFO].name}
              </strong>
              <br />
              Scor: {strongestDimension[1]}/24 — Folosește această putere pentru a-ți ridica celelalte arii.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/20 via-background to-primary/10 p-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <Sword className="h-12 w-12 text-primary mx-auto mb-4" />
          
          <h3 className="text-2xl font-bold mb-3">
            Pregătit să Devii ACCELERAT în Toate Ariile?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Acum că știi exact unde te afli, este timpul să îți setezi obiective anuale
            clare și să începi călătoria spre versiunea ta de warrior.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/pricing')}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg px-8 py-6 font-bold"
          >
            <Flame className="h-5 w-5" />
            Începe Transformarea
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Rezultatele tale au fost salvate și trimise pe email.
        </p>
      </motion.div>
    </div>
  );
}
