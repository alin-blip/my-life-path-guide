import React from 'react';
import { ModuleComments } from '@/components/warriors-way/ModuleComments';
import { useLanguage } from '@/context/LanguageContext';

interface ChallengeCommentsProps {
  dayNumber: number;
}

export const ChallengeComments: React.FC<ChallengeCommentsProps> = ({ dayNumber }) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  
  // Generate module_id in the format used by warriors_way_comments table
  const moduleId = `challenge-day-${dayNumber}`;
  
  return (
    <div className="mt-6">
      <ModuleComments moduleId={moduleId} />
    </div>
  );
};
