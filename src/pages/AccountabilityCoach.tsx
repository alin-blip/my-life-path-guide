import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { CoachChatMode } from '@/components/accountability/CoachChatMode';
import { CoachReminders } from '@/components/accountability/CoachReminders';

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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-background h-[75vh]">
              <CardHeader className="border-b border-amber-500/20">
                <CardTitle className="flex items-center gap-3 text-amber-100">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Accountability Coach
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  {language === 'ro' 
                    ? 'Coach-ul tău personal care te ține responsabil pentru obiectivele tale.'
                    : 'Your personal coach who keeps you accountable for your goals.'}
                </p>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-100px)]">
                <CoachChatMode
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  quickActions={quickActions}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Reminders */}
          <div className="lg:col-span-1">
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background h-[75vh]">
              <CardHeader className="border-b border-amber-500/20 py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  🔔 {language === 'ro' ? 'Reminder-uri' : 'Reminders'}
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
