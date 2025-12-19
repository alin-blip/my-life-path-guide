import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { ReadingProgressDashboard } from './ReadingProgressDashboard';
import { BadgesDisplay } from './badges/BadgesDisplay';
import { ProgressCharts } from './analytics/ProgressCharts';
import { BarChart3, Award, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Overview' : 'Sumar'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Badges' : 'Badge-uri'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'en' ? 'Analytics' : 'Analize'}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <ReadingProgressDashboard />
        </TabsContent>
        
        <TabsContent value="badges" className="mt-0">
          <BadgesDisplay />
        </TabsContent>
        
        <TabsContent value="charts" className="mt-0">
          <ProgressCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
