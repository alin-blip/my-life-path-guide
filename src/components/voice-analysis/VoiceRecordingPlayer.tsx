import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Download, Trash2 } from 'lucide-react';
import { voiceRecordingService } from '@/services/voiceRecordingService';
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
