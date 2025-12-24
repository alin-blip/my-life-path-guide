import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { AudioWaveform } from './voice/AudioWaveform';
import { SilenceCountdown } from './voice/SilenceCountdown';
import { StatusIndicator } from './voice/StatusIndicator';
import { QuickActionButton } from './voice/QuickActionButton';
import { VoiceSelector, DEFAULT_VOICE_ID } from './VoiceSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Phone, PhoneOff, Send, 
  Target, ListTodo, Sparkles, Zap, Heart, Plus,
  SkipForward, Settings, Save, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  message?: string;
  action?: string;
}

interface VoiceConversationWidgetProps {
  systemPrompt: string;
  welcomeMessage?: string;
  onComplete?: () => void;
  onAddToHitList?: (action: string) => void;
  quickActions?: QuickAction[];
  className?: string;
}

const defaultQuickActions: QuickAction[] = [
  { icon: Target, label: 'Plan', message: 'Care este planul meu pentru azi?' },
  { icon: ListTodo, label: 'Tasks', message: 'Ce sarcini am de făcut azi?' },
  { icon: Heart, label: 'Rugă', message: 'Hai să facem rugăciunea divină.' },
  { icon: Zap, label: 'Putere', message: 'Dă-mi o afirmație puternică pentru ziua de azi!' },
  { icon: Sparkles, label: 'Final', message: 'Hai să încheiem sesiunea cu un rezumat.' }
];

// Persist voice selection in localStorage
const VOICE_STORAGE_KEY = 'voice-conversation-voice-id';

const getStoredVoiceId = () => {
  try {
    return localStorage.getItem(VOICE_STORAGE_KEY) || DEFAULT_VOICE_ID;
  } catch {
    return DEFAULT_VOICE_ID;
  }
};

