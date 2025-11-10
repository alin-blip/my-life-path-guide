import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceToTextOptions {
  onTranscript?: (text: string) => void;
  language?: 'en' | 'ro';
  autoSubmit?: boolean;
  onAutoSubmit?: () => void;
}

export const useVoiceToText = (options: UseVoiceToTextOptions = {}) => {
  const {
    onTranscript,
    language = 'ro',
    autoSubmit = false,
    onAutoSubmit
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
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

          const newText = finalTranscript || interimTranscript;
          setTranscript(newText);
          if (onTranscript) {
            onTranscript(newText);
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
          setIsListening(false);
          if (autoSubmit && transcript.trim() && onAutoSubmit) {
            setTimeout(() => {
              onAutoSubmit();
            }, 300);
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

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
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
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    isSupported: !!recognitionRef.current
  };
};
