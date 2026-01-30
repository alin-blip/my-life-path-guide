import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseDemoTextToSpeechOptions {
  voiceId?: string;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  autoPlay?: boolean;
  initialPlaybackRate?: number;
}

// TTS cache for demo - stores blob URLs
const demoTTSCache = new Map<string, { blob: Blob }>();

export const useDemoTextToSpeech = (options: UseDemoTextToSpeechOptions = {}) => {
  const {
    voiceId = 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural voice
    onSpeakingStart,
    onSpeakingEnd,
    autoPlay = true,
    initialPlaybackRate = 1.15
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false);
  const { toast } = useToast();

  const DEMO_TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech-demo`;

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current.src = '';
      audioRef.current.remove();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    onSpeakingEnd?.();
  }, [onSpeakingEnd]);

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('No text provided for TTS');
      return;
    }

    // Prevent duplicate calls
    if (isSpeakingRef.current || isSpeaking) {
      console.log('🛑 Already speaking, skipping');
      return;
    }

    try {
      isSpeakingRef.current = true;
      setIsLoading(true);
      console.log('🔊 Demo TTS for:', text.substring(0, 50) + '...');

      // Check cache first
      const cacheKey = `${voiceId}:${text}`;
      let audioBlob: Blob;

      if (demoTTSCache.has(cacheKey)) {
        console.log('✅ Using cached demo TTS audio');
        audioBlob = demoTTSCache.get(cacheKey)!.blob;
      } else {
        // Call public demo TTS endpoint (no auth required)
        const response = await fetch(DEMO_TTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            toast({
              title: '⏱️ Pauză scurtă',
              description: 'Prea multe cereri. Încearcă din nou în câteva secunde.',
              variant: 'destructive',
            });
            cleanup();
            return;
          }
          throw new Error('TTS request failed');
        }

        audioBlob = await response.blob();
        
        if (!audioBlob || audioBlob.size === 0) {
          throw new Error('Invalid audio data');
        }

        // Cache for future use
        demoTTSCache.set(cacheKey, { blob: audioBlob });
        console.log('💾 Cached demo TTS audio');
      }

      // Create and play audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio();
      audioRef.current = audio;
      
      audio.src = audioUrl;
      audio.playbackRate = initialPlaybackRate;
      audio.preload = 'auto';

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
        onSpeakingStart?.();
        console.log('🎵 Demo AI speaking...');
      };

      audio.onended = () => {
        setIsSpeaking(false);
        onSpeakingEnd?.();
        console.log('✅ Demo AI finished speaking');
        
        // Cleanup
        URL.revokeObjectURL(audioUrl);
        audio.remove();
        audioRef.current = null;
        isSpeakingRef.current = false;
      };

      audio.onerror = (e) => {
        console.error('❌ Demo audio error:', e);
        demoTTSCache.delete(cacheKey);
        isSpeakingRef.current = false;
        cleanup();
        setIsLoading(false);
      };

      if (autoPlay) {
        await audio.play();
      }

    } catch (error) {
      console.error('❌ Demo TTS error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, [isSpeaking, voiceId, autoPlay, onSpeakingStart, onSpeakingEnd, initialPlaybackRate, cleanup, toast, DEMO_TTS_URL]);

  const stop = useCallback(() => {
    isSpeakingRef.current = false;
    cleanup();
  }, [cleanup]);

  const skip = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration;
    }
  }, []);

  return {
    speak,
    stop,
    skip,
    isSpeaking,
    isLoading,
  };
};
