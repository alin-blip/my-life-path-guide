import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, AudioQueue, RealtimeChat } from '@/utils/RealtimeAudio';
import { logger } from '@/lib/logger';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  systemPrompt?: string;
  enabled?: boolean;
  transport?: 'webrtc' | 'ws'; // WebRTC is recommended
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const { onTranscript, systemPrompt = "You are a helpful assistant.", enabled = true, transport = 'webrtc' } = options;
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const rtcChatRef = useRef<RealtimeChat | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptBufferRef = useRef<string>('');
  
  // Fallback state
  const audioBufferRef = useRef<Float32Array[]>([]);
  const whisperTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingWhisperRef = useRef(false);
  const hasQuotaErrorRef = useRef(false);
  const browserSTTRef = useRef<any>(null);
  const sttActiveRef = useRef(false);
  const hasShownFallbackToastRef = useRef(false);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not configured');
    }
    
    // Extract project ref from URL
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    return `wss://${projectRef}.functions.supabase.co/functions/v1/realtime-voice`;
  }, []);

  // Initialize audio context
  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [enabled]);

  // Browser STT as ultimate fallback
  const startBrowserSTT = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // Prevent multiple STT instances
    if (browserSTTRef.current || sttActiveRef.current) {
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

    logger.log('🎤 Starting Browser STT fallback');
    if (!hasShownFallbackToastRef.current) {
      toast({
        title: "Fallback local activat",
        description: "Folosim browserul pentru transcriere (fără răspuns audio AI).",
      });
      hasShownFallbackToastRef.current = true;
    }

    // Release microphone from WebRTC before starting STT
    if (rtcChatRef.current) {
      try {
        rtcChatRef.current.disconnect();
      } catch (e) {
        logger.warn('Could not disconnect RTC before STT', e);
      }
      rtcChatRef.current = null;
      setIsConnected(false);
      setIsAISpeaking(false);
      setIsUserSpeaking(false);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ro-RO';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0]?.transcript || '';
        if (res.isFinal) final += text + ' ';
        else interim += text;
      }
      const out = (final || interim).trim();
      if (out) {
        logger.log('✅ Browser STT:', out);
        onTranscript?.(out);
      }
    };

    recognition.onerror = (event: any) => {
      logger.error('❌ Browser STT error:', event.error);
      sttActiveRef.current = false;
      browserSTTRef.current = null;
    };

    recognition.onend = () => {
      sttActiveRef.current = false;
      browserSTTRef.current = null;
    };

    sttActiveRef.current = true;
    recognition.start();
    browserSTTRef.current = recognition;
  }, [onTranscript, toast]);

  // Whisper fallback
  const processWithWhisper = useCallback(async () => {
    if (isProcessingWhisperRef.current || sttActiveRef.current || audioBufferRef.current.length === 0) return;

    isProcessingWhisperRef.current = true;
    logger.log('⚠️ Whisper fallback triggered');
    
    toast({
      title: "Folosim fallback",
      description: "AI voice limitat temporar.",
    });

    try {
      const totalLength = audioBufferRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      
      for (const chunk of audioBufferRef.current) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const int16Array = new Int16Array(combined.length);
      for (let i = 0; i < combined.length; i++) {
        const s = Math.max(-1, Math.min(1, combined[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      const uint8Array = new Uint8Array(int16Array.buffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Audio = btoa(binary);

      logger.log('📤 Sending to Whisper, size:', base64Audio.length);

      const response = await supabase.functions.invoke('whisper-transcribe', {
        body: { audio: base64Audio }
      });

      if (response.error || (response.data?.error && (response.data?.code === 429 || response.data?.code === 402))) {
        logger.error('❌ Whisper error:', response.data?.error || response.error);
        
        if (!hasShownFallbackToastRef.current) {
          toast({
            title: "Rate limit atins",
            description: "Folosim browserul pentru transcriere.",
            variant: "destructive"
          });
          hasShownFallbackToastRef.current = true;
        }
        
        startBrowserSTT();
        return;
      }
      
      if (response.data?.text) {
        logger.log('✅ Whisper:', response.data.text);
        onTranscript?.(response.data.text);
      }
    } catch (error) {
      logger.error('❌ Whisper error:', error);
      startBrowserSTT();
    } finally {
      isProcessingWhisperRef.current = false;
      audioBufferRef.current = [];
    }
  }, [onTranscript, toast, startBrowserSTT]);

  const startVoice = useCallback(async () => {
    if (!enabled) return;
    
    try {
      if (transport === 'webrtc') {
        // WebRTC implementation using ephemeral token
        console.log('🔌 Starting WebRTC voice connection...');
        
        // Initialize audio context if not already done
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          audioQueueRef.current = new AudioQueue(audioContextRef.current);
        }

        rtcChatRef.current = new RealtimeChat(
          (event: any) => {
            logger.log('📨 RTC Event:', event.type);

            // Immediate handling of quota/429 errors
            if (event?.response?.status_details?.error?.code === 'insufficient_quota') {
              logger.error('❌ Realtime insufficient_quota');
              hasQuotaErrorRef.current = true;
              if (!hasShownFallbackToastRef.current) {
                toast({ title: 'AI voice limitat', description: 'Folosim fallback.', variant: 'destructive' });
                hasShownFallbackToastRef.current = true;
              }
              if (audioBufferRef.current.length > 0) processWithWhisper();
              return;
            }

            if (event.type === 'conversation.item.input_audio_transcription.failed') {
              const msg: string | undefined = event?.error?.message;
              logger.error('❌ Transcription failed:', msg);
              // Trigger Whisper on 429 Too Many Requests
              if (msg?.includes('429')) {
                hasQuotaErrorRef.current = true;
                if (audioBufferRef.current.length > 0) processWithWhisper();
                return;
              }
            }
            
            if (event.type === 'input_audio_buffer.speech_started') {
              logger.log('🎤 User speaking');
              setIsUserSpeaking(true);
              hasQuotaErrorRef.current = false;
              if (whisperTimeoutRef.current) {
                clearTimeout(whisperTimeoutRef.current);
                whisperTimeoutRef.current = null;
              }
            } else if (event.type === 'input_audio_buffer.speech_stopped') {
              logger.log('🛑 User stopped');
              setIsUserSpeaking(false);
              if (!hasQuotaErrorRef.current) {
                whisperTimeoutRef.current = setTimeout(() => {
                  logger.log('⏰ Timeout - Whisper fallback');
                  processWithWhisper();
                }, 2500);
              }
            } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
              if (whisperTimeoutRef.current) {
                clearTimeout(whisperTimeoutRef.current);
                whisperTimeoutRef.current = null;
              }
              logger.log('📝 User transcript:', event.transcript);
              if (event.transcript && onTranscript) onTranscript(event.transcript);
              audioBufferRef.current = [];
            } else if (event.type === 'response.audio.delta') {
              setIsAISpeaking(true);
            } else if (event.type === 'response.audio.done') {
              setIsAISpeaking(false);
            } else if (event.type === 'error') {
              logger.error('❌ RTC Error:', event);
            }
          },
          audioQueueRef.current!,
          (level: number) => setAudioLevel(level),
          (audioData: Float32Array) => {
            // Continuously buffer mic audio for fallback
            audioBufferRef.current.push(new Float32Array(audioData));
          }
        );

        await rtcChatRef.current.init();
        setIsConnected(true);
        setIsMicOn(true);
        
        toast({
          title: "🎤 Voice Ready",
          description: "Speak naturally - AI will respond with voice"
        });
        
      } else {
        // WebSocket fallback (original implementation)
        const wsUrl = getWebSocketUrl();
        console.log('🔌 Connecting to voice WebSocket:', wsUrl);
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = async () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          
          toast({
            title: "🎤 Voice Ready",
            description: "Speak naturally - AI will respond with voice"
          });
          
          // Start microphone recording
          try {
            recorderRef.current = new AudioRecorder(
              (audioData: Float32Array) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  const base64Audio = AudioRecorder.encodeAudioForAPI(audioData);
                  wsRef.current.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                  }));
                }
              },
              (level: number) => {
                setAudioLevel(level);
              }
            );
            
            await recorderRef.current.start();
            setIsMicOn(true);
            console.log('🎙️ Microphone started');
          } catch (error) {
            console.error('❌ Microphone error:', error);
            toast({
              title: "Microphone Error",
              description: "Could not access microphone. Please check permissions.",
              variant: "destructive"
            });
          }
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received:', data.type);
            
            // Handle different message types
            switch (data.type) {
              case 'response.audio.delta':
                // Play audio chunk
                if (data.delta && audioQueueRef.current) {
                  const binaryString = atob(data.delta);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  audioQueueRef.current.addToQueue(bytes);
                }
                break;
                
              case 'response.audio.done':
                setIsAISpeaking(false);
                console.log('🔇 AI finished speaking');
                break;
                
              case 'response.audio_transcript.delta':
                // Accumulate transcript
                if (data.delta) {
                  transcriptBufferRef.current += data.delta;
                }
                break;
                
              case 'response.audio_transcript.done':
                // Send complete transcript
                if (transcriptBufferRef.current && onTranscript) {
                  console.log('📝 Transcript:', transcriptBufferRef.current);
                  onTranscript(transcriptBufferRef.current);
                  transcriptBufferRef.current = '';
                }
                break;
                
              case 'response.created':
                setIsAISpeaking(true);
                console.log('🔊 AI started speaking');
                break;
                
              case 'input_audio_buffer.speech_started':
                console.log('🎤 User started speaking');
                setIsUserSpeaking(true);
                break;
              
              case 'input_audio_buffer.speech_stopped':
                console.log('🎤 User stopped speaking');
                setIsUserSpeaking(false);
                break;
                
              case 'error':
                console.error('❌ Voice error:', data);
                const errorMessage = typeof data.error === 'string' 
                  ? data.error 
                  : data.error?.message || data.message || "An error occurred";
                
                toast({
                  title: "Voice Error",
                  description: errorMessage,
                  variant: "destructive"
                });
                break;
            }
          } catch (error) {
            console.error('❌ Error processing message:', error);
          }
        };
        
        wsRef.current.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: "Voice connection failed",
            variant: "destructive"
          });
        };
        
        wsRef.current.onclose = () => {
          console.log('🔌 WebSocket closed');
          setIsConnected(false);
          setIsMicOn(false);
          setIsAISpeaking(false);
        };
      }
      
    } catch (error) {
      console.error('❌ Error starting voice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice",
        variant: "destructive"
      });
    }
  }, [enabled, transport, getWebSocketUrl, onTranscript, toast]);

  const stopVoice = useCallback(() => {
    logger.log('🛑 Stopping voice');
    
    if (whisperTimeoutRef.current) {
      clearTimeout(whisperTimeoutRef.current);
      whisperTimeoutRef.current = null;
    }
    
    if (browserSTTRef.current) {
      browserSTTRef.current.stop();
      browserSTTRef.current = null;
    }
    
    audioBufferRef.current = [];
    hasQuotaErrorRef.current = false;
    hasShownFallbackToastRef.current = false;
    sttActiveRef.current = false;
    
    if (rtcChatRef.current) {
      rtcChatRef.current.disconnect();
      rtcChatRef.current = null;
    }
    
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsMicOn(false);
    }
    
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsAISpeaking(false);
    setIsUserSpeaking(false);
    transcriptBufferRef.current = '';
  }, []);

  const toggleMic = useCallback(() => {
    if (!isConnected) {
      startVoice();
    } else {
      stopVoice();
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
    startVoice,
    stopVoice,
    toggleMic
  };
};