export const VoiceConversationWidget: React.FC<VoiceConversationWidgetProps> = ({
  systemPrompt,
  welcomeMessage,
  onComplete,
  onAddToHitList,
  quickActions = defaultQuickActions,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastAIMessage, setLastAIMessage] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(getStoredVoiceId);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Ref to hold speakAI function to avoid stale closure
  const speakAIRef = useRef<((text: string) => void) | null>(null);
  
  // Ref for auto-scrolling messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle voice change and persist
  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoiceId(voiceId);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceId);
    } catch (e) {
      console.warn('Could not persist voice selection');
    }
    toast({
      title: '🎙️ Voce schimbată',
      description: 'Noua voce va fi folosită pentru următorul răspuns.',
    });
  }, [toast]);

  // Handle sending message to AI
  const handleUserMessage = useCallback(async (text: string) => {
    console.log('📨 User message:', text);
    
    // Add user message
    const userMessage: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessingAI(true);

    // Get AI response
    try {
      const allMessages = [...messages, userMessage];
      
      const response = await supabase.functions.invoke('ai-coach', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt,
          stackType: 'daily-master'
        }
      });

      if (response.error) throw response.error;

      const aiText = response.data?.response || response.data?.message || 'Nu am putut genera un răspuns.';
      
      // Add AI message
      const aiMessage: Message = { role: 'assistant', content: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
      setLastAIMessage(aiText);
      setIsProcessingAI(false);

      // Speak the response using ref
      console.log('🔊 Calling speakAI via ref');
      speakAIRef.current?.(aiText);

    } catch (error) {
      console.error('AI error:', error);
      setIsProcessingAI(false);
      toast({
        title: 'Eroare',
        description: 'Nu am putut obține răspunsul AI.',
        variant: 'destructive'
      });
    }
  }, [messages, systemPrompt, toast]);

  const voiceConversation = useVoiceConversation({
    onUserMessage: handleUserMessage,
    onAIResponse: (text) => setLastAIMessage(text),
    silenceThreshold: 3000,
    language: 'ro-RO',
    voiceId: selectedVoiceId
  });

  // Keep speakAI ref updated
  useEffect(() => {
    speakAIRef.current = voiceConversation.speakAI;
  }, [voiceConversation.speakAI]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start conversation with welcome message
  const handleStart = useCallback(() => {
    setIsStarted(true);
    voiceConversation.startConversation();
    
    if (welcomeMessage) {
      const aiMessage: Message = { role: 'assistant', content: welcomeMessage, timestamp: new Date() };
      setMessages([aiMessage]);
      setLastAIMessage(welcomeMessage);
      voiceConversation.speakAI(welcomeMessage);
    }
  }, [welcomeMessage, voiceConversation]);

  // Handle quick action
  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.message) {
      handleUserMessage(action.message);
    } else if (action.action === 'complete') {
      onComplete?.();
    }
  }, [handleUserMessage, onComplete]);

  // Add to HIT List
  const handleAddToHitList = useCallback(() => {
    if (lastAIMessage && onAddToHitList) {
      // Extract action from AI message
      const actionMatch = lastAIMessage.match(/(?:poți|ar trebui să|recomand să|acțiune:)\s*([^.!?]+)/i);
      const action = actionMatch?.[1] || lastAIMessage.substring(0, 100);
      onAddToHitList(action);
      toast({
        title: '✅ Adăugat la HIT List',
        description: action.substring(0, 50) + '...'
      });
    }
  }, [lastAIMessage, onAddToHitList, toast]);

  // Save conversation to database
  const handleSaveConversation = useCallback(async () => {
    if (messages.length < 2) {
      toast({
        title: 'Conversație prea scurtă',
        description: 'Trebuie să existe cel puțin un schimb de mesaje.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a summary from the conversation
      const summary = messages
        .map(m => `${m.role === 'user' ? 'Tu' : 'AI'}: ${m.content.substring(0, 100)}...`)
        .join('\n');

      const { error } = await supabase.from('stack_sessions').insert({
        user_id: user.id,
        session_id: `voice-conv-${Date.now()}`,
        stack_type: 'voice-conversation',
        completed: true,
        answers: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          savedAt: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: '✅ Conversație salvată',
        description: 'Poți accesa conversația din istoricul sesiunilor.',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut salva conversația.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [messages, toast]);

  // Get current status
  const getStatus = () => {
    if (voiceConversation.isAISpeaking) return 'ai-speaking';
    if (isProcessingAI || voiceConversation.isProcessing || voiceConversation.isTTSLoading) return 'processing';
    if (voiceConversation.isListening) return 'listening';
    return 'idle';
  };

  if (!isStarted) {
    return (
      <Card className={cn(
        'p-8 flex flex-col items-center justify-center gap-6',
        'bg-gradient-to-br from-primary/5 to-secondary/5',
        className
      )}>
        <div className="text-center space-y-2">
          <Phone className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Conversație Vocală</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Vorbește natural cu AI-ul tău. După 3 secunde de pauză, 
            mesajul se trimite automat.
          </p>
        </div>

        {/* Voice Selector before starting */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">Alege vocea AI:</span>
          <VoiceSelector
            currentVoice={selectedVoiceId}
            onVoiceChange={handleVoiceChange}
          />
        </div>
        
        <Button
          onClick={handleStart}
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-primary/80"
        >
          <Phone className="w-5 h-5" />
          Începe Conversația
        </Button>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'flex flex-col overflow-hidden',
      'bg-gradient-to-br from-background to-muted/20',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50">
        <div className="flex items-center gap-3">
          <StatusIndicator status={getStatus()} />
          <AudioWaveform
            audioLevel={voiceConversation.audioLevel}
            isActive={voiceConversation.isListening || voiceConversation.isAISpeaking}
            variant={voiceConversation.isAISpeaking ? 'ai' : voiceConversation.isListening ? 'user' : 'idle'}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Voice Selector - available during conversation */}
          <VoiceSelector
            currentVoice={selectedVoiceId}
            onVoiceChange={handleVoiceChange}
            disabled={voiceConversation.isAISpeaking}
            compact
          />
          
          <Button
            variant="destructive"
            size="sm"
            onClick={voiceConversation.stopConversation}
            className="gap-1"
          >
            <PhoneOff className="w-4 h-4" />
            Închide
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 max-h-[300px]">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {/* Loading indicator when AI is processing */}
          {isProcessingAI && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Se generează răspunsul...</span>
              </div>
            </div>
          )}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Live Transcript */}
      {voiceConversation.currentTranscript && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-background rounded-lg px-3 py-2 text-sm">
              <span className="text-muted-foreground">🎤 </span>
              {voiceConversation.currentTranscript}
            </div>
            <SilenceCountdown
              seconds={voiceConversation.silenceTimer}
              maxSeconds={3}
              onManualSend={voiceConversation.manualSend}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t">
        <div className="flex flex-wrap gap-2 justify-center">
          {quickActions.map((action, i) => (
            <QuickActionButton
              key={i}
              icon={action.icon}
              label={action.label}
              onClick={() => handleQuickAction(action)}
              disabled={voiceConversation.isAISpeaking || voiceConversation.isProcessing}
            />
          ))}
          {onAddToHitList && (
            <QuickActionButton
              icon={Plus}
              label="Add"
              onClick={handleAddToHitList}
              variant="success"
              disabled={!lastAIMessage}
            />
          )}
          {/* Save conversation button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveConversation}
            disabled={messages.length < 2 || isSaving}
            className="gap-1 text-xs"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            Salvează
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t bg-background/80">
        <div className="flex items-center justify-center gap-4">
          {/* Skip AI Speaking */}
          {voiceConversation.isAISpeaking && (
            <Button
              variant="outline"
              size="icon"
              onClick={voiceConversation.skipAISpeaking}
              className="rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          )}

          {/* Main mic button */}
          <Button
            variant={voiceConversation.isListening ? 'destructive' : 'default'}
            size="lg"
            onClick={voiceConversation.isListening ? voiceConversation.stopListening : voiceConversation.startListening}
            disabled={voiceConversation.isAISpeaking || voiceConversation.isProcessing}
            className={cn(
              'rounded-full w-16 h-16',
              voiceConversation.isListening && 'animate-pulse'
            )}
          >
            {voiceConversation.isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          {/* Manual send */}
          {voiceConversation.currentTranscript && (
            <Button
              variant="outline"
              size="icon"
              onClick={voiceConversation.manualSend}
              className="rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          {voiceConversation.isAISpeaking 
            ? '🔊 AI vorbește... Click skip pentru a sări'
            : voiceConversation.isListening 
              ? '🎤 Vorbește natural, se trimite automat după 3s pauză'
              : '👆 Apasă microfonul pentru a vorbi'}
        </p>
      </div>
    </Card>
  );
};