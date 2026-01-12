import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Zap, Home } from 'lucide-react';
import { ChampionRoutineFlow, RoutineStepId } from '@/components/champion-routine/ChampionRoutineFlow';
import { FocusModeBackground } from '@/components/champion-routine/FocusModeBackground';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const DailyFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });
  
  // Get initial step from query param
  const initialStep = searchParams.get('step') as RoutineStepId | null;
  
  // Determine time of day for greeting
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour < 12) return { 
      text: 'Bună dimineața', 
      icon: Sun, 
      emoji: '🌅', 
      gradientLight: 'from-amber-100/50 to-orange-100/30',
      gradientDark: 'from-amber-500/20 to-orange-500/20' 
    };
    if (hour < 18) return { 
      text: 'Bună ziua', 
      icon: Zap, 
      emoji: '☀️', 
      gradientLight: 'from-yellow-100/50 to-amber-100/30',
      gradientDark: 'from-yellow-500/20 to-amber-500/20' 
    };
    return { 
      text: 'Bună seara', 
      icon: Moon, 
      emoji: '🌙', 
      gradientLight: 'from-indigo-100/40 to-purple-100/30',
      gradientDark: 'from-indigo-500/20 to-purple-500/20' 
    };
  };
  const greeting = getGreeting();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Focus Mode Background */}
      <FocusModeBackground />
      
      {/* Gradient Overlay based on time of day - Theme aware */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b pointer-events-none z-[1]",
        theme === 'dark' ? greeting.gradientDark : greeting.gradientLight
      )} />
      
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Floating Header - Theme aware */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-20"
        >
          <div className="container max-w-4xl mx-auto px-4 pt-4">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-2xl backdrop-blur-xl border",
              theme === 'dark' 
                ? "bg-black/30 border-white/10" 
                : "bg-white/70 border-border/50 shadow-lg"
            )}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "rounded-xl",
                  theme === 'dark' 
                    ? "text-white/80 hover:text-white hover:bg-white/10" 
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )}
              >
                <Home className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{greeting.emoji}</span>
                  <h1 className={cn(
                    "text-lg font-semibold truncate",
                    theme === 'dark' ? "text-white" : "text-foreground"
                  )}>
                    Rutina Zilnică
                  </h1>
                </div>
                <p className={cn(
                  "text-sm capitalize truncate",
                  theme === 'dark' ? "text-white/50" : "text-muted-foreground"
                )}>{today}</p>
              </div>
              
              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "rounded-xl transition-all",
                  theme === 'dark' 
                    ? "text-white/80 hover:text-white hover:bg-white/10" 
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="container max-w-4xl mx-auto px-4 py-4"
        >
          <ChampionRoutineFlow 
            onComplete={() => navigate('/dashboard')} 
            initialStep={initialStep || undefined}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DailyFlow;
