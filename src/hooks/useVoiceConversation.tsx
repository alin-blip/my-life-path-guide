import { useState, useRef, useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { useToast } from './use-toast';

interface UseVoiceConversationOptions {
  onUserMessage: (text: string) => void;
  onAIResponse?: (text: string) => void;
  silenceThreshold?: number; // ms before auto-send (default 3000)
  language?: 'ro-RO' | 'en-US';
  voiceId?: string;
}

interface VoiceConversationState {
  isActive: boolean;
  isAISpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  silenceTimer: number;
  audioLevel: number;
}

export const useVoiceConversation = (options: UseVoiceConversationOptions) => {
  const {
    onUserMessage,
    onAIResponse,
    silenceThreshold = 3000,
    language = 'ro-RO',
    voiceId = 'EXAVITQu4vr4xnSDxMaL'
  } = options;

  const [state, setState] = useState<VoiceConversationState>({
    isActive: false,
    isAISpeaking: false,
    isListening: false,
    isProcessing: false,
    currentTranscript: '',
    silenceTimer: 0,
    audioLevel: 0
  });

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const isListeningRef = useRef(false);
  const isActiveRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const onUserMessageRef = useRef(onUserMessage);

  // Keep onUserMessage ref updated
  useEffect(() => {
    onUserMessageRef.current = onUserMessage;
  }, [onUserMessage]);

  const { toast } = useToast();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Stop listening internal
  const stopListeningInternal = useCallback(() => {
    console.log('🔇 Stopping listening');
    isListeningRef.current = false;
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {}

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isListening: false, 
      silenceTimer: 0,
      audioLevel: 0
    }));
  }, []);

  // Send user message - uses ref to avoid dependency issues
  const sendUserMessage = useCallback(() => {
    const message = accumulatedTranscriptRef.current.trim();
    if (!message) {
      console.log('📭 No message to send');
      return;
    }

    console.log('📤 Sending user message:', message);
    stopListeningInternal();
    
    setState(prev => ({ 
      ...prev, 
      isProcessing: true,
      currentTranscript: ''
    }));

    accumulatedTranscriptRef.current = '';
    
    // Use ref to call the latest onUserMessage
    onUserMessageRef.current(message);

    // Processing will be set to false when AI responds
    setTimeout(() => {
      setState(prev => ({ ...prev, isProcessing: false }));
    }, 500);
  }, [stopListeningInternal]);

  // Reset silence timer and start countdown
  const resetSilenceTimer = useCallback(() => {
    // Clear existing timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Start countdown display
    let countdown = silenceThreshold / 1000;
    setState(prev => ({ ...prev, silenceTimer: countdown }));

    countdownIntervalRef.current = setInterval(() => {
      countdown -= 0.1;
      if (countdown <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setState(prev => ({ ...prev, silenceTimer: 0 }));
      } else {
        setState(prev => ({ ...prev, silenceTimer: Math.max(0, countdown) }));
      }
    }, 100);

    // Auto-send after silence threshold
    silenceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Silence timer triggered');
      if (accumulatedTranscriptRef.current.trim() && isListeningRef.current) {
        console.log('🔄 Auto-sending after silence');
        sendUserMessage();
      }
    }, silenceThreshold);
  }, [silenceThreshold, sendUserMessage]);

  // TTS hook for AI speaking
  const tts = useTextToSpeech({
    voiceId,
    onSpeakingStart: () => {
      console.log('🔊 AI started speaking');
      setState(prev => ({ ...prev, isAISpeaking: true, isListening: false }));
      stopListeningInternal();
    },
    onSpeakingEnd: () => {
      console.log('🔇 AI finished speaking');
      setState(prev => ({ ...prev, isAISpeaking: false }));
      // Auto-start listening after AI finishes if conversation is active
      if (isActiveRef.current) {
        setTimeout(() => {
          if (isActiveRef.current) {
            startListeningInternal();
          }
        }, 500);
      }
    }
  });

  // Monitor audio levels
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current || !isListeningRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(1, average / 128);

        setState(prev => ({ ...prev, audioLevel: normalizedLevel }));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.error('Error starting audio monitoring:', error);
    }
  }, []);

  // Internal start listening
  const startListeningInternal = useCallback(async () => {
    if (!recognitionRef.current || isListeningRef.current) {
      console.log('⚠️ Cannot start listening:', { 
        hasRecognition: !!recognitionRef.current, 
        isAlreadyListening: isListeningRef.current 
      });
      return;
    }

    try {
      console.log('🎤 Starting to listen');
      isListeningRef.current = true;
      accumulatedTranscriptRef.current = '';
      
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        currentTranscript: '',
        silenceTimer: silenceThreshold / 1000
      }));

      await startAudioMonitoring();
      recognitionRef.current.start();
      
      // Start initial silence timer
      resetSilenceTimer();
      
      console.log('🎤 Voice conversation listening started');
    } catch (error) {
      console.error('Error starting listening:', error);
      isListeningRef.current = false;
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, [startAudioMonitoring, resetSilenceTimer, silenceThreshold]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      toast({
        title: 'Browser nesuportat',
        description: 'Folosește Chrome sau Edge pentru recunoaștere vocală.',
        variant: 'destructive'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (!isListeningRef.current) return;

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result + ' ';
        } else {
          interimTranscript += result;
        }
      }

      // If we got final text, accumulate and reset timer
      if (finalTranscript.trim()) {
        accumulatedTranscriptRef.current += finalTranscript;
        console.log('📝 Accumulated transcript:', accumulatedTranscriptRef.current);
        resetSilenceTimer();
      }

      const displayText = accumulatedTranscriptRef.current + interimTranscript;
      setState(prev => ({ ...prev, currentTranscript: displayText }));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast({
          title: 'Acces microfon refuzat',
          description: 'Permite acces la microfon în setări',
          variant: 'destructive'
        });
      } else if (event.error === 'no-speech') {
        // No speech detected - this is normal, just restart
        console.log('No speech detected, continuing...');
      }
    };

    recognition.onend = () => {
      console.log('🔄 Recognition ended, isListening:', isListeningRef.current, 'isActive:', isActiveRef.current);
      if (isListeningRef.current && isActiveRef.current) {
        try {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.warn('Could not restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      cleanup();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, toast, cleanup, resetSilenceTimer]);

  // Start conversation
  const startConversation = useCallback(() => {
    console.log('🚀 Starting voice conversation');
    isActiveRef.current = true;
    setState(prev => ({ ...prev, isActive: true }));
    startListeningInternal();
  }, [startListeningInternal]);

  // Stop conversation
  const stopConversation = useCallback(() => {
    console.log('🛑 Stopping voice conversation');
    isActiveRef.current = false;
    tts.stop();
    stopListeningInternal();
    cleanup();
    setState({
      isActive: false,
      isAISpeaking: false,
      isListening: false,
      isProcessing: false,
      currentTranscript: '',
      silenceTimer: 0,
      audioLevel: 0
    });
  }, [tts, stopListeningInternal, cleanup]);

  // Speak AI response
  const speakAI = useCallback((text: string) => {
    console.log('🤖 AI speaking:', text.substring(0, 50) + '...');
    onAIResponse?.(text);
    tts.speak(text);
  }, [tts, onAIResponse]);

  // Manual send
  const manualSend = useCallback(() => {
    if (accumulatedTranscriptRef.current.trim()) {
      sendUserMessage();
    }
  }, [sendUserMessage]);

  // Skip AI speaking
  const skipAISpeaking = useCallback(() => {
    tts.stop();
    setState(prev => ({ ...prev, isAISpeaking: false }));
    if (isActiveRef.current) {
      setTimeout(() => startListeningInternal(), 300);
    }
  }, [tts, startListeningInternal]);

  return {
    // State
    isActive: state.isActive,
    isAISpeaking: state.isAISpeaking,
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    currentTranscript: state.currentTranscript,
    silenceTimer: state.silenceTimer,
    audioLevel: state.audioLevel,
    isTTSLoading: tts.isLoading,

    // Actions
    startConversation,
    stopConversation,
    speakAI,
    manualSend,
    skipAISpeaking,
    startListening: startListeningInternal,
    stopListening: stopListeningInternal
  };
};
