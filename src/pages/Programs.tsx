import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProgramsLayout } from '@/components/programs/ProgramsLayout';
import { SkoolTab } from '@/components/programs/SkoolNavBar';
import { ClassroomTab } from '@/components/programs/ClassroomTab';
import { CalendarTab } from '@/components/programs/CalendarTab';
import { MembersTab } from '@/components/programs/MembersTab';
import { LeaderboardsTab } from '@/components/programs/LeaderboardsTab';
import { GroupsTab } from '@/components/programs/GroupsTab';
import { CommunitySettingsTab } from '@/components/programs/CommunitySettingsTab';
import { CommunityFeedTab } from '@/components/programs/CommunityFeedTab';
import { ProgramCardProps } from '@/components/programs/ProgramCard';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';

const Programs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') as SkoolTab) || 'community';
  const [activeTab, setActiveTab] = useState<SkoolTab>(tabFromUrl);
  const { completedDaysCount } = useChallengeProgress();

  // Sync activeTab when URL search params change (e.g. from GlobalTopBar)
  React.useEffect(() => {
    const urlTab = (searchParams.get('tab') as SkoolTab) || 'community';
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const challengeProgress = (completedDaysCount / 7) * 100;

  const handleTabChange = (tab: SkoolTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const programs: ProgramCardProps[] = [
    {
      id: 'challenge-7-zile',
      title: 'Have It All Lifestyle Challenge',
      titleRo: 'Have It All Lifestyle Challenge',
      description: 'Break free from burnout in 7 days. Step-by-step plan, execution guide, and Vision Board creation.',
      descriptionRo: 'Scapă de burnout în 7 zile. Plan pas cu pas, ghid de execuție și creare Vision Board.',
      thumbnail: '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: '/challenge',
      isFree: true,
      badge: 'FREE',
      progress: challengeProgress,
      completedLessons: completedDaysCount,
      totalLessons: 7,
    },
    {
      id: 'personal-power-plus',
      title: 'Personal Power Plus',
      titleRo: 'Personal Power Plus',
      description: '30-day program to create an extraordinary quality of life. Transform how you think, feel, and act.',
      descriptionRo: 'Program de 30 de zile pentru a crea o calitate extraordinară a vieții. Transformă modul în care gândești, simți și acționezi.',
      thumbnail: '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: '/personal-power',
      badge: 'PRO',
      requiredTier: 'pro',
      totalLessons: 30,
    },
    {
      id: 'the-ultimate-you',
      title: 'The Ultimate YOU',
      titleRo: 'The Ultimate YOU',
      description: '18-day program to discover your ultimate potential. Transform decisions, emotions and actions for an extraordinary life.',
      descriptionRo: 'Program de 18 zile pentru a-ți descoperi potențialul maxim. Transformă deciziile, emoțiile și acțiunile pentru o viață extraordinară.',
      thumbnail: '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: '/ultimate-you',
      badge: 'PRO',
      requiredTier: 'pro',
      totalLessons: 18,
    },
    {
      id: 'warrior-accelerator',
      title: 'Warrior Certified Coach',
      titleRo: 'Warrior Certified Coach',
      description: '47+ video lessons on business launch, marketing, and personal transformation. Premium coaching program.',
      descriptionRo: '47+ lecții video despre lansare business, marketing și transformare personală. Program premium de coaching.',
      thumbnail: '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: '/warriors-way',
      isPremium: true,
      badge: 'PREMIUM',
      requiredTier: 'elite',
      price: '€1,999',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityFeedTab />;
      case 'classroom':
        return <ClassroomTab programs={programs} />;
      case 'groups':
        return <GroupsTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'members':
        return <MembersTab />;
      case 'leaderboards':
        return <LeaderboardsTab />;
      case 'settings':
        return <CommunitySettingsTab />;
      default:
        return <CommunityFeedTab />;
    }
  };

  return (
    <ProgramsLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {/* Tab Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    </ProgramsLayout>
  );
};

export default Programs;
