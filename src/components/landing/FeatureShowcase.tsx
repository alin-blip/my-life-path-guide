import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy,
  Brain,
  Eye, 
  Dumbbell, 
  CalendarDays,
  Rocket,
  Sparkles,
  Users,
  Target,
  LucideIcon
} from "lucide-react";

// Feature screenshots - using placeholder images for now
// These will be replaced with actual screenshots
const featureImages = {
  challenge: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop",
  aiCoaches: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop",
  visionBoard: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  warriorRoutine: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
  theDoor: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop",
  accelerator: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
  stacks: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop",
  brotherhood: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
  monthlyMission: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop",
};

interface Feature {
  id: string;
  title: string;
  problem: string;
  solution: string;
  image: string;
  icon: LucideIcon;
  color: string;
}

const features: Feature[] = [
  {
    id: 'challenge',
    title: 'Have It All Challenge',
    problem: 'Știi că trebuie să schimbi ceva... dar ideea de "transformare" te copleșește. Nu știi de unde să începi.',
    solution: '7 zile ghidate pas cu pas. Un singur task pe zi. Zero overwhelm. Rezultate vizibile din ziua 1.',
    image: featureImages.challenge,
    icon: Trophy,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'ai-coaches',
    title: '4 AI Coaches',
    problem: 'Plătești sute de euro pe un coach... și tot ești blocat după 3 săptămâni. Sau nu-ți permiți deloc.',
    solution: '4 coach-uri AI specializate pentru Corp, Minte, Relații și Business. Disponibile 24/7. Răspunsuri instant.',
    image: featureImages.aiCoaches,
    icon: Brain,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'vision-board',
    title: 'Vision Board AI',
    problem: 'Știi că vrei mai mult, dar nu poți vizualiza cum arată viața la care visezi...',
    solution: 'AI-ul generează imagini cu viața ta de vis în toate cele 4 arii. Le vezi zilnic. Devin realitate.',
    image: featureImages.visionBoard,
    icon: Eye,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'warrior-routine',
    title: 'Rutina Războinicului',
    problem: 'Ai încercat meditație, exerciții, journaling... separat. Niciuna n-a ținut mai mult de 2 săptămâni.',
    solution: 'O singură rutină de 20 minute care le combină pe toate. Ghidată pas cu pas. Imposibil să dai greș.',
    image: featureImages.warriorRoutine,
    icon: Dumbbell,
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'the-door',
    title: 'The Door (War Planning)',
    problem: 'Săptămâna trece și nu știi ce ai făcut. Ai fost "ocupat" dar n-ai avansat cu nimic important.',
    solution: 'Hit List, Hot List, Do List - vezi exact ce contează săptămâna asta. Prioritizare clară pentru succes.',
    image: featureImages.theDoor,
    icon: CalendarDays,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'accelerator',
    title: 'Warrior Launch Accelerator',
    problem: 'Vrei să crești business-ul dar nu știi cum. Citești cărți, urmărești podcasturi... și nimic nu se schimbă.',
    solution: '47+ lecții video structurate. De la ideea inițială la primii 100K euro. Pas cu pas, fără bullshit.',
    image: featureImages.accelerator,
    icon: Rocket,
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'stacks',
    title: 'Stack-uri Emoționale',
    problem: 'Furia, anxietatea, frustrarea... le înghiți. Le ignori. Dar te mănâncă pe dinăuntru.',
    solution: 'Transformă orice emoție negativă în 10 minute. Ghidare AI care știe exact ce întrebări să pună.',
    image: featureImages.stacks,
    icon: Sparkles,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'brotherhood',
    title: 'Brotherhood Community',
    problem: 'Te simți singur în lupta ta. Nimeni din jur nu înțelege ce încerci să construiești.',
    solution: '2000+ războinici care se susțin reciproc. Feed, chat, tribe-uri. Nu mai ești singur în această călătorie.',
    image: featureImages.brotherhood,
    icon: Users,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'monthly-mission',
    title: 'Misiune Lunară & Progress',
    problem: 'Luna trecută ai zis că schimbi totul. Azi ești în același loc. O lună pierdută. Din nou.',
    solution: 'Obiective clare pe 30 zile cu progres vizibil. Heatmap care dovedește transformarea ta zilnică.',
    image: featureImages.monthlyMission,
    icon: Target,
    color: 'from-cyan-500 to-teal-500'
  },
];

const TYPING_SPEED = 35; // ms per character
const PAUSE_BETWEEN_TEXTS = 800; // ms pause between problem and solution
const FEATURE_DURATION = 10000; // 10 seconds per feature

