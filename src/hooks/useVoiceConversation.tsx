import { useState, useRef, useCallback, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { useToast } from './use-toast';

interface UseVoiceConversationOptions {
  onUserMessage: (text: string) => void;
  onAIResponse?: (text: string) => void;
  silenceThreshold?: number; // ms before auto-send (default 3000)
  autoStartDelay?: number; // ms after AI finishes to auto-start mic (default 2000)
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
    autoStartDelay = 2000,
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
  const autoStartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const isListeningRef = useRef(false);
  const isActiveRef = useRef(false);
  const recognitionRunningRef = useRef(false);
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

  // Cleanup all timers
  const cleanupTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
  }, []);

  // Full cleanup function
  const cleanup = useCallback(() => {
    cleanupTimers();
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
  }, [cleanupTimers]);

  // Safely stop recognition
  const safeStopRecognition = useCallback(() => {
    if (recognitionRef.current && recognitionRunningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }
    recognitionRunningRef.current = false;
  }, []);

  // Safely start recognition
  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current) return false;
    
    if (recognitionRunningRef.current) {
      console.log('⚠️ Recognition already running');
      return true;
    }
    
    try {
      recognitionRef.current.start();
      recognitionRunningRef.current = true;
      console.log('✅ Recognition started');
      return true;
    } catch (e) {
      console.error('Recognition start error:', e);
      recognitionRunningRef.current = false;
      return false;
    }
  }, []);

  // Stop listening internal
  const stopListeningInternal = useCallback(() => {
    console.log('🔇 Stopping listening');
    isListeningRef.current = false;
    cleanupTimers();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    safeStopRecognition();

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
  }, [cleanupTimers, safeStopRecognition]);

  // Send user message
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
    onUserMessageRef.current(message);

    setTimeout(() => {
      setState(prev => ({ ...prev, isProcessing: false }));
    }, 500);
  }, [stopListeningInternal]);

  // Reset silence timer and start countdown
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

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

    silenceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Silence timer triggered');
      if (accumulatedTranscriptRef.current.trim() && isListeningRef.current) {
        console.log('🔄 Auto-sending after silence');
        sendUserMessage();
      }
    }, silenceThreshold);
  }, [silenceThreshold, sendUserMessage]);

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
    if (!recognitionRef.current) {
      console.log('⚠️ No recognition available');
      return;
    }
    
    if (isListeningRef.current) {
      console.log('⚠️ Already listening');
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
      
      if (safeStartRecognition()) {
        resetSilenceTimer();
        console.log('🎤 Voice conversation listening started');
      } else {
        throw new Error('Could not start recognition');
      }
    } catch (error) {
      console.error('Error starting listening:', error);
      isListeningRef.current = false;
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, [startAudioMonitoring, resetSilenceTimer, silenceThreshold, safeStartRecognition]);

  // Schedule auto-start after AI finishes
  const scheduleAutoStart = useCallback(() => {
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
    }
    
    console.log(`⏰ Scheduling auto-start in ${autoStartDelay}ms`);
    
    autoStartTimerRef.current = setTimeout(() => {
      if (isActiveRef.current && !isListeningRef.current) {
        console.log('🎤 Auto-starting mic after AI finished');
        startListeningInternal();
      }
    }, autoStartDelay);
  }, [autoStartDelay, startListeningInternal]);

  // TTS hook for AI speaking
  const tts = useTextToSpeech({
    voiceId,
    onSpeakingStart: () => {
      console.log('🔊 AI started speaking');
      stopListeningInternal();
      setState(prev => ({ ...prev, isAISpeaking: true, isListening: false }));
    },
    onSpeakingEnd: () => {
      console.log('🔇 AI finished speaking');
      setState(prev => ({ ...prev, isAISpeaking: false }));
      // Auto-start listening after AI finishes
      if (isActiveRef.current) {
        scheduleAutoStart();
      }
    }
  });

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

    recognition.onstart = () => {
      console.log('🎙️ Recognition onstart');
      recognitionRunningRef.current = true;
    };

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
        isListeningRef.current = false;
        setState(prev => ({ ...prev, isListening: false }));
      } else if (event.error === 'aborted') {
        // Normal abort, do nothing
      }
    };

    recognition.onend = () => {
      console.log('🔄 Recognition onend');
      recognitionRunningRef.current = false;
      
      // Only restart if we're supposed to be listening
      if (isListeningRef.current && isActiveRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && isActiveRef.current) {
            safeStartRecognition();
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      cleanup();
      safeStopRecognition();
    };
  }, [language, toast, cleanup, resetSilenceTimer, safeStartRecognition, safeStopRecognition]);

  // Start conversation
  const startConversation = useCallback(() => {
    console.log('🚀 Starting voice conversation');
    isActiveRef.current = true;
    setState(prev => ({ ...prev, isActive: true }));
    // Don't auto-start listening here, wait for welcome message to finish
  }, []);

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
      scheduleAutoStart();
    }
  }, [tts, scheduleAutoStart]);

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
