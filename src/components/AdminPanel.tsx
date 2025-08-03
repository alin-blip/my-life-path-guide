
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CourseManager } from './admin/CourseManager';
import { ClientManager } from './admin/ClientManager';
import { ApiConfig } from './admin/ApiConfig';
import { CourseUploader } from './admin/CourseUploader';
import { Users, BookOpen, WrenchIcon, Lock, Unlock, Upload } from 'lucide-react';

interface AdminPanelProps {
  isAdmin: boolean;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  onAdminAccess: (hasAccess: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isAdmin, 
  adminPassword, 
  setAdminPassword, 
  onAdminAccess 
}) => {
  const { toast } = useToast();
  
  const handleAdminLogin = () => {
    // In a real app, this would be a secure authentication flow
    // For demo purposes, we're using a simple password check
    if (adminPassword === 'admin123') {
      onAdminAccess(true);
      toast({
        title: "Admin access granted",
        description: "You now have admin privileges for course management.",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect admin password.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    onAdminAccess(false);
    setAdminPassword('');
    toast({
      title: "Logged out",
      description: "Admin session ended.",
    });
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter admin password to manage courses and clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="admin-password">Admin Password</label>
              <Input 
                id="admin-password" 
                type="password"
                placeholder="Enter admin password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={handleAdminLogin}>Login</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Admin Control Panel</h2>
        <Button 
          variant="ghost"
          onClick={handleLogout}
          className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          Admin Logout
        </Button>
      </div>
      
      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload Course
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1">
            <WrenchIcon className="h-4 w-4" />
            API Configuration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="pt-4">
          <CourseManager />
        </TabsContent>
        
        <TabsContent value="upload" className="pt-4">
          <CourseUploader />
        </TabsContent>
        
        <TabsContent value="clients" className="pt-4">
          <ClientManager />
        </TabsContent>
        
        <TabsContent value="api" className="pt-4">
          <ApiConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};
