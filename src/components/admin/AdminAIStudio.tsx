import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Image, Lightbulb } from 'lucide-react';
import { AIChat } from './ai-studio/AIChat';
import { AIContentGenerator } from './ai-studio/AIContentGenerator';
import { AIImageGenerator } from './ai-studio/AIImageGenerator';
import { AIDailyInsights } from './ai-studio/AIDailyInsights';

export const AdminAIStudio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Content Studio</h2>
          <p className="text-muted-foreground">Creează conținut pentru RoWarrior cu ajutorul AI</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Imagini
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <AIChat />
        </TabsContent>

        <TabsContent value="content">
          <AIContentGenerator />
        </TabsContent>

        <TabsContent value="image">
          <AIImageGenerator />
        </TabsContent>

        <TabsContent value="insights">
          <AIDailyInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};
