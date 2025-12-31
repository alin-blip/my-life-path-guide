import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Flag, Crown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { WeeklyTab } from './WeeklyTab';
import { QuarterlyGoalsTab } from './QuarterlyGoalsTab';
import { MonthlyMissionTab } from './MonthlyMissionTab';
import { AnnualVisionTab } from './AnnualVisionTab';
import { useSearchParams } from 'react-router-dom';

export const CommandCenterTabs: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'weekly';
  
  const handleTabChange = (value: string) => {
    if (value === 'weekly') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', value);
    }
    setSearchParams(searchParams);
  };

  const tabs = [
    {
      value: 'weekly',
      label: language === 'ro' ? 'Săptămâna' : 'This Week',
      icon: Calendar,
      description: language === 'ro' ? 'Planifică & execută task-uri' : 'Plan & execute tasks'
    },
    {
      value: 'quarterly',
      label: language === 'ro' ? '90 Zile' : '90 Days',
      icon: Target,
      description: language === 'ro' ? 'Obiective trimestriale' : 'Quarterly goals'
    },
    {
      value: 'monthly',
      label: language === 'ro' ? 'Lunar' : 'Monthly',
      icon: Flag,
      description: language === 'ro' ? 'Misiune lunară' : 'Monthly mission'
    },
    {
      value: 'annual',
      label: language === 'ro' ? 'Anual' : 'Annual',
      icon: Crown,
      description: language === 'ro' ? 'Viziune anuală' : 'Annual vision'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <TabsList className="w-full grid grid-cols-4 gap-1 bg-muted/50 p-1 rounded-xl h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 py-3 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto">
          <TabsContent value="weekly" className="mt-0 outline-none">
            <WeeklyTab />
          </TabsContent>
          
          <TabsContent value="quarterly" className="mt-0 outline-none">
            <QuarterlyGoalsTab />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 outline-none">
            <MonthlyMissionTab />
          </TabsContent>
          
          <TabsContent value="annual" className="mt-0 outline-none">
            <AnnualVisionTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
