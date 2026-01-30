import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket, Target, Clock, Users, Zap, Check } from 'lucide-react';

interface BreakthroughOverlayProps {
  isVisible: boolean;
  breakthroughData?: {
    emotionBefore: string;
    emotionAfter: string;
    insight?: string;
    actionCommitted?: string;
  };
  onContinue: () => void;
  language?: 'ro' | 'en';
}

export function BreakthroughOverlay({
  isVisible,
  breakthroughData,
  onContinue,
  language = 'ro',
}: BreakthroughOverlayProps) {
  const benefits = language === 'ro' ? [
    { icon: Target, text: 'Claritate despre ce vrei CU ADEVĂRAT' },
    { icon: Zap, text: 'Plan strategic pentru obiective' },
    { icon: Clock, text: 'Energie și productivitate zilnică' },
    { icon: Users, text: 'Timp pentru familie și ce contează' },
  ] : [
    { icon: Target, text: 'Clarity about what you REALLY want' },
    { icon: Zap, text: 'Strategic plan for your goals' },
    { icon: Clock, text: 'Daily energy and productivity' },
    { icon: Users, text: 'Time for family and what matters' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 max-w-md w-full mx-auto"
          >
            {/* Card container */}
            <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-2xl border border-primary/30 p-6 shadow-2xl shadow-primary/20">
              {/* Celebration icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>

              {/* Main text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-3"
              >
                <h2 className="text-2xl font-bold text-foreground">
                  🎉 {language === 'ro' ? 'Felicitări!' : 'Congratulations!'}
                </h2>
                
                <p className="text-muted-foreground text-sm">
                  {language === 'ro' 
                    ? 'Ai făcut primul pas spre transformare.'
                    : 'You took the first step towards transformation.'}
                </p>

                {/* Transformation display */}
                {breakthroughData && (
                  <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/20 rounded-xl p-3 border border-primary/30">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {breakthroughData.emotionBefore}
                      </span>
                      <span className="text-primary font-bold text-lg">→</span>
                      <span className="text-sm font-bold text-primary">
                        {breakthroughData.emotionAfter}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Divider */}
              <div className="my-5 border-t border-primary/20" />

              {/* Challenge unlock section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-center font-semibold text-foreground flex items-center justify-center gap-2">
                  <span className="text-xl">⭐</span>
                  {language === 'ro' ? 'DEBLOCHEAZĂ ACUM:' : 'UNLOCK NOW:'}
                </h3>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-center font-bold text-primary mb-3">
                    🚀 Challenge de 7 Zile - Transformă-ți Viața
                  </p>
                  
                  <div className="space-y-2">
                    {benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-muted-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-primary via-purple-500 to-primary hover:from-primary/90 hover:to-purple-600 text-white shadow-lg shadow-primary/30 py-6 text-base"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  {language === 'ro' ? 'ÎNCEPE CHALLENGE-UL GRATUIT' : 'START FREE CHALLENGE'}
                </Button>

                {/* Trust line */}
                <p className="text-center text-xs text-muted-foreground">
                  ✓ {language === 'ro' ? 'Fără card' : 'No card'} • 
                  ✓ {language === 'ro' ? 'Acces instant' : 'Instant access'} • 
                  ✓ 10,000+ {language === 'ro' ? 'transformări' : 'transformations'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
