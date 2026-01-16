import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuth } from '@/context/AuthContext';
import { CourseManager } from './admin/CourseManager';
import { ClientManager } from './admin/ClientManager';
import { ApiConfig } from './admin/ApiConfig';
import { ToolsManager } from './admin/ToolsManager';
import { Leaderboard } from './admin/Leaderboard';
import { CourseSubmissions } from './admin/CourseSubmissions';
import { RevenueDashboard } from './admin/RevenueDashboard';
import { AdminAIStudio } from './admin/AdminAIStudio';
import { MarketingHub } from './admin/marketing/MarketingHub';
import { WarriorsWayManager } from './admin/WarriorsWayManager';
import { EmailAnalytics } from './admin/EmailAnalytics';
import { CRMDashboard } from './admin/crm/CRMDashboard';
import { 
  Shield, Users, BookOpen, Wrench, Settings, LayoutDashboard, 
  Trophy, Upload, DollarSign, Lock, Bot, Megaphone, GraduationCap, Mail, Target
} from 'lucide-react';

export const SecureAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-warrior-accent"></div>
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
        <h1 className="text-2xl font-bold">Secure Admin Control Panel</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Authenticated as: {user.email}</span>
        </div>
      </div>
      
      <Tabs defaultValue="ai-studio">
        <TabsList className="mb-8 flex-wrap">
          <TabsTrigger value="ai-studio" className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            🤖 AI Studio
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            🎯 CRM
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-1">
            <Megaphone className="h-4 w-4" />
            📢 Marketing
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="warriors-way" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            ⚔️ W. Way
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="email-analytics" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            📧 Emails
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-studio" className="pt-4">
          <AdminAIStudio />
        </TabsContent>
        
        <TabsContent value="crm" className="pt-4">
          <CRMDashboard />
        </TabsContent>
        
        <TabsContent value="marketing" className="pt-4">
          <MarketingHub />
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system security status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">Secure</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  RLS policies active, admin authentication enabled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Admin Session</CardTitle>
                <CardDescription>
                  Current admin session info
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p><strong>User:</strong> {user.email}</p>
                  <p><strong>Role:</strong> Administrator</p>
                  <p><strong>Session:</strong> Active</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Notice</CardTitle>
                <CardDescription>
                  Important security information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-600">
                  Admin access is now properly secured with role-based authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="pt-4">
          <Leaderboard />
        </TabsContent>
        
        <TabsContent value="courses" className="pt-4">
          <CourseManager />
        </TabsContent>
        
        <TabsContent value="warriors-way" className="pt-4">
          <WarriorsWayManager />
        </TabsContent>
        
        <TabsContent value="submissions" className="pt-4">
          <CourseSubmissions />
        </TabsContent>
        
        <TabsContent value="revenue" className="pt-4">
          <RevenueDashboard />
        </TabsContent>
        
        <TabsContent value="clients" className="pt-4">
          <ClientManager />
        </TabsContent>
        
        <TabsContent value="tools" className="pt-4">
          <ToolsManager />
        </TabsContent>
        
        <TabsContent value="email-analytics" className="pt-4">
          <EmailAnalytics />
        </TabsContent>
        
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
