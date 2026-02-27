import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CanvasSection {
  id: string;
  title: string;
  content: string;
  gridClass: string;
}

const INITIAL_CANVAS: CanvasSection[] = [
  {
    id: 'problem',
    title: 'Problem',
    gridClass: 'col-span-1 row-span-2',
    content: `1. Burnout epidemic: 67% of entrepreneurs sacrifice health/relationships for business success

2. Tool fragmentation: Average entrepreneur uses 8-12 apps with no integration

3. No holistic system: Business tools ignore personal life, wellness apps ignore business goals`,
  },
  {
    id: 'solution',
    title: 'Solution',
    gridClass: 'col-span-1 row-span-2',
    content: `• CORE 4 Framework: Unified Business + Body + Being + Balance system

• AI Coaching Network: 4 specialized coaches (Business, Health, Mindset, Life)

• Command Center: Single dashboard integrating all life domains

• Stack Sessions: Daily guided rituals for peak performance`,
  },
  {
    id: 'uvp',
    title: 'Unique Value Proposition',
    gridClass: 'col-span-1 row-span-2',
    content: `"Success Without Sacrifice"

The first Life Operating System that proves you don't have to choose between building an empire and living a fulfilling life.

High-level concept: "Notion meets Life Coach meets AI" for ambitious entrepreneurs`,
  },
  {
    id: 'unfair-advantage',
    title: 'Unfair Advantage',
    gridClass: 'col-span-1 row-span-2',
    content: `Triple Moat Defense:

1. Category Creator: First-mover in "Life Operating System" category

2. Data Network Effects: AI improves with every user's success patterns

3. Holistic Integration: Competitors would need to rebuild entire architecture to match CORE 4 integration`,
  },
  {
    id: 'segments',
    title: 'Customer Segments',
    gridClass: 'col-span-1',
    content: `Primary: "The Overwhelmed Achiever"
• Entrepreneurs 30-50, $100K-$1M revenue
• High ambition, sacrificing personal life
• Tech-savvy, self-improvement oriented

Early Adopters:
• Productivity enthusiasts
• Life design community
• Burned-out high performers`,
  },
  {
    id: 'channels',
    title: 'Channels',
    gridClass: 'col-span-1',
    content: `Primary (80% effort):
• YouTube: Weekly "Life Operating System" content
• Podcast: Guest appearances + own show
• Partnerships: Integration with productivity influencers

Secondary (20% effort):
• SEO: "life operating system" keywords
• LinkedIn: Thought leadership
• Email: Nurture sequences`,
  },
  {
    id: 'revenue',
    title: 'Revenue Streams',
    gridClass: 'col-span-1',
    content: `Freemium + Subscription:
• Free: Basic CORE 4 tracking
• Pro ($29/mo): Full AI coaching, unlimited stacks
• Enterprise ($99/mo): Team features, analytics

Target: 
• Year 1: $500K ARR (1,500 paid users)
• Year 3: $5M ARR`,
  },
  {
    id: 'costs',
    title: 'Cost Structure',
    gridClass: 'col-span-1',
    content: `Fixed Costs:
• Development team: $15K/mo
• Infrastructure: $2K/mo
• AI/API costs: $3K/mo

Variable Costs:
• Marketing: 30% of revenue
• Support: $500/mo per 1000 users

Break-even: ~500 Pro subscribers`,
  },
  {
    id: 'metrics',
    title: 'Key Metrics',
    gridClass: 'col-span-2',
    content: `North Star: Daily Active Users completing CORE 4

Acquisition: CAC < $50, Trial-to-Paid > 15%
Activation: 7-day CORE 4 completion rate > 40%
Retention: 30-day retention > 60%, Monthly churn < 5%
Revenue: LTV > $500, LTV:CAC > 3:1
Referral: NPS > 50, Referral rate > 20%`,
  },
];

export const LeanCanvas = () => {
  const { toast } = useToast();
  const [canvas, setCanvas] = useState<CanvasSection[]>(INITIAL_CANVAS);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSection = (id: string, content: string) => {
    setCanvas((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
    setHasChanges(true);
  };

  const saveCanvas = async () => {
    setIsSaving(true);
    try {
      // Check if exists first
      const { data: existing } = await supabase
        .from('marketing_assets')
        .select('id')
        .eq('asset_type', 'lean_canvas')
        .eq('title', 'CEO Mind OS Lean Canvas')
        .single();

      const payload = {
        asset_type: 'lean_canvas' as const,
        title: 'CEO Mind OS Lean Canvas',
        content: { sections: canvas } as unknown as import('@/integrations/supabase/types').Json,
        category: 'strategy',
      };

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('marketing_assets')
          .update(payload)
          .eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('marketing_assets').insert(payload));
      }

      if (error) throw error;

      toast({
        title: 'Saved!',
        description: 'Lean Canvas updated successfully',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving canvas:', error);
      toast({
        title: 'Error',
        description: 'Failed to save canvas',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetCanvas = () => {
    setCanvas(INITIAL_CANVAS);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">CEO Mind OS Lean Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Click any section to edit. All changes are saved to database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetCanvas}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            size="sm"
            onClick={saveCanvas}
            disabled={isSaving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Canvas'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {canvas.map((section) => (
          <Card key={section.id} className={section.gridClass}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, e.target.value)}
                className="min-h-[120px] text-xs resize-none"
                placeholder={`Enter ${section.title.toLowerCase()}...`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
