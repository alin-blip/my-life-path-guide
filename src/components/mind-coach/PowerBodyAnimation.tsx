import React from 'react';
import { motion } from 'framer-motion';

export function PowerBodyAnimation() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="w-full max-w-[85%]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.3)] p-6"
        >
          {/* Pulsing background energy */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-blue-400/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex flex-col items-center gap-4">
            {/* Power body SVG with blue flames */}
            <div className="relative w-32 h-48">
              {/* Flame particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6 + Math.random() * 8,
                    height: 6 + Math.random() * 8,
                    left: `${20 + Math.random() * 60}%`,
                    bottom: `${10 + Math.random() * 70}%`,
                    background: `radial-gradient(circle, hsl(210, 100%, 70%), hsl(220, 100%, 50%))`,
                  }}
                  animate={{
                    y: [0, -30 - Math.random() * 40],
                    opacity: [0.8, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{
                    duration: 1 + Math.random() * 0.8,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Body silhouette - power pose with raised fist */}
              <svg
                viewBox="0 0 120 180"
                className="w-full h-full drop-shadow-[0_0_15px_hsl(210,100%,60%)]"
              >
                {/* Outer glow */}
                <defs>
                  <filter id="powerGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(210, 100%, 70%)" />
                    <stop offset="50%" stopColor="hsl(220, 100%, 55%)" />
                    <stop offset="100%" stopColor="hsl(230, 100%, 45%)" />
                  </linearGradient>
                </defs>

                {/* Head */}
                <motion.circle
                  cx="60" cy="22" r="14"
                  fill="url(#bodyGrad)"
                  filter="url(#powerGlow)"
                  animate={{ filter: ['url(#powerGlow)', 'url(#powerGlow)'] }}
                />

                {/* Torso */}
                <motion.path
                  d="M 45 38 L 38 90 L 82 90 L 75 38 Z"
                  fill="url(#bodyGrad)"
                  filter="url(#powerGlow)"
                />

                {/* Right arm - RAISED FIST (power pose) */}
                <motion.path
                  d="M 75 42 L 95 35 L 100 10"
                  stroke="url(#bodyGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#powerGlow)"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Fist */}
                <motion.circle
                  cx="100" cy="8" r="6"
                  fill="url(#bodyGrad)"
                  filter="url(#powerGlow)"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Left arm - at side, fist clenched */}
                <motion.path
                  d="M 45 42 L 25 55 L 20 75"
                  stroke="url(#bodyGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#powerGlow)"
                />
                <circle cx="20" cy="77" r="5" fill="url(#bodyGrad)" filter="url(#powerGlow)" />

                {/* Left leg */}
                <motion.path
                  d="M 50 90 L 42 130 L 38 170"
                  stroke="url(#bodyGrad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#powerGlow)"
                />

                {/* Right leg */}
                <motion.path
                  d="M 70 90 L 78 130 L 82 170"
                  stroke="url(#bodyGrad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#powerGlow)"
                />
              </svg>

              {/* Energy rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                  animate={{
                    scale: [1, 1.8 + i * 0.3],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Power text */}
            <motion.div
              className="text-center space-y-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-lg font-bold text-primary">
                STRÂNGE PUMNUL!
              </p>
              <p className="text-sm font-semibold text-primary/80">
                SPUNE CU VOCE TARE!
              </p>
              <p className="text-xs text-muted-foreground italic">
                Mimează poziția de putere ↑
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
