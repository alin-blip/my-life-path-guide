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
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            toast({
              title: language === 'ro' ? 'Eroare recunoaștere vocală' : 'Speech recognition error',
              description: event.error,
              variant: 'destructive',
            });
          }
          setIsListening(false);
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
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        audioChunksRef.current = [];
        accumulatedTranscriptRef.current = ''; // Reset accumulated transcript
        
        // Clear any existing timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
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
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm'
            });
            
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
          }
        }
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isListening, saveRecording]);

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
