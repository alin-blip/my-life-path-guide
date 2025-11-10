import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, SkipForward, Keyboard, Mic, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult, PreviousWeekData } from '@/types/door';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { weeklyPlanningDraftService } from '@/services/weeklyPlanningDraftService';
import { getISOWeek, getYear } from 'date-fns';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '@/components/stack/VoiceInputButton';
import { VoiceLanguageToggle } from '@/components/stack/VoiceLanguageToggle';

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
  const today = new Date();
  const currentWeekKey = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
  const draftKey = `doorPlanningDraft_${currentWeekKey}`;
  
  // Load draft from database first, fallback to localStorage
  const loadDraft = async () => {
    try {
      // Try database first
      const dbDraft = await weeklyPlanningDraftService.loadDraft(currentWeekKey);
      if (dbDraft) {
        console.log('📦 Loaded draft from database');
        return {
          messages: dbDraft.messages || [],
          questionsAnswered: dbDraft.questionsAnswered || 0,
          isSkippingReview: dbDraft.isSkippingReview || false,
        };
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        console.log('📦 Loaded draft from localStorage (will migrate to DB)');
        
        // Migrate to database
        if (draft.messages && draft.messages.length > 0) {
          await weeklyPlanningDraftService.saveDraft(currentWeekKey, {
            messages: draft.messages,
            questionsAnswered: draft.questionsAnswered || 0,
            isSkippingReview: draft.isSkippingReview || false,
          });
          localStorage.removeItem(draftKey); // Clear old localStorage
        }
        
        return {
          messages: draft.messages || [],
          questionsAnswered: draft.questionsAnswered || 0,
          isSkippingReview: draft.isSkippingReview || false,
        };
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  };

  const [draftLoaded, setDraftLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastCloudSave, setLastCloudSave] = useState<Date | null>(null);
  const [isSkippingReview, setIsSkippingReview] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [previousWeekData, setPreviousWeekData] = useState<PreviousWeekData | undefined>(externalPreviousData);
  const [isLoadingPreviousData, setIsLoadingPreviousData] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Voice input integration
  const [inputMode, setInputMode] = useState<'text' | 'voice'>(() => {
    const saved = localStorage.getItem('doorPlanningInputMode');
    return (saved === 'voice' || saved === 'text') ? saved : 'text';
  });
  
  const {
    isConnected,
    isMicOn,
    isUserSpeaking,
    voiceLanguage,
    changeVoiceLanguage,
    toggleMic
  } = useVoiceInput({
    onTranscript: async (transcript) => {
      const userMessage: Message = { role: 'user', content: transcript };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setQuestionsAnswered(prev => prev + 1);

      // Salvare imediată în database după voice input
      const updatedMessages = [...messages, userMessage];
      const updatedQuestionsAnswered = questionsAnswered + 1;
      
      setIsSaving(true);
      await weeklyPlanningDraftService.saveDraft(currentWeekKey, {
        messages: updatedMessages,
        questionsAnswered: updatedQuestionsAnswered,
        isSkippingReview,
      });
      setLastCloudSave(new Date());
      setIsSaving(false);
      console.log('☁️ Voice message saved to cloud immediately');

      try {
        const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';
        
        await streamChat({
          mode,
          previousWeekData: mode === 'review' ? previousWeekData : undefined,
          messages: updatedMessages,
        });
      } catch (error) {
        console.error('Error sending voice message:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut trimite mesajul',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    enabled: inputMode === 'voice'
  });

  // Save input mode preference
  useEffect(() => {
    localStorage.setItem('doorPlanningInputMode', inputMode);
  }, [inputMode]);

  const totalQuestions = previousWeekData ? 22 : 18;
  const progress = (questionsAnswered / totalQuestions) * 100;

  // Load draft on mount
  useEffect(() => {
    if (isOpen && !draftLoaded) {
      loadDraft().then(draft => {
        if (draft) {
          setMessages(draft.messages);
          setQuestionsAnswered(draft.questionsAnswered);
          setIsSkippingReview(draft.isSkippingReview);
        }
        setDraftLoaded(true);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadPreviousWeekData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Only start new conversation if no draft exists
    if (isOpen && !isLoadingPreviousData && draftLoaded && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, isLoadingPreviousData, draftLoaded]);

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

  // Auto-save to localStorage immediately for fast backup
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          messages,
          questionsAnswered,
          isSkippingReview,
          timestamp: new Date().toISOString(),
        }));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [messages, questionsAnswered, isSkippingReview, draftKey]);

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      setInputMode('text');
      setDraftLoaded(false);
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
    // Clear both localStorage and database
    localStorage.removeItem(draftKey);
    weeklyPlanningDraftService.deleteDraft(currentWeekKey);
    startConversation();
  };

  const handleClearDraft = async () => {
    // Clear from both localStorage and database
    localStorage.removeItem(draftKey);
    await weeklyPlanningDraftService.deleteDraft(currentWeekKey);
    
    setMessages([]);
    setQuestionsAnswered(0);
    setIsSkippingReview(false);
    setLastCloudSave(null);
    
    toast({
      title: 'Draft șters',
      description: 'Conversația salvată a fost ștearsă din localStorage și din cloud.',
    });
    onClose();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    const updatedQuestionsAnswered = questionsAnswered + 1;
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setQuestionsAnswered(updatedQuestionsAnswered);

    // Salvare imediată în database după text input
    setIsSaving(true);
    await weeklyPlanningDraftService.saveDraft(currentWeekKey, {
      messages: updatedMessages,
      questionsAnswered: updatedQuestionsAnswered,
      isSkippingReview,
    });
    setLastCloudSave(new Date());
    setIsSaving(false);
    console.log('☁️ Text message saved to cloud immediately');

    try {
      const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: updatedMessages,
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
                
                console.log('📝 Planning data received from AI:', planningData);
                
                // Save to database
                const saveSuccess = await weeklyPlanningService.savePlan({
                  weekKey: currentWeekKey,
                  dominoTitle: planningData.dominoTitle,
                  weekGoal: planningData.weekGoal,
                  keyPoints: planningData.keyPoints,
                });
                
                if (saveSuccess) {
                  console.log('✅ Planning saved successfully to database');
                  
                  // Clear draft from both localStorage and database
                  localStorage.removeItem(draftKey);
                  await weeklyPlanningDraftService.deleteDraft(currentWeekKey);
                  
                  toast({
                    title: 'Plan salvat cu succes!',
                    description: 'Planul săptămânii a fost salvat în baza de date.',
                  });
                  
                  onPlanningComplete(planningData);
                  
                  // Small delay before closing to ensure user sees success message
                  setTimeout(() => {
                    onClose();
                  }, 500);
                } else {
                  console.error('❌ Failed to save planning to database');
                  toast({
                    title: 'Eroare la salvare',
                    description: 'Planul nu a putut fi salvat. Datele rămân în draft.',
                    variant: 'destructive',
                  });
                }
                return;
              } catch (e) {
                console.error('❌ Error parsing or saving planning data:', e);
                toast({
                  title: 'Eroare',
                  description: 'A apărut o eroare la procesarea planului. Datele rămân în draft.',
                  variant: 'destructive',
                });
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

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'text' ? 'voice' : 'text');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Weekly Planning Assistant
              {previousWeekData && !isSkippingReview && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (cu review săptămână precedentă)
                </span>
              )}
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Salvare cloud...</span>
                    </div>
                  ) : lastCloudSave ? (
                    <div className="flex items-center gap-1 text-xs text-green-500">
                      <Cloud className="w-3 h-3" />
                      <span>Cloud: {lastCloudSave.toLocaleTimeString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CloudOff className="w-3 h-3" />
                      <span>Local only</span>
                    </div>
                  )}
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Auto-save
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDraft}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Șterge draft
                </Button>
              </div>
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
            <div ref={messagesEndRef} />
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
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={toggleInputMode}
                      variant="outline"
                      size="icon"
                      title="Activează voice"
                      disabled={isLoading}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3">
                    <VoiceLanguageToggle
                      currentLanguage={voiceLanguage}
                      onLanguageChange={changeVoiceLanguage}
                      disabled={isMicOn || isLoading}
                    />
                    <VoiceInputButton 
                      isMicOn={isMicOn}
                      isConnected={isConnected}
                      isAISpeaking={false}
                      isUserSpeaking={isUserSpeaking}
                      audioLevel={0}
                      onToggle={toggleMic}
                      variant="compact"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {isMicOn 
                      ? 'Vorbește acum - microfonul este activ' 
                      : 'Click pe microfon pentru a începe'}
                  </p>
                  <Button
                    onClick={toggleInputMode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Înapoi la text
                  </Button>
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
