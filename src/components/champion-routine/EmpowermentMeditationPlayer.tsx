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
  User
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

const AVAILABLE_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam - Voce profundă', gender: 'male' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger - Voce calmă', gender: 'male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Profesională', gender: 'female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura - Voce caldă', gender: 'female' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George - Accent britanic', gender: 'male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda - Relaxantă', gender: 'female' },
];

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
  const [binauralVolume, setBinauralVolume] = useState(0.15);
  const [currentBinauralType, setCurrentBinauralType] = useState<BinauralType>(binauralType);
  const [selectedVoice, setSelectedVoice] = useState(() => 
    localStorage.getItem('meditation-voice') || 'CwhRBWXzGAHq8TQ4Fs17'
  );
  const [hasFinishedSpeaking, setHasFinishedSpeaking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const binauralStartedRef = useRef(false);

  const binaural = useBinauralBeats();
  
  const tts = useTextToSpeech({
    voiceId: selectedVoice,
    initialPlaybackRate: 0.9, // Slower for meditation
    onSpeakingEnd: () => {
      console.log('🧘 TTS finished speaking');
      setHasFinishedSpeaking(true);
    }
  });

  // Handle completion separately when speaking ends
  useEffect(() => {
    if (hasFinishedSpeaking && isPlaying) {
      console.log('🎵 Fading out binaural...');
      // Fade out binaural over 5 seconds
      if (binaural.isPlaying) {
        binaural.fadeOut(5000);
      }
      // Complete after fade
      const timer = setTimeout(() => {
        handleComplete();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [hasFinishedSpeaking, isPlaying]);

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

  // Start binaural when playing and enabled
  useEffect(() => {
    if (isPlaying && binauralEnabled && !binauralStartedRef.current) {
      console.log('🎵 Starting binaural beats:', currentBinauralType);
      binaural.start(currentBinauralType);
      binaural.changeVolume(binauralVolume);
      binauralStartedRef.current = true;
    }
  }, [isPlaying, binauralEnabled, currentBinauralType, binauralVolume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    setHasFinishedSpeaking(false);
    startTimeRef.current = Date.now();
    binauralStartedRef.current = false;

    // Start binaural beats if enabled
    if (binauralEnabled) {
      console.log('🎵 Starting binaural beats:', currentBinauralType);
      binaural.start(currentBinauralType);
      binaural.changeVolume(binauralVolume);
      binauralStartedRef.current = true;
    }

    // Start TTS immediately - no delay!
    console.log('🔊 Starting meditation narration immediately...');
    tts.speak(meditationScript);
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
    setHasFinishedSpeaking(false);
    binauralStartedRef.current = false;
    binaural.stop();
    tts.stop();
    setElapsedSeconds(0);
    if (onCancel) onCancel();
  }, [binaural, tts, onCancel]);

  const handleComplete = useCallback(() => {
    const duration = elapsedSeconds;
    setIsPlaying(false);
    setIsPaused(false);
    setHasFinishedSpeaking(false);
    binauralStartedRef.current = false;
    binaural.stop();
    tts.stop();
    onComplete(duration);
  }, [elapsedSeconds, binaural, tts, onComplete]);

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
        binauralStartedRef.current = true;
      } else {
        binaural.stop();
        binauralStartedRef.current = false;
      }
    }
  }, [isPlaying, currentBinauralType, binauralVolume, binaural]);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('meditation-voice', voiceId);
  }, []);

  // Estimated duration based on word count (slower rate for meditation)
  const estimatedDuration = Math.round(meditationScript.split(' ').length / 100 * 60);

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
            <>
              <div className="absolute inset-4 rounded-full border border-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-8 rounded-full border border-purple-400/20 animate-ping" style={{ animationDuration: '3s' }} />
            </>
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
          {isPlaying && !isPaused && !tts.isLoading && !tts.isSpeaking && binaural.isPlaying && '🎵 Frecvențe binaurale active...'}
          {isPlaying && isPaused && '⏸️ Pauză'}
        </p>
      </div>

      {/* Voice Selection */}
      <div className="p-4 rounded-lg bg-muted/30 border border-muted space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-purple-400" />
          <Label className="text-sm font-medium">Voce Ghid</Label>
        </div>
        <Select
          value={selectedVoice}
          onValueChange={handleVoiceChange}
          disabled={isPlaying}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center gap-2">
                  <span>{voice.gender === 'female' ? '👩' : '👨'}</span>
                  <span>{voice.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Binaural Controls */}
      <div className="p-4 rounded-lg bg-muted/30 border border-muted space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-indigo-400" />
            <Label htmlFor="binaural-toggle" className="text-sm font-medium">
              Frecvențe Binaurale
            </Label>
            {binaural.isPlaying && (
              <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full animate-pulse">
                ACTIV
              </span>
            )}
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
                  <SelectItem value="delta">
                    <div className="flex flex-col">
                      <span>Delta (2 Hz)</span>
                      <span className="text-xs text-muted-foreground">Somn profund, vindecare</span>
                    </div>
                  </SelectItem>
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
                max={0.4}
                step={0.02}
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
            
            <Button size="lg" variant="ghost" onClick={handleSkip} className="gap-2" title="Sari la final">
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
