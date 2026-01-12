import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Flag, Crown, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { WeeklyTab } from './WeeklyTab';
import { QuarterlyGoalsTab } from './QuarterlyGoalsTab';
import { MonthlyMissionTab } from './MonthlyMissionTab';
import { AnnualVisionTab } from './AnnualVisionTab';
import { LifeVisionTab } from './LifeVisionTab';
import { useSearchParams } from 'react-router-dom';

export const CommandCenterTabs: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'weekly';
  
  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'weekly') {
        next.delete('tab');
      } else {
        next.set('tab', value);
      }
      return next;
    }, { replace: true });
  };

  const tabs = [
    {
      value: 'lifevision',
      label: language === 'en' ? 'Vision' : 'Viziune',
      icon: Compass,
      description: language === 'en' ? 'Life vision (5-10 years)' : 'Viziune de viață (5-10 ani)'
    },
    {
      value: 'annual',
      label: language === 'en' ? 'Annual' : 'Anual',
      icon: Crown,
      description: language === 'en' ? 'Annual vision & big goals' : 'Viziune anuală & obiective mari'
    },
    {
      value: 'quarterly',
      label: language === 'en' ? '90 Days' : '90 Zile',
      icon: Target,
      description: language === 'en' ? 'Quarterly goals & progress' : 'Obiective și progres trimestrial'
    },
    {
      value: 'monthly',
      label: language === 'en' ? 'Monthly' : 'Lunar',
      icon: Flag,
      description: language === 'en' ? 'Monthly focus mission' : 'Misiune lunară de focus'
    },
    {
      value: 'weekly',
      label: language === 'en' ? 'Weekly' : 'Săptămâna',
      icon: Calendar,
      description: language === 'en' ? 'Plan & execute weekly tasks' : 'Planifică & execută sarcini săptămânale'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <TabsList className="w-full grid grid-cols-5 gap-1 bg-muted/50 p-1 rounded-xl h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 py-3 px-3 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
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
          <TabsContent value="lifevision" forceMount className="mt-0 outline-none">
            <LifeVisionTab />
          </TabsContent>
          
          <TabsContent value="annual" forceMount className="mt-0 outline-none">
            <AnnualVisionTab />
          </TabsContent>
          
          <TabsContent value="quarterly" forceMount className="mt-0 outline-none">
            <QuarterlyGoalsTab />
          </TabsContent>
          
          <TabsContent value="monthly" forceMount className="mt-0 outline-none">
            <MonthlyMissionTab />
          </TabsContent>
          
          <TabsContent value="weekly" forceMount className="mt-0 outline-none">
            <WeeklyTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
