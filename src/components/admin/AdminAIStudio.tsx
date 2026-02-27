import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Image, Lightbulb, GalleryHorizontal, Calendar, Share2, LayoutGrid } from 'lucide-react';
import { AIChat } from './ai-studio/AIChat';
import { AIContentGenerator } from './ai-studio/AIContentGenerator';
import { AIImageGenerator } from './ai-studio/AIImageGenerator';
import { AIDailyInsights } from './ai-studio/AIDailyInsights';
import { AIImageGallery } from './ai-studio/AIImageGallery';
import { AIScheduler } from './ai-studio/AIScheduler';
import { AISocialShare } from './ai-studio/AISocialShare';
import { AIFeatureImageGenerator } from './ai-studio/AIFeatureImageGenerator';

export const AdminAIStudio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Content Studio</h2>
          <p className="text-muted-foreground">Creează conținut pentru CEO Mind OS cu ajutorul AI</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1 text-xs">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-1 text-xs">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Imagini</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1 text-xs">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-1 text-xs">
            <GalleryHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Galerie</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-1 text-xs">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Programare</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 text-xs">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
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

        <TabsContent value="features">
          <AIFeatureImageGenerator />
        </TabsContent>

        <TabsContent value="gallery">
          <AIImageGallery />
        </TabsContent>

        <TabsContent value="scheduler">
          <AIScheduler />
        </TabsContent>

        <TabsContent value="social">
          <AISocialShare />
        </TabsContent>

        <TabsContent value="insights">
          <AIDailyInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};
