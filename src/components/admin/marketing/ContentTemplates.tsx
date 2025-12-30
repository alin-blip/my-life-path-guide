import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
}

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

  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  const filteredTemplates = TEMPLATES.filter((template) => {
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
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template.content}
                readOnly
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
