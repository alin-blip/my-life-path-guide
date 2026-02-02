import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const FocusModeBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep navy blue base - using Tailwind bg colors */}
      <div 
        className={cn(
          "absolute inset-0",
          isDark ? "bg-slate-950" : "bg-slate-100"
        )}
      />
      
      {/* Overlay gradient for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark 
            ? 'radial-gradient(ellipse at 50% 30%, rgba(15, 23, 42, 1) 0%, rgba(2, 6, 23, 1) 50%, rgba(0, 0, 0, 1) 100%)'
            : 'radial-gradient(ellipse at 50% 30%, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)'
        }}
      />
      
      {/* Blue tint overlay */}
      <div 
        className={cn(
          "absolute inset-0",
          isDark ? "bg-blue-950/40" : "bg-blue-100/30"
        )}
      />
      
      {/* Animated energy rings - Focus symbol */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className={cn(
            "absolute w-[600px] h-[600px] rounded-full border-2",
            isDark ? "border-blue-500/10" : "border-blue-400/15"
          )}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={cn(
            "absolute w-[400px] h-[400px] rounded-full border",
            isDark ? "border-cyan-400/15" : "border-cyan-500/20"
          )}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.15, 0.4]
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <motion.div
          className={cn(
            "absolute w-[200px] h-[200px] rounded-full",
            isDark ? "bg-blue-500/5" : "bg-blue-400/10"
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      {/* Warrior energy glow - Top */}
      <motion.div 
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        animate={{
          opacity: isDark ? [0.3, 0.5, 0.3] : [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          background: isDark 
            ? 'radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.2) 0%, rgba(30, 64, 175, 0.1) 40%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.15) 0%, rgba(30, 64, 175, 0.08) 40%, transparent 70%)'
        }}
      />
      
      {/* Focus beam - Center vertical */}
      <div 
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, transparent 0%, rgba(56, 189, 248, 0.15) 30%, rgba(56, 189, 248, 0.15) 70%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(56, 189, 248, 0.1) 30%, rgba(56, 189, 248, 0.1) 70%, transparent 100%)'
        }}
      />
      
      {/* Side warrior accents */}
      <div 
        className="absolute left-0 top-1/4 w-32 h-96"
        style={{
          background: isDark
            ? 'linear-gradient(to right, rgba(30, 64, 175, 0.15) 0%, transparent 100%)'
            : 'linear-gradient(to right, rgba(59, 130, 246, 0.08) 0%, transparent 100%)'
        }}
      />
      <div 
        className="absolute right-0 top-1/4 w-32 h-96"
        style={{
          background: isDark
            ? 'linear-gradient(to left, rgba(30, 64, 175, 0.15) 0%, transparent 100%)'
            : 'linear-gradient(to left, rgba(59, 130, 246, 0.08) 0%, transparent 100%)'
        }}
      />
      
      {/* Animated floating particles - Warrior spirit */}
      {isDark && (
        <>
          <motion.div
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{ left: '20%', top: '60%' }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 bg-cyan-400/30 rounded-full"
            style={{ left: '75%', top: '70%' }}
            animate={{
              y: [-10, -80, -10],
              opacity: [0, 0.8, 0]
            }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-blue-300/50 rounded-full"
            style={{ left: '50%', top: '80%' }}
            animate={{
              y: [-10, -120, -10],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          />
          <motion.div
            className="absolute w-0.5 h-0.5 bg-cyan-300/40 rounded-full"
            style={{ left: '30%', top: '75%' }}
            animate={{
              y: [-5, -60, -5],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            style={{ left: '85%', top: '65%' }}
            animate={{
              y: [-15, -90, -15],
              opacity: [0, 0.7, 0]
            }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
          />
        </>
      )}
      
      {/* Grid overlay - Tactical focus */}
      <div 
        className={cn(
          "absolute inset-0",
          isDark ? "opacity-20" : "opacity-10"
        )}
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Vignette - Focus tunnel effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(2, 6, 23, 0.7) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(241, 245, 249, 0.4) 100%)'
        }}
      />
    </div>
  );
};
