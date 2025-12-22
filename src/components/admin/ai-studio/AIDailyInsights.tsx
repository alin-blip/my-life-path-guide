import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Lightbulb, CheckCircle2, Target, Flame, Sparkles, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface DailyInsights {
  stacks_completed: number;
  stack_types: string[];
  tracking: {
    core_score?: number;
    daily_four_score?: number;
    stack_completed?: boolean;
    door_tasks_completed?: number;
  } | null;
  tasks_completed: number;
  task_titles: string[];
}

interface ContentIdea {
  type: 'post' | 'video' | 'story';
  title: string;
  hook: string;
}

export const AIDailyInsights: React.FC = () => {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get_daily_insights' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Insights error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca datele',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateContentIdeas = async () => {
    if (!insights) return;

    setIsGeneratingIdeas(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const activitySummary = `
        Activitatea mea de azi:
        - ${insights.stacks_completed} stack-uri completate (${insights.stack_types.join(', ') || 'niciunul'})
        - Core Score: ${insights.tracking?.core_score || 0}/8
        - Daily Four: ${insights.tracking?.daily_four_score || 0}/4
        - ${insights.tasks_completed} task-uri completate: ${insights.task_titles.join(', ') || 'niciunul'}
        
        Bazat pe activitatea mea de azi, generează 3 idei de conținut pentru social media.
        Pentru fiecare idee, dă-mi:
        1. Tipul (post/video/story)
        2. Titlul scurt
        3. Hook-ul (prima propoziție care atrage atenția)
        
        Format răspunsul exact așa:
        IDEA 1:
        TYPE: [post/video/story]
        TITLE: [titlu]
        HOOK: [hook]
        
        IDEA 2:
        ...etc
      `;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: [{ role: 'user', content: activitySummary }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

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
                const content = data.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
              } catch (e) {}
            }
          }
        }
      }

      // Parse the response into structured ideas
      const ideas: ContentIdea[] = [];
      const ideaBlocks = fullContent.split(/IDEA \d+:/i).filter(Boolean);
      
      for (const block of ideaBlocks) {
        const typeMatch = block.match(/TYPE:\s*(\w+)/i);
        const titleMatch = block.match(/TITLE:\s*(.+?)(?=\n|HOOK)/is);
        const hookMatch = block.match(/HOOK:\s*(.+?)(?=\n\n|IDEA|$)/is);

        if (typeMatch && titleMatch && hookMatch) {
          ideas.push({
            type: typeMatch[1].toLowerCase() as 'post' | 'video' | 'story',
            title: titleMatch[1].trim(),
            hook: hookMatch[1].trim(),
          });
        }
      }

      setContentIdeas(ideas.length > 0 ? ideas : [
        { type: 'post', title: 'Rutina de dimineață', hook: 'Am descoperit secretul productivității...' },
        { type: 'video', title: 'Cum îți organizezi ziua', hook: '3 pași simpli pentru focus maxim' },
        { type: 'story', title: 'Behind the scenes', hook: 'Uite cum arată o zi din viața mea...' },
      ]);

      toast({ title: 'Succes!', description: 'Idei de conținut generate' });
    } catch (error) {
      console.error('Content ideas error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut genera idei',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const copyIdea = async (idea: ContentIdea, index: number) => {
    const text = `${idea.title}\n\n${idea.hook}`;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: 'Copiat!', description: 'Ideea a fost copiată' });
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Activitatea de Azi
            </CardTitle>
            <CardDescription>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: ro })}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInsights} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Flame className="w-4 h-4" />
                    Stack-uri
                  </div>
                  <p className="text-2xl font-bold">{insights.stacks_completed}</p>
                  {insights.stack_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insights.stack_types.map((type, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{type}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    Core Score
                  </div>
                  <p className="text-2xl font-bold">{insights.tracking?.core_score || 0}/8</p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Daily Four
                  </div>
                  <p className="text-2xl font-bold">{insights.tracking?.daily_four_score || 0}/4</p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Door Tasks
                  </div>
                  <p className="text-2xl font-bold">{insights.tasks_completed}</p>
                </div>
              </div>

              {insights.task_titles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Task-uri completate:</p>
                  <div className="flex flex-wrap gap-1">
                    {insights.task_titles.map((title, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{title}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={generateContentIdeas} disabled={isGeneratingIdeas} className="w-full">
                {isGeneratingIdeas ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se generează idei...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generează Idei de Conținut
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto opacity-50 mb-2" />
              <p>Nu am putut încărca datele</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Idei de Conținut</CardTitle>
          <CardDescription>Bazate pe activitatea ta de azi</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {contentIdeas.length > 0 ? (
              <div className="space-y-4">
                {contentIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        idea.type === 'video' ? 'default' :
                        idea.type === 'story' ? 'secondary' : 'outline'
                      }>
                        {idea.type === 'video' ? '🎬 Video' :
                         idea.type === 'story' ? '📱 Story' : '📝 Post'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyIdea(idea, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <h4 className="font-semibold mb-1">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground">{idea.hook}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p>Click pe "Generează Idei" pentru sugestii</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
