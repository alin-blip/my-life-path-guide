import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, AudioQueue, RealtimeChat } from '@/utils/RealtimeAudio';

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
  
  // Whisper fallback state
  const [isRecordingForWhisper, setIsRecordingForWhisper] = useState(false);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const whisperFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Whisper fallback function
  const processWithWhisper = useCallback(async () => {
    try {
      console.log('🎙️ Processing with Whisper API...');
      
      // Combine all audio chunks
      const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunksRef.current) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Encode to base64
      const int16Array = new Int16Array(combined.length);
      for (let i = 0; i < combined.length; i++) {
        const s = Math.max(-1, Math.min(1, combined[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      const uint8Array = new Uint8Array(int16Array.buffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Audio = btoa(binary);
      
      // Call Whisper API
      const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
        body: { audio: base64Audio }
      });
      
      if (error) throw error;
      
      if (data?.text && onTranscript) {
        console.log('✅ Whisper transcription:', data.text);
        onTranscript(data.text);
      }
      
      setIsRecordingForWhisper(false);
      audioChunksRef.current = [];
    } catch (error) {
      console.error('❌ Whisper fallback error:', error);
      toast({
        title: "Transcription Error",
        description: "Could not transcribe audio",
        variant: "destructive"
      });
    }
  }, [onTranscript, toast]);

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

        // Create RealtimeChat instance with audio capture for fallback
        rtcChatRef.current = new RealtimeChat(
          (event: any) => {
            console.log('📨 RTC Event:', event.type, event);
            
            // Capture audio for Whisper fallback
            if (event.type === 'input_audio_buffer.append' && isRecordingForWhisper) {
              // This won't work in WebRTC mode - we need to capture from microphone directly
            }
            
            // Handle different event types
            if (event.type === 'response.created') {
              setIsAISpeaking(true);
            } else if (event.type === 'response.audio.done' || event.type === 'response.done') {
              setIsAISpeaking(false);
            } else if (event.type === 'input_audio_buffer.speech_started') {
              setIsUserSpeaking(true);
              setIsRecordingForWhisper(true);
              audioChunksRef.current = [];
              console.log('🎤 User started speaking - recording for fallback');
            } else if (event.type === 'input_audio_buffer.speech_stopped') {
              setIsUserSpeaking(false);
              console.log('🎤 User stopped speaking');
              
              // Start fallback timer - if no transcription in 3 seconds, use Whisper
              whisperFallbackTimerRef.current = setTimeout(async () => {
                if (isRecordingForWhisper && audioChunksRef.current.length > 0) {
                  console.log('⚠️ No transcription received - using Whisper fallback');
                  await processWithWhisper();
                }
              }, 3000);
            } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
              console.log('📝 User transcription completed:', event.transcript);
              setIsRecordingForWhisper(false);
              if (whisperFallbackTimerRef.current) {
                clearTimeout(whisperFallbackTimerRef.current);
              }
              if (event.transcript && onTranscript) {
                onTranscript(event.transcript);
              }
            } else if (event.type === 'conversation.item.created') {
              // Check if this has user audio transcription
              if (event.item?.content) {
                const audioContent = event.item.content.find((c: any) => c.type === 'input_audio');
                if (audioContent?.transcript) {
                  console.log('📝 User transcript from item.created:', audioContent.transcript);
                  setIsRecordingForWhisper(false);
                  if (whisperFallbackTimerRef.current) {
                    clearTimeout(whisperFallbackTimerRef.current);
                  }
                  if (onTranscript) {
                    onTranscript(audioContent.transcript);
                  }
                }
              }
            } else if (event.type === 'response.audio_transcript.delta') {
              transcriptBufferRef.current += event.delta || '';
            } else if (event.type === 'response.audio_transcript.done') {
              if (transcriptBufferRef.current && onTranscript) {
                console.log('📝 AI transcript completed:', transcriptBufferRef.current);
                onTranscript(transcriptBufferRef.current);
                transcriptBufferRef.current = '';
              }
            }
          },
          audioQueueRef.current!,
          (level: number) => setAudioLevel(level),
          (audioData: Float32Array) => {
            // Capture audio for Whisper fallback
            if (isRecordingForWhisper) {
              audioChunksRef.current.push(new Float32Array(audioData));
            }
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
    // Stop WebRTC if active
    if (rtcChatRef.current) {
      rtcChatRef.current.disconnect();
      rtcChatRef.current = null;
    }
    
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
