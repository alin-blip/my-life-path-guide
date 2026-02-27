import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Copy, Sparkles, Plus, Search, Loader2, Save, RotateCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
  isCustom?: boolean;
  originalContent?: string;
}

// Brand Kit data for AI context
const BRAND_KIT = {
  productName: 'CEO Mind OS',
  tagline: 'The Founder Operating System',
  uvp: "CEO Mind OS is the first Founder Operating System that integrates business growth with personal well-being through AI-powered coaching, giving entrepreneurs the structure to achieve success without sacrifice.",
  secondaryTaglines: [
    'The Operating System for Your Entire Life',
    'Design Your Life. Execute Your Vision.',
    'Where High Performance Meets Holistic Living',
    'Build Your Empire Without Breaking Yourself',
  ],
  toneOfVoice: [
    'Empowering, not preachy',
    'Direct and actionable',
    'Holistic but grounded',
    'Tech-forward yet human',
    'Aspirational without toxic positivity',
  ],
  core4Framework: ['Business', 'Body', 'Being', 'Balance'],
  keyFeatures: [
    'CORE 4 Framework: Business + Body + Being + Balance',
    'AI Coaching Network with 4 specialized coaches',
    'Command Center dashboard',
    'Stack Sessions for daily rituals',
    'Napoleon Hill 17 Principles integration',
    'Lifebook System for life vision',
  ],
};

// Lean Canvas data for AI context
const LEAN_CANVAS = {
  problem: 'Burnout epidemic (67% of entrepreneurs sacrifice health/relationships), tool fragmentation (8-12 apps), no holistic system',
  solution: 'CORE 4 Framework, AI Coaching Network, Command Center, Stack Sessions',
  unfairAdvantage: 'Category Creator (first Life Operating System), Data Network Effects, Holistic Integration',
  customerSegments: 'Entrepreneurs 30-50, $100K-$1M revenue, high ambition, tech-savvy',
  channels: 'YouTube, Podcast, Partnerships, SEO, LinkedIn, Email',
  revenueStreams: 'Free tier, Pro ($29/mo), Enterprise ($99/mo)',
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'default-1',
    title: 'Hook - Problem Agitation',
    category: 'Social Media',
    content: `You're working 80 hours a week...

But your health is declining.
Your relationships are suffering.
Your "success" feels empty.

Here's the truth most entrepreneurs won't tell you:

You don't have to sacrifice EVERYTHING to build something great.

{{product_name}} proves it. Here's how 👇`,
    variables: ['product_name'],
  },
  {
    id: 'default-2',
    title: 'Webinar Opening Script',
    category: 'Video Script',
    content: `[HOOK - 0:00]
"What if I told you that the most successful entrepreneurs I know work LESS than you... and achieve MORE?"

[PROBLEM - 0:30]
Most of us were taught that success requires sacrifice.
More hours. More hustle. More burnout.

But here's what nobody tells you...

[AGITATION - 1:00]
That approach has a ceiling. And it's destroying you.
- 67% of entrepreneurs report burnout
- Average entrepreneur uses 12 different apps
- There's no system connecting your business goals to your life goals

[SOLUTION - 2:00]
Today I'm going to show you {{product_name}} - the first Life Operating System...`,
    variables: ['product_name'],
  },
  {
    id: 'default-3',
    title: 'Email - Welcome Sequence #1',
    category: 'Email',
    content: `Subject: Welcome to {{product_name}} - Let's design your life

Hey {{first_name}},

Welcome to the {{product_name}} community!

You just made a decision that 99% of entrepreneurs never make:
You chose to prioritize YOUR WHOLE LIFE, not just your business.

Here's what happens next:

1️⃣ Today: Complete your CORE 4 assessment (takes 5 min)
2️⃣ Tomorrow: I'll send you our "Success Without Sacrifice" framework
3️⃣ Day 3: Your first AI coaching session

Quick win for today: Open the app and set ONE intention for each life area.

To your holistic success,
The {{product_name}} Team`,
    variables: ['product_name', 'first_name'],
  },
  {
    id: 'default-4',
    title: 'Facebook Ad - Problem/Solution',
    category: 'Ad Copy',
    content: `🔥 Tired of choosing between SUCCESS and SANITY?

You shouldn't have to sacrifice your health, relationships, and happiness to build a thriving business.

{{product_name}} is the first Life Operating System that integrates:
✅ Business growth
✅ Physical health
✅ Mental clarity
✅ Life balance

All in ONE AI-powered platform.

🎁 Try it FREE for 14 days

[CTA: Start Your Free Trial]`,
    variables: ['product_name'],
  },
  {
    id: 'default-5',
    title: 'LinkedIn Post - Thought Leadership',
    category: 'Social Media',
    content: `I used to think "work-life balance" was a myth.

After 10 years of building companies:
- 2 burnouts
- 1 failed marriage
- Countless missed moments

I realized the truth:

It's not about balance. It's about INTEGRATION.

Your business, body, being, and balance aren't separate buckets.
They're one interconnected system.

When you optimize ONE, you optimize ALL.

That's why I built {{product_name}}.

Not another productivity app.
A Life Operating System.

What's one area of your life you've been neglecting for "success"?`,
    variables: ['product_name'],
  },
  {
    id: 'default-6',
    title: 'YouTube Video Description',
    category: 'Video Script',
    content: `{{video_title}}

In this video, I break down the exact system I use to manage my entire life - business, health, mindset, and relationships - all from ONE dashboard.

🎯 What you'll learn:
- The CORE 4 Framework explained
- How to set up your Life Command Center
- AI coaching that actually works
- Daily rituals for peak performance

⏱️ Timestamps:
0:00 - Introduction
{{timestamps}}

🔗 Resources:
- Try {{product_name}} Free: {{link}}
- CORE 4 Framework PDF: {{lead_magnet_link}}

📱 Connect with me:
- Instagram: @lifeos
- Twitter: @lifeos

#productivity #entrepreneur #lifehacks #personaldevelopment`,
    variables: ['video_title', 'timestamps', 'product_name', 'link', 'lead_magnet_link'],
  },
];

