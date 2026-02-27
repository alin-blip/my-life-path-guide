import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const EARLY_BIRD_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const STORAGE_KEY = 'ceomindos_early_bird_start';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(startTime: number): TimeLeft {
  const endTime = startTime + EARLY_BIRD_DURATION_MS;
  const difference = endTime - Date.now();

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

async function getVisitorFingerprint(): Promise<string> {
  // Simple fingerprint based on available browser info
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `fp_${Math.abs(hash).toString(36)}`;
}

export function LandingEarlyBirdTimer() {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTimer = async () => {
      try {
        const fingerprint = await getVisitorFingerprint();
        const storageKey = `${STORAGE_KEY}_${fingerprint}`;
        
        let startTime = localStorage.getItem(storageKey);
        
        if (!startTime) {
          // First visit - start the timer
          const now = Date.now().toString();
          localStorage.setItem(storageKey, now);
          startTime = now;
        }
        
        const startMs = parseInt(startTime, 10);
        setTimeLeft(calculateTimeLeft(startMs));
        
        // Update every second
        const timer = setInterval(() => {
          setTimeLeft(calculateTimeLeft(startMs));
        }, 1000);
        
        setIsLoading(false);
        return () => clearInterval(timer);
      } catch (error) {
        console.error('Timer init error:', error);
        setIsLoading(false);
      }
    };

    initTimer();
  }, []);

  if (isLoading || !timeLeft || timeLeft.total <= 0) {
    return null;
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 ${
        isUrgent 
          ? 'border-red-500/50 bg-red-500/10' 
          : 'border-amber-500/50 bg-amber-500/10'
      }`}
    >
      <div className={`p-1.5 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-amber-500'}`}>
        <Flame className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}>
          Have It All Lifestyle Free Challenge
        </span>
        
        <div className="flex items-center gap-1 font-mono text-sm font-bold">
          <TimeBlock value={timeLeft.days} label="z" isUrgent={isUrgent} />
          <span className={isUrgent ? 'text-red-400' : 'text-amber-400'}>:</span>
          <TimeBlock value={timeLeft.hours} label="h" isUrgent={isUrgent} />
          <span className={isUrgent ? 'text-red-400' : 'text-amber-400'}>:</span>
          <TimeBlock value={timeLeft.minutes} label="m" isUrgent={isUrgent} />
          {timeLeft.days === 0 && (
            <>
              <span className={isUrgent ? 'text-red-400' : 'text-amber-400'}>:</span>
              <TimeBlock value={timeLeft.seconds} label="s" isUrgent={isUrgent} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimeBlock({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
  return (
    <span className={`${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
      {String(value).padStart(2, '0')}{label}
    </span>
  );
}

// Hook for checking if Early Bird is active for current visitor
export function useVisitorEarlyBird() {
  const [isActive, setIsActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const fingerprint = await getVisitorFingerprint();
        const storageKey = `${STORAGE_KEY}_${fingerprint}`;
        const startTime = localStorage.getItem(storageKey);
        
        if (!startTime) {
          // New visitor, Early Bird is active
          setIsActive(true);
          return;
        }
        
        const startMs = parseInt(startTime, 10);
        const tl = calculateTimeLeft(startMs);
        setTimeLeft(tl);
        setIsActive(tl.total > 0);
      } catch {
        setIsActive(true);
      }
    };

    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, []);

  return { isActive, timeLeft };
}
