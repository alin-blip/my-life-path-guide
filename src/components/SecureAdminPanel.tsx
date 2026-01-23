import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';
import { CourseManager } from './admin/CourseManager';
import { ApiConfig } from './admin/ApiConfig';
import { Leaderboard } from './admin/Leaderboard';
import { RevenueDashboard } from './admin/RevenueDashboard';
import { AdminAIStudio } from './admin/AdminAIStudio';
import { MarketingHub } from './admin/marketing/MarketingHub';
import { WarriorsWayManager } from './admin/WarriorsWayManager';
import { EmailAnalytics } from './admin/EmailAnalytics';
import { SplitTestDashboard } from './admin/SplitTestDashboard';
import { CRMDashboard } from './admin/crm/CRMDashboard';
import { LeadMagnetAnalytics } from './admin/LeadMagnetAnalytics';
import { AdminCoaches } from './admin/AdminCoaches';
import { 
  Shield, BookOpen, Settings, LayoutDashboard, 
  Lock, Bot, Megaphone, Target, Users, DollarSign, Trophy, TrendingUp, UserCheck
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
      
      <Tabs defaultValue="crm">
        <TabsList className="mb-8 flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {/* Tab 1: Overview */}
          <TabsTrigger value="overview" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">📊 Overview</span>
          </TabsTrigger>
          
          {/* Tab 2: CRM */}
          <TabsTrigger value="crm" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Target className="h-4 w-4" />
            <span>👥 CRM</span>
          </TabsTrigger>
          
          {/* Tab 3: Leads Analytics */}
          <TabsTrigger value="leads" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4" />
            <span>📈 Leads</span>
          </TabsTrigger>
          
          {/* Tab 4: Content */}
          <TabsTrigger value="content" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <BookOpen className="h-4 w-4" />
            <span>📚 Content</span>
          </TabsTrigger>
          
          {/* Tab 5: AI Studio */}
          <TabsTrigger value="ai-studio" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Bot className="h-4 w-4" />
            <span>🤖 AI Studio</span>
          </TabsTrigger>
          
          {/* Tab 6: Marketing */}
          <TabsTrigger value="marketing" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Megaphone className="h-4 w-4" />
            <span>📢 Marketing</span>
          </TabsTrigger>
          
          {/* Tab 7: Coaches */}
          <TabsTrigger value="coaches" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <UserCheck className="h-4 w-4" />
            <span>🎯 Coaches</span>
          </TabsTrigger>
          
          {/* Tab 8: Settings */}
          <TabsTrigger value="settings" className="flex items-center gap-1.5 data-[state=active]:bg-background">
            <Settings className="h-4 w-4" />
            <span>⚙️ Settings</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab 1: Overview Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current system security status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-medium">✓ Secure</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  RLS policies active, admin authentication enabled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Admin Session
                </CardTitle>
                <CardDescription>
                  Current admin session info
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p><strong>User:</strong> {user.email}</p>
                  <p><strong>Role:</strong> Administrator</p>
                  <p><strong>Session:</strong> Active</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  Revenue Summary
                </CardTitle>
                <CardDescription>
                  Quick financial overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View detailed revenue data in the Marketing tab.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Leaderboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab 2: CRM Content */}
        <TabsContent value="crm" className="pt-4">
          <CRMDashboard />
        </TabsContent>
        
        {/* Tab 3: Leads Analytics Content */}
        <TabsContent value="leads" className="pt-4">
          <LeadMagnetAnalytics />
        </TabsContent>
        
        {/* Tab 4: Content Content */}
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
        
        {/* Tab 4: AI Studio Content */}
        <TabsContent value="ai-studio" className="pt-4">
          <AdminAIStudio />
        </TabsContent>
        
        {/* Tab 5: Marketing Content */}
        <TabsContent value="marketing" className="space-y-6">
          <Tabs defaultValue="hub" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="hub">📢 Marketing Hub</TabsTrigger>
              <TabsTrigger value="split-tests">🧪 Split Tests</TabsTrigger>
              <TabsTrigger value="emails">📧 Email Analytics</TabsTrigger>
              <TabsTrigger value="revenue">💰 Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hub">
              <MarketingHub />
            </TabsContent>
            
            <TabsContent value="split-tests">
              <SplitTestDashboard />
            </TabsContent>
            
            <TabsContent value="emails">
              <EmailAnalytics />
            </TabsContent>
            
            <TabsContent value="revenue">
              <RevenueDashboard />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Tab 7: Coaches Content */}
        <TabsContent value="coaches" className="pt-4">
          <AdminCoaches />
        </TabsContent>
        
        {/* Tab 8: Settings Content */}
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
