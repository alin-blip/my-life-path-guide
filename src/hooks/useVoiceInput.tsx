import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '@/utils/realtimeAudio';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  systemPrompt?: string;
  enabled?: boolean;
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const { onTranscript, systemPrompt = "You are a helpful assistant.", enabled = true } = options;
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const transcriptBufferRef = useRef<string>('');

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not configured');
    }
    
    // Extract project ref from URL
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    return `wss://${projectRef}.supabase.co/functions/v1/realtime-voice`;
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

  const startVoice = useCallback(async () => {
    if (!enabled) return;
    
    try {
      // Connect WebSocket
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
            const base64Audio = encodeAudioForAPI(audioData);
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
              toast({
                title: "Voice Error",
                description: data.error || "An error occurred",
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
      
    } catch (error) {
      console.error('❌ Error starting voice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice",
        variant: "destructive"
      });
    }
  }, [enabled, getWebSocketUrl, onTranscript, toast]);

  const stopVoice = useCallback(() => {
    // Stop recording
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsMicOn(false);
    }
    
    // Clear audio queue
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsAISpeaking(false);
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
