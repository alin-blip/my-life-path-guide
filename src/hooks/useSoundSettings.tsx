import { useState, useEffect, useCallback } from 'react';

const SOUND_SETTINGS_KEY = 'rowarrior-sound-settings';

interface SoundSettings {
  muted: boolean;
  volume: number;
}

const defaultSettings: SoundSettings = {
  muted: false,
  volume: 0.5,
};

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    try {
      const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleMute = useCallback(() => {
    setSettings(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const playBeep = useCallback(() => {
    if (settings.muted) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(settings.volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Could not play beep sound:', error);
    }
  }, [settings.muted, settings.volume]);

  const playSuccessSound = useCallback(() => {
    if (settings.muted) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play two ascending notes for success
      const frequencies = [523.25, 659.25]; // C5, E5
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(settings.volume * 0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (error) {
      console.warn('Could not play success sound:', error);
    }
  }, [settings.muted, settings.volume]);

  return {
    muted: settings.muted,
    volume: settings.volume,
    toggleMute,
    setVolume,
    playBeep,
    playSuccessSound,
  };
}
