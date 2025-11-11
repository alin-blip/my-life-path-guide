import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseTextToSpeechOptions {
  voiceId?: string;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  autoPlay?: boolean;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const {
    voiceId = 'pNInz6obpgDQGcFmaJgB', // Default ElevenLabs voice
    onSpeakingStart,
    onSpeakingEnd,
    autoPlay = true
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId }
      });

      if (error) {
        throw error;
      }

      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Convert response to blob URL
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      audio.src = audioUrl;

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
    clearQueue,
    isSpeaking,
    isLoading,
    queueLength: audioQueueRef.current.length
  };
};
