import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FunnelPipeline } from './FunnelPipeline';
import { CRMAnalytics } from './CRMAnalytics';
import { ContactProfile360 } from './ContactProfile360';
import { FunnelVisualDashboard } from './FunnelVisualDashboard';
import { ChallengeDropOffStats } from './ChallengeDropOffStats';
import { CRMConversationsDashboard } from './CRMConversationsDashboard';
import { ChallengeAdminChat } from './ChallengeAdminChat';
import { AdminErrorMonitor } from './AdminErrorMonitor';
import { FunnelLeadsDashboard } from './FunnelLeadsDashboard';
import { BarChart3, Users, Target, Zap, AlertTriangle, MessageSquare, MessagesSquare, ShieldAlert, Mail } from 'lucide-react';

export const CRMDashboard: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  if (selectedContactId) {
    return (
      <ContactProfile360 
        contactId={selectedContactId} 
        onBack={() => setSelectedContactId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            CRM Dashboard
          </h2>
          <p className="text-muted-foreground">
            Vizualizare completă a funnelului și clienților
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="funnel-leads" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Funnel Emails
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Funnel Vizual
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversații AI
          </TabsTrigger>
          <TabsTrigger value="chat-moderare" className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4" />
            Chat Moderare
          </TabsTrigger>
          <TabsTrigger value="challenge" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Challenge Stats
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Erori
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <FunnelPipeline onSelectContact={setSelectedContactId} />
        </TabsContent>

        <TabsContent value="funnel-leads">
          <FunnelLeadsDashboard />
        </TabsContent>

        <TabsContent value="funnel">
          <FunnelVisualDashboard />
        </TabsContent>

        <TabsContent value="conversations">
          <CRMConversationsDashboard />
        </TabsContent>

        <TabsContent value="chat-moderare">
          <ChallengeAdminChat />
        </TabsContent>

        <TabsContent value="challenge">
          <ChallengeDropOffStats />
        </TabsContent>

        <TabsContent value="errors">
          <AdminErrorMonitor />
        </TabsContent>

        <TabsContent value="analytics">
          <CRMAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
