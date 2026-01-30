import { useState, useEffect, useCallback, useRef } from 'react';
import { getSoundSettings, updateSoundSettings, syncLocalPreferencesToCloud } from '@/services/userPreferencesService';
import { supabase } from '@/integrations/supabase/client';

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
    // Initial load from localStorage for instant UI
    try {
      const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from cloud on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadSettings = async () => {
      try {
        const cloudSettings = await getSoundSettings();
        if (isMounted) {
          setSettings(cloudSettings);
          // Also update localStorage for offline access
          localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(cloudSettings));
        }
      } catch (error) {
        console.warn('Failed to load sound settings from cloud:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync preferences when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        syncLocalPreferencesToCloud();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Debounced save to cloud
  const saveToCloud = useCallback((newSettings: SoundSettings) => {
    // Always save to localStorage immediately
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(newSettings));
    
    // Debounce cloud save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateSoundSettings(newSettings.muted, newSettings.volume).catch(err => {
        console.warn('Failed to save sound settings to cloud:', err);
      });
    }, 500);
  }, []);

  const toggleMute = useCallback(() => {
    setSettings(prev => {
      const updated = { ...prev, muted: !prev.muted };
      saveToCloud(updated);
      return updated;
    });
  }, [saveToCloud]);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => {
      const updated = { ...prev, volume: Math.max(0, Math.min(1, volume)) };
      saveToCloud(updated);
      return updated;
    });
  }, [saveToCloud]);

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
    isLoading,
    toggleMute,
    setVolume,
    playBeep,
    playSuccessSound,
  };
}
