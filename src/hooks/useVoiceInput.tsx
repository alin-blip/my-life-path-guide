import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, AudioQueue, RealtimeChat } from '@/utils/RealtimeAudio';
import { logger } from '@/lib/logger';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void; // Called with interim results for real-time display
  onMicStop?: () => void; // Called when user stops the microphone
  onSilenceDetected?: () => void; // Called after 3 seconds of silence
  systemPrompt?: string;
  enabled?: boolean;
  transport?: 'webrtc' | 'ws'; // WebRTC is recommended
  voiceLanguage?: 'ro-RO' | 'en-US'; // Language for voice recognition
  autoSubmitDelay?: number; // Milliseconds to wait before auto-submit (default: 3000)
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const { 
    onTranscript, 
    onInterimTranscript,
    onMicStop, 
    onSilenceDetected,
    systemPrompt = "You are a helpful assistant.", 
    enabled = true, 
    transport = 'webrtc', 
    voiceLanguage: initialLanguage,
    autoSubmitDelay = 3000 
  } = options;
  const { toast } = useToast();
  
  // Voice language state with localStorage persistence
  const [voiceLanguage, setVoiceLanguage] = useState<'ro-RO' | 'en-US'>(() => {
    if (initialLanguage) return initialLanguage;
    const saved = localStorage.getItem('voice-language');
    return (saved === 'en-US' ? 'en-US' : 'ro-RO') as 'ro-RO' | 'en-US';
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Simplified state - only Browser STT
  const browserSTTRef = useRef<any>(null);
  const lastFinalTranscriptRef = useRef<string>('');
  const lastInterimTranscriptRef = useRef<string>('');
  const isStoppingIntentionallyRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>(''); // Accumulate all transcripts

  // Simplified Browser STT - direct implementation
  
  // Update language and persist to localStorage
  const changeVoiceLanguage = useCallback((lang: 'ro-RO' | 'en-US') => {
    setVoiceLanguage(lang);
    localStorage.setItem('voice-language', lang);
    
    // If mic is active, restart with new language
    if (browserSTTRef.current) {
      stopBrowserSTT();
      // Small delay to ensure cleanup
      setTimeout(() => {
        startBrowserSTT();
      }, 100);
    }
  }, []);

  const startBrowserSTT = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (browserSTTRef.current) {
      logger.warn('Browser STT already active');
      return;
    }
    
    if (!SpeechRecognition) {
      logger.error('Browser STT not supported');
      toast({
        title: "Voice input indisponibil",
        description: "Browserul nu suportă recunoașterea vocală.",
        variant: "destructive"
      });
      return;
    }

    logger.log('🎤 Starting Browser STT');
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLanguage; // Use selected language

    recognition.onstart = () => {
      logger.log('✅ Browser STT started');
      setIsConnected(true);
      setIsMicOn(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Clear any existing silence timer when user speaks
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Process final results - accumulate them
      if (finalTranscript) {
        const trimmedFinal = finalTranscript.trim();
        
        if (trimmedFinal && trimmedFinal !== lastFinalTranscriptRef.current) {
          logger.log('✅ Browser STT (Final):', trimmedFinal);
          lastFinalTranscriptRef.current = trimmedFinal;
          
          // Accumulate transcript
          accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + trimmedFinal).trim();
          
          // Send accumulated transcript for display
          onTranscript?.(accumulatedTranscriptRef.current);
          
          // Start silence timer for auto-submit
          silenceTimerRef.current = setTimeout(() => {
            logger.log('🔕 3 seconds of silence detected - auto-submitting');
            onSilenceDetected?.();
          }, autoSubmitDelay);
        }
      } else if (interimTranscript) {
        // For interim results, show user feedback in real-time
        const trimmedInterim = interimTranscript.trim();
        if (trimmedInterim) {
          lastInterimTranscriptRef.current = trimmedInterim;
          setIsUserSpeaking(true);
          
          // Show interim + accumulated for real-time preview
          const fullText = (accumulatedTranscriptRef.current + ' ' + trimmedInterim).trim();
          onInterimTranscript?.(fullText);
        }
      }
    };

    recognition.onspeechstart = () => {
      logger.log('🎤 User started speaking');
      setIsUserSpeaking(true);
    };

    recognition.onspeechend = () => {
      logger.log('🛑 User stopped speaking');
      setIsUserSpeaking(false);
    };

    recognition.onerror = (event: any) => {
      logger.error('❌ Browser STT error:', event.error);
      
      // Ignore expected errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are normal, just log them
        logger.log(`ℹ️ STT event: ${event.error}`);
        return;
      }
      
      // Only show toast for actual errors
      if (!isStoppingIntentionallyRef.current) {
        toast({
          title: "Eroare microfon",
          description: `Problemă: ${event.error}`,
          variant: "destructive"
        });
      }
      stopBrowserSTT();
    };

    recognition.onend = () => {
      logger.log('🔚 Browser STT ended');
      // Clean up state
      if (browserSTTRef.current) {
        browserSTTRef.current = null;
        setIsConnected(false);
        setIsMicOn(false);
        setIsUserSpeaking(false);
        
        // Call onMicStop callback when mic is stopped
        if (onMicStop) {
          logger.log('📞 Calling onMicStop callback');
          onMicStop();
        }
      }
    };

    try {
      recognition.start();
      browserSTTRef.current = recognition;
    } catch (error) {
      logger.error('Failed to start recognition:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut porni microfonul.",
        variant: "destructive"
      });
    }
  }, [onTranscript, onMicStop, toast, voiceLanguage]);

  const stopBrowserSTT = useCallback(() => {
    if (browserSTTRef.current) {
      try {
        logger.log('🛑 Stopping Browser STT');
        isStoppingIntentionallyRef.current = true;
        browserSTTRef.current.stop();
        // Reset flag after a short delay
        setTimeout(() => {
          isStoppingIntentionallyRef.current = false;
        }, 500);
      } catch (error) {
        logger.warn('Error stopping recognition:', error);
        isStoppingIntentionallyRef.current = false;
      }
      browserSTTRef.current = null;
    }
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Reset deduplication refs
    lastFinalTranscriptRef.current = '';
    lastInterimTranscriptRef.current = '';
    accumulatedTranscriptRef.current = '';
    
    // Update state
    setIsConnected(false);
    setIsMicOn(false);
    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setAudioLevel(0);
  }, []);

  const startVoice = useCallback(async () => {
    if (!enabled) return;
    startBrowserSTT();
  }, [enabled, startBrowserSTT]);

  const stopVoice = useCallback(() => {
    logger.log('🛑 Stopping voice');
    stopBrowserSTT();
  }, [stopBrowserSTT]);

  const toggleMic = useCallback(() => {
    if (isConnected || browserSTTRef.current) {
      stopVoice();
    } else {
      startVoice();
    }
  }, [isConnected, startVoice, stopVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  return {
    isConnected,
    isMicOn,
    isAISpeaking,
    isUserSpeaking,
    audioLevel,
    voiceLanguage,
    changeVoiceLanguage,
    startVoice,
    stopVoice,
    toggleMic
  };
};
