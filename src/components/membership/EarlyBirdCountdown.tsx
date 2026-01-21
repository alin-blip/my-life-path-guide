import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EarlyBirdCountdownProps {
  expiresAt: string | null;
  compact?: boolean;
  showExpiredMessage?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(expiresAt: string): TimeLeft {
  const difference = new Date(expiresAt).getTime() - Date.now();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference
  };
}

export function EarlyBirdCountdown({ 
  expiresAt, 
  compact = false,
  showExpiredMessage = true 
}: EarlyBirdCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    // Calculate immediately
    setTimeLeft(calculateTimeLeft(expiresAt));

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt || !timeLeft) {
    return null;
  }

  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 6;

  if (isExpired && !showExpiredMessage) {
    return null;
  }

  // Compact version for inline use
  if (compact) {
    if (isExpired) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Preț Normal
        </Badge>
      );
    }

    return (
      <Badge 
        className={`gap-1 ${
          isUrgent 
            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }`}
        variant="outline"
      >
        <Clock className="w-3 h-3" />
        {timeLeft.days > 0 
          ? `${timeLeft.days}z ${timeLeft.hours}h`
          : `${timeLeft.hours}h ${timeLeft.minutes}m`
        }
      </Badge>
    );
  }

  // Full version
  if (isExpired) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Oferta Early Bird a expirat - Prețuri normale aplicate
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border-2 p-4 ${
        isUrgent 
          ? 'border-red-500/50 bg-gradient-to-r from-red-500/10 via-orange-500/5 to-red-500/10' 
          : 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10'
      }`}
    >
      {/* Animated top border */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        isUrgent 
          ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500' 
          : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500'
      } animate-pulse`} />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${
          isUrgent 
            ? 'bg-gradient-to-br from-red-500 to-orange-500' 
            : 'bg-gradient-to-br from-amber-500 to-orange-500'
        } shadow-lg`}>
          <Flame className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <Badge className={`${
              isUrgent 
                ? 'bg-red-500 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
            } border-0`}>
              🔥 EARLY BIRD
            </Badge>
            {isUrgent && (
              <Badge variant="outline" className="text-red-400 border-red-500/50 animate-pulse">
                ULTIMELE ORE!
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isUrgent 
              ? 'Grăbește-te! Prețurile Early Bird expiră în curând!'
              : 'Blochează prețul special înainte să expire!'
            }
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <TimeUnit value={timeLeft.days} label="ZILE" isUrgent={isUrgent} />
          <span className={`text-xl font-bold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>:</span>
          <TimeUnit value={timeLeft.hours} label="ORE" isUrgent={isUrgent} />
          <span className={`text-xl font-bold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>:</span>
          <TimeUnit value={timeLeft.minutes} label="MIN" isUrgent={isUrgent} />
          {timeLeft.days === 0 && (
            <>
              <span className={`text-xl font-bold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>:</span>
              <TimeUnit value={timeLeft.seconds} label="SEC" isUrgent={isUrgent} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-xl font-bold ${
        isUrgent 
          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      }`}>
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

// Hook for easy access to early bird status
export function useEarlyBirdStatus(expiresAt: string | null) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setIsActive(false);
      setTimeLeft(null);
      return;
    }

    const check = () => {
      const tl = calculateTimeLeft(expiresAt);
      setTimeLeft(tl);
      setIsActive(tl.total > 0);
    };

    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return { isActive, timeLeft };
}
