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
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
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
    recognitionRef.current.maxAlternatives = 1; // Better mobile performance

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

          // Clear any existing silence timer when user speaks
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }

          // Handle final transcripts
          if (finalTranscript.trim()) {
            accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + finalTranscript).trim();
            console.log('✅ Final transcript accumulated:', accumulatedTranscriptRef.current);
            
            // Update state with accumulated transcript
            setTranscript(accumulatedTranscriptRef.current);
            if (onTranscript) {
              onTranscript(accumulatedTranscriptRef.current);
            }

            // Start 3-second silence timer for auto-submit
            if (autoSubmit) {
              silenceTimerRef.current = setTimeout(() => {
                console.log('🔕 3 seconds of silence detected - auto-submitting');
                if (accumulatedTranscriptRef.current.trim()) {
                  onAutoSubmit?.();
                }
              }, 3000);
            }
          } else if (interimTranscript.trim()) {
            // Show interim results in real-time
            const fullText = (accumulatedTranscriptRef.current + ' ' + interimTranscript).trim();
            setTranscript(fullText);
            if (onTranscript) {
              onTranscript(fullText);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Mobile-specific error handling
          if (event.error === 'not-allowed') {
            toast({
              title: '🎤 Acces microfon refuzat',
              description: 'Te rog permite accesul la microfon în setările browser-ului.',
              variant: 'destructive',
            });
          } else if (event.error === 'network') {
            toast({
              title: '⚠️ Eroare de rețea',
              description: 'Verifică conexiunea la internet și încearcă din nou.',
              variant: 'destructive',
            });
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast({
              title: language === 'ro' ? 'Eroare recunoaștere vocală' : 'Speech recognition error',
              description: event.error,
              variant: 'destructive',
            });
          }
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 Voice recognition ended');
          setIsListening(false);
          
          // Clear silence timer on end
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
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
    if (!recognitionRef.current) {
      toast({
        title: '⚠️ Speech Recognition indisponibil',
        description: 'Browserul tău nu suportă recunoașterea vocală.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🎤 Starting voice recognition...');
      setIsListening(true);

      // Reset accumulated transcript
      accumulatedTranscriptRef.current = '';
      setTranscript('');

      // Start audio recording if enabled
      if (saveRecording) {
        console.log('🎙️ Starting audio recording...');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Detect iOS/Safari
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          
          // Use compatible MIME type for iOS/Safari
          let mimeType = 'audio/webm';
          if (isIOS || isSafari) {
            mimeType = 'audio/mp4';
          }
          
          let mediaRecorder;
          try {
            mediaRecorder = new MediaRecorder(stream, { mimeType });
          } catch (e) {
            // Fallback to browser default
            console.log('⚠️ MIME type not supported, using default');
            mediaRecorder = new MediaRecorder(stream);
          }
          
          const audioChunks: Blob[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
            audioChunksRef.current = [audioBlob];
            recordingStartTimeRef.current = duration;
            console.log(`✅ Audio recording saved (${duration.toFixed(1)}s)`);
          };

          recordingStartTimeRef.current = Date.now();
          mediaRecorder.start();
          mediaRecorderRef.current = mediaRecorder;
          console.log('✅ MediaRecorder started');
        } catch (recordError) {
          console.error('Audio recording error:', recordError);
          toast({
            title: '⚠️ Eroare înregistrare',
            description: 'Nu am putut începe înregistrarea audio.',
            variant: 'destructive',
          });
        }
      }

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      toast({
        title: '⚠️ Eroare microfon',
        description: 'Nu am putut accesa microfonul. Verifică permisiunile.',
        variant: 'destructive',
      });
    }
  }, [saveRecording, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Stop audio recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        
        // Stop all audio tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        console.log('🎙️ Audio recording stopped');
      }
    }
  }, [isListening]);

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
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const getRecordedAudio = useCallback(() => {
    if (audioChunksRef.current.length === 0) return null;
    
    // Get the correct MIME type
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const mimeType = (isIOS || isSafari) ? 'audio/mp4' : 'audio/webm';
    
    const audioBlob = audioChunksRef.current[0]; // Already a blob from MediaRecorder
    const durationSeconds = typeof recordingStartTimeRef.current === 'number' && recordingStartTimeRef.current < 100000
      ? recordingStartTimeRef.current 
      : (Date.now() - recordingStartTimeRef.current) / 1000;
    
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
