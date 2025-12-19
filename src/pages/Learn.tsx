import React from 'react';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BarChart3, Trophy } from 'lucide-react';
import { DailyBookPage } from '@/components/challenge/DailyBookPage';
import { AnalyticsDashboard } from '@/components/challenge/AnalyticsDashboard';
import { EmptyStateCard } from '@/components/door/EmptyStateCard';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';

const LearnPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Learn - Think and Grow Rich' : 'Învață - Think and Grow Rich'}
          </h1>
          
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Study Napoleon Hill\'s timeless principles through daily pages and track your progress through all 13 principles of success.' 
              : 'Studiază principiile atemporale ale lui Napoleon Hill prin pagini zilnice și urmărește-ți progresul prin toate cele 13 principii ale succesului.'}
          </p>

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {language === 'en' ? 'Daily Page' : 'Pagina Zilnică'}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {language === 'en' ? 'Progress' : 'Progres'}
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {language === 'en' ? 'Leaderboard' : 'Clasament'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-6">
              <DailyBookPage />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              {user ? (
                <AnalyticsDashboard />
              ) : (
                <EmptyStateCard
                  icon={BarChart3}
                  title={language === 'en' ? 'Login Required' : 'Autentificare Necesară'}
                  description={language === 'en' 
                    ? 'Please login to track your reading progress through the 13 principles.' 
                    : 'Te rugăm să te autentifici pentru a-ți urmări progresul de lectură prin cele 13 principii.'}
                  actionLabel={language === 'en' ? 'Login' : 'Autentificare'}
                  onAction={() => window.location.href = '/auth'}
                  emoji="🔐"
                />
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <Leaderboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPage;
