import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { sentimentAnalysisService } from '@/services/sentimentAnalysisService';
import { SentimentBadge } from './SentimentBadge';
import { Brain, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionInsightsProps {
  session: any;
}

export const SessionInsights: React.FC<SessionInsightsProps> = ({ session }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, [session.sessionId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const result = await sentimentAnalysisService.getSessionInsights(session.sessionId);
      
      if (result.success && result.insights) {
        setInsights(result.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSession = async () => {
    try {
      setAnalyzing(true);
      toast({
        title: 'Analiză în curs',
        description: 'Se analizează toate înregistrările...'
      });

      const result = await sentimentAnalysisService.analyzeSession(session.sessionId);
      
      if (result.success) {
        toast({
          title: 'Succes',
          description: `${result.analyzed} înregistrări analizate cu succes!`
        });
        await loadInsights();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut analiza sesiunea.',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Insights AI
          </CardTitle>
          <CardDescription>
            Analizează sesiunea pentru a obține insights personalizate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={analyzeSession}
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizez sesiunea...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analizează cu AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sentimentPercentage = ((insights.averageSentiment + 1) / 2) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Insights AI pentru Sesiune
        </CardTitle>
        <CardDescription>
          Analiză emoțională generată de inteligența artificială
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Insight */}
        <div className="bg-background/70 p-4 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Observație Generală</p>
              <p className="text-sm text-muted-foreground">{insights.overallInsight}</p>
            </div>
          </div>
        </div>

        {/* Sentiment Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold">Scor Emoțional Mediu</p>
            <span className={`text-sm font-bold ${
              insights.averageSentiment > 0.3 ? 'text-green-400' : 
              insights.averageSentiment < -0.3 ? 'text-red-400' : 
              'text-blue-400'
            }`}>
              {(insights.averageSentiment * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={sentimentPercentage} className="h-2" />
        </div>

        {/* Dominant Emotions */}
        <div>
          <p className="text-sm font-semibold mb-3">Emoții Dominante</p>
          <div className="space-y-2">
            {insights.dominantEmotions.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <SentimentBadge emotion={item.emotion} />
                <div className="flex-1 mx-3">
                  <Progress 
                    value={(item.count / session.totalQuestions) * 100} 
                    className="h-1.5"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.count}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Themes */}
        {insights.keyThemes.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Teme Identificate</p>
            <div className="flex flex-wrap gap-2">
              {insights.keyThemes.map((theme: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Journey */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm font-semibold">Călătoria Emoțională</p>
          </div>
          <div className="space-y-2">
            {insights.emotionalJourney.map((point: any, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-8">#{index + 1}</span>
                <SentimentBadge 
                  emotion={point.emotion} 
                  intensity={point.intensity}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
