import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, SkipForward, Keyboard, Mic, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlanningResult, PreviousWeekData, DayOfWeek } from '@/types/door';
import { weeklyPlanningService } from '@/services/weeklyPlanningService';
import { weeklyPlanningDraftService } from '@/services/weeklyPlanningDraftService';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { v4 as uuidv4 } from 'uuid';
import { getISOWeek, getYear } from 'date-fns';
import { getWeekKeyForPlanning } from '@/utils/weekUtils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceInputButton } from '@/components/stack/VoiceInputButton';
import { VoiceLanguageToggle } from '@/components/stack/VoiceLanguageToggle';
import { ReviewProgressStats } from './ReviewProgressStats';
import { DomainCategory, DOMAINS } from './DomainSelector';
import { awardXP } from '@/services/xpService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SelectedObjective {
  category: string;
  objectiveId: string;
  title: string;
}

interface DoorPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousWeekData?: PreviousWeekData;
  onPlanningComplete: (data?: PlanningResult) => void;
  selectedObjectives?: SelectedObjective[];
}

type PlanningStep = 'planning';

export const DoorPlanningModal: React.FC<DoorPlanningModalProps> = ({
  isOpen,
  onClose,
  previousWeekData: externalPreviousData,
  onPlanningComplete,
}) => {
  // Use centralized week key logic: Mon-Sat = current week, Sunday = next week
  const currentWeekKey = getWeekKeyForPlanning();
  
  // Planning step state
 // SIMPLIFIED: Always use 'business' category, no domain selection needed
 const [planningStep] = useState<PlanningStep>('planning');
 const [selectedDomain] = useState<DomainCategory>('business');
  
  const draftKey = `doorPlanningDraft_${currentWeekKey}_${selectedDomain || 'business'}`;
  
  // Load draft from database first, fallback to localStorage
  const loadDraft = async () => {
    if (!selectedDomain) return null;
    
    try {
      // Try database first
      const dbDraft = await weeklyPlanningDraftService.loadDraft(currentWeekKey, selectedDomain);
      if (dbDraft) {
        console.log('📦 Loaded draft from database for', selectedDomain);
        if (dbDraft.lastSavedAt) {
          setLastCloudSave(new Date(dbDraft.lastSavedAt));
        }
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
          }, selectedDomain);
          localStorage.removeItem(draftKey);
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
  const [isLoadingPreviousData, setIsLoadingPreviousData] = useState(false);
  
  // Review statistics tracking
  const [reviewStats, setReviewStats] = useState({
    totalKeys: 4,
    completedKeys: 0,
    continuedKeys: 0,
    failedKeys: 0,
    reviewComplete: false
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Keep history bounded to avoid backend 100-message limit
  const MAX_MESSAGES_IN_STATE = 100;
  const MAX_MESSAGES_TO_SEND = 40;
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
      const trimmed = transcript.trim();
      if (!trimmed || !selectedDomain) return;

      const userMessage: Message = { role: 'user', content: trimmed };
      const nextMessages = [...messagesRef.current, userMessage];
      const cappedMessages = nextMessages.slice(-MAX_MESSAGES_IN_STATE);
      const messagesForAI = cappedMessages.slice(-MAX_MESSAGES_TO_SEND);

      setMessages(cappedMessages);
      setUserScrolledUp(false); // Reset scroll on voice send
      setInput('');
      setIsLoading(true);
      setQuestionsAnswered(prev => prev + 1);

      const updatedQuestionsAnswered = questionsAnswered + 1;
      try {
        setIsSaving(true);
        await weeklyPlanningDraftService.saveDraft(currentWeekKey, {
          messages: cappedMessages,
          questionsAnswered: updatedQuestionsAnswered,
          isSkippingReview,
        }, selectedDomain);
        setLastCloudSave(new Date());
      } catch (e) {
        console.error('Error saving voice draft:', e);
      } finally {
        setIsSaving(false);
      }

      try {
        const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';

        await streamChat({
          mode,
          previousWeekData: mode === 'review' ? previousWeekData : undefined,
          messages: messagesForAI,
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
    enabled: inputMode === 'voice' && planningStep === 'planning'
  });

  // Save input mode preference
  useEffect(() => {
    localStorage.setItem('doorPlanningInputMode', inputMode);
  }, [inputMode]);

  const totalQuestions = previousWeekData ? 22 : 18;
  const progress = (questionsAnswered / totalQuestions) * 100;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setQuestionsAnswered(0);
      setDraftLoaded(false);
      setInputMode('text');
      setLastCloudSave(null);
    }
  }, [isOpen]);

  // Load draft when domain is selected
  useEffect(() => {
    if (selectedDomain && planningStep === 'planning' && !draftLoaded) {
      loadDraft().then(draft => {
        if (draft) {
          setMessages(draft.messages);
          setQuestionsAnswered(draft.questionsAnswered);
          setIsSkippingReview(draft.isSkippingReview);
        }
        setDraftLoaded(true);
      });
    }
  }, [selectedDomain, planningStep]);

  // Load previous week data when domain is selected
  useEffect(() => {
    if (selectedDomain && planningStep === 'planning') {
      loadPreviousWeekData();
    }
  }, [selectedDomain, planningStep]);

  // Start conversation when ready
  useEffect(() => {
    if (planningStep === 'planning' && !isLoadingPreviousData && draftLoaded && messages.length === 0) {
      startConversation();
    }
  }, [planningStep, isLoadingPreviousData, draftLoaded]);

  const loadPreviousWeekData = async () => {
    if (!selectedDomain) return;
    
    setIsLoadingPreviousData(true);
    
    try {
      const today = new Date();
      const currentWeekKeyISO = `${getYear(today)}-W${getISOWeek(today).toString().padStart(2, '0')}`;
      
      const previousPlan = await weeklyPlanningService.getPreviousWeekPlan(currentWeekKeyISO, selectedDomain);
      
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
        console.log('✅ Loaded previous week data for', selectedDomain);
      } else {
        setPreviousWeekData(undefined);
      }
    } catch (error) {
      console.error('Error loading previous week data:', error);
    } finally {
      setIsLoadingPreviousData(false);
    }
  };

  // Auto-save to localStorage immediately for fast backup
  useEffect(() => {
    if (messages.length > 0 && selectedDomain) {
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
  }, [messages, questionsAnswered, isSkippingReview, draftKey, selectedDomain]);

  // Smart auto-scroll: only scroll if user is already at bottom
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const isScrollingRef = useRef(false);
  
  // Attach scroll listener directly to the viewport element for reliable detection
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;
    
    const handleScroll = () => {
      if (isScrollingRef.current) return; // Ignore scroll events during programmatic scrolling
      const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
      setUserScrolledUp(!isAtBottom);
    };
    
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [planningStep, selectedDomain]);

  // Auto-scroll using requestAnimationFrame for better timing
  useEffect(() => {
    if (!userScrolledUp) {
      const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        // Use requestAnimationFrame for better DOM sync
        isScrollingRef.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            viewport.style.scrollBehavior = 'auto';
            viewport.scrollTop = viewport.scrollHeight;
            // Re-enable smooth scrolling after programmatic scroll
            setTimeout(() => {
              viewport.style.scrollBehavior = 'smooth';
              isScrollingRef.current = false;
            }, 50);
          });
        });
      }
    }
  }, [messages, isLoading, userScrolledUp]);

  // Reset scroll flag when user sends a message
  const resetScrollOnSend = () => {
    setUserScrolledUp(false);
  };

  const startConversation = async (forceSkip: boolean = false) => {
    if (!selectedDomain) return;
    
    // Force scroll to bottom when starting conversation
    setUserScrolledUp(false);
    
    setIsLoading(true);
    
    try {
      const shouldSkip = forceSkip || isSkippingReview;
      const mode = previousWeekData && !shouldSkip ? 'review' : 'new';
      
      const domainConfig = DOMAINS.find(d => d.id === selectedDomain);
      const domainName = domainConfig?.labelRo || selectedDomain;
      
      const initialMessage: Message = { 
        role: 'user', 
        content: `Salut! Să începem planificarea săptămânii pentru domeniul ${domainName}.` 
      };
      
      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: [initialMessage],
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
    if (!selectedDomain) return;
    
    setIsSkippingReview(true);
    setMessages([]);
    setQuestionsAnswered(0);
    localStorage.removeItem(draftKey);
    weeklyPlanningDraftService.deleteDraft(currentWeekKey, selectedDomain);
    startConversation(true);
  };

  const handleClearDraft = async () => {
    if (!selectedDomain) return;
    
    localStorage.removeItem(draftKey);
    await weeklyPlanningDraftService.deleteDraft(currentWeekKey, selectedDomain);
    
    setMessages([]);
    setQuestionsAnswered(0);
    setIsSkippingReview(false);
    setLastCloudSave(null);
    
    toast({
      title: 'Draft șters',
      description: 'Conversația salvată a fost ștearsă.',
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !selectedDomain) return;
    resetScrollOnSend();

    const userMessage: Message = { role: 'user', content: input.trim() };
    const nextMessages = [...messagesRef.current, userMessage];
    const cappedMessages = nextMessages.slice(-MAX_MESSAGES_IN_STATE);
    const messagesForAI = cappedMessages.slice(-MAX_MESSAGES_TO_SEND);
    const updatedQuestionsAnswered = questionsAnswered + 1;

    setMessages(cappedMessages);
    setInput('');
    setIsLoading(true);
    setQuestionsAnswered(updatedQuestionsAnswered);

    try {
      setIsSaving(true);
      await weeklyPlanningDraftService.saveDraft(currentWeekKey, {
        messages: cappedMessages,
        questionsAnswered: updatedQuestionsAnswered,
        isSkippingReview,
      }, selectedDomain);
      setLastCloudSave(new Date());
    } catch (e) {
      console.error('Error saving text draft:', e);
    } finally {
      setIsSaving(false);
    }

    try {
      const mode = previousWeekData && !isSkippingReview && questionsAnswered < 4 ? 'review' : 'new';

      await streamChat({
        mode,
        previousWeekData: mode === 'review' ? previousWeekData : undefined,
        messages: messagesForAI,
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

  const handlePlanningComplete = (planningData: PlanningResult) => {
    // Award XP for completing weekly planning
    awardXP('weekly_planning');
    
     // Simplified: just complete and close
     onPlanningComplete(planningData);
     onClose();
  };

  const streamChat = async ({ mode, previousWeekData, messages: chatMessages }: {
    mode: 'review' | 'new';
    previousWeekData?: PreviousWeekData;
    messages: Message[];
  }) => {
    if (!selectedDomain) return;
    
    const safeMessages = Array.isArray(chatMessages)
      ? chatMessages.slice(-MAX_MESSAGES_TO_SEND)
      : [];

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const domainConfig = DOMAINS.find(d => d.id === selectedDomain);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/door-ai-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': `${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        mode, 
        previousWeekData, 
        messages: safeMessages,
        category: selectedDomain,
        categoryLabel: domainConfig?.labelRo || selectedDomain,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText || 'Request failed'}`);
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
                
                // Save to database with category
                const saveSuccess = await weeklyPlanningService.savePlan({
                  weekKey: currentWeekKey,
                  dominoTitle: planningData.dominoTitle,
                  weekGoal: planningData.weekGoal,
                  keyPoints: planningData.keyPoints,
                  category: selectedDomain,
                });
                
                if (saveSuccess) {
                  console.log('✅ Planning saved successfully to database');
                  
                  // Add steps to daily tasks with domain category
                  let stepsAdded = 0;
                  for (const keyPoint of planningData.keyPoints || []) {
                    for (const step of keyPoint.steps || []) {
                      const stepText = typeof step === 'string' ? step : step.text;
                      const stepDay = typeof step === 'object' ? step.day : null;
                      const stepListType = typeof step === 'object' ? step.listType : 'do';
                      
                      if (stepText && stepDay) {
                        try {
                          await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
                            id: uuidv4(),
                            text: `[${domainConfig?.labelRo || selectedDomain}] ${stepText}`,
                            category: stepListType as 'hit' | 'do',
                            priority: 'important',
                            day: stepDay as DayOfWeek
                          });
                          stepsAdded++;
                        } catch (stepError) {
                          console.error('Error adding step to tasks:', stepError);
                        }
                      }
                    }
                  }
                  
                  console.log(`📋 Total ${stepsAdded} steps added to daily tasks`);
                  
                  // Clear draft
                  localStorage.removeItem(draftKey);
                  await weeklyPlanningDraftService.deleteDraft(currentWeekKey, selectedDomain);
                  
                  toast({
                    title: 'Plan salvat cu succes!',
                    description: stepsAdded > 0 
                      ? `Planul ${domainConfig?.labelRo} și ${stepsAdded} pași au fost adăugați.`
                      : `Planul ${domainConfig?.labelRo} a fost salvat.`,
                  });
                  
                  // Trigger continue flow
                  handlePlanningComplete(planningData);
                } else {
                  console.error('❌ Failed to save planning to database');
                  toast({
                    title: 'Eroare la salvare',
                    description: 'Planul nu a putut fi salvat. Încearcă din nou.',
                    variant: 'destructive',
                  });
                }
              } catch (e) {
                console.error('❌ Error parsing or saving planning data:', e);
                toast({
                  title: 'Eroare la procesare',
                  description: 'A apărut o eroare. Datele rămân în draft.',
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
    // Detect mobile - on mobile, Enter creates new line, only Send button submits
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleInputMode = () => {
    setInputMode(prev => prev === 'text' ? 'voice' : 'text');
  };

   const selectedDomainConfig = DOMAINS.find(d => d.id === 'business');

  return (
    <>
       <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                 <span className="flex items-center gap-2">
                   Domino Door Planning
                   {previousWeekData && !isSkippingReview && (
                     <span className="text-sm font-normal text-muted-foreground">
                       (cu review)
                     </span>
                   )}
                 </span>
              </div>
               {messages.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isSaving ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Salvare...</span>
                      </div>
                    ) : lastCloudSave ? (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <Cloud className="w-3 h-3" />
                        <span>{lastCloudSave.toLocaleTimeString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CloudOff className="w-3 h-3" />
                      </div>
                    )}
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
                <p className="text-sm text-muted-foreground">Încărcare date...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="px-6 py-4">
                <div className="space-y-4">
                  {previousWeekData && !isSkippingReview && reviewStats.reviewComplete && (
                    <ReviewProgressStats
                      totalKeys={reviewStats.totalKeys}
                      completedKeys={reviewStats.completedKeys}
                      continuedKeys={reviewStats.continuedKeys}
                      failedKeys={reviewStats.failedKeys}
                    />
                  )}
                  
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
                </div>
                <ScrollBar orientation="vertical" className="visible" />
              </ScrollArea>
              </div>

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
                    Sari peste review
                  </Button>
                )}

                <div className="flex gap-2">
                  {inputMode === 'text' ? (
                    <>
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scrie răspunsul tău..."
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
                          ? 'Vorbește acum' 
                          : 'Click pe microfon'}
                      </p>
                      <Button
                        onClick={toggleInputMode}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Keyboard className="w-4 h-4 mr-2" />
                        Text
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
