import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Home } from 'lucide-react';
import { ChampionRoutineFlow, RoutineStepId } from '@/components/champion-routine/ChampionRoutineFlow';
import { FocusModeBackground } from '@/components/champion-routine/FocusModeBackground';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { useAchievements } from '@/hooks/useAchievements';

const DailyFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { check: checkAchievements } = useAchievements();
  const shortDate = format(new Date(), "d MMM", { locale: ro }).toUpperCase();

  const initialStep = searchParams.get('step') as RoutineStepId | null;

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      <FocusModeBackground />

      {/* Slim vertical side rail — premium, discreet */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-30 w-10 flex flex-col items-center justify-between py-3",
          "border-r backdrop-blur-xl",
          theme === 'dark'
            ? "bg-black/40 border-[hsl(var(--primary)/0.2)]"
            : "bg-white/70 border-border/50"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className={cn(
            "h-8 w-8 rounded-lg",
            theme === 'dark'
              ? "text-white/70 hover:text-[hsl(var(--primary))] hover:bg-white/5"
              : "text-foreground/70 hover:text-foreground hover:bg-muted"
          )}
          title="Acasă"
        >
          <Home className="h-4 w-4" />
        </Button>

        <div
          className={cn(
            "flex flex-col items-center gap-2 select-none",
            theme === 'dark' ? "text-white/70" : "text-muted-foreground"
          )}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">
            Rutina
          </span>
          <span
            className={cn(
              "text-[10px] font-mono tracking-widest",
              theme === 'dark' ? "text-[hsl(var(--primary))]/80" : "text-primary/80"
            )}
          >
            {shortDate}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={cn(
            "h-8 w-8 rounded-lg",
            theme === 'dark'
              ? "text-white/70 hover:text-[hsl(var(--primary))] hover:bg-white/5"
              : "text-foreground/70 hover:text-foreground hover:bg-muted"
          )}
          title="Temă"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
        </Button>
      </motion.aside>

      {/* Content Layer — offset for side rail */}
      <div className="relative z-10 flex flex-col h-full pl-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <ChampionRoutineFlow
              onComplete={async () => {
                await checkAchievements();
                navigate('/dashboard');
              }}
              initialStep={initialStep || undefined}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyFlow;

