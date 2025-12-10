import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceToTextOptions {
  onTranscript?: (text: string) => void;
  language?: 'en' | 'ro';
  autoSubmit?: boolean;
  onAutoSubmit?: () => void;
  saveRecording?: boolean;
  onRecordingSaved?: (recordingId: string) => void;
}

export const useVoiceToText = (options: UseVoiceToTextOptions = {}) => {
  const {
    onTranscript,
    language = 'ro',
    autoSubmit = false,
    onAutoSubmit,
    saveRecording = false,
    onRecordingSaved
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<number | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const didAutoSubmitRef = useRef(false);
  const lastTranscriptTimeRef = useRef<number>(0);
  const isListeningRef = useRef(false); // ✅ Track actual listening state
  const onTranscriptRef = useRef(onTranscript); // ✅ Stable ref for callback
  const onAutoSubmitRef = useRef(onAutoSubmit); // ✅ Stable ref for callback
  const { toast } = useToast();

  // ✅ Keep refs updated without triggering re-renders
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  // ✅ Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // ✅ Initialize Speech Recognition ONCE
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'ro' ? 'ro-RO' : 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      // ✅ Check ref for actual state
      if (!isListeningRef.current) {
        console.log('🚫 Ignoring result - not listening');
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript.trim()) {
        accumulatedTranscriptRef.current += finalTranscript;
        lastTranscriptTimeRef.current = Date.now();
      }

      const displayText = accumulatedTranscriptRef.current + interimTranscript;
      setTranscript(displayText);
      
      // ✅ Use ref for callback
      if (onTranscriptRef.current) {
        onTranscriptRef.current(displayText);
      }

      // Auto-submit timer
      if (autoSubmit && isListeningRef.current) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = window.setTimeout(() => {
          const now = Date.now();
          const timeSinceLastTranscript = now - lastTranscriptTimeRef.current;
          
          if (timeSinceLastTranscript >= 3000 && !didAutoSubmitRef.current && accumulatedTranscriptRef.current.trim()) {
            console.log('🔄 VAD: 3s silence detected, auto-submitting');
            didAutoSubmitRef.current = true;
            onAutoSubmitRef.current?.();
            
            setTimeout(() => {
              didAutoSubmitRef.current = false;
            }, 1000);
          }
        }, 3100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        toast({
          title: language === 'ro' ? 'Acces microfon refuzat' : 'Microphone access denied',
          description: language === 'ro' ? 'Permite acces la microfon în setări' : 'Allow microphone access in settings',
          variant: 'destructive',
        });
      } else if (event.error === 'network') {
        toast({
          title: language === 'ro' ? 'Eroare conexiune' : 'Network error',
          description: language === 'ro' ? 'Verifică conexiunea la internet' : 'Check internet connection',
          variant: 'destructive',
        });
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          title: language === 'ro' ? 'Eroare recunoaștere vocală' : 'Speech recognition error',
          description: event.error,
          variant: 'destructive',
        });
      }
      
      setIsListening(false);
      isListeningRef.current = false;
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended, isListeningRef:', isListeningRef.current);
      
      // ✅ Only update state if we're still supposed to be listening
      // This prevents the "onend fires unexpectedly" bug
      if (isListeningRef.current) {
        console.log('🔄 Recognition ended unexpectedly, restarting...');
        try {
          recognition.start();
        } catch (e) {
          console.warn('⚠️ Could not restart recognition:', e);
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language, autoSubmit, toast]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not available');
      toast({
        title: 'Eroare',
        description: 'Recunoașterea vocală nu este disponibilă în acest browser.',
        variant: 'destructive'
      });
      return;
    }

    if (isListeningRef.current) {
      console.log('⚠️ Already listening, ignoring start');
      return;
    }

    try {
      // Reset refs
      setTranscript('');
      accumulatedTranscriptRef.current = '';
      didAutoSubmitRef.current = false;
      lastTranscriptTimeRef.current = Date.now();
      audioChunksRef.current = [];
      
      // Start audio recording if saveRecording is enabled
      if (saveRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
              sampleRate: 24000
            } as MediaTrackConstraints 
          });
          
          let mimeType = 'audio/webm';
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          
          if (isIOS || isSafari) {
            mimeType = 'audio/mp4';
          }
          
          let mediaRecorder: MediaRecorder;
          try {
            mediaRecorder = new MediaRecorder(stream, { mimeType });
          } catch (e) {
            console.log('⚠️ Falling back to default MediaRecorder format');
            mediaRecorder = new MediaRecorder(stream);
          }
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorderRef.current = mediaRecorder;
          recordingStartTimeRef.current = Date.now();
          mediaRecorder.start();
          console.log('🎙️ Audio recording started');
        } catch (error) {
          console.error('❌ Error starting audio recording:', error);
          toast({
            title: language === 'ro' ? 'Eroare înregistrare' : 'Recording error',
            description: language === 'ro' ? 'Nu s-a putut porni înregistrarea audio' : 'Could not start audio recording',
            variant: 'destructive'
          });
        }
      }
      
      // ✅ Set state BEFORE starting recognition
      setIsListening(true);
      isListeningRef.current = true;
      
      recognitionRef.current.start();
      console.log('🎤 Voice recognition started');
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      isListeningRef.current = false;
      toast({
        title: language === 'ro' ? 'Eroare microfon' : 'Microphone error',
        description: language === 'ro' ? 'Nu s-a putut porni microfonul' : 'Could not start microphone',
        variant: 'destructive'
      });
    }
  }, [saveRecording, language, toast]);

  const stopListening = useCallback(() => {
    console.log('🛑 stopListening called, isListeningRef:', isListeningRef.current);
    
    // ✅ Set state FIRST to prevent restart in onend
    setIsListening(false);
    isListeningRef.current = false;

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Stop speech recognition
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      console.warn('⚠️ Error stopping recognition:', e);
    }

    // Stop audio recording
    try {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        const stream = mediaRecorderRef.current.stream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        mediaRecorderRef.current = null;
        console.log('🎙️ Audio recording stopped');
      }
    } catch (e) {
      console.warn('⚠️ Error stopping media recorder:', e);
    }
  }, []);

  const toggleListening = useCallback(() => {
    console.log('🔄 toggleListening, current state:', isListeningRef.current);
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    accumulatedTranscriptRef.current = '';
    didAutoSubmitRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const getRecordedAudio = useCallback(() => {
    if (audioChunksRef.current.length === 0) return null;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const durationSeconds = (Date.now() - recordingStartTimeRef.current) / 1000;
    
    return { audioBlob, durationSeconds };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    getRecordedAudio,
    isSupported: typeof window !== 'undefined' && 
      !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  };
};
