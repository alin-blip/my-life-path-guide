import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { XPProgressBar } from '@/components/xp/XPProgressBar';
import { AchievementGallery } from '@/components/gamification/AchievementGallery';

const Achievements: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {language === 'ro' ? '🏅 Realizări' : '🏅 Achievements'}
        </h1>
      </div>

      <XPProgressBar />

      <AchievementGallery />
    </div>
  );
};

export default Achievements;
