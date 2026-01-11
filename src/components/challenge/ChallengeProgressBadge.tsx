import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeProgressBadgeProps {
  completions: number;
  language: string;
}

export const ChallengeProgressBadge: React.FC<ChallengeProgressBadgeProps> = ({
  completions,
  language
}) => {
  if (completions === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
    >
      <Users className="h-3 w-3" />
      <span>
        {completions} {language === 'en' ? 'completed' : 'au completat'}
      </span>
    </motion.div>
  );
};
