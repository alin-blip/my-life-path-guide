import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { XPProgressBar } from '@/components/xp/XPProgressBar';
import { QuestSystem } from '@/components/gamification/QuestSystem';
import { GlobalLeaderboard } from '@/components/gamification/GlobalLeaderboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {language === 'ro' ? '🏆 Clasament & Misiuni' : '🏆 Leaderboard & Quests'}
        </h1>
      </div>

      <XPProgressBar />

      <div className="grid lg:grid-cols-2 gap-6">
        <QuestSystem />
        <GlobalLeaderboard limit={20} />
      </div>
    </div>
  );
};

export default Leaderboard;
