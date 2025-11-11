import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseTextToSpeechOptions {
  voiceId?: string;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  autoPlay?: boolean;
}

// TTS cache to avoid regenerating same audio
const ttsCache = new Map<string, string>();

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const {
    voiceId = 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice
    onSpeakingStart,
    onSpeakingEnd,
    autoPlay = true
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsSpeaking(false);
    onSpeakingEnd?.();
  }, [onSpeakingEnd]);

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('No text provided for TTS');
      return;
    }

    // If currently speaking, queue the text
    if (isSpeaking) {
      audioQueueRef.current.push(text);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...');

      // Check cache first
      const cacheKey = `${voiceId}:${text}`;
      let audioUrl: string;

      if (ttsCache.has(cacheKey)) {
        console.log('✅ Using cached TTS audio');
        audioUrl = ttsCache.get(cacheKey)!;
      } else {
        // Generate new audio
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text, voiceId }
        });

        if (error) {
          throw error;
        }

        // Convert response to blob URL
        const blob = new Blob([data], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(blob);
        
        // Cache the audio URL
        ttsCache.set(cacheKey, audioUrl);
        console.log('💾 Cached TTS audio for future use');
      }

      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = audioUrl;
      audio.playbackRate = playbackRate;

      // Set up event listeners
      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
        onSpeakingStart?.();
        console.log('🎵 AI speaking...');
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onSpeakingEnd?.();
        console.log('✅ AI finished speaking');

        // Process queue
        const nextText = audioQueueRef.current.shift();
        if (nextText) {
          speak(nextText);
        }
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        cleanup();
        setIsLoading(false);
        toast({
          title: '⚠️ Eroare audio',
          description: 'Nu s-a putut reda audio-ul',
          variant: 'destructive',
        });
      };

      // Auto-play if enabled
      if (autoPlay) {
        await audio.play();
      }

    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      
      // Only show toast for real errors, not for missing API key
      if (error instanceof Error && !error.message.includes('API_KEY')) {
        toast({
          title: '⚠️ Eroare TTS',
          description: 'Nu s-a putut genera audio. Verifică conexiunea.',
          variant: 'destructive',
        });
      }
    }
  }, [isSpeaking, voiceId, autoPlay, onSpeakingStart, onSpeakingEnd, cleanup, toast]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
    }
  }, []);

  const skip = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration;
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const stop = useCallback(() => {
    audioQueueRef.current = [];
    cleanup();
  }, [cleanup]);

  const clearQueue = useCallback(() => {
    audioQueueRef.current = [];
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    skip,
    changePlaybackRate,
    clearQueue,
    isSpeaking,
    isLoading,
    isPaused,
    playbackRate,
    queueLength: audioQueueRef.current.length
  };
};
