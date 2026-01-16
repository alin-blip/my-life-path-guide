import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Target, Flag, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { QuarterlyGoalsTab } from '@/components/door/tabs/QuarterlyGoalsTab';
import { MonthlyMissionTab } from '@/components/door/tabs/MonthlyMissionTab';
import { AnnualVisionTab } from '@/components/door/tabs/AnnualVisionTab';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';

const GameObjectives: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'quarterly';
  
  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      return next;
    }, { replace: true });
  };

  const tabs = [
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
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {language === 'en' ? 'Game - Vision' : 'Game - Viziune'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Your strategic objectives' : 'Obiectivele tale strategice'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <TabsList className="w-full grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-xl h-auto">
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

          <div className="container mx-auto">
            <TabsContent value="annual" className="mt-0 outline-none">
              <AnnualVisionTab />
            </TabsContent>
            
            <TabsContent value="quarterly" className="mt-0 outline-none">
              <QuarterlyGoalsTab />
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-0 outline-none">
              <MonthlyMissionTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GameObjectives;
