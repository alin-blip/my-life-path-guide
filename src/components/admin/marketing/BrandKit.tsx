import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BRAND_COLORS = [
  { name: 'Primary', hex: '#9b87f5', usage: 'CTA buttons, highlights, icons' },
  { name: 'Primary Dark', hex: '#7E69AB', usage: 'Hover states, secondary elements' },
  { name: 'Accent', hex: '#D946EF', usage: 'Urgent actions, notifications' },
  { name: 'Success', hex: '#22c55e', usage: 'Completed tasks, positive feedback' },
  { name: 'Background Dark', hex: '#1A1F2C', usage: 'Main dark theme background' },
  { name: 'Background Light', hex: '#F1F0FB', usage: 'Main light theme background' },
];

const TAGLINES = {
  primary: 'Success Without Sacrifice',
  secondary: [
    'The Operating System for Your Entire Life',
    'Design Your Life. Execute Your Vision.',
    'Where High Performance Meets Holistic Living',
    'Build Your Empire Without Breaking Yourself',
  ],
};

const TONE_OF_VOICE = [
  'Empowering, not preachy',
  'Direct and actionable',
  'Holistic but grounded',
  'Tech-forward yet human',
  'Aspirational without toxic positivity',
];

export const BrandKit = () => {
  const { toast } = useToast();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [uvp, setUvp] = useState(
    "CEO Mind OS is the first Founder Operating System that integrates business growth with personal well-being through AI-powered coaching, giving entrepreneurs the structure to achieve success without sacrifice."
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Official color palette for all marketing materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BRAND_COLORS.map((color) => (
              <div
                key={color.hex}
                className="border rounded-lg p-4 space-y-2"
              >
                <div
                  className="h-16 rounded-md border"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(color.hex, color.name)}
                  >
                    {copiedColor === color.hex ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{color.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Taglines */}
      <Card>
        <CardHeader>
          <CardTitle>Taglines & Slogans</CardTitle>
          <CardDescription>Approved messaging for campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Primary Tagline</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-primary">{TAGLINES.primary}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(TAGLINES.primary, 'Primary tagline')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Secondary Taglines</p>
            {TAGLINES.secondary.map((tagline, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <p className="text-sm">{tagline}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tagline, 'Tagline')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UVP */}
      <Card>
        <CardHeader>
          <CardTitle>Unique Value Proposition</CardTitle>
          <CardDescription>Core messaging for all marketing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={uvp}
            onChange={(e) => setUvp(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(uvp, 'UVP')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tone of Voice */}
      <Card>
        <CardHeader>
          <CardTitle>Tone of Voice</CardTitle>
          <CardDescription>Guidelines for brand communication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TONE_OF_VOICE.map((tone, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tone}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
