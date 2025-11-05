import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult } from '@/types/door';
import { AudioRecorder, encodeAudioForAPI, AudioQueue, createWavFromPCM } from '@/utils/realtimeAudio';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { getISOWeek, getYear } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VoicePlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanningComplete: (data: PlanningResult) => void;
}

export const VoicePlanningModal: React.FC<VoicePlanningModalProps> = ({
  isOpen,
  onClose,
  onPlanningComplete,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initializeVoiceChat();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const initializeVoiceChat = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to WebSocket
      const projectId = 'sdflvglvhqmukzqmqosa';
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-voice`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to voice AI');
        setIsConnected(true);
        startMicrophone();
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data.type);

          if (data.type === 'response.audio.delta') {
            setIsAISpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          }
          else if (data.type === 'response.audio.done') {
            setIsAISpeaking(false);
          }
          else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            setMessages(prev => [...prev, { role: 'user', content: data.transcript }]);
          }
          else if (data.type === 'response.audio_transcript.delta') {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [...prev.slice(0, -1), { role: 'assistant', content: last.content + data.delta }];
              }
              return [...prev, { role: 'assistant', content: data.delta }];
            });
          }
          else if (data.type === 'response.function_call_arguments.done') {
            try {
              const planningData = JSON.parse(data.arguments);
              const today = new Date();
              const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
              
              await weeklyPlanningService.savePlan({
                weekKey: currentWeekKey,
                dominoTitle: planningData.dominoTitle,
                weekGoal: planningData.weekGoal,
                keyPoints: planningData.keyPoints,
              });
              
              onPlanningComplete(planningData);
              onClose();
            } catch (e) {
              console.error('Error parsing planning:', e);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Eroare conexiune',
          description: 'Nu s-a putut conecta la AI voice',
          variant: 'destructive',
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsMicOn(false);
      };

    } catch (error) {
      console.error('Error initializing voice:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut inițializa voice chat',
        variant: 'destructive',
      });
    }
  };

  const startMicrophone = async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isAISpeaking) {
          const encoded = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encoded
          }));
        }
      });

      await recorderRef.current.start();
      setIsMicOn(true);

      toast({
        title: 'Microfon activ',
        description: 'Poți începe să vorbești acum',
      });
    } catch (error) {
      console.error('Error starting microphone:', error);
      toast({
        title: 'Eroare microfon',
        description: 'Nu s-a putut accesa microfonul',
        variant: 'destructive',
      });
    }
  };

  const toggleMicrophone = async () => {
    if (isMicOn) {
      recorderRef.current?.stop();
      setIsMicOn(false);
    } else {
      await startMicrophone();
    }
  };

  const cleanup = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioQueueRef.current?.clear();
    audioContextRef.current?.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Voice AI Planning
            {isAISpeaking && (
              <span className="ml-2 text-sm font-normal text-muted-foreground animate-pulse">
                🎙️ AI vorbește...
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
              <p className="text-sm text-muted-foreground">Conectare la Voice AI...</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 pb-6 border-t pt-4 space-y-3">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={toggleMicrophone}
                  size="lg"
                  className={`rounded-full w-16 h-16 ${
                    isMicOn 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isMicOn ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {isMicOn 
                  ? 'Vorbește acum - microfonul este activ' 
                  : 'Click pe buton pentru a activa microfonul'}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
