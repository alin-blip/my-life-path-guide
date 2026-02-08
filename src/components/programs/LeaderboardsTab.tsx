import React from 'react';
import { GlobalLeaderboard } from '@/components/gamification/GlobalLeaderboard';
import { QuestSystem } from '@/components/gamification/QuestSystem';

export const LeaderboardsTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <GlobalLeaderboard />
      <QuestSystem />
    </div>
  );
};
