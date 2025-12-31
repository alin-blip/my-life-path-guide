import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, Plus, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
}

// Brand Kit data for AI context
const BRAND_KIT = {
  productName: 'LifeOS',
  tagline: 'Success Without Sacrifice',
  uvp: "LifeOS is the first Life Operating System that integrates business growth with personal well-being through AI-powered coaching, giving entrepreneurs the structure to achieve success without sacrifice.",
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
  colors: {
    primary: '#9b87f5',
    accent: '#D946EF',
    success: '#22c55e',
  },
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

const TEMPLATES: Template[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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

export const ContentTemplates = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

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

      // Build context prompt with brand kit and lean canvas
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
- Variables to use: ${template.variables.map(v => `{{${v}}}`).join(', ')}
- Original template for reference: 
${template.content}

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
          contentType: template.category === 'Social Media' ? 'social_post' : 
                       template.category === 'Video Script' ? 'video_script' : undefined,
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
                // Skip invalid JSON lines
              }
            }
          }
        }

        if (generatedContent) {
          setTemplates(prev => 
            prev.map(t => 
              t.id === template.id 
                ? { ...t, content: generatedContent.trim() }
                : t
            )
          );

          toast({
            title: 'Content Generated!',
            description: `"${template.title}" has been updated with fresh AI content`,
          });
        }
      } else if (typeof response.data === 'string') {
        setTemplates(prev => 
          prev.map(t => 
            t.id === template.id 
              ? { ...t, content: response.data.trim() }
              : t
          )
        );

        toast({
          title: 'Content Generated!',
          description: `"${template.title}" has been updated with fresh AI content`,
        });
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
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyTemplate(template.content, template.title)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template.content}
                onChange={(e) => {
                  setTemplates(prev =>
                    prev.map(t =>
                      t.id === template.id
                        ? { ...t, content: e.target.value }
                        : t
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
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add New Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