export const FeatureShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayProblem, setDisplayProblem] = useState('');
  const [displaySolution, setDisplaySolution] = useState('');
  const [phase, setPhase] = useState<'problem' | 'pause' | 'solution' | 'reading'>('problem');
  const [progress, setProgress] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentFeature = features[activeIndex];

  // Typing animation effect
  useEffect(() => {
    let timeout: number;
    
    if (phase === 'problem') {
      const targetText = currentFeature.problem;
      if (displayProblem.length < targetText.length) {
        timeout = window.setTimeout(() => {
          setDisplayProblem(targetText.slice(0, displayProblem.length + 1));
        }, TYPING_SPEED);
      } else {
        timeout = window.setTimeout(() => {
          setPhase('pause');
        }, PAUSE_BETWEEN_TEXTS);
      }
    } else if (phase === 'pause') {
      timeout = window.setTimeout(() => {
        setPhase('solution');
      }, 100);
    } else if (phase === 'solution') {
      const targetText = currentFeature.solution;
      if (displaySolution.length < targetText.length) {
        timeout = window.setTimeout(() => {
          setDisplaySolution(targetText.slice(0, displaySolution.length + 1));
        }, TYPING_SPEED);
      } else {
        setPhase('reading');
      }
    }

    return () => window.clearTimeout(timeout);
  }, [displayProblem, displaySolution, phase, currentFeature]);

  // Auto-rotate features
  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + (100 / (FEATURE_DURATION / 100));
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [activeIndex]);

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % features.length);
    setDisplayProblem('');
    setDisplaySolution('');
    setPhase('problem');
    setProgress(0);
  }, []);

  const goToFeature = (index: number) => {
    setActiveIndex(index);
    setDisplayProblem('');
    setDisplaySolution('');
    setPhase('problem');
    setProgress(0);
  };

  // Calculate indicator position
  const getIndicatorStyle = () => {
    const activeItem = itemRefs.current[activeIndex];
    if (!activeItem || !listRef.current) return { top: 0, height: 0 };
    
    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    return {
      top: itemRect.top - listRect.top,
      height: itemRect.height,
    };
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tot ce ai nevoie pentru{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              transformare
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            9 funcții integrate care lucrează împreună pentru a-ți construi viața pe care o meriți
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-8 max-w-6xl mx-auto">
          {/* Main Display Area */}
          <div className="space-y-6">
            {/* Screenshot with animated neon border */}
            <div className="relative">
              {/* Animated gradient border glow */}
              <motion.div
                className="absolute -inset-1 rounded-2xl opacity-75"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6)',
                  backgroundSize: '300% 300%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              {/* Blur glow effect */}
              <motion.div
                className="absolute -inset-2 rounded-2xl blur-xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                }}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentFeature.id}
                    src={currentFeature.image}
                    alt={currentFeature.title}
                    className="w-full aspect-video object-cover"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                  />
                </AnimatePresence>
                
                {/* Feature badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentFeature.color} text-white text-sm font-medium shadow-lg`}>
                    <currentFeature.icon className="w-4 h-4" />
                    {currentFeature.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Typing Text Box */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 min-h-[140px]">
              {/* Problem */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-orange-500/90 font-medium leading-relaxed">
                    {displayProblem}
                    {phase === 'problem' && displayProblem.length < currentFeature.problem.length && (
                      <span className="inline-block w-2 h-5 bg-orange-500 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>

              {/* Solution */}
              {(phase === 'solution' || phase === 'reading') && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-xl">✓</span>
                  <p className="text-emerald-500/90 font-medium leading-relaxed">
                    {displaySolution}
                    {phase === 'solution' && displaySolution.length < currentFeature.solution.length && (
                      <span className="inline-block w-2 h-5 bg-emerald-500 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${currentFeature.color}`}
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Feature List Sidebar with Slide Indicator */}
          <div className="relative" ref={listRef}>
            {/* Animated slide indicator */}
            <motion.div
              className="absolute left-0 w-1 rounded-full z-10"
              style={{
                background: 'linear-gradient(180deg, #3b82f6, #06b6d4, #3b82f6)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(6, 182, 212, 0.6), 0 0 45px rgba(59, 130, 246, 0.4)',
              }}
              animate={{
                top: getIndicatorStyle().top,
                height: getIndicatorStyle().height,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
            
            <div className="space-y-2 pl-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = index === activeIndex;
                
                return (
                  <motion.button
                    key={feature.id}
                    ref={(el) => (itemRefs.current[index] = el)}
                    onClick={() => goToFeature(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden ${
                      isActive 
                        ? 'bg-blue-500/10 text-foreground' 
                        : 'bg-card/50 border border-transparent hover:bg-muted/50 hover:border-border'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Neon glow background for active */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                          boxShadow: 'inset 0 0 25px rgba(59, 130, 246, 0.1)',
                        }}
                      />
                    )}
                    
                    <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${feature.color} text-white shadow-md` 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`relative z-10 font-medium text-sm transition-colors duration-300 ${
                      isActive ? 'text-blue-400' : 'text-muted-foreground'
                    }`}>
                      {feature.title}
                    </span>
                    {isActive && (
                      <motion.div 
                        className="relative z-10 ml-auto w-2 h-2 rounded-full bg-blue-400"
                        animate={{ 
                          boxShadow: [
                            '0 0 5px rgba(59, 130, 246, 0.8)',
                            '0 0 15px rgba(59, 130, 246, 1)',
                            '0 0 5px rgba(59, 130, 246, 0.8)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    
                    {/* Progress bar for active item */}
                    {isActive && (
                      <motion.div 
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ 
                          width: `${progress}%`,
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};