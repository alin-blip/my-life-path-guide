import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

interface EmotionalPattern {
  id: string;
  pattern_type: string;
  description: string;
  frequency: number;
  first_detected: string;
  last_detected: string;
  ai_insight: string | null;
  is_active: boolean;
}

interface PatternAlertProps {
  refreshTrigger?: number;
}

export function PatternAlert({ refreshTrigger }: PatternAlertProps) {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<EmotionalPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPatterns();
    }
  }, [user, refreshTrigger]);

  const fetchPatterns = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('emotional_patterns')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_detected', { ascending: false });

    if (error) {
      console.error('Error fetching patterns:', error);
    } else {
      setPatterns(data || []);
    }
    setIsLoading(false);
  };

  const analyzePatterns = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('emotional-insights', {
        body: { userId: user.id, action: 'analyze_patterns' }
      });

      if (error) throw error;

      toast.success('Analiză completă!');
      fetchPatterns();
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast.error('Nu am putut analiza pattern-urile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'recurring_trigger':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'energy_pattern':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'emotional_cycle':
        return <Brain className="h-4 w-4 text-purple-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getPatternLabel = (type: string) => {
    switch (type) {
      case 'recurring_trigger':
        return 'Trigger recurent';
      case 'energy_pattern':
        return 'Pattern energie';
      case 'emotional_cycle':
        return 'Ciclu emoțional';
      case 'reaction_pattern':
        return 'Pattern reacție';
      default:
        return 'Pattern detectat';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Se încarcă...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Pattern-uri detectate
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzePatterns}
            disabled={isAnalyzing}
            className="h-7 text-xs"
          >
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Analizează
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patterns.length > 0 ? (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="p-3 rounded-lg border bg-gradient-to-r from-muted/50 to-transparent"
              >
                <div className="flex items-start gap-2">
                  {getPatternIcon(pattern.pattern_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {getPatternLabel(pattern.pattern_type)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Detectat de {pattern.frequency}x
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">{pattern.description}</p>
                    {pattern.ai_insight && (
                      <div className="mt-2 p-2 rounded-md bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1 text-[10px] text-primary font-medium mb-0.5">
                          <Lightbulb className="h-3 w-3" />
                          Insight AI
                        </div>
                        <p className="text-xs text-muted-foreground">{pattern.ai_insight}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Ultima detecție: {format(new Date(pattern.last_detected), 'd MMM yyyy', { locale: ro })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Brain className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Niciun pattern detectat încă
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Continuă să faci check-in-uri pentru a descoperi pattern-uri în emoțiile tale
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={analyzePatterns}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              Analizează acum
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
