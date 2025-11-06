import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, SkipForward, Mic, MicOff, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult, PreviousWeekData } from '@/types/door';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { getISOWeek, getYear } from 'date-fns';
import { AudioRecorder, AudioQueue, encodeAudioForAPI, createWavFromPCM } from '@/utils/realtimeAudio';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DoorPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousWeekData?: PreviousWeekData;
  onPlanningComplete: (data: PlanningResult) => void;
}

export const DoorPlanningModal: React.FC<DoorPlanningModalProps> = ({
  isOpen,
  onClose,
  previousWeekData: externalPreviousData,
  onPlanningComplete,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSkippingReview, setIsSkippingReview] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [previousWeekData, setPreviousWeekData] = useState<PreviousWeekData | undefined>(externalPreviousData);
  const [isLoadingPreviousData, setIsLoadingPreviousData] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Voice mode state
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalQuestions = previousWeekData ? 22 : 18;
  const progress = (questionsAnswered / totalQuestions) * 100;

  useEffect(() => {
    if (isOpen) {
      loadPreviousWeekData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isLoadingPreviousData && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, isLoadingPreviousData]);

  const loadPreviousWeekData = async () => {
    setIsLoadingPreviousData(true);
    
    try {
      const today = new Date();
      const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
      
      // Load previous week's plan from database
      const previousPlan = await weeklyPlanningService.getPreviousWeekPlan(currentWeekKey);
      
      if (previousPlan) {
        setPreviousWeekData({
          dominoTitle: previousPlan.dominoTitle,
          keyPoints: previousPlan.keyPoints.map(kp => ({
            title: kp.title,
            objective: kp.objective,
            positiveImpact: kp.positiveImpact,
            negativeImpact: kp.negativeImpact,
            steps: kp.steps.join(', '),
            responsible: kp.responsible,
            deadline: kp.deadline,
          })),
        });
        
        console.log('✅ Loaded previous week data:', previousPlan);
      } else {
        console.log('ℹ️ No previous week data found');
      }
    } catch (error) {
      console.error('Error loading previous week data:', error);
    } finally {
      setIsLoadingPreviousData(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom with ResizeObserver for better handling of long messages
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          requestAnimationFrame(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          });
        }
      }
    };

    scrollToBottom();

    // Observe content height changes
    const observer = new ResizeObserver(scrollToBottom);
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      observer.observe(scrollElement);
    }

    return () => observer.disconnect();
  }, [messages]);

  // Cleanup voice resources when modal closes or mode changes
  useEffect(() => {
    return () => {
      if (inputMode === 'voice') {
        cleanupVoice();
      }
    };
  }, [inputMode]);

  useEffect(() => {
    if (!isOpen) {
      cleanupVoice();
      setInputMode('text');
      setMessages([]);
      setQuestionsAnswered(0);
      setIsSkippingReview(false);
    }
  }, [isOpen]);

  const startConversation = async () => {
    setIsLoading(true);
    
    try {
      const mode = previousWeekData && !isSkippingReview ? 'review' : 'new';
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: [],
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut porni conversația cu AI-ul',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipReview = () => {
    setIsSkippingReview(true);
    setMessages([]);
    setQuestionsAnswered(0);
    startConversation();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setQuestionsAnswered(prev => prev + 1);

    try {
      const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: [...messages, userMessage],
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const streamChat = async ({ mode, previousWeekData, messages: chatMessages }: {
    mode: 'review' | 'new';
    previousWeekData?: PreviousWeekData;
    messages: Message[];
  }) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/door-ai-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mode, previousWeekData, messages: chatMessages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';
    let currentAssistantMessage = '';
    let hasStartedAssistantMessage = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith(':')) continue;
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          
          // Check for tool calls (structured output)
          if (parsed.choices?.[0]?.delta?.tool_calls) {
            const toolCall = parsed.choices[0].delta.tool_calls[0];
            if (toolCall?.function?.name === 'save_planning' && toolCall?.function?.arguments) {
              try {
                const planningData = JSON.parse(toolCall.function.arguments);
                
                // Save to database
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
                return;
              } catch (e) {
                console.error('Error parsing planning data:', e);
              }
            }
          }

          // Regular content streaming
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            currentAssistantMessage += content;
            
            if (!hasStartedAssistantMessage) {
              hasStartedAssistantMessage = true;
              setMessages(prev => [...prev, { role: 'assistant', content: currentAssistantMessage }]);
            } else {
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: currentAssistantMessage
                  };
                }
                return newMessages;
              });
            }
          }
        } catch (e) {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const cleanupVoice = () => {
    console.log('🧹 Cleaning up voice resources');
    recorderRef.current?.stop();
    wsConnection?.close();
    audioQueueRef.current?.clear();
    audioContextRef.current?.close();
    setIsRecording(false);
    setWsConnection(null);
    recorderRef.current = null;
    audioQueueRef.current = null;
    audioContextRef.current = null;
  };

  const initializeVoiceMode = async () => {
    try {
      console.log('🎤 Initializing voice mode...');
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      const projectId = 'sdflvglvhqmukzqmqosa';
      const wsUrl = `wss://${projectId}.functions.supabase.co/functions/v1/realtime-voice`;
      
      console.log('📡 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsRecording(true);
        startMicrophone();
        
        toast({
          title: 'Voice activat',
          description: 'Poți vorbi acum, AI-ul te ascultă',
        });
      };

      ws.onmessage = handleVoiceMessage;
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        toast({
          title: 'Eroare voice',
          description: 'Conexiunea cu AI-ul a eșuat',
          variant: 'destructive',
        });
        cleanupVoice();
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        setIsRecording(false);
      };
      
      setWsConnection(ws);
    } catch (error) {
      console.error('❌ Error initializing voice:', error);
      toast({
        title: 'Eroare voice',
        description: 'Nu s-a putut activa microfonul. Verifică permisiunile.',
        variant: 'destructive',
      });
      setInputMode('text');
    }
  };

  const startMicrophone = async () => {
    try {
      console.log('🎙️ Starting microphone...');
      recorderRef.current = new AudioRecorder((audioData: Float32Array) => {
        if (wsConnection?.readyState === WebSocket.OPEN) {
          wsConnection.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudioForAPI(audioData)
          }));
        }
      });
      
      await recorderRef.current.start();
      console.log('✅ Microphone started');
    } catch (error) {
      console.error('❌ Error starting microphone:', error);
      toast({
        title: 'Eroare microfon',
        description: 'Nu s-a putut accesa microfonul',
        variant: 'destructive',
      });
    }
  };

  const handleVoiceMessage = async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Voice message:', data.type);
      
      if (data.type === 'response.audio.delta') {
        // Play audio
        const binaryString = atob(data.delta);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        await audioQueueRef.current?.addToQueue(bytes);
      }
      else if (data.type === 'conversation.item.input_audio_transcription.completed') {
        // User speech transcribed
        console.log('👤 User said:', data.transcript);
        setMessages(prev => [...prev, { role: 'user', content: data.transcript }]);
        setQuestionsAnswered(prev => prev + 1);
      }
      else if (data.type === 'response.audio_transcript.delta') {
        // AI response text
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: last.content + data.delta }];
          }
          return [...prev, { role: 'assistant', content: data.delta }];
        });
      }
      else if (data.type === 'response.function_call_arguments.done') {
        // Planning complete
        console.log('✅ Planning complete, saving...');
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
          
          toast({
            title: 'Plan salvat!',
            description: 'Planul tău săptămânal a fost salvat cu succes',
          });
          
          onPlanningComplete(planningData);
          cleanupVoice();
          onClose();
        } catch (e) {
          console.error('❌ Error parsing planning data:', e);
        }
      }
    } catch (error) {
      console.error('❌ Voice message error:', error);
    }
  };

  const toggleInputMode = async () => {
    if (inputMode === 'text') {
      // Switch to voice
      await initializeVoiceMode();
      setInputMode('voice');
    } else {
      // Switch back to text
      cleanupVoice();
      setInputMode('text');
      
      toast({
        title: 'Mod text activat',
        description: 'Poți scrie răspunsurile cu tastatura',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Weekly Planning Assistant
            {previousWeekData && !isSkippingReview && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (cu review săptămână precedentă)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoadingPreviousData ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
              <p className="text-sm text-muted-foreground">Încărcare date săptămâna precedentă...</p>
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">AI gândește...</span>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>

          <div className="px-6 pb-6 border-t pt-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progres: {questionsAnswered}/{totalQuestions} întrebări</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {previousWeekData && !isSkippingReview && questionsAnswered === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipReview}
                className="w-full"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Sari peste review, planifică direct săptămâna nouă
              </Button>
            )}

            <div className="flex gap-2">
              {inputMode === 'text' ? (
                <>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrie răspunsul tău... (Enter = trimite, Shift+Enter = rând nou)"
                    className="resize-none flex-1"
                    rows={2}
                    disabled={isLoading}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={toggleInputMode}
                      variant="outline"
                      size="icon"
                      title="Activează voice"
                      disabled={isLoading}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                    <div className="text-center space-y-3 py-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                        isRecording ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-green-500'
                      }`}>
                        {isRecording ? (
                          <Mic className="w-8 h-8 text-white" />
                        ) : (
                          <MicOff className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isRecording ? 'Vorbește acum...' : 'Conectare voice...'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI-ul te ascultă și răspunde
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={toggleInputMode}
                    variant="outline"
                    size="icon"
                    title="Înapoi la text"
                    className="h-auto"
                  >
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
