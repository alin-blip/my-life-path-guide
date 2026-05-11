import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Crown, Target, Flag, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { QuarterlyGoalsTab } from './QuarterlyGoalsTab';
import { MonthlyMissionTab } from './MonthlyMissionTab';
import { AnnualVisionTab } from './AnnualVisionTab';
import { WeeklySection } from '@/components/door/WeeklySection';
import { CompactMissionCards } from '@/components/door/CompactMissionCards';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const CommandCenterTabs: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default to monthly, no weekly tab anymore
  const currentTab = searchParams.get('tab') || 'monthly';
  
  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'monthly') {
        next.delete('tab');
      } else {
        next.set('tab', value);
      }
      return next;
    }, { replace: true });
    
    // Auto-expand when switching tabs
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // Only 3 tabs: Lunar, 90 Zile, Anual
  const tabs = [
    {
      value: 'monthly',
      label: language === 'en' ? 'Monthly' : 'Lunar',
      icon: Flag,
      description: language === 'en' ? 'Monthly focus mission' : 'Misiune lunară de focus'
    },
    {
      value: 'quarterly',
      label: language === 'en' ? '90 Days' : '90 Zile',
      icon: Target,
      description: language === 'en' ? 'Quarterly goals & progress' : 'Obiective și progres trimestrial'
    },
    {
      value: 'annual',
      label: language === 'en' ? 'Annual' : 'Anual',
      icon: Crown,
      description: language === 'en' ? 'Annual vision & big goals' : 'Viziune anuală & obiective mari'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Objectives Section with Tabs - Collapsible */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Navigation */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <TabsList className="w-full grid grid-cols-3 gap-0 bg-transparent border border-border p-0 rounded-none h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 py-3 px-3 text-mono text-xs uppercase tracking-wider rounded-none border-r border-border last:border-r-0 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-200"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Compact Cards - Always visible when collapsed */}
          {!isExpanded && (
            <CollapsibleTrigger asChild>
              <div className="cursor-pointer hover:bg-muted/30 transition-colors">
                <CompactMissionCards />
              </div>
            </CollapsibleTrigger>
          )}

          {/* Full Tab Content - Only when expanded */}
          <CollapsibleContent>
            <div className="container mx-auto">
              <TabsContent value="monthly" className="mt-0 outline-none">
                <MonthlyMissionTab />
              </TabsContent>
              
              <TabsContent value="quarterly" className="mt-0 outline-none">
                <QuarterlyGoalsTab />
              </TabsContent>
              
              <TabsContent value="annual" className="mt-0 outline-none">
                <AnnualVisionTab />
              </TabsContent>
            </div>
          </CollapsibleContent>

          {/* Collapse/Expand Toggle when expanded */}
          {isExpanded && (
            <CollapsibleTrigger asChild>
              <div className="flex justify-center py-2 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  <span>{language === 'en' ? 'Collapse' : 'Restrânge'}</span>
                </div>
              </div>
            </CollapsibleTrigger>
          )}
        </Tabs>
      </Collapsible>

      {/* Weekly Section - Always Visible Below */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto">
          <WeeklySection />
        </div>
      </div>
    </div>
  );
};
