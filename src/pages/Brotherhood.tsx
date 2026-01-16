import React from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Hash, Users, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { BrotherhoodFeed } from '@/components/brotherhood/BrotherhoodFeed';
import { BrotherhoodChat } from '@/components/brotherhood/BrotherhoodChat';
import { BrotherhoodTribes } from '@/components/brotherhood/BrotherhoodTribes';
import { BrotherhoodMembers } from '@/components/brotherhood/BrotherhoodMembers';

const Brotherhood: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'feed';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              ⚔️ Brotherhood
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'ro' 
                ? 'Comunitatea războinicilor' 
                : 'The warriors community'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="feed" className="gap-2 text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 hidden sm:block" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 text-xs sm:text-sm">
              <Hash className="h-4 w-4 hidden sm:block" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tribes" className="gap-2 text-xs sm:text-sm">
              <Users className="h-4 w-4 hidden sm:block" />
              Tribes
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2 text-xs sm:text-sm">
              <UserPlus className="h-4 w-4 hidden sm:block" />
              {language === 'ro' ? 'Membri' : 'Members'}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="feed" className="mt-0">
              <BrotherhoodFeed />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <BrotherhoodChat />
            </TabsContent>

            <TabsContent value="tribes" className="mt-0">
              <BrotherhoodTribes />
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <BrotherhoodMembers />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Brotherhood;
