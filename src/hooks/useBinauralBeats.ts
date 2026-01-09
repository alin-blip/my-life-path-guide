import { useState, useRef, useCallback } from 'react';

export type BinauralType = 'theta' | 'alpha' | 'gamma' | 'delta';

// Binaural beat frequencies
const BEAT_FREQUENCIES: Record<BinauralType, number> = {
  delta: 2,    // 0.5-4 Hz - Deep sleep, healing
  theta: 6,    // 4-8 Hz - Deep relaxation, meditation, creativity
  alpha: 10,   // 8-12 Hz - Relaxed alertness, calm focus
  gamma: 40,   // 30-100 Hz - High focus, insight, peak awareness
};

const BASE_FREQUENCY = 200; // Base carrier frequency

export function useBinauralBeats() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentType, setCurrentType] = useState<BinauralType>('theta');
  const [volume, setVolume] = useState(0.3);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);

  const start = useCallback((type: BinauralType = 'theta') => {
    // If already playing the same type, don't restart
    if (isPlaying && currentType === type && audioContextRef.current) {
      console.log('🎵 Binaural beats already playing:', type);
      return;
    }
    
    // Stop any existing audio only if switching types
    if (audioContextRef.current) {
      stop();
    }

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const beatFreq = BEAT_FREQUENCIES[type];

      // Create oscillators
      const leftOscillator = audioContext.createOscillator();
      const rightOscillator = audioContext.createOscillator();
      
      leftOscillator.type = 'sine';
      rightOscillator.type = 'sine';
      
      // Left ear gets base frequency, right ear gets base + beat frequency
      leftOscillator.frequency.setValueAtTime(BASE_FREQUENCY, audioContext.currentTime);
      rightOscillator.frequency.setValueAtTime(BASE_FREQUENCY + beatFreq, audioContext.currentTime);

      // Create gain nodes for each channel
      const leftGain = audioContext.createGain();
      const rightGain = audioContext.createGain();
      leftGain.gain.setValueAtTime(volume, audioContext.currentTime);
      rightGain.gain.setValueAtTime(volume, audioContext.currentTime);

      // Create stereo merger (2 channels)
      const merger = audioContext.createChannelMerger(2);

      // Master gain for volume control
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime);

      // Connect: oscillators -> individual gains -> merger -> master gain -> destination
      leftOscillator.connect(leftGain);
      rightOscillator.connect(rightGain);
      leftGain.connect(merger, 0, 0); // Left channel
      rightGain.connect(merger, 0, 1); // Right channel
      merger.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Store references
      leftOscillatorRef.current = leftOscillator;
      rightOscillatorRef.current = rightOscillator;
      leftGainRef.current = leftGain;
      rightGainRef.current = rightGain;
      masterGainRef.current = masterGain;
      mergerRef.current = merger;

      // Start oscillators
      leftOscillator.start();
      rightOscillator.start();

      setCurrentType(type);
      setIsPlaying(true);
      
      console.log(`🎵 Started binaural beats: ${type} (${beatFreq}Hz)`);
    } catch (error) {
      console.error('Error starting binaural beats:', error);
    }
  }, [volume]);

  const stop = useCallback(() => {
    try {
      if (leftOscillatorRef.current) {
        leftOscillatorRef.current.stop();
        leftOscillatorRef.current.disconnect();
        leftOscillatorRef.current = null;
      }
      if (rightOscillatorRef.current) {
        rightOscillatorRef.current.stop();
        rightOscillatorRef.current.disconnect();
        rightOscillatorRef.current = null;
      }
      if (leftGainRef.current) {
        leftGainRef.current.disconnect();
        leftGainRef.current = null;
      }
      if (rightGainRef.current) {
        rightGainRef.current.disconnect();
        rightGainRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
      if (mergerRef.current) {
        mergerRef.current.disconnect();
        mergerRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsPlaying(false);
      console.log('🔇 Stopped binaural beats');
    } catch (error) {
      console.error('Error stopping binaural beats:', error);
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVolume, audioContextRef.current.currentTime);
    }
  }, []);

  const changeType = useCallback((type: BinauralType) => {
    if (isPlaying) {
      stop();
      start(type);
    } else {
      setCurrentType(type);
    }
  }, [isPlaying, stop, start]);

  // Fade out for smooth ending
  const fadeOut = useCallback((duration: number = 3000) => {
    if (masterGainRef.current && audioContextRef.current) {
      const currentTime = audioContextRef.current.currentTime;
      masterGainRef.current.gain.linearRampToValueAtTime(0, currentTime + duration / 1000);
      
      setTimeout(() => {
        stop();
      }, duration);
    } else {
      stop();
    }
  }, [stop]);

  return {
    start,
    stop,
    fadeOut,
    changeVolume,
    changeType,
    isPlaying,
    currentType,
    volume,
    availableTypes: Object.keys(BEAT_FREQUENCIES) as BinauralType[],
    getDescription: (type: BinauralType) => {
      const descriptions: Record<BinauralType, string> = {
        delta: 'Somn profund, vindecare',
        theta: 'Relaxare profundă, meditație',
        alpha: 'Calm, focus lin',
        gamma: 'Concentrare intensă, insight',
      };
      return descriptions[type];
    }
  };
}
