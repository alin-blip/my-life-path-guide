import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Check } from 'lucide-react';

interface EarlyBirdCountdownCardProps {
  quizCompletedAt?: string;
}

const EARLY_BIRD_DURATION = 72 * 60 * 60 * 1000; // 72 hours in milliseconds
const STORAGE_KEY = 'warrior_power_early_bird_start';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(startTime: number): TimeLeft {
  const now = Date.now();
  const endTime = startTime + EARLY_BIRD_DURATION;
  const diff = Math.max(0, endTime - now);

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff
  };
}

export function EarlyBirdCountdownCard({ quizCompletedAt }: EarlyBirdCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Get or set start time
    let start = localStorage.getItem(STORAGE_KEY);
    
    if (!start) {
      // Use quiz completion time or current time
      const now = quizCompletedAt ? new Date(quizCompletedAt).getTime() : Date.now();
      localStorage.setItem(STORAGE_KEY, now.toString());
      start = now.toString();
    }

    setStartTime(parseInt(start, 10));
  }, [quizCompletedAt]);

  useEffect(() => {
    if (!startTime) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(startTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!timeLeft || timeLeft.total <= 0) {
    return null; // Don't show if expired
  }

  const isUrgent = timeLeft.hours < 24;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl border-2 ${
        isUrgent 
          ? 'border-red-500 bg-gradient-to-br from-red-50 via-white to-orange-50' 
          : 'border-primary bg-gradient-to-br from-primary/10 via-white to-primary/5'
      }`}
    >
      {/* Animated background pulse for urgency */}
      {isUrgent && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      )}

      <div className="relative p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className={`h-5 w-5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
          <span className={`font-bold uppercase tracking-wider text-sm ${
            isUrgent ? 'text-red-400' : 'text-primary'
          }`}>
            Ofertă Early Bird - Expiră în:
          </span>
          <Flame className={`h-5 w-5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-5">
          <TimeUnit value={timeLeft.hours} label="ore" isUrgent={isUrgent} />
          <span className={`text-2xl font-bold ${isUrgent ? 'text-red-400' : 'text-primary'}`}>:</span>
          <TimeUnit value={timeLeft.minutes} label="min" isUrgent={isUrgent} />
          <span className={`text-2xl font-bold ${isUrgent ? 'text-red-400' : 'text-primary'}`}>:</span>
          <TimeUnit value={timeLeft.seconds} label="sec" isUrgent={isUrgent} />
        </div>

        {/* Price Comparison */}
        <div className="space-y-3">
          {/* Normal Prices - Strikethrough */}
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span className="text-xs uppercase tracking-wide">Prețuri normale:</span>
            <div className="flex gap-3">
              <span className="line-through text-sm">Basic €99</span>
              <span className="line-through text-sm">Pro €197</span>
              <span className="line-through text-sm">Elite €497</span>
            </div>
          </div>

          {/* Early Bird Prices */}
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-xs uppercase tracking-wide text-green-400 font-semibold">Prețul TĂU acum:</span>
            <div className="flex gap-3">
              <span className="font-bold text-green-400">Basic €49</span>
              <span className="font-bold text-green-400">Pro €97</span>
              <span className="font-bold text-green-400">Elite €297</span>
            </div>
          </div>

          {/* Savings Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-semibold text-green-400">
              <Clock className="h-3 w-3" />
              Economisești până la €200!
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center
        ${isUrgent 
          ? 'bg-red-500/20 border-2 border-red-500/50' 
          : 'bg-primary/20 border-2 border-primary/50'
        }
      `}>
        <span className={`text-2xl md:text-3xl font-black tabular-nums ${
          isUrgent ? 'text-red-400' : 'text-primary'
        }`}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-gray-600 mt-1">{label}</span>
    </div>
  );
}
