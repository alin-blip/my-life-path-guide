import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Check, FileText, Video, BarChart3, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'social_post' | 'video_script' | 'diagram';

const contentTypes = [
  { id: 'social_post' as ContentType, label: 'Postare Social', icon: FileText, description: 'Instagram, Facebook, LinkedIn' },
  { id: 'video_script' as ContentType, label: 'Script Video', icon: Video, description: 'Reels, TikTok, YouTube Shorts' },
  { id: 'diagram' as ContentType, label: 'Diagramă', icon: BarChart3, description: 'Infographic, Flowchart' },
];

export const AIContentGenerator: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('social_post');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({ title: 'Eroare', description: 'Te rog introdu un subiect', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setGeneratedContent('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          contentType: selectedType,
          messages: [{ role: 'user', content: topic }],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                  content += delta;
                  setGeneratedContent(content);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      toast({ title: 'Succes!', description: 'Conținut generat cu succes' });
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: 'Eroare',
        description: error instanceof Error ? error.message : 'Nu am putut genera conținutul',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyContent = async () => {
    if (!generatedContent) return;
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copiat!', description: 'Conținutul a fost copiat în clipboard' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generator de Conținut
          </CardTitle>
          <CardDescription>Selectează tipul și introdu subiectul</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-3 rounded-lg border transition-all text-center ${
                  selectedType === type.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                  selectedType === type.id ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className="text-xs font-medium">{type.label}</p>
                <p className="text-[10px] text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subiect / Idee</label>
            <Textarea
              placeholder="Ex: Importanța disciplinei în dimineață..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sugestii rapide:</p>
            <div className="flex flex-wrap gap-1">
              {['CORE 4 benefits', 'Morning routine', 'Door System', 'Stack session', 'Napoleon Hill'].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setTopic(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={generateContent} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se generează...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generează Conținut
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rezultat</CardTitle>
            <CardDescription>Conținutul generat de AI</CardDescription>
          </div>
          {generatedContent && (
            <Button variant="outline" size="sm" onClick={copyContent}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copiat!' : 'Copiază'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-lg border p-4">
            {generatedContent ? (
              <pre className="whitespace-pre-wrap text-sm font-sans">{generatedContent}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p>Conținutul generat va apărea aici</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
