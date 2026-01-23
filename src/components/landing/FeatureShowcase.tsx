import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useScroll } from "framer-motion";
import { Trophy, Brain, Eye, Dumbbell, CalendarDays, Rocket, Sparkles, Users, Target, LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Feature images from storage bucket (generated via AI in Admin > AI Studio > Features)
// Cache-busting timestamp to force fresh images
const STORAGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/feature-images`;
const CACHE_BUSTER = `?v=${Date.now()}`;
const featureImages = {
  challenge: `${STORAGE_BASE}/challenge.png${CACHE_BUSTER}`,
  aiCoaches: `${STORAGE_BASE}/aiCoaches.png${CACHE_BUSTER}`,
  visionBoard: `${STORAGE_BASE}/visionBoard.png${CACHE_BUSTER}`,
  warriorRoutine: `${STORAGE_BASE}/warriorRoutine.png${CACHE_BUSTER}`,
  theDoor: `${STORAGE_BASE}/theDoor.png${CACHE_BUSTER}`,
  accelerator: `${STORAGE_BASE}/accelerator.png${CACHE_BUSTER}`,
  stacks: `${STORAGE_BASE}/stacks.png${CACHE_BUSTER}`,
  brotherhood: `${STORAGE_BASE}/brotherhood.png${CACHE_BUSTER}`,
  monthlyMission: `${STORAGE_BASE}/monthlyMission.png${CACHE_BUSTER}`
};
interface Feature {
  id: string;
  title: string;
  problem: string;
  solution: string;
  image: string;
  icon: LucideIcon;
  color: string;
  hasCosmicBg?: boolean;
}
const features: Feature[] = [{
  id: 'challenge',
  title: 'Have It All Challenge',
  problem: 'Știi că trebuie să schimbi ceva... dar ideea de "transformare" te copleșește. Nu știi de unde să începi.',
  solution: '7 zile ghidate pas cu pas. Un singur task pe zi. Zero overwhelm. Rezultate vizibile din ziua 1.',
  image: featureImages.challenge,
  icon: Trophy,
  color: 'from-amber-500 to-orange-500'
}, {
  id: 'ai-coaches',
  title: 'Accountability Coach + 3',
  problem: 'Plătești sute de euro pe un coach... și tot ești blocat după 3 săptămâni. Sau nu-ți permiți deloc.',
  solution: 'Coach AI personal care te ține responsabil + 3 coach-uri specializate pentru Corp, Minte și Business. 24/7.',
  image: featureImages.aiCoaches,
  icon: Brain,
  color: 'from-violet-500 to-purple-500',
  hasCosmicBg: true
}, {
  id: 'vision-board',
  title: 'Vision Board AI',
  problem: 'Știi că vrei mai mult, dar nu poți vizualiza cum arată viața la care visezi...',
  solution: 'AI-ul generează imagini cu viața ta de vis în toate cele 4 arii. Le vezi zilnic. Devin realitate.',
  image: featureImages.visionBoard,
  icon: Eye,
  color: 'from-purple-500 to-pink-500'
}, {
  id: 'warrior-routine',
  title: 'Rutina Războinicului',
  problem: 'Ai încercat meditație, exerciții, journaling... separat. Niciuna n-a ținut mai mult de 2 săptămâni.',
  solution: 'O singură rutină de 20 minute care le combină pe toate. Ghidată pas cu pas. Imposibil să dai greș.',
  image: featureImages.warriorRoutine,
  icon: Dumbbell,
  color: 'from-red-500 to-orange-500'
}, {
  id: 'the-door',
  title: 'The Door (War Planning)',
  problem: 'Săptămâna trece și nu știi ce ai făcut. Ai fost "ocupat" dar n-ai avansat cu nimic important.',
  solution: 'Hit List, Hot List, Do List - vezi exact ce contează săptămâna asta. Prioritizare clară pentru succes.',
  image: featureImages.theDoor,
  icon: CalendarDays,
  color: 'from-blue-500 to-indigo-500'
}, {
  id: 'accelerator',
  title: 'Warrior Launch Accelerator',
  problem: 'Vrei să crești business-ul dar nu știi cum. Citești cărți, urmărești podcasturi... și nimic nu se schimbă.',
  solution: '47+ lecții video structurate. De la ideea inițială la primii 100K euro. Pas cu pas, fără bullshit.',
  image: featureImages.accelerator,
  icon: Rocket,
  color: 'from-emerald-500 to-green-500'
}, {
  id: 'stacks',
  title: 'Stack-uri Emoționale',
  problem: 'Furia, anxietatea, frustrarea... le înghiți. Le ignori. Dar te mănâncă pe dinăuntru.',
  solution: 'Transformă orice emoție negativă în 10 minute. Ghidare AI care știe exact ce întrebări să pună.',
  image: featureImages.stacks,
  icon: Sparkles,
  color: 'from-violet-500 to-purple-500'
}, {
  id: 'brotherhood',
  title: 'Brotherhood Community',
  problem: 'Te simți singur în lupta ta. Nimeni din jur nu înțelege ce încerci să construiești.',
  solution: '2000+ războinici care se susțin reciproc. Feed, chat, tribe-uri. Nu mai ești singur în această călătorie.',
  image: featureImages.brotherhood,
  icon: Users,
  color: 'from-pink-500 to-rose-500'
}, {
  id: 'monthly-mission',
  title: 'Misiune Lunară & Progress',
  problem: 'Luna trecută ai zis că schimbi totul. Azi ești în același loc. O lună pierdută. Din nou.',
  solution: 'Obiective clare pe 30 zile cu progres vizibil. Heatmap care dovedește transformarea ta zilnică.',
  image: featureImages.monthlyMission,
  icon: Target,
  color: 'from-cyan-500 to-teal-500'
}];
const TYPING_SPEED = 35; // ms per character
const PAUSE_BETWEEN_TEXTS = 800; // ms pause between problem and solution
const FEATURE_DURATION = 10000; // 10 seconds per feature

export const FeatureShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayProblem, setDisplayProblem] = useState('');
  const [displaySolution, setDisplaySolution] = useState('');
  const [phase, setPhase] = useState<'problem' | 'pause' | 'solution' | 'reading'>('problem');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  // Motion values for drag feedback
  const dragX = useMotionValue(0);
  const dragOpacityLeft = useTransform(dragX, [0, 50], [0, 0.8]);
  const dragOpacityRight = useTransform(dragX, [-50, 0], [0.8, 0]);

  // Parallax scroll effect
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [50, -50]);
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

  // Auto-rotate features (pause when dragging)
  useEffect(() => {
    if (isDragging) return;
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + 100 / (FEATURE_DURATION / 100);
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [activeIndex, isDragging]);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    if (!isMobile) return;
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, [isMobile]);
  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % features.length);
    setDisplayProblem('');
    setDisplaySolution('');
    setPhase('problem');
    setProgress(0);
  }, []);
  const goToPrevious = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + features.length) % features.length);
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

  // Handle swipe drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    if (info.offset.x < -threshold) {
      goToNext();
    } else if (info.offset.x > threshold) {
      goToPrevious();
    }
  };

  // Calculate indicator position
  const getIndicatorStyle = () => {
    const activeItem = itemRefs.current[activeIndex];
    if (!activeItem || !listRef.current) return {
      top: 0,
      height: 0
    };
    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    return {
      top: itemRect.top - listRect.top,
      height: itemRect.height
    };
  };
  return <section ref={sectionRef} className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
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
              <motion.div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-card touch-pan-y opacity-70 border-accent" drag={isMobile ? "x" : false} dragConstraints={{
              left: 0,
              right: 0
            }} dragElastic={0.2} onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd} style={{
              x: dragX
            }} whileDrag={{
              cursor: "grabbing"
            }}>
                <AnimatePresence mode="wait">
                  <motion.div key={currentFeature.id} className="relative w-full aspect-video" initial={{
                  opacity: 0,
                  scale: 1.02
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  scale: 0.98
                }} transition={{
                  duration: 0.4
                }}>
                    {/* Cosmic background for specific features */}
                    {currentFeature.hasCosmicBg && <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 overflow-hidden">
                        {/* Animated stars */}
                        <div className="absolute inset-0">
                          {[...Array(50)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.3 + Math.random() * 0.7
                      }} animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1]
                      }} transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }} />)}
                        </div>
                        
                        {/* Power lines / energy rays */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          {/* Radial energy lines from center */}
                          {[...Array(12)].map((_, i) => <motion.line key={i} x1="50%" y1="50%" x2={`${50 + Math.cos(i * 30 * Math.PI / 180) * 60}%`} y2={`${50 + Math.sin(i * 30 * Math.PI / 180) * 60}%`} stroke="url(#powerLineGradient)" strokeWidth="1" strokeOpacity="0.3" initial={{
                        pathLength: 0,
                        opacity: 0
                      }} animate={{
                        pathLength: [0, 1, 0],
                        opacity: [0, 0.6, 0]
                      }} transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }} />)}
                          
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="powerLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                            </linearGradient>
                            <radialGradient id="centerGlow">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          
                          {/* Center glow */}
                          <motion.circle cx="50%" cy="50%" r="20%" fill="url(#centerGlow)" animate={{
                        r: ["15%", "25%", "15%"],
                        opacity: [0.3, 0.6, 0.3]
                      }} transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }} />
                        </svg>
                        
                        {/* Orbital rings */}
                        <motion.div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/20" animate={{
                      rotate: 360
                    }} transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }} />
                        <motion.div className="absolute top-1/2 left-1/2 w-[400px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/15" style={{
                      transform: "translateX(-50%) translateY(-50%) rotateX(60deg)"
                    }} animate={{
                      rotate: -360
                    }} transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear"
                    }} />
                      </div>}
                    
                    {/* Feature image with shining blue border for cosmic features */}
                    <div className={`${currentFeature.hasCosmicBg ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto max-w-[85%] md:max-w-[70%] h-auto max-h-[85%]' : 'w-full h-full'}`}>
                      {/* Shining blue border glow - only around the image */}
                      {currentFeature.hasCosmicBg && <motion.div className="absolute -inset-1 md:-inset-2 rounded-xl z-0" style={{
                      background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #60a5fa, #06b6d4, #3b82f6)',
                      backgroundSize: '300% 100%'
                    }} animate={{
                      backgroundPosition: ['0% 0%', '300% 0%'],
                      boxShadow: ['0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(6, 182, 212, 0.4), 0 0 45px rgba(59, 130, 246, 0.2)', '0 0 25px rgba(6, 182, 212, 0.8), 0 0 50px rgba(59, 130, 246, 0.5), 0 0 75px rgba(6, 182, 212, 0.3)', '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(6, 182, 212, 0.4), 0 0 45px rgba(59, 130, 246, 0.2)']
                    }} transition={{
                      backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      },
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    }} />}
                      <motion.img src={currentFeature.image} alt={currentFeature.title} className={`pointer-events-none select-none relative z-10 ${currentFeature.hasCosmicBg ? 'w-full h-full object-contain rounded-xl' : 'w-full h-full object-cover'}`} style={{
                      y: parallaxY
                    }} draggable={false} />
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Swipe indicators */}
                <motion.div className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 lg:hidden" style={{
                opacity: dragOpacityLeft
              }}>
                  <ChevronLeft className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2 lg:hidden" style={{
                opacity: dragOpacityRight
              }}>
                  <ChevronRight className="w-6 h-6 text-white" />
                </motion.div>
                
                {/* Feature badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentFeature.color} text-white text-sm font-medium shadow-lg`}>
                    <currentFeature.icon className="w-4 h-4" />
                    {currentFeature.title}
                  </div>
                </div>
                
                {/* Swipe hint for mobile */}
                <AnimatePresence>
                  {showSwipeHint && isMobile && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0
                }} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4 text-white/80 animate-pulse" />
                      <span className="text-xs text-white/80">Swipe pentru a naviga</span>
                      <ChevronRight className="w-4 h-4 text-white/80 animate-pulse" />
                    </motion.div>}
                </AnimatePresence>
              </motion.div>
              
              {/* Mobile dots indicator */}
              <div className="flex justify-center gap-2 mt-4 lg:hidden">
                {features.map((_, index) => <button key={index} onClick={() => goToFeature(index)} className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'}`} aria-label={`Go to feature ${index + 1}`} />)}
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
                    {phase === 'problem' && displayProblem.length < currentFeature.problem.length && <span className="inline-block w-2 h-5 bg-orange-500 ml-0.5 animate-pulse" />}
                  </p>
                </div>
              </div>

              {/* Solution */}
              {(phase === 'solution' || phase === 'reading') && <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="flex items-start gap-3">
                  <span className="text-xl">✓</span>
                  <p className="text-emerald-500/90 font-medium leading-relaxed">
                    {displaySolution}
                    {phase === 'solution' && displaySolution.length < currentFeature.solution.length && <span className="inline-block w-2 h-5 bg-emerald-500 ml-0.5 animate-pulse" />}
                  </p>
                </motion.div>}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div className={`h-full bg-gradient-to-r ${currentFeature.color}`} style={{
              width: `${progress}%`
            }} transition={{
              duration: 0.1
            }} />
            </div>
          </div>

          {/* Feature List Sidebar with Slide Indicator */}
          <div className="relative" ref={listRef}>
            {/* Animated slide indicator */}
            <motion.div className="absolute left-0 w-1 rounded-full z-10" style={{
            background: 'linear-gradient(180deg, #3b82f6, #06b6d4, #3b82f6)',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(6, 182, 212, 0.6), 0 0 45px rgba(59, 130, 246, 0.4)'
          }} animate={{
            top: getIndicatorStyle().top,
            height: getIndicatorStyle().height
          }} transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }} />
            
            <div className="space-y-2 pl-4">
              {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeIndex;
              return <motion.button key={feature.id} ref={el => itemRefs.current[index] = el} onClick={() => goToFeature(index)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden ${isActive ? 'bg-blue-500/10 text-foreground' : 'bg-card/50 border border-transparent hover:bg-muted/50 hover:border-border'}`} whileHover={{
                x: 4
              }} whileTap={{
                scale: 0.98
              }}>
                    {/* Neon glow background for active */}
                    {isActive && <motion.div className="absolute inset-0 rounded-xl" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} style={{
                  background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                  boxShadow: 'inset 0 0 25px rgba(59, 130, 246, 0.1)'
                }} />}
                    
                    <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive ? `bg-gradient-to-br ${feature.color} text-white shadow-md` : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`relative z-10 font-medium text-sm transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {feature.title}
                    </span>
                    {isActive && <motion.div className="relative z-10 ml-auto w-2 h-2 rounded-full bg-blue-400" animate={{
                  boxShadow: ['0 0 5px rgba(59, 130, 246, 0.8)', '0 0 15px rgba(59, 130, 246, 1)', '0 0 5px rgba(59, 130, 246, 0.8)']
                }} transition={{
                  duration: 1.5,
                  repeat: Infinity
                }} />}
                    
                    {/* Progress bar for active item */}
                    {isActive && <motion.div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400" style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)'
                }} />}
                  </motion.button>;
            })}
            </div>
          </div>
        </div>
      </div>
    </section>;
};