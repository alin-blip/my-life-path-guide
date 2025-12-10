import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceToTextOptions {
  onTranscript?: (text: string) => void;
  language?: 'en' | 'ro';
  autoSubmit?: boolean;
  onAutoSubmit?: () => void;
  saveRecording?: boolean; // New option to enable recording
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
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Speech Recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language === 'ro' ? 'ro-RO' : 'en-US';
        recognitionRef.current.maxAlternatives = 1; // Mobile optimization

        recognitionRef.current.onresult = (event: any) => {
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

          // Acumulare transcript final
          if (finalTranscript.trim()) {
            accumulatedTranscriptRef.current += finalTranscript;
            lastTranscriptTimeRef.current = Date.now();
          }

          // Display: accumulated + interim pentru feedback live
          const displayText = accumulatedTranscriptRef.current + interimTranscript;
          setTranscript(displayText);
          if (onTranscript) {
            onTranscript(displayText);
          }

          // Timer de liniște 3s
          if (autoSubmit) {
            // Clear timer existent
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }

            // Set timer nou - după 3s de liniște => submit
            silenceTimerRef.current = window.setTimeout(() => {
              const now = Date.now();
              const timeSinceLastTranscript = now - lastTranscriptTimeRef.current;
              
              // Verifică că a trecut 3s și nu am făcut deja submit
              if (timeSinceLastTranscript >= 3000 && !didAutoSubmitRef.current && accumulatedTranscriptRef.current.trim()) {
                console.log('🔄 VAD: 3s silence detected, auto-submitting');
                didAutoSubmitRef.current = true;
                onAutoSubmit?.();
                
                // Reset flag după 1s pentru a permite submit-uri viitoare
                setTimeout(() => {
                  didAutoSubmitRef.current = false;
                }, 1000);
              }
            }, 3100); // 3.1s pentru siguranță
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Mobile-specific error handling
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
          
          // Clear timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
          
          // Clear timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          // Auto-submit se face din timer, nu aici
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, autoSubmit, onAutoSubmit, transcript]);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
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
            
            // iOS/Safari fallback pentru MIME type
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
              // Fallback fără mimeType dacă browser-ul nu-l suportă
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
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: language === 'ro' ? 'Eroare microfon' : 'Microphone error',
          description: language === 'ro' ? 'Nu s-a putut porni microfonul' : 'Could not start microphone',
          variant: 'destructive'
        });
      }
    }
  }, [isListening, saveRecording, language, toast]);

  const stopListening = useCallback(() => {
    console.log('🛑 stopListening called');
    
    // Always set UI state to OFF
    setIsListening(false);

    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Safely stop speech recognition WITHOUT removing handlers
    try {
      if (recognitionRef.current) {
        // Don't remove handlers - just stop. Handlers will be reused.
        recognitionRef.current.stop?.();
      }
    } catch (e) {
      console.warn('⚠️ Error stopping recognition:', e);
    }

    // Stop audio recording and release mic tracks (if any)
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
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

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
    isSupported: !!recognitionRef.current
  };
};
