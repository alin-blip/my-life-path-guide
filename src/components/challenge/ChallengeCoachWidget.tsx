import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, X, Rocket, RotateCcw, Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useChallengeCoach } from '@/hooks/useChallengeCoach';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ChallengeCoachChat } from './ChallengeCoachChat';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ChallengeCoachWidgetProps {
  currentDay?: number;
}

export const ChallengeCoachWidget: React.FC<ChallengeCoachWidgetProps> = ({ 
  currentDay = 1 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    initializeChat,
  } = useChallengeCoach({ currentDay });

  // Voice input hook
  const {
    isConnected: isMicConnected,
    isMicOn,
    isUserSpeaking,
    voiceLanguage,
    changeVoiceLanguage,
    startVoice,
    stopVoice,
    toggleMic,
  } = useVoiceInput({
    enabled: activeMode === 'voice',
    voiceLanguage: language === 'ro' ? 'ro-RO' : 'en-US',
    onTranscript: (text) => {
      setVoiceTranscript(prev => prev ? `${prev} ${text}` : text);
    },
    onMicStop: () => {
      // When mic stops in call mode, send the accumulated transcript
      if (isCallActive && voiceTranscript.trim()) {
        handleVoiceSend();
      }
    },
  });

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopVoice();
      setIsCallActive(false);
      setVoiceTranscript('');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [isOpen, stopVoice]);

  const handleReset = useCallback(() => {
    clearMessages();
    initializeChat();
    setVoiceTranscript('');
  }, [clearMessages, initializeChat]);

  // Text-to-speech for AI responses
  const speakResponse = useCallback(async (text: string) => {
    if (!text || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah multilingual
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          // In call mode, restart listening after AI finishes speaking
          if (isCallActive) {
            startVoice();
          }
        };
        
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  }, [isSpeaking, isCallActive, startVoice]);

  // Handle sending voice transcript
  const handleVoiceSend = useCallback(async () => {
    if (!voiceTranscript.trim()) return;
    
    const transcript = voiceTranscript.trim();
    setVoiceTranscript('');
    
    // Send message and get response
    await sendMessage(transcript);
    
    // Get the last AI message and speak it
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && activeMode === 'voice') {
      speakResponse(lastMessage.content);
    }
  }, [voiceTranscript, sendMessage, messages, activeMode, speakResponse]);

  // Watch for new AI messages to speak
  useEffect(() => {
    if (activeMode === 'voice' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant' && !isLoading) {
        speakResponse(lastMessage.content);
      }
    }
  }, [messages, activeMode, isLoading, speakResponse]);

  // Toggle call mode
  const toggleCall = useCallback(() => {
    if (isCallActive) {
      stopVoice();
      setIsCallActive(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setIsCallActive(true);
      startVoice();
    }
  }, [isCallActive, startVoice, stopVoice]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg',
          'transition-all duration-300',
          'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
          'flex items-center justify-center',
          isOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 hover:scale-105'
        )}
      >
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
        
        <Rocket className="w-6 h-6 text-white" />
        
        {/* Day badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center shadow">
          {currentDay}
        </span>
      </Button>

      {/* Coach Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[420px] p-0 flex flex-col"
        >
          <SheetHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-base">
                    Challenge Coach
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ro' ? `Ziua ${currentDay} din 7` : `Day ${currentDay} of 7`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                  title={language === 'ro' ? 'Resetează conversația' : 'Reset conversation'}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Mode Tabs */}
          <Tabs 
            value={activeMode} 
            onValueChange={(v) => {
              setActiveMode(v as 'text' | 'voice');
              if (v === 'text') {
                stopVoice();
                setIsCallActive(false);
              }
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-3 max-w-[calc(100%-2rem)]">
              <TabsTrigger value="text" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                {language === 'ro' ? 'Text' : 'Text'}
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5">
                <Phone className="w-4 h-4" />
                {language === 'ro' ? 'Voce' : 'Voice'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="flex-1 overflow-hidden m-0 mt-2">
              <ChallengeCoachChat
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                currentDay={currentDay}
              />
            </TabsContent>

            <TabsContent value="voice" className="flex-1 overflow-hidden m-0 mt-2">
              <div className="flex flex-col h-full">
                {/* Voice Status */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  {/* Main Voice Button */}
                  <button
                    onClick={toggleCall}
                    className={cn(
                      'w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300',
                      isCallActive
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                    )}
                  >
                    {isCallActive ? (
                      <PhoneOff className="w-10 h-10 text-white" />
                    ) : (
                      <Phone className="w-10 h-10 text-white" />
                    )}
                  </button>

                  {/* Status Text */}
                  <h3 className="font-semibold mb-2">
                    {isCallActive 
                      ? (isSpeaking 
                          ? (language === 'ro' ? 'Coach-ul vorbește...' : 'Coach is speaking...')
                          : (isUserSpeaking 
                              ? (language === 'ro' ? 'Te ascult...' : 'Listening...')
                              : (language === 'ro' ? 'Spune ceva...' : 'Say something...')))
                      : (language === 'ro' ? 'Începe Conversația' : 'Start Conversation')
                    }
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
                    {isCallActive
                      ? (language === 'ro' 
                          ? 'Vorbește liber - coach-ul te ascultă și îți răspunde'
                          : 'Speak freely - the coach listens and responds')
                      : (language === 'ro' 
                          ? 'Apasă pentru a începe o conversație vocală cu Challenge Coach'
                          : 'Tap to start a voice conversation with Challenge Coach')}
                  </p>

                  {/* Transcript Preview */}
                  {voiceTranscript && (
                    <div className="bg-muted rounded-lg p-3 max-w-full mb-4">
                      <p className="text-sm italic">{voiceTranscript}</p>
                    </div>
                  )}

                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span className="text-sm">
                        {language === 'ro' ? 'Redare audio...' : 'Playing audio...'}
                      </span>
                    </div>
                  )}

                  {/* Language Toggle */}
                  <div className="mt-6 flex items-center gap-2">
                    <Button
                      variant={voiceLanguage === 'ro-RO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeVoiceLanguage('ro-RO')}
                      className="text-xs"
                    >
                      🇷🇴 Română
                    </Button>
                    <Button
                      variant={voiceLanguage === 'en-US' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeVoiceLanguage('en-US')}
                      className="text-xs"
                    >
                      🇬🇧 English
                    </Button>
                  </div>
                </div>

                {/* Recent Messages in Voice Mode */}
                {messages.length > 0 && (
                  <div className="border-t border-border p-4 max-h-[200px] overflow-y-auto">
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === 'ro' ? 'Conversație recentă:' : 'Recent conversation:'}
                    </p>
                    {messages.slice(-3).map((msg, i) => (
                      <div key={i} className={cn(
                        'text-sm mb-2 p-2 rounded',
                        msg.role === 'user' ? 'bg-primary/10 text-right' : 'bg-muted'
                      )}>
                        {msg.content.substring(0, 100)}{msg.content.length > 100 ? '...' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};