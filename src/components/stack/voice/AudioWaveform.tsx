import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  variant?: 'ai' | 'user' | 'idle';
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioLevel,
  isActive,
  variant = 'user',
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array(12).fill(0.2));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barCount = 12;
      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;

      ctx.clearRect(0, 0, width, height);

      // Update bars
      for (let i = 0; i < barCount; i++) {
        if (isActive) {
          const targetHeight = variant === 'ai' 
            ? 0.3 + Math.sin(Date.now() / 200 + i * 0.5) * 0.3 + Math.random() * 0.2
            : 0.1 + audioLevel * 0.8 + Math.random() * 0.1;
          
          barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3;
        } else {
          barsRef.current[i] += (0.15 - barsRef.current[i]) * 0.1;
        }

        const barHeight = barsRef.current[i] * height;
        const x = i * (barWidth + gap) + gap / 2;
        const y = (height - barHeight) / 2;

        // Gradient based on variant
        let gradient;
        if (variant === 'ai') {
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(142, 76%, 50%)');
          gradient.addColorStop(1, 'hsl(142, 76%, 36%)');
        } else if (variant === 'user') {
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(217, 91%, 60%)');
          gradient.addColorStop(1, 'hsl(217, 91%, 45%)');
        } else {
          gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'hsl(0, 0%, 50%)');
          gradient.addColorStop(1, 'hsl(0, 0%, 35%)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, variant]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className={cn('rounded', className)}
    />
  );
};