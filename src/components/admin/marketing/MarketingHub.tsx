import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, LayoutGrid, FileText, Calendar } from 'lucide-react';
import { BrandKit } from './BrandKit';
import { LeanCanvas } from './LeanCanvas';
import { ContentTemplates } from './ContentTemplates';
import { CampaignPlanner } from './CampaignPlanner';

export const MarketingHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Marketing Command Center</h2>
        <p className="text-muted-foreground">
          Centralizează toate resursele și strategia de marketing pentru LifeOS
        </p>
      </div>

      <Tabs defaultValue="brand-kit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brand-kit" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Kit
          </TabsTrigger>
          <TabsTrigger value="lean-canvas" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Lean Canvas
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand-kit" className="mt-6">
          <BrandKit />
        </TabsContent>
        
        <TabsContent value="lean-canvas" className="mt-6">
          <LeanCanvas />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <ContentTemplates />
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <CampaignPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};
