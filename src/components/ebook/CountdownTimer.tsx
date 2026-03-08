import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TIMER_KEY = 'ebook_upsell_timer_start';

interface CountdownTimerProps {
  language?: 'ro' | 'en';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ language = 'ro' }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    let startTime = localStorage.getItem(TIMER_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(TIMER_KEY, startTime);
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - parseInt(startTime!, 10);
      const remaining = Math.max(0, 24 * 60 * 60 * 1000 - elapsed);
      
      setTimeLeft({
        hours: Math.floor(remaining / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full bg-amber-500/10 border-y border-amber-500/20 py-3 flex items-center justify-center gap-3">
      <Clock className="w-4 h-4 text-amber-400" />
      <span className="text-sm text-white/70 uppercase tracking-wider">{language === 'ro' ? 'Oferta expiră în:' : 'Offer expires in:'}</span>
      <div className="flex items-center gap-1 font-mono text-lg font-bold text-white">
        <span className="bg-white/10 rounded px-2 py-0.5">{pad(timeLeft.hours)}</span>
        <span className="text-amber-400">:</span>
        <span className="bg-white/10 rounded px-2 py-0.5">{pad(timeLeft.minutes)}</span>
        <span className="text-amber-400">:</span>
        <span className="bg-white/10 rounded px-2 py-0.5">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};
