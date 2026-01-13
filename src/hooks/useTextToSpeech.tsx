import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseTextToSpeechOptions {
  voiceId?: string;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  autoPlay?: boolean;
  initialPlaybackRate?: number;
}

// TTS cache to avoid regenerating same audio - stores blob URLs
const ttsCache = new Map<string, { url: string; blob: Blob }>();

// Track active audio elements for cleanup
const activeAudioElements = new Set<HTMLAudioElement>();

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const {
    voiceId = 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice
    onSpeakingStart,
    onSpeakingEnd,
    autoPlay = true,
    initialPlaybackRate = 1.25
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(initialPlaybackRate);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false); // Prevent re-entrant speak calls
  const currentTextRef = useRef<string | null>(null); // Track current spoken text
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      // Remove from active set
      activeAudioElements.delete(audioRef.current);
      // Revoke object URL properly
      if (audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current.src = '';
      audioRef.current.remove();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    onSpeakingEnd?.();
  }, [onSpeakingEnd]);

  // Keep voiceId in a ref so speak() always uses current value
  const voiceIdRef = useRef(voiceId);
  voiceIdRef.current = voiceId;

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('No text provided for TTS');
      return;
    }

    // If currently speaking or locked, avoid duplicates
    if (isSpeakingRef.current || isSpeaking) {
      // Drop duplicate if same as current or already last in queue
      if (
        currentTextRef.current === text ||
        audioQueueRef.current[audioQueueRef.current.length - 1] === text
      ) {
        console.log('🛑 Dropping duplicate TTS request');
        return;
      }
      audioQueueRef.current.push(text);
      return;
    }

    const currentVoiceId = voiceIdRef.current;
    
    try {
      isSpeakingRef.current = true; // Lock immediately to avoid race conditions
      setIsLoading(true);
      console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...', 'with voice:', currentVoiceId);

      // Check cache first
      const cacheKey = `${currentVoiceId}:${text}`;
      let audioUrl: string;
      let audioBlob: Blob;

      if (ttsCache.has(cacheKey)) {
        console.log('✅ Using cached TTS audio');
        const cached = ttsCache.get(cacheKey)!;
        audioBlob = cached.blob;
        // Create fresh URL from blob to avoid revoked URLs
        audioUrl = URL.createObjectURL(audioBlob);
      } else {
        // Get user session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Generate new audio using direct fetch to get binary response
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ text, voiceId: currentVoiceId }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('TTS API error:', errorText);
          throw new Error('Failed to generate speech');
        }

        // Get audio blob directly
        audioBlob = await response.blob();
        
        // Verify blob is valid and has content
        if (!audioBlob || audioBlob.size === 0) {
          throw new Error('Invalid audio data received');
        }
        
        audioUrl = URL.createObjectURL(audioBlob);
        
        // Cache the blob (not the URL, as URLs can be revoked)
        ttsCache.set(cacheKey, { url: audioUrl, blob: audioBlob });
        console.log('💾 Cached TTS audio for future use');
      }

      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;
      activeAudioElements.add(audio);
      
      // Set source and verify it's loadable
      audio.src = audioUrl;
      audio.playbackRate = playbackRate;
      audio.preload = 'auto';

      // Set up event listeners
      audio.onplay = () => {
        currentTextRef.current = text; // Track currently spoken text
        setIsSpeaking(true);
        setIsLoading(false);
        onSpeakingStart?.();
        console.log('🎵 AI speaking...');
      };

      audio.onended = () => {
        setIsSpeaking(false);
        onSpeakingEnd?.();
        console.log('✅ AI finished speaking');
        
        // Clean up this specific audio element
        if (audioRef.current === audio) {
          activeAudioElements.delete(audio);
          if (audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(audio.src);
          }
          audio.remove();
          audioRef.current = null;
        }

        // Unlock speaking
        isSpeakingRef.current = false;
        currentTextRef.current = null;

        // Process queue (skip duplicates of just-played text)
        let nextText = audioQueueRef.current.shift();
        while (nextText && nextText === text) {
          console.log('⏩ Skipping queued duplicate TTS');
          nextText = audioQueueRef.current.shift();
        }
        if (nextText) {
          speak(nextText);
        }
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        console.error('Audio src:', audio.src);
        console.error('Audio readyState:', audio.readyState);
        console.error('Audio networkState:', audio.networkState);
        
        // Clear corrupted cache entry
        ttsCache.delete(cacheKey);
        
        // Unlock
        isSpeakingRef.current = false;
        currentTextRef.current = null;
        
        cleanup();
        setIsLoading(false);
        toast({
          title: '⚠️ Eroare audio',
          description: 'Nu s-a putut reda audio-ul. Încearcă din nou.',
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
      isSpeakingRef.current = false;
      currentTextRef.current = null;
      
      // Only show toast for real errors, not for missing API key
      if (error instanceof Error && !error.message.includes('API_KEY')) {
        toast({
          title: '⚠️ Eroare TTS',
          description: 'Nu s-a putut genera audio. Verifică conexiunea.',
          variant: 'destructive',
        });
      }
    }
  }, [isSpeaking, voiceId, autoPlay, onSpeakingStart, onSpeakingEnd, playbackRate, cleanup, toast]);

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
    isSpeakingRef.current = false; // Unlock speaking
    currentTextRef.current = null;
    
    // Stop all active audio elements
    activeAudioElements.forEach(audio => {
      audio.pause();
      if (audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
      audio.remove();
    });
    activeAudioElements.clear();
    
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
