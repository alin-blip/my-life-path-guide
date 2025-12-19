import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { BADGES, BadgeStats } from './badgeDefinitions';
import { BadgeCard } from './BadgeCard';
import { Award, Trophy, Lock } from 'lucide-react';

export const BadgesDisplay: React.FC = () => {
  const { language } = useLanguage();
  const { progress, principleStats, getOverallStats } = useReadingProgress();
  
  const badgeStats: BadgeStats = useMemo(() => {
    const stats = getOverallStats();
    
    // Calculate unique days active
    const uniqueDays = new Set(
      progress.map(p => new Date(p.read_at).toDateString())
    ).size;
    
    // Calculate longest streak from progress data
    let longestStreak = stats.currentStreak;
    
    return {
      totalPagesRead: stats.totalPagesRead,
      totalActionsCompleted: stats.totalActionsCompleted,
      currentStreak: stats.currentStreak,
      longestStreak,
      principlesStarted: stats.principlesStarted,
      principlesMastered: stats.principlesMastered,
      totalDaysActive: uniqueDays
    };
  }, [progress, principleStats, getOverallStats]);
  
  const earnedBadges = useMemo(() => {
    return BADGES.filter(badge => badge.requirement(badgeStats));
  }, [badgeStats]);
  
  const lockedBadges = useMemo(() => {
    return BADGES.filter(badge => !badge.requirement(badgeStats));
  }, [badgeStats]);
  
  const tierCounts = useMemo(() => {
    return {
      bronze: earnedBadges.filter(b => b.tier === 'bronze').length,
      silver: earnedBadges.filter(b => b.tier === 'silver').length,
      gold: earnedBadges.filter(b => b.tier === 'gold').length,
      platinum: earnedBadges.filter(b => b.tier === 'platinum').length
    };
  }, [earnedBadges]);
  
  return (
    <Card className="p-6 bg-card border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Achievements' : 'Realizări'}
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="font-medium">
            {earnedBadges.length}/{BADGES.length}
          </span>
        </div>
      </div>
      
      {/* Tier Summary */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <TierStat tier="bronze" count={tierCounts.bronze} total={BADGES.filter(b => b.tier === 'bronze').length} />
        <TierStat tier="silver" count={tierCounts.silver} total={BADGES.filter(b => b.tier === 'silver').length} />
        <TierStat tier="gold" count={tierCounts.gold} total={BADGES.filter(b => b.tier === 'gold').length} />
        <TierStat tier="platinum" count={tierCounts.platinum} total={BADGES.filter(b => b.tier === 'platinum').length} />
      </div>
      
      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="earned" className="gap-2">
            <Trophy className="h-4 w-4" />
            {language === 'en' ? 'Earned' : 'Obținute'} ({earnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="locked" className="gap-2">
            <Lock className="h-4 w-4" />
            {language === 'en' ? 'Locked' : 'Blocate'} ({lockedBadges.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="earned" className="mt-0">
          {earnedBadges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{language === 'en' ? 'Start reading to earn your first badge!' : 'Începe să citești pentru primul badge!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isEarned={true}
                  progress={badge.progress(badgeStats)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="locked" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={false}
                progress={badge.progress(badgeStats)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

interface TierStatProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  count: number;
  total: number;
}

const TierStat: React.FC<TierStatProps> = ({ tier, count, total }) => {
  const tierLabels = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  };
  
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30 border border-border/50">
      <div className="text-lg">{tierLabels[tier]}</div>
      <div className="text-sm font-medium">{count}/{total}</div>
    </div>
  );
};

export default BadgesDisplay;
