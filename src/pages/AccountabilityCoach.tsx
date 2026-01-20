import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { CoachChatMode } from '@/components/accountability/CoachChatMode';
import { CoachReminders } from '@/components/accountability/CoachReminders';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const getQuickActions = (language: 'en' | 'ro') => {
  return language === 'ro' ? [
    { label: 'Ce am de făcut azi?', message: 'Ce am de făcut azi?' },
    { label: 'Progres săptămânal', message: 'Arată-mi progresul meu săptămânal.' },
    { label: 'Motivație', message: 'Am nevoie de puțină motivație.' },
    { label: 'Planifică ziua', message: 'Ajută-mă să-mi planific ziua.' },
  ] : [
    { label: 'What should I do today?', message: 'What should I do today?' },
    { label: 'Weekly progress', message: 'Show me my weekly progress.' },
    { label: 'Motivation', message: 'I need some motivation.' },
    { label: 'Plan my day', message: 'Help me plan my day.' },
  ];
};

const AccountabilityCoach = () => {
  const { language } = useLanguage();
  const [showReminders, setShowReminders] = useState(false);
  const {
    messages,
    isLoading,
    sendMessage,
  } = useAccountabilityCoach({
    currentPage: '/accountability-coach',
  });

  const quickActions = getQuickActions(language as 'en' | 'ro');

  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-background h-[calc(100vh-180px)] sm:h-[75vh]">
              <CardHeader className="border-b border-amber-500/20 py-2 sm:py-4 px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-amber-100 text-base sm:text-xl">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  Accountability Coach
                </CardTitle>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2 hidden sm:block">
                  {language === 'ro' 
                    ? 'Coach-ul tău personal care te ține responsabil pentru obiectivele tale.'
                    : 'Your personal coach who keeps you accountable for your goals.'}
                </p>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)] sm:h-[calc(100%-100px)]">
                <CoachChatMode
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  quickActions={quickActions}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reminders (collapsible on mobile) */}
          <div className="lg:col-span-1">
            {/* Mobile: Collapsible */}
            <div className="lg:hidden">
              <Collapsible open={showReminders} onOpenChange={setShowReminders}>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer py-3 px-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          {language === 'ro' ? 'Reminder-uri' : 'Reminders'}
                        </span>
                        {showReminders ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0 max-h-[300px] overflow-auto">
                      <CoachReminders />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Desktop: Always visible */}
            <Card className="hidden lg:block border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background h-[75vh]">
              <CardHeader className="border-b border-amber-500/20 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {language === 'ro' ? 'Reminder-uri' : 'Reminders'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <CoachReminders />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountabilityCoach;
