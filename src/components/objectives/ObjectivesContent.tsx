
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { ObjectivesForm } from './ObjectivesForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

type ObjectiveType = 'current' | 'weekly' | 'monthly' | 'annual';

export const ObjectivesContent = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<MissionCategory>('body');
  const [activeObjective, setActiveObjective] = useState<ObjectiveType | null>(null);

  const categoryColors = {
    body: 'from-red-900/60 to-red-700/40',
    being: 'from-blue-900/60 to-blue-700/40', 
    balance: 'from-green-900/60 to-green-700/40',
    business: 'from-purple-900/60 to-purple-700/40'
  };

  const getCategoryName = (category: MissionCategory) => {
    const names = {
      en: {
        body: 'Body',
        being: 'Spirituality', 
        balance: 'Relationships',
        business: 'Business'
      },
      ro: {
        body: 'Corp',
        being: 'Spiritualitate',
        balance: 'Relații', 
        business: 'Business'
      }
    };
    return names[language][category];
  };

  const getObjectiveTitle = (type: ObjectiveType) => {
    const titles = {
      en: {
        current: 'Current Reality',
        weekly: 'Weekly Plan',
        monthly: 'Monthly Mission', 
        annual: 'Annual Goals'
      },
      ro: {
        current: 'Realitatea Actuală',
        weekly: 'Planul Săptămânal',
        monthly: 'Misiunea Lunară',
        annual: 'Obiectivele Anuale'
      }
    };
    return titles[language][type];
  };

  const getObjectiveDescription = (type: ObjectiveType) => {
    const descriptions = {
      en: {
        current: 'Where are you today?',
        weekly: 'What 4 actions will you take this week?',
        monthly: 'What do you want to achieve this month?',
        annual: 'What is your vision for the next year?'
      },
      ro: {
        current: 'Unde te afli astăzi?',
        weekly: 'Ce 4 acțiuni vei face săptămâna aceasta?',
        monthly: 'Ce vrei să realizezi luna aceasta?', 
        annual: 'Care este viziunea ta pentru următorul an?'
      }
    };
    return descriptions[language][type];
  };

  if (activeObjective) {
    return (
      <ObjectivesForm
        category={activeCategory}
        objectiveType={activeObjective}
        onBack={() => setActiveObjective(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white">
      <div className={`${isMobile ? 'px-3 py-4' : 'p-6'} max-w-4xl mx-auto`}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center mb-6`}>
          {language === 'en' ? 'Objectives' : 'Obiective'}
        </h1>

        {/* Category Selection */}
        <Tabs 
          defaultValue="body" 
          className="w-full mb-6"
          onValueChange={(value) => setActiveCategory(value as MissionCategory)}
        >
          {isMobile ? (
            // Mobile: Horizontal scrollable tabs
            <div className="w-full mb-6">
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="flex w-max space-x-2 bg-slate-800 p-2">
                  <TabsTrigger 
                    value="body" 
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-4 py-2 text-sm"
                  >
                    {getCategoryName('body')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="being" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 text-sm"
                  >
                    {getCategoryName('being')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="balance" 
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white px-4 py-2 text-sm"
                  >
                    {getCategoryName('balance')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="business" 
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4 py-2 text-sm"
                  >
                    {getCategoryName('business')}
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>
          ) : (
            // Desktop: Grid layout
            <TabsList className="grid grid-cols-4 max-w-2xl mx-auto bg-slate-800">
              <TabsTrigger value="body" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                {getCategoryName('body')}
              </TabsTrigger>
              <TabsTrigger value="being" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {getCategoryName('being')}
              </TabsTrigger>
              <TabsTrigger value="balance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                {getCategoryName('balance')}
              </TabsTrigger>
              <TabsTrigger value="business" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                {getCategoryName('business')}
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value={activeCategory} className="mt-6">
            <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-r ${categoryColors[activeCategory]} rounded-lg mb-6`}>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center`}>
                {getCategoryName(activeCategory)}
              </h2>
            </div>

            {/* Four Main Buttons */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
              {(['current', 'weekly', 'monthly', 'annual'] as ObjectiveType[]).map((type) => (
                <Card 
                  key={type}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors cursor-pointer"
                  onClick={() => setActiveObjective(type)}
                >
                  <CardHeader className={isMobile ? 'pb-3' : ''}>
                    <CardTitle className={`text-white text-center ${isMobile ? 'text-lg' : ''}`}>
                      {getObjectiveTitle(type)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`text-center ${isMobile ? 'pt-0' : ''}`}>
                    <p className={`text-gray-300 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                      {getObjectiveDescription(type)}
                    </p>
                    <Button 
                      className={`w-full ${isMobile ? 'h-10 text-sm' : ''}`}
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveObjective(type);
                      }}
                    >
                      {language === 'en' ? 'Start' : 'Începe'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
