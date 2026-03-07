import { useState, useRef, useCallback, useEffect } from 'react';
import { useDemoTextToSpeech } from './useDemoTextToSpeech';
import { useToast } from './use-toast';

interface UseVoiceConversationDemoOptions {
  onUserMessage: (text: string) => void;
  onAIResponse?: (text: string) => void;
  silenceThreshold?: number; // ms before auto-send (default 3000)
  autoStartDelay?: number; // ms after AI finishes to auto-start mic (default 1500)
  language?: 'ro-RO' | 'en-US';
  voiceId?: string;
  playbackRate?: number;
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

export const useVoiceConversationDemo = (options: UseVoiceConversationDemoOptions) => {
  const {
    onUserMessage,
    onAIResponse,
    silenceThreshold = 3000,
    autoStartDelay = 1500,
    language = 'ro-RO',
    voiceId = 'EXAVITQu4vr4xnSDxMaL',
    playbackRate = 1.15
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
  const interimTranscriptRef = useRef<string>('');
  const isListeningRef = useRef(false);
  const isActiveRef = useRef(false);
  const recognitionRunningRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const onUserMessageRef = useRef(onUserMessage);

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

  // Full cleanup
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
      audioContextRef.current.close().catch((err) => {
        if (import.meta.env.DEV) console.warn('AudioContext close failed:', err);
      });
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
  const sendUserMessage = useCallback((textOverride?: string) => {
    const combined = `${accumulatedTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
    const message = (textOverride ?? combined).trim();

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
    interimTranscriptRef.current = '';
    onUserMessageRef.current(message);

    setTimeout(() => {
      setState(prev => ({ ...prev, isProcessing: false }));
    }, 500);
  }, [stopListeningInternal]);

  // Reset silence timer
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
      const pending = `${accumulatedTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
      if (pending && isListeningRef.current) {
        console.log('🔄 Auto-sending after silence');
        sendUserMessage(pending);
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
      interimTranscriptRef.current = '';
      
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

  // Demo TTS (no auth required)
  const tts = useDemoTextToSpeech({
    voiceId,
    initialPlaybackRate: playbackRate,
    onSpeakingStart: () => {
      console.log('🔊 AI started speaking');
      stopListeningInternal();
      setState(prev => ({ ...prev, isAISpeaking: true, isListening: false }));
    },
    onSpeakingEnd: () => {
      console.log('🔇 AI finished speaking');
      setState(prev => ({ ...prev, isAISpeaking: false }));
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
        interimTranscriptRef.current = '';
        console.log('📝 Accumulated transcript:', accumulatedTranscriptRef.current);
        resetSilenceTimer();
      }

      if (interimTranscript.trim()) {
        interimTranscriptRef.current = interimTranscript;
        resetSilenceTimer();
      } else if (!finalTranscript.trim()) {
        interimTranscriptRef.current = '';
      }

      const displayText = `${accumulatedTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
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
      }
    };

    recognition.onend = () => {
      console.log('🔄 Recognition onend');
      recognitionRunningRef.current = false;
      
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
    console.log('🚀 Starting demo voice conversation');
    isActiveRef.current = true;
    setState(prev => ({ ...prev, isActive: true }));
  }, []);

  // Stop conversation
  const stopConversation = useCallback(() => {
    console.log('🛑 Stopping demo voice conversation');
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
    const pending = `${accumulatedTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
    if (pending) {
      sendUserMessage(pending);
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

  // Start listening (exposed for manual control)
  const startListening = useCallback(() => {
    if (isActiveRef.current && !state.isAISpeaking) {
      startListeningInternal();
    }
  }, [state.isAISpeaking, startListeningInternal]);

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

    // Controls
    startConversation,
    stopConversation,
    speakAI,
    manualSend,
    skipAISpeaking,
    startListening
  };
};
