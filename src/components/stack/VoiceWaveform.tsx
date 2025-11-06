import React, { useRef, useEffect } from 'react';

interface VoiceWaveformProps {
  audioLevel: number;
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  variant?: 'inline' | 'fullscreen';
  width?: number;
  height?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  audioLevel,
  isUserSpeaking,
  isAISpeaking,
  variant = 'inline',
  width = 200,
  height = 60
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(new Array(32).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = barsRef.current;
    const barCount = bars.length;
    const barWidth = width / barCount;
    const centerY = height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Shift bars and add new level
      bars.shift();
      bars.push(audioLevel);

      // Dynamic colors based on state
      let gradient;
      if (isAISpeaking) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)'); // green
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');
      } else if (isUserSpeaking) {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)'); // red
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      } else {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)'); // blue
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      }

      // Draw bars
      bars.forEach((level, i) => {
        const barHeight = level * height * 0.8;
        const x = i * barWidth;
        const y = centerY - barHeight / 2;

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isUserSpeaking, isAISpeaking, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-md ${variant === 'inline' ? 'border border-border' : ''}`}
    />
  );
};
