import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Wind, ArrowRight, Check, Play, Pause, Volume2 } from 'lucide-react';
import { useStepConfig, BreathingStepConfig } from '@/hooks/useStepConfig';
import { useBreathingMusic, BreathingMusicItem } from '@/hooks/useBreathingMusic';

interface BreathingStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfter';

export function BreathingStep({ completed, onComplete, onNext }: BreathingStepProps) {
  const { config } = useStepConfig<BreathingStepConfig>('breathing');
  const { music, getSignedUrl } = useBreathingMusic();

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycles, setCycles] = useState(0);
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [musicEnded, setMusicEnded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const technique = config.technique || 'box';
  const durationMode = config.durationMode || 'cycles';
  const TARGET_CYCLES = config.cycles || 5;

  // Phase durations from config
  const phaseDurations = useMemo(() => {
    const inhale = config.inhaleDuration ?? 4;
    const hold = config.holdDuration ?? 4;
    const exhale = config.exhaleDuration ?? 4;
    const holdAfter = config.holdAfterExhale ?? 0;
    return { inhale, hold, exhale, holdAfter };
  }, [config.inhaleDuration, config.holdDuration, config.exhaleDuration, config.holdAfterExhale]);

  const currentPhaseDuration = phaseDurations[phase];

  // Determine active phases (skip those with duration 0)
  const getNextPhase = useCallback((current: Phase): { nextPhase: Phase; incrementCycle: boolean } => {
    const order: Phase[] = ['inhale', 'hold', 'exhale', 'holdAfter'];
    let idx = order.indexOf(current);
    let incrementCycle = false;

    while (true) {
      idx = (idx + 1) % order.length;
      if (idx === 0) incrementCycle = true; // wrapped around = 1 full cycle
      const next = order[idx];
      if (phaseDurations[next] > 0) return { nextPhase: next, incrementCycle };
      if (next === 'exhale' && idx === 2) incrementCycle = false; // skip holdAfter doesn't mean new cycle
      if (idx === 0 && phaseDurations[next] === 0) {
        // skip inhale with 0? shouldn't happen but safety
        continue;
      }
    }
  }, [phaseDurations]);

  // Load selected music URL
  useEffect(() => {
    const loadUrl = async () => {
      if (config.selectedMusicId) {
        const m = music.find(item => item.id === config.selectedMusicId);
        if (m) {
          const url = await getSignedUrl(m.file_path);
          setAudioUrl(url);
        }
      } else {
        setAudioUrl(null);
      }
    };
    loadUrl();
  }, [config.selectedMusicId, music]);

  // Audio element setup
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.addEventListener('ended', () => setMusicEnded(true));
      audioRef.current = audio;
      return () => {
        audio.pause();
        audio.removeEventListener('ended', () => setMusicEnded(true));
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Play/pause audio with exercise
  useEffect(() => {
    if (!audioRef.current) return;
    if (isActive) {
      audioRef.current.play().catch((err) => {
        if (import.meta.env.DEV) console.warn('Audio playback failed:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isActive]);

  // Music duration mode: end when music ends
  useEffect(() => {
    if (durationMode === 'music' && musicEnded && isActive) {
      setIsActive(false);
      onComplete(true);
    }
  }, [musicEnded, durationMode, isActive, onComplete]);

  // Main breathing timer
  useEffect(() => {
    const shouldRun = isActive && (durationMode === 'music' || cycles < TARGET_CYCLES);
    if (shouldRun) {
      intervalRef.current = setInterval(() => {
        setSecondsInPhase(prev => {
          if (prev >= currentPhaseDuration - 1) {
            const { nextPhase, incrementCycle } = getNextPhase(phase);
            setPhase(nextPhase);
            if (incrementCycle) setCycles(c => c + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, phase, cycles, currentPhaseDuration, getNextPhase, durationMode, TARGET_CYCLES]);

  // Cycles mode completion
  useEffect(() => {
    if (durationMode === 'cycles' && cycles >= TARGET_CYCLES && !completed) {
      setIsActive(false);
      if (audioRef.current) audioRef.current.pause();
      onComplete(true);
    }
  }, [cycles, completed, onComplete, TARGET_CYCLES, durationMode]);

  const toggleBreathing = () => {
    if ((durationMode === 'cycles' && cycles >= TARGET_CYCLES) || musicEnded) {
      setCycles(0);
      setSecondsInPhase(0);
      setPhase('inhale');
      setMusicEnded(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
    setIsActive(!isActive);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inspiră';
      case 'hold': return 'Ține';
      case 'exhale': return 'Expiră';
      case 'holdAfter': return 'Pauză';
    }
  };

  const getCircleScale = () => {
    const progress = currentPhaseDuration > 0 ? secondsInPhase / currentPhaseDuration : 0;
    switch (phase) {
      case 'inhale': return 1 + progress * 0.5;
      case 'hold': return 1.5;
      case 'exhale': return 1.5 - progress * 0.5;
      case 'holdAfter': return 1;
    }
  };

  const handleConfirm = () => {
    onComplete(true);
    if (audioRef.current) audioRef.current.pause();
    setTimeout(() => onNext(), 500);
  };

  const selectedMusic = music.find(m => m.id === config.selectedMusicId);

  // Active phase indicators
  const phaseIndicators = [
    { key: 'inhale', label: 'Inspiră', seconds: phaseDurations.inhale },
    { key: 'hold', label: 'Ține', seconds: phaseDurations.hold },
    { key: 'exhale', label: 'Expiră', seconds: phaseDurations.exhale },
    { key: 'holdAfter', label: 'Pauză', seconds: phaseDurations.holdAfter },
  ].filter(p => p.seconds > 0);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border-cyan-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-cyan-500/20'
          } mb-4`}>
            {completed ? (
              <Check className="h-12 w-12 text-green-500" />
            ) : (
              <Wind className="h-12 w-12 text-cyan-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Respirație Profundă</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {durationMode === 'music' && selectedMusic
              ? `Exercițiu de respirație pe melodia "${selectedMusic.title}"`
              : `${TARGET_CYCLES} cicluri de respirație (${phaseDurations.inhale}/${phaseDurations.hold}/${phaseDurations.exhale}/${phaseDurations.holdAfter})`
            }
          </p>
        </div>

        {/* Breathing visualization */}
        {!completed && (
          <div className="flex flex-col items-center py-8 space-y-6">
            <div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/50 to-teal-400/50 flex items-center justify-center transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${getCircleScale()})` }}
            >
              <div className="text-center">
                {isActive ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">{getPhaseText()}</p>
                    <p className="text-4xl font-mono">{Math.max(0, currentPhaseDuration - secondsInPhase)}</p>
                  </>
                ) : (
                  <Play className="h-12 w-12 text-foreground" />
                )}
              </div>
            </div>

            {/* Progress dots - only for cycles mode */}
            {durationMode === 'cycles' && (
              <>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[...Array(TARGET_CYCLES)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all ${
                        i < cycles
                          ? 'bg-green-500'
                          : i === cycles && isActive
                            ? 'bg-cyan-500 animate-pulse'
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ciclu {Math.min(cycles + 1, TARGET_CYCLES)} din {TARGET_CYCLES}
                </p>
              </>
            )}

            {/* Music mode progress */}
            {durationMode === 'music' && (
              <p className="text-sm text-muted-foreground">
                Ciclu {cycles + 1} • Melodia rulează...
              </p>
            )}
          </div>
        )}

        {/* Phase indicators */}
        <div className={`grid gap-4 text-center text-sm grid-cols-${phaseIndicators.length}`} style={{ gridTemplateColumns: `repeat(${phaseIndicators.length}, 1fr)` }}>
          {phaseIndicators.map(({ key, label, seconds }) => (
            <div
              key={key}
              className={`p-3 rounded-lg transition-all ${
                phase === key && isActive ? 'bg-cyan-500/30 border-2 border-cyan-500' : 'bg-muted/30'
              }`}
            >
              <span className="font-medium block">{label}</span>
              <span className="text-muted-foreground text-xs">{seconds} sec</span>
            </div>
          ))}
        </div>

        {/* Volume control when music is selected */}
        {audioUrl && !completed && (
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{Math.round(volume * 100)}%</span>
          </div>
        )}

        {/* Action buttons */}
        {!completed ? (
          <div className="space-y-3">
            <Button
              onClick={toggleBreathing}
              size="lg"
              variant={isActive ? 'secondary' : 'default'}
              className="w-full gap-2"
            >
              {isActive ? (
                <><Pause className="h-5 w-5" /> Pauză</>
              ) : (
                <><Play className="h-5 w-5" /> {cycles > 0 ? 'Continuă' : 'Începe Exercițiul'}</>
              )}
            </Button>

            {cycles > 0 && !isActive && (
              <Button onClick={handleConfirm} size="lg" variant="outline" className="w-full gap-2">
                <Check className="h-5 w-5" /> Marchează ca finalizat
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={onNext} size="lg" className="w-full gap-2">
              Continuă <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => onComplete(false)} 
              size="sm" 
              variant="ghost" 
              className="w-full text-xs text-muted-foreground"
            >
              🔄 Reset test (temporar)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
