import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';
import { CourseManager } from './admin/CourseManager';
import { ApiConfig } from './admin/ApiConfig';
import { Leaderboard } from './admin/Leaderboard';
import { RevenueDashboard } from './admin/RevenueDashboard';
import { CMOCommandCenter } from './admin/CMOCommandCenter';
import { AdminAIStudio } from './admin/AdminAIStudio';
import { MarketingHub } from './admin/marketing/MarketingHub';
import { WarriorsWayManager } from './admin/WarriorsWayManager';
import { EmailAnalytics } from './admin/EmailAnalytics';
import { SplitTestDashboard } from './admin/SplitTestDashboard';
import { CRMDashboard } from './admin/crm/CRMDashboard';
import { LeadMagnetAnalytics } from './admin/LeadMagnetAnalytics';
import { AdminCoaches } from './admin/AdminCoaches';
import { EngagementDashboard } from './admin/EngagementDashboard';
import { AdminHealthPanel } from './admin/AdminHealthPanel';
import { SmsAdmin } from './admin/SmsAdmin';
import { ChallengeFunnelDashboard } from './admin/ChallengeFunnelDashboard';
import { 
  Shield, BookOpen, Settings, LayoutDashboard, 
  Lock, Bot, Megaphone, Target, Users, DollarSign, Trophy, TrendingUp, UserCheck, Activity
} from 'lucide-react';

export const SecureAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have administrator privileges to access this panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Authenticated as: {user.email}</span>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-8 flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <LayoutDashboard className="h-4 w-4" />
            <span>📊 Overview</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <DollarSign className="h-4 w-4" />
            <span>💰 Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4" />
            <span>🚀 Growth</span>
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Target className="h-4 w-4" />
            <span>👥 CRM</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Activity className="h-4 w-4" />
            <span>🔥 Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4" />
            <span>📚 Content</span>
          </TabsTrigger>
          <TabsTrigger value="ai-studio" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Bot className="h-4 w-4" />
            <span>🤖 AI Studio</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Settings className="h-4 w-4" />
            <span>⚙️ Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <AdminHealthPanel />
          <CMOCommandCenter />
        </TabsContent>

        <TabsContent value="revenue" className="pt-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">💰 Revenue Dashboard</TabsTrigger>
              <TabsTrigger value="coaches">🎯 Coaches & Commissions</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <RevenueDashboard />
            </TabsContent>
            <TabsContent value="coaches">
              <AdminCoaches />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="growth" className="pt-4">
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="leads">📈 Leads</TabsTrigger>
              <TabsTrigger value="challenge-funnel">🎯 Challenge Funnel</TabsTrigger>
              <TabsTrigger value="emails">📧 Email Analytics</TabsTrigger>
              <TabsTrigger value="split-tests">🧪 Split Tests</TabsTrigger>
              <TabsTrigger value="hub">📢 Marketing Hub</TabsTrigger>
              <TabsTrigger value="sms">📱 SMS Twilio</TabsTrigger>
            </TabsList>
            <TabsContent value="leads">
              <LeadMagnetAnalytics />
            </TabsContent>
            <TabsContent value="challenge-funnel">
              <ChallengeFunnelDashboard />
            </TabsContent>
            <TabsContent value="emails">
              <EmailAnalytics />
            </TabsContent>
            <TabsContent value="split-tests">
              <SplitTestDashboard />
            </TabsContent>
            <TabsContent value="hub">
              <MarketingHub />
            </TabsContent>
            <TabsContent value="sms">
              <SmsAdmin />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="crm" className="pt-4">
          <CRMDashboard />
        </TabsContent>

        <TabsContent value="engagement" className="pt-4">
          <EngagementDashboard />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">📖 Cursuri</TabsTrigger>
              <TabsTrigger value="warriors-way">⚔️ Warriors Way</TabsTrigger>
            </TabsList>
            <TabsContent value="courses">
              <CourseManager />
            </TabsContent>
            <TabsContent value="warriors-way">
              <WarriorsWayManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="ai-studio" className="pt-4">
          <AdminAIStudio />
        </TabsContent>

        {/* Settings Content */}
        <TabsContent value="settings" className="pt-4">
          <div className="space-y-6">
            <ApiConfig />
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure system-wide security settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Row Level Security</h4>
                      <p className="text-sm text-muted-foreground">Database RLS policies are active</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Admin Authentication</h4>
                      <p className="text-sm text-muted-foreground">Role-based admin access control</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
