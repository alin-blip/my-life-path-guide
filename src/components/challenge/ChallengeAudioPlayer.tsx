import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, Loader2, RotateCcw } from 'lucide-react';
import { getPlainTextScript } from '@/data/challengeScripts';
import { VoiceSelector, DEFAULT_VOICE_ID } from '@/components/stack/VoiceSelector';

interface ChallengeAudioPlayerProps {
  script: string;
  language?: 'ro' | 'en';
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const labels = {
  ro: {
    title: 'Coach Audio Challenge',
    subtitle: 'Ascultă introducerea',
  },
  en: {
    title: 'Challenge Coach Audio',
    subtitle: 'Listen to the introduction',
  },
};

export const ChallengeAudioPlayer: React.FC<ChallengeAudioPlayerProps> = ({ 
  script,
  language = 'ro'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE_ID);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const l = labels[language];

  const generateAudio = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setIsLoading(true);
    setError(null);

    try {
      const plainText = getPlainTextScript(script);
      const truncatedText = plainText.substring(0, 2000);

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/text-to-speech-demo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
          },
          body: JSON.stringify({
            text: truncatedText,
            voiceId: selectedVoice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(100);
      };

      audio.onerror = () => {
        setError(language === 'ro' ? 'Eroare la redarea audio' : 'Error playing audio');
        setIsPlaying(false);
        setIsGenerating(false);
      };

      // Wait for audio to be ready before playing
      audio.oncanplaythrough = async () => {
        setIsLoading(false);
        setIsGenerating(false);
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err: any) {
          if (err?.name !== 'AbortError') {
            console.error('Playback error:', err);
            setError(language === 'ro' ? 'Eroare la redarea audio' : 'Error playing audio');
          }
        }
      };

      audio.load();

    } catch (err) {
      console.error('TTS error:', err);
      setError(language === 'ro' ? 'Eroare la generarea audio. Încearcă din nou.' : 'Failed to generate audio. Please try again.');
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const togglePlay = async () => {
    if (isGenerating || isLoading) return;

    if (!audioUrl) {
      await generateAudio();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err: any) {
          if (err?.name !== 'AbortError') {
            setError(language === 'ro' ? 'Eroare la redarea audio' : 'Error playing audio');
          }
        }
      }
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="p-4 border-b border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Volume2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{l.title}</p>
          <p className="text-xs text-muted-foreground">{l.subtitle}</p>
        </div>
        <VoiceSelector
          currentVoice={selectedVoice}
          onVoiceChange={(voiceId) => {
            setSelectedVoice(voiceId);
            // Reset audio so it regenerates with new voice
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
              setAudioUrl(null);
            }
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);
            setIsGenerating(false);
          }}
          disabled={isLoading || isGenerating}
          compact
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          size="icon"
          variant="outline"
          disabled={isLoading || isGenerating}
          className="h-12 w-12 rounded-full border-2 flex-shrink-0"
        >
          {isLoading || isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {audioUrl && (
          <Button
            onClick={restart}
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-2">{error}</p>
      )}
    </div>
  );
};

export default ChallengeAudioPlayer;
