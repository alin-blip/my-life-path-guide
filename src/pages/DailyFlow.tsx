import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Zap, Home } from 'lucide-react';
import { ChampionRoutineFlow, RoutineStepId } from '@/components/champion-routine/ChampionRoutineFlow';
import { FocusModeBackground } from '@/components/champion-routine/FocusModeBackground';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion } from 'framer-motion';

const DailyFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });
  
  // Get initial step from query param
  const initialStep = searchParams.get('step') as RoutineStepId | null;
  
  // Determine time of day for greeting
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour < 12) return { text: 'Bună dimineața', icon: Sun, emoji: '🌅', gradient: 'from-amber-500/20 to-orange-500/20' };
    if (hour < 18) return { text: 'Bună ziua', icon: Zap, emoji: '☀️', gradient: 'from-yellow-500/20 to-amber-500/20' };
    return { text: 'Bună seara', icon: Moon, emoji: '🌙', gradient: 'from-indigo-500/20 to-purple-500/20' };
  };
  const greeting = getGreeting();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Focus Mode Background */}
      <FocusModeBackground />
      
      {/* Gradient Overlay based on time of day */}
      <div className={`absolute inset-0 bg-gradient-to-b ${greeting.gradient} pointer-events-none z-[1]`} />
      
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Floating Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-20"
        >
          <div className="container max-w-4xl mx-auto px-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Home className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{greeting.emoji}</span>
                  <h1 className="text-lg font-semibold text-white truncate">
                    Rutina Zilnică
                  </h1>
                </div>
                <p className="text-sm text-white/50 capitalize truncate">{today}</p>
              </div>
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
