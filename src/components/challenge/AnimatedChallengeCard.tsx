import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { ChallengeProgressBadge } from './ChallengeProgressBadge';
import { LucideIcon } from 'lucide-react';

interface AnimatedChallengeCardProps {
  day: number;
  icon: LucideIcon;
  titleEn: string;
  titleRo: string;
  descEn: string;
  descRo: string;
  color: string;
  completions: number;
  language: string;
  onClick?: () => void;
}

export const AnimatedChallengeCard: React.FC<AnimatedChallengeCardProps> = ({
  day,
  icon: Icon,
  titleEn,
  titleRo,
  descEn,
  descRo,
  color,
  completions,
  language,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: day * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="p-4 flex items-center gap-4 bg-card border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <motion.div 
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-primary">
              {language === 'en' ? `Day ${day}` : `Ziua ${day}`}
            </span>
            <ChallengeProgressBadge 
              completions={completions} 
              language={language} 
            />
          </div>
          <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {language === 'en' ? titleEn : titleRo}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {language === 'en' ? descEn : descRo}
          </p>
        </div>
        
        <motion.div
          className="flex-shrink-0"
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </Card>
    </motion.div>
  );
};
