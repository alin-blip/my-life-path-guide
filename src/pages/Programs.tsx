import React from 'react';
import { Layout } from '@/components/Layout';
import { ProgramGrid } from '@/components/programs/ProgramGrid';
import { ProgramCardProps } from '@/components/programs/ProgramCard';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { useLanguage } from '@/context/LanguageContext';
import { BookOpen, Sparkles } from 'lucide-react';

const Programs: React.FC = () => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const { completedDaysCount } = useChallengeProgress();
  
  // Calculate challenge progress percentage
  const challengeProgress = (completedDaysCount / 7) * 100;

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
      id: 'warrior-accelerator',
      title: 'Warrior Launch Accelerator',
      titleRo: 'Warrior Launch Accelerator',
      description: '47+ video lessons on business launch, marketing, and personal transformation. Premium coaching program.',
      descriptionRo: '47+ lecții video despre lansare business, marketing și transformare personală. Program premium de coaching.',
      thumbnail: '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: '/warriors-way',
      isPremium: true,
      badge: 'PREMIUM',
      price: '€497',
    },
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <BookOpen className="h-6 w-6 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRo ? 'Programe' : 'Programs'}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {isRo 
              ? 'Accesează toate programele și cursurile. Începe cu Challenge-ul gratuit de 7 zile și continuă cu Warrior Launch Accelerator pentru transformare completă.' 
              : 'Access all programs and courses. Start with the free 7-Day Challenge and continue with Warrior Launch Accelerator for complete transformation.'}
          </p>
        </div>

        {/* Programs Grid */}
        <ProgramGrid programs={programs} />

        {/* Coming Soon Section */}
        <div className="mt-12 p-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            {isRo ? 'Mai multe programe în curând' : 'More programs coming soon'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRo 
              ? 'Suntem în lucru la noi cursuri și programe pentru tine.' 
              : 'We\'re working on new courses and programs for you.'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Programs;
