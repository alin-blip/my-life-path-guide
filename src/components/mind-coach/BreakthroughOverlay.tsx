import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket, Brain, ArrowDown } from 'lucide-react';

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
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 max-w-md mx-4 text-center"
          >
            {/* Celebration icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>

            {/* Main text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                🎉 {language === 'ro' ? 'Felicitări!' : 'Congratulations!'}
              </h2>
              
              <p className="text-muted-foreground">
                {language === 'ro' 
                  ? 'Tocmai ai descoperit ce te ținea pe loc.'
                  : 'You just discovered what was holding you back.'}
              </p>

              {/* Transformation display */}
              {breakthroughData && (
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg font-medium text-muted-foreground">
                      {breakthroughData.emotionBefore}
                    </span>
                    <span className="text-primary font-bold">→</span>
                    <span className="text-lg font-bold text-primary">
                      {breakthroughData.emotionAfter}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {language === 'ro'
                  ? 'Imaginează-ți ce e posibil când deblochezi experiența completă Mind Coach—suport continuu, claritate și momentum creat special pentru tine.'
                  : 'Imagine what\'s possible when you unlock your full personalized Mind Coach experience—continuous support, clarity, and momentum created just for you.'}
              </p>

              {/* CTA Section */}
              <div className="pt-4 space-y-3">
                <p className="text-lg font-semibold text-foreground">
                  ✨ {language === 'ro' ? 'Ready to take control?' : 'Ready to take control?'}
                </p>
                <p className="text-sm text-primary font-medium">
                  {language === 'ro'
                    ? 'Unlock your full potential with 7-days trial now.'
                    : 'Unlock your full potential with 7-days trial now.'}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  size="lg"
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/30"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  {language === 'ro' ? 'UNLOCK MY MIND COACH NOW' : 'UNLOCK MY MIND COACH NOW'}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onContinue}
                  className="w-full border-primary/30 hover:bg-primary/10"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {language === 'ro' ? 'START MY TRANSFORMATION' : 'START MY TRANSFORMATION'}
                </Button>
              </div>

              {/* Scroll hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-6 flex flex-col items-center text-muted-foreground"
              >
                <span className="text-xs mb-2">
                  {language === 'ro' ? 'Sau descoperă planurile mai jos' : 'Or discover plans below'}
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowDown className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