const CATEGORIES = ['Social Media', 'Video Script', 'Email', 'Ad Copy', 'Webinar'];

export const ContentTemplates = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', category: 'Social Media', content: '', variables: '' });

  const categories = [...new Set([...CATEGORIES, ...templates.map((t) => t.category)])];

  // Load templates from database
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_assets')
        .select('*')
        .eq('asset_type', 'template')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const dbTemplates: Template[] = data.map((item) => {
          const content = item.content as { 
            templateContent: string; 
            variables: string[]; 
            originalContent?: string;
            isCustom?: boolean;
          };
          return {
            id: item.id,
            title: item.title,
            category: item.category || 'Social Media',
            content: content.templateContent || '',
            variables: content.variables || [],
            originalContent: content.originalContent,
            isCustom: content.isCustom || false,
          };
        });
        setTemplates(dbTemplates);
      } else {
        // Initialize with default templates in database
        await initializeDefaultTemplates();
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultTemplates = async () => {
    try {
      const inserts = DEFAULT_TEMPLATES.map((t) => ({
        asset_type: 'template',
        title: t.title,
        category: t.category,
        content: {
          templateContent: t.content,
          variables: t.variables,
          originalContent: t.content,
          isCustom: false,
        },
        is_active: true,
      }));

      const { error } = await supabase.from('marketing_assets').insert(inserts);
      if (error) throw error;

      await loadTemplates();
    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyTemplate = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Template Copied!',
      description: `"${title}" copied to clipboard`,
    });
  };

  const saveTemplate = async (template: Template) => {
    setSavingId(template.id);
    try {
      const { error } = await supabase
        .from('marketing_assets')
        .update({
          content: {
            templateContent: template.content,
            variables: template.variables,
            originalContent: template.originalContent || template.content,
            isCustom: template.isCustom || false,
          },
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: 'Saved!',
        description: `"${template.title}" saved successfully`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const restoreTemplate = async (template: Template) => {
    if (!template.originalContent) return;

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === template.id ? { ...t, content: template.originalContent! } : t
      )
    );

    try {
      const { error } = await supabase
        .from('marketing_assets')
        .update({
          content: {
            templateContent: template.originalContent,
            variables: template.variables,
            originalContent: template.originalContent,
            isCustom: template.isCustom || false,
          },
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: 'Restored!',
        description: `"${template.title}" restored to original`,
      });
    } catch (error) {
      console.error('Error restoring template:', error);
    }
  };

  const deleteTemplate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('marketing_assets')
        .update({ is_active: false })
        .eq('id', template.id);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== template.id));

      toast({
        title: 'Deleted!',
        description: `"${template.title}" has been removed`,
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const createNewTemplate = async () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    try {
      const variables = newTemplate.variables
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

      const { data, error } = await supabase
        .from('marketing_assets')
        .insert({
          asset_type: 'template',
          title: newTemplate.title,
          category: newTemplate.category,
          content: {
            templateContent: newTemplate.content,
            variables,
            originalContent: newTemplate.content,
            isCustom: true,
          },
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const content = data.content as { templateContent: string; variables: string[] };
      setTemplates((prev) => [
        ...prev,
        {
          id: data.id,
          title: data.title,
          category: data.category || 'Social Media',
          content: content.templateContent,
          variables: content.variables || [],
          originalContent: content.templateContent,
          isCustom: true,
        },
      ]);

      setNewTemplate({ title: '', category: 'Social Media', content: '', variables: '' });
      setShowNewDialog(false);

      toast({
        title: 'Template Created!',
        description: `"${data.title}" has been added`,
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const generateWithAI = async (template: Template) => {
    setGeneratingId(template.id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to use AI generation',
          variant: 'destructive',
        });
        return;
      }

      const contextPrompt = `Generate fresh content for a "${template.title}" template in the "${template.category}" category.

## BRAND CONTEXT
- Product Name: ${BRAND_KIT.productName}
- Primary Tagline: ${BRAND_KIT.tagline}
- UVP: ${BRAND_KIT.uvp}
- Tone of Voice: ${BRAND_KIT.toneOfVoice.join(', ')}
- Key Features: ${BRAND_KIT.keyFeatures.join('; ')}
- CORE 4 Framework: ${BRAND_KIT.core4Framework.join(', ')}

## LEAN CANVAS CONTEXT
- Problem: ${LEAN_CANVAS.problem}
- Solution: ${LEAN_CANVAS.solution}
- Unfair Advantage: ${LEAN_CANVAS.unfairAdvantage}
- Target Customer: ${LEAN_CANVAS.customerSegments}
- Channels: ${LEAN_CANVAS.channels}
- Pricing: ${LEAN_CANVAS.revenueStreams}

## TEMPLATE REQUIREMENTS
- Category: ${template.category}
- Title: ${template.title}
- Variables to use: ${template.variables.map((v) => `{{${v}}}`).join(', ')}
- Original template for reference: 
${template.originalContent || template.content}

## INSTRUCTIONS
Create a NEW, FRESH version of this template that:
1. Uses the brand voice and messaging
2. Incorporates key product features naturally
3. Addresses the target customer's pain points
4. Keeps the same general structure but with fresh content
5. Uses {{variable}} format for any placeholders
6. Is ready to use with minimal editing

Generate ONLY the template content, no explanations.`;

      const response = await supabase.functions.invoke('admin-ai-assistant', {
        body: {
          messages: [{ role: 'user', content: contextPrompt }],
          contentType:
            template.category === 'Social Media'
              ? 'social_post'
              : template.category === 'Video Script'
              ? 'video_script'
              : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate content');
      }

      // Handle streaming response
      if (response.data instanceof ReadableStream) {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();
        let generatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  generatedContent += content;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        if (generatedContent) {
          const updatedTemplate = {
            ...template,
            content: generatedContent.trim(),
            originalContent: template.originalContent || template.content,
          };

          setTemplates((prev) =>
            prev.map((t) => (t.id === template.id ? updatedTemplate : t))
          );

          // Auto-save to database
          await saveTemplate(updatedTemplate);

          toast({
            title: 'Content Generated & Saved!',
            description: `"${template.title}" has been updated`,
          });
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate content',
        variant: 'destructive',
      });
    } finally {
      setGeneratingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {template.title}
                    {template.isCustom && (
                      <Badge variant="outline" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyTemplate(template.content, template.title)}
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveTemplate(template)}
                    disabled={savingId === template.id}
                    title="Save"
                  >
                    {savingId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  {template.originalContent && template.content !== template.originalContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => restoreTemplate(template)}
                      title="Restore original"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateWithAI(template)}
                    disabled={generatingId !== null}
                    title="Generate with AI"
                  >
                    {generatingId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                  {template.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template.content}
                onChange={(e) => {
                  setTemplates((prev) =>
                    prev.map((t) =>
                      t.id === template.id ? { ...t, content: e.target.value } : t
                    )
                  );
                }}
                className="min-h-[200px] text-xs font-mono resize-none"
              />
              {template.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Variables:</span>
                  {template.variables.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs">
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Template */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogTrigger asChild>
          <Card className="border-dashed cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="flex items-center justify-center py-8">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Template
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Instagram Story Hook"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Variables (comma-separated)</Label>
              <Input
                placeholder="e.g., product_name, first_name, link"
                value={newTemplate.variables}
                onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{variable_name}}'} in your content to reference these
              </p>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Write your template content here..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
