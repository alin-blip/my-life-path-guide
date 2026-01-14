import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Target, Flag, Crown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { WeeklyTab } from './WeeklyTab';
import { ObjectivesSummaryCards } from './ObjectivesSummaryCards';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const CommandCenterTabs: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentObjectivesTab = searchParams.get('objectives') || 'monthly';
  
  const handleObjectivesTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'monthly') {
        next.delete('objectives');
      } else {
        next.set('objectives', value);
      }
      return next;
    }, { replace: true });
  };

  const objectivesTabs = [
    {
      value: 'monthly',
      label: language === 'en' ? 'Monthly' : 'Lunar',
      icon: Flag,
    },
    {
      value: 'quarterly',
      label: language === 'en' ? '90 Days' : '90 Zile',
      icon: Target,
    },
    {
      value: 'annual',
      label: language === 'en' ? 'Annual' : 'Anual',
      icon: Crown,
    }
  ];

  const handleViewAllObjectives = () => {
    navigate(`/objectives?type=${currentObjectivesTab}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Objectives Section - Compact Header Tabs */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={currentObjectivesTab} onValueChange={handleObjectivesTabChange} className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-xl h-auto">
              {objectivesTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Objectives Cards Summary */}
      <div className="container mx-auto px-4 py-4">
        <ObjectivesSummaryCards 
          objectivesType={currentObjectivesTab as 'monthly' | 'quarterly' | 'annual'} 
        />
        
        {/* View All Link */}
        <button 
          onClick={handleViewAllObjectives}
          className="flex items-center gap-1 mx-auto mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {language === 'en' 
            ? `View all ${currentObjectivesTab} objectives` 
            : `Vezi toate obiectivele ${currentObjectivesTab === 'monthly' ? 'lunare' : currentObjectivesTab === 'quarterly' ? 'trimestriale' : 'anuale'}`
          }
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content - Always Weekly */}
      <div className="container mx-auto border-t border-border">
        <WeeklyTab />
      </div>
    </div>
  );
};
