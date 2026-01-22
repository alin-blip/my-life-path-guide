import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ChevronDown, ChevronUp, ListTodo, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccountabilityCoach } from '@/hooks/useAccountabilityCoach';
import { CoachChatMode } from '@/components/accountability/CoachChatMode';
import { CoachReminders } from '@/components/accountability/CoachReminders';
import { SidebarChatMode } from '@/components/accountability/SidebarChatMode';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFoundationStatus } from '@/hooks/useFoundationStatus';

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
  const [showSidebar, setShowSidebar] = useState(false);
  const { pendingItems } = useFoundationStatus();
  const pendingCount = pendingItems.length;
  
  // Main chat hook
  const {
    messages,
    isLoading,
    sendMessage,
  } = useAccountabilityCoach({
    currentPage: '/accountability-coach',
  });

  // Sidebar chat hook (separate instance)
  const {
    messages: sidebarMessages,
    isLoading: sidebarLoading,
    sendMessage: sendSidebarMessage,
  } = useAccountabilityCoach({
    currentPage: '/accountability-coach/sidebar',
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

          {/* Sidebar - Tabs: Plan / AI Coach */}
          <div className="lg:col-span-1">
            {/* Mobile: Collapsible */}
            <div className="lg:hidden">
              <Collapsible open={showSidebar} onOpenChange={setShowSidebar}>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer py-3 px-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4" />
                          {language === 'ro' ? 'Asistent' : 'Assistant'}
                          {pendingCount > 0 && (
                            <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {pendingCount}
                            </span>
                          )}
                        </span>
                        {showSidebar ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <Tabs defaultValue="plan" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 mx-2 mb-2" style={{ width: 'calc(100% - 16px)' }}>
                          <TabsTrigger value="plan" className="text-xs gap-1">
                            <ListTodo className="h-3 w-3" />
                            {language === 'ro' ? 'De Făcut' : 'Plan'}
                            {pendingCount > 0 && (
                              <span className="bg-amber-500/80 text-white text-[10px] px-1 rounded-full ml-1">
                                {pendingCount}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="coach" className="text-xs gap-1">
                            <MessageSquare className="h-3 w-3" />
                            AI Coach
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="plan" className="m-0 max-h-[300px] overflow-auto">
                          <CoachReminders />
                        </TabsContent>
                        <TabsContent value="coach" className="m-0 h-[300px]">
                          <SidebarChatMode
                            messages={sidebarMessages}
                            isLoading={sidebarLoading}
                            onSendMessage={sendSidebarMessage}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Desktop: Always visible with tabs */}
            <Card className="hidden lg:flex flex-col border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background h-[75vh]">
              <Tabs defaultValue="plan" className="flex flex-col h-full">
                <CardHeader className="border-b border-amber-500/20 py-2 px-3 shrink-0">
                  <TabsList className="w-full grid grid-cols-2 h-9">
                    <TabsTrigger value="plan" className="text-xs gap-1.5">
                      <ListTodo className="h-3.5 w-3.5" />
                      {language === 'ro' ? 'De Făcut' : 'Plan'}
                      {pendingCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="coach" className="text-xs gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      AI Coach
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <TabsContent value="plan" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <CoachReminders />
                  </TabsContent>
                  <TabsContent value="coach" className="h-full m-0">
                    <SidebarChatMode
                      messages={sidebarMessages}
                      isLoading={sidebarLoading}
                      onSendMessage={sendSidebarMessage}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountabilityCoach;
