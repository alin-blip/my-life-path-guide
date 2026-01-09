import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Headphones,
  Waves,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { useBinauralBeats, BinauralType } from '@/hooks/useBinauralBeats';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EmpowermentMeditationPlayerProps {
  meditationScript: string;
  binauralType?: BinauralType;
  onComplete: (durationSeconds: number) => void;
  onCancel?: () => void;
}

export function EmpowermentMeditationPlayer({
  meditationScript,
  binauralType = 'theta',
  onComplete,
  onCancel
}: EmpowermentMeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [binauralEnabled, setBinauralEnabled] = useState(true);
  const [binauralVolume, setBinauralVolume] = useState(0.2);
  const [currentBinauralType, setCurrentBinauralType] = useState<BinauralType>(binauralType);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const binaural = useBinauralBeats();
  const tts = useTextToSpeech({
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Default calm voice
    onSpeakingEnd: () => {
      // When TTS ends, fade out binaural and complete
      if (binaural.isPlaying) {
        binaural.fadeOut(3000);
      }
      setTimeout(() => {
        handleComplete();
      }, 3500);
    }
  });

  // Timer effect
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      binaural.stop();
      tts.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    // Start binaural beats if enabled
    if (binauralEnabled) {
      binaural.start(currentBinauralType);
      binaural.changeVolume(binauralVolume);
    }

    // Start TTS after a short delay for binaural to settle
    setTimeout(() => {
      tts.speak(meditationScript);
    }, 2000);
  }, [binauralEnabled, currentBinauralType, binauralVolume, meditationScript, binaural, tts]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    tts.pause();
    // Keep binaural playing for ambient effect
  }, [tts]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    tts.resume();
  }, [tts]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    binaural.stop();
    tts.stop();
    setElapsedSeconds(0);
    if (onCancel) onCancel();
  }, [binaural, tts, onCancel]);

  const handleComplete = useCallback(() => {
    const duration = elapsedSeconds;
    setIsPlaying(false);
    setIsPaused(false);
    binaural.stop();
    onComplete(duration);
  }, [elapsedSeconds, binaural, onComplete]);

  const handleSkip = useCallback(() => {
    tts.skip();
  }, [tts]);

  const handleBinauralVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setBinauralVolume(newVolume);
    if (binaural.isPlaying) {
      binaural.changeVolume(newVolume);
    }
  }, [binaural]);

  const handleBinauralTypeChange = useCallback((type: BinauralType) => {
    setCurrentBinauralType(type);
    if (binaural.isPlaying) {
      binaural.changeType(type);
    }
  }, [binaural]);

  const toggleBinaural = useCallback((enabled: boolean) => {
    setBinauralEnabled(enabled);
    if (isPlaying) {
      if (enabled) {
        binaural.start(currentBinauralType);
        binaural.changeVolume(binauralVolume);
      } else {
        binaural.stop();
      }
    }
  }, [isPlaying, currentBinauralType, binauralVolume, binaural]);

  // Estimated duration based on word count
  const estimatedDuration = Math.round(meditationScript.split(' ').length / 120 * 60);

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="flex flex-col items-center py-6">
        <div className={`relative w-48 h-48 rounded-full flex items-center justify-center ${
          isPlaying && !isPaused
            ? 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30'
            : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
        }`}>
          {/* Pulsing animation when playing */}
          {isPlaying && !isPaused && (
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-pulse" />
          )}
          
          {/* Binaural wave animation */}
          {binaural.isPlaying && (
            <div className="absolute inset-4 rounded-full border border-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
          )}

          <div className="text-center z-10">
            <Headphones className={`h-8 w-8 mx-auto mb-2 ${isPlaying ? 'text-purple-400' : 'text-muted-foreground'}`} />
            <p className="text-4xl font-mono font-bold">
              {formatTime(elapsedSeconds)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ~{formatTime(estimatedDuration)} total
            </p>
          </div>
        </div>

        {/* Status */}
        <p className="mt-4 text-sm text-center text-muted-foreground">
          {!isPlaying && 'Apasă Play pentru a începe meditația ghidată'}
          {isPlaying && !isPaused && tts.isLoading && '🎵 Se pregătește audio...'}
          {isPlaying && !isPaused && tts.isSpeaking && '🧘 Meditație în curs...'}
          {isPlaying && isPaused && '⏸️ Pauză'}
        </p>
      </div>

      {/* Binaural Controls */}
      <div className="p-4 rounded-lg bg-muted/30 border border-muted space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-indigo-400" />
            <Label htmlFor="binaural-toggle" className="text-sm font-medium">
              Frecvențe Binaurale
            </Label>
          </div>
          <Switch
            id="binaural-toggle"
            checked={binauralEnabled}
            onCheckedChange={toggleBinaural}
          />
        </div>

        {binauralEnabled && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">Tip:</span>
              <Select
                value={currentBinauralType}
                onValueChange={(v) => handleBinauralTypeChange(v as BinauralType)}
              >
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theta">
                    <div className="flex flex-col">
                      <span>Theta (6 Hz)</span>
                      <span className="text-xs text-muted-foreground">Meditație profundă</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alpha">
                    <div className="flex flex-col">
                      <span>Alpha (10 Hz)</span>
                      <span className="text-xs text-muted-foreground">Relaxare, calm</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gamma">
                    <div className="flex flex-col">
                      <span>Gamma (40 Hz)</span>
                      <span className="text-xs text-muted-foreground">Focus intens</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <VolumeX className="h-3 w-3 text-muted-foreground" />
              <Slider
                value={[binauralVolume]}
                onValueChange={handleBinauralVolumeChange}
                min={0}
                max={0.5}
                step={0.05}
                className="flex-1"
              />
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            </div>
          </>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        {!isPlaying ? (
          <Button
            size="lg"
            onClick={handleStart}
            className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Play className="h-5 w-5" />
            Start Meditație
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button size="lg" onClick={handleResume} className="gap-2">
                <Play className="h-5 w-5" />
                Continuă
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
                <Pause className="h-5 w-5" />
                Pauză
              </Button>
            )}
            
            <Button size="lg" variant="ghost" onClick={handleSkip} className="gap-2">
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2">
              <Square className="h-5 w-5" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Headphones tip */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Headphones className="h-3 w-3" />
        <span>Folosește căști pentru efectul complet al frecvențelor binaurale</span>
      </div>
    </div>
  );
}
