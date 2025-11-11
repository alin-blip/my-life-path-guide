import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Trash2, Brain, Sparkles } from 'lucide-react';
import { voiceRecordingService } from '@/services/voiceRecordingService';
import { sentimentAnalysisService, SentimentAnalysis } from '@/services/sentimentAnalysisService';
import { SentimentBadge } from './SentimentBadge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VoiceRecordingPlayerProps {
  recording: any;
  index: number;
}

export const VoiceRecordingPlayer: React.FC<VoiceRecordingPlayerProps> = ({
  recording,
  index
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(
    recording.sentiment_analysis || null
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAudio();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [recording.id]);

  const loadAudio = async () => {
    try {
      setLoading(true);
      const url = await voiceRecordingService.getRecordingUrl(recording.storage_path);
      if (url) {
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut încărca înregistrarea audio.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${recording.question_number || index + 1}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut descărca înregistrarea.',
        variant: 'destructive'
      });
    }
  };

  const handleAnalyze = async () => {
    if (!recording.transcript) {
      toast({
        title: 'Eroare',
        description: 'Nu există transcript pentru analiză.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAnalyzing(true);
      const result = await sentimentAnalysisService.analyzeRecording(
        recording.id,
        recording.transcript,
        recording.question_text || undefined
      );

      if (result.success && result.analysis) {
        setSentiment(result.analysis);
        toast({
          title: 'Succes',
          description: 'Analiza sentimentelor completă!'
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut analiza sentimentul.',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await voiceRecordingService.deleteRecording(recording.id);
      if (result.success) {
        toast({
          title: 'Succes',
          description: 'Înregistrarea a fost ștearsă.'
        });
        window.location.reload();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge înregistrarea.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-accent/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Question */}
          {recording.question_text && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Întrebarea {recording.question_number || index + 1}
              </p>
              <p className="text-sm">{recording.question_text}</p>
            </div>
          )}

          {/* Transcript */}
          {recording.transcript && (
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Transcriptul răspunsului tău:
              </p>
              <p className="text-sm italic">{recording.transcript}</p>
            </div>
          )}

          {/* Sentiment Analysis */}
          {sentiment ? (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary">Analiză AI a Sentimentelor</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <SentimentBadge 
                    emotion={sentiment.primary_emotion} 
                    intensity={sentiment.intensity}
                  />
                  {sentiment.secondary_emotions?.map((emotion, i) => (
                    <SentimentBadge key={i} emotion={emotion} />
                  ))}
                </div>

                {sentiment.key_themes && sentiment.key_themes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Teme identificate:</p>
                    <div className="flex flex-wrap gap-1">
                      {sentiment.key_themes.map((theme, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-background/70 p-3 rounded">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Insight psihologic:</p>
                  <p className="text-sm">{sentiment.psychological_insight}</p>
                </div>

                {sentiment.recommendation && (
                  <div className="bg-primary/10 p-3 rounded border border-primary/30">
                    <p className="text-xs font-semibold text-primary mb-1">Recomandare:</p>
                    <p className="text-sm">{sentiment.recommendation}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Scor sentiment: 
                    <span className={`ml-1 font-semibold ${
                      sentiment.sentiment_score > 0.3 ? 'text-green-400' : 
                      sentiment.sentiment_score < -0.3 ? 'text-red-400' : 
                      'text-blue-400'
                    }`}>
                      {(sentiment.sentiment_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : recording.transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {analyzing ? 'Analizez...' : 'Analizează Sentimentele cu AI'}
            </Button>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <>
              <audio ref={audioRef} src={audioUrl} />
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  disabled={loading}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <div className="flex-1 space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  title="Descarcă"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Șterge înregistrarea?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Această acțiune nu poate fi anulată. Înregistrarea va fi ștearsă permanent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Șterge
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
