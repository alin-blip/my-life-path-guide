import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Zap } from 'lucide-react';
import { ChampionRoutineFlow, RoutineStepId } from '@/components/champion-routine/ChampionRoutineFlow';
import { FocusModeBackground } from '@/components/champion-routine/FocusModeBackground';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const DailyFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: ro });
  
  // Get initial step from query param
  const initialStep = searchParams.get('step') as RoutineStepId | null;
  
  // Determine time of day for greeting
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour < 12) return { text: 'Bună dimineața', icon: Sun, emoji: '🌅' };
    if (hour < 18) return { text: 'Bună ziua', icon: Zap, emoji: '☀️' };
    return { text: 'Bună seara', icon: Moon, emoji: '🌙' };
  };
  const greeting = getGreeting();

  return (
    <div className="min-h-screen relative">
      {/* Cosmic Focus Mode Background */}
      <FocusModeBackground />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {/* Header - Simplified & Unified */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {greeting.emoji} Rutina Zilnică
              </h1>
              <p className="text-white/60 capitalize">{today}</p>
            </div>
          </div>

          {/* Unified Routine Flow - All functionality here */}
          <ChampionRoutineFlow 
            onComplete={() => navigate('/dashboard')} 
            initialStep={initialStep || undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyFlow;
