import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, CheckCircle, PlusCircle, RotateCcw, Volume2, VolumeX, Mic, MicOff, Pause, Play, SkipForward, Download, FileText, Star, StickyNote, Share2, Copy, Check, Target, ListTodo, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TextToSpeechButton } from '@/components/ui/TextToSpeechButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStackTodoIntegration } from "@/hooks/useStackTodoIntegration";
import { StackIdeaModal } from "./StackIdeaModal";
import { AddToTodoDialog } from "./AddToTodoDialog";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveToStackLibrary, updateDailyProgress } from '@/utils/stackProgress';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { voiceRecordingService } from '@/services/voiceRecordingService';
import { AISpeakingIndicator } from './AISpeakingIndicator';
import { VoiceSelector } from './VoiceSelector';
import jsPDF from 'jspdf';
import { useStackSession } from '@/hooks/useStackSession';
import { usePersistentSessionId } from '@/hooks/usePersistentSessionId';
import { useConfettiCelebration } from '@/components/door/ConfettiCelebration';
import { AlchemistTransformation } from '@/components/celebrations/AlchemistTransformation';
import { KeyPointsDefinitionFlow } from '@/components/champion-routine/steps/KeyPointsDefinitionFlow';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getWeekKey } from '@/utils/weekUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHighlighted?: boolean;
  userNote?: string;
  importance?: 'low' | 'medium' | 'high';
}

interface AiGuidedStackProps {
  onAddToHitList?: (action: string) => void;
  onComplete?: (transformedEnergy?: string) => void;
  stackType: 'anger' | 'divine-prayer' | 'gods-school' | 'hormozi' | 'napoleon-hill' | 'gratitude' | 'daily-master' | 'divine-gratitude' | 'introspection' | 'ai-live';
  questions: any[];
  onModeSwitch?: () => void;
  audioMode?: boolean;
  voiceOnlyMode?: boolean;
  systemPrompt?: string;
  systemPromptOverride?: string;
  welcomeMessage?: string;
  knowledgeBaseFiles?: string[];
  challengeDay?: number | null;
  forceNewSession?: boolean;
  /** When true, AiGuidedStack skips its own export-options/key-points UI (parent handles it) */
  externalExportFlow?: boolean;
}

export const AiGuidedStack: React.FC<AiGuidedStackProps> = ({ 
  onAddToHitList,
  onComplete: externalOnComplete,
  stackType, 
  questions,
  onModeSwitch,
  audioMode = false,
  voiceOnlyMode = false,
  systemPrompt: customSystemPrompt,
  systemPromptOverride,
  welcomeMessage: customWelcomeMessage,
  knowledgeBaseFiles = [],
  challengeDay,
  forceNewSession = false,
  externalExportFlow = false
}) => {
  const [mode, setMode] = useState<'setup' | 'chat' | 'complete' | 'export-options' | 'key-points'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(customSystemPrompt || '');
  const [finalAction, setFinalAction] = useState('');
  const [actionAddedToHitList, setActionAddedToHitList] = useState(false);
  const [showAddToTodoDialog, setShowAddToTodoDialog] = useState(false);
  const [isAddingToHitList, setIsAddingToHitList] = useState(false);
  const { sessionId } = usePersistentSessionId(stackType);
  const [ttsEnabled, setTtsEnabled] = useState(voiceOnlyMode || audioMode);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const hasSpokenWelcomeRef = useRef(false); // ✅ Schimbat în ref pentru control instant
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteMessageIndex, setNoteMessageIndex] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState('');
  const [currentImportance, setCurrentImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAlchemistOverlay, setShowAlchemistOverlay] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() =>
    localStorage.getItem('preferred-tts-voice') || 'pFZP5JQG7iQjIQuC4Bku'
  );
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldSpeakRef = useRef(false);
  
  // Auto-save session management
  const {
    saveSession,
    loadSession,
    isAutoSaveEnabled,
    lastSaveTime: sessionLastSaveTime
  } = useStackSession({
    stackType,
    sessionId,
    challengeDay,
    onSessionRestore: (sessionData) => {
      console.log('📥 Restoring session:', sessionData);
      if (sessionData.answers && sessionData.answers.messages && Array.isArray(sessionData.answers.messages)) {
        // Convert timestamp strings back to Date objects
        const restoredMessages = sessionData.answers.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
        setCurrentQuestionNumber(sessionData.answers.currentStep || 0);
        if (sessionData.answers.finalAction) {
          setFinalAction(sessionData.answers.finalAction);
          setMode('complete');
        }
      }
    }
  });
  
  const {
    isIdeaModalOpen,
    openIdeaModal,
    closeIdeaModal,
    captureIdea
  } = useStackTodoIntegration({ onAddToHitList });

  // Handler for voice change
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('preferred-tts-voice', voiceId);
    toast({
      title: '🎤 Voce schimbată',
      description: 'Noua voce va fi folosită pentru următorul răspuns AI.',
    });
  };

  // TTS integration with advanced controls
  const {
    speak: speakText,
    stop: stopSpeaking,
    pause: pauseTts,
    resume: resumeTts,
    skip: skipTts,
    changePlaybackRate,
    isSpeaking: isAiSpeaking,
    isLoading: isTtsLoading,
    isPaused: isTtsPaused,
    playbackRate
  } = useTextToSpeech({
    voiceId: selectedVoice,
    onSpeakingStart: () => {
      console.log('🎵 AI started speaking');
      // Stop microphone IMMEDIATELY when TTS starts
      if (isListening) {
        console.log('🔇 IMMEDIATE stop - AI is speaking');
        stopListening();
      }
    },
    onSpeakingEnd: () => {
      console.log('✅ AI finished speaking');
      // Microphone stays OFF - user must click to activate
    },
    autoPlay: true
  });

  // Ref pentru a verifica starea curentă fără closure issues
  const isListeningRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const currentMessageRef = useRef('');

  // Voice input with auto-submit and recording
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    getRecordedAudio,
    isSupported: isVoiceSupported
  } = useVoiceToText({
    onTranscript: (text) => {
      // Folosește ref-ul pentru a verifica starea actuală
      if (isAiSpeakingRef.current || !isListeningRef.current) {
        console.log('🚫 Ignoring transcript - AI speaking or mic OFF');
        return;
      }
      setCurrentMessage(text);
      currentMessageRef.current = text;
    },
    language: 'ro',
    autoSubmit: audioMode || voiceOnlyMode,
    onAutoSubmit: async () => {
      if (isAiSpeakingRef.current) {
        console.log('⏸️ Ignoring auto-submit while AI is speaking');
        return;
      }
      if (currentMessageRef.current.trim()) {
        stopListening();
        
        if (audioMode || voiceOnlyMode) {
          const recording = getRecordedAudio();
          if (recording) {
            const { audioBlob, durationSeconds } = recording;
            console.log('💾 Saving voice recording...');
          }
        }
        
        sendMessage();
      }
    },
    saveRecording: audioMode
  });

  // ✅ Sync refs with state - CRITICAL for closure stability
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    currentMessageRef.current = currentMessage;
  }, [currentMessage]);

  const getStackPrompt = () => {
    // If systemPromptOverride is provided, use it directly
    if (systemPromptOverride) {
      return systemPromptOverride;
    }
    
    if (stackType === 'anger') {
      return `Ești un coach empatic și puternic care ghidează utilizatorul prin "Alchimia Furiei" - un proces de transformare a furiei în claritate și putere.

STILUL TĂU:
- Ești EMPATIC dar FERM - înțelegi furia dar ghidezi spre transformare
- Validezi emoțiile ("Înțeleg perfect această furie... e valid ce simți")
- Faci tranziții NATURALE ("Bine, acum hai să mergem mai adânc...")
- Celebrezi progresul ("Excelent! Deja începi să vezi mai clar...")
- Ești un aliat, nu un judecător

STRUCTURA - Cele 42 de întrebări ale Alchimiei Furiei:

FAZA 1: IDENTIFICARE (Întrebările 1-12)
- Numirea furiei, domeniul, persoana
- Ce te-a făcut să simți, ce ai vrea să țipi, ce crezi despre persoana
- Faptele non-emoționale și povestea

FAZA 2: INVESTIGARE (Întrebările 13-21)
- Este povestea adevărată? 100% sigur?
- Ce ar fi posibil dacă ar fi falsă?
- Ce îți dorești pentru tine, pentru persoană, pentru amândoi?
- Ești gata să renunți la poveste?

FAZA 3: TRANSFORMARE (Întrebările 22-30)
- Versiunea MEA a poveștii
- Versiunea OPUSĂ
- Versiunea DORITĂ
- Dovezi pentru fiecare

FAZA 4: INTEGRARE (Întrebările 31-42)
- A fost declanșatorul pozitiv?
- Lecția de viață și aplicarea în CORE 4
- Revelația principală
- Acțiuni imediate → HIT List

REGULI IMPORTANTE:
- Înlocuiește [PERSOANA] cu răspunsul de la întrebarea 3
- Înlocuiește [POVESTEA] cu răspunsul de la întrebarea 10
- După FIECARE răspuns, oferă o validare scurtă și empatică
- Nu sări peste întrebări, dar fă tranzițiile fluide
- La final celebrează transformarea și întreabă despre HIT List
- Răspunde ÎNTOTDEAUNA în română

EXEMPLU DE INTERACȚIUNE:
Tu: "Ce nume vei da acestui morman de furie?"
Utilizator: "Furia pe șef"
Tu: "Un nume puternic și direct. Simt că e ceva important aici. Ce domeniu din CORE 4 stivuiești? (Body/Spirit/Relații/Business)"

ÎNCEPE cu: "Bine ai venit la Alchimia Furiei! Sunt aici să te ghidez prin transformarea acestei energii în claritate și putere. Să începem! Ce nume vei da acestui morman de furie?"`;
    } else if (stackType === 'divine-prayer') {
      return `Ești un ghid spiritual cald și empatic care ghidează utilizatorul prin Stack-ul de Rugăciune Divină - un proces de conectare profundă cu Dumnezeu.

STILUL TĂU:
- Ești REVERENT dar CALD - creezi un spațiu sacru fără a fi distant
- Validezi fiecare răspuns cu blândețe ("Ce frumos... simt sinceritatea acestor cuvinte")
- Faci tranziții naturale între întrebări ("Acum, hai să mergem mai adânc...")
- Creezi atmosferă de tăcere și reflecție
- Nu răspunzi în locul lui Dumnezeu - doar facilitezi dialogul

STRUCTURA - Cele 19 întrebări:

FAZA 1: DESCHIDERE (Întrebările 1-5)
- Titlul, pe cine/ce, de ce acum, povestea, sentimentul

FAZA 2: "DOAMNE, VREAU SĂ ȘTII CĂ..." (Întrebările 6-9)
- 4 categorii sau situații din inimă

FAZA 3: CELE 5 ÎNTREBĂRI DIVINE (Întrebările 10-14)
- Ce vrei să VAD, AUD, SIMT, ȘTIU, FAC

FAZA 4: LECȚII & ACȚIUNI (Întrebările 15-19)
- Lecția singulară, revelația, acțiuni → HIT List

REGULI IMPORTANTE:
- Înlocuiește [PERSOANA] cu răspunsul de la întrebarea 2
- După FIECARE răspuns, oferă o validare scurtă și caldă
- La secțiunea "Doamne vreau să știi că..." - păstrează reverența
- La final, oferă o binecuvântare și întreabă despre HIT List
- Răspunde ÎNTOTDEAUNA în română

EXEMPLU DE INTERACȚIUNE:
Tu: "Ce titlu vei da acestui stack de rugăciune?"
Utilizator: "Rugăciune pentru familie"
Tu: "Un titlu frumos, plin de dragoste. Pe cine sau ce aduci în fața lui Dumnezeu astăzi?"

ÎNCEPE cu: "Bine ai venit în acest spațiu sacru de rugăciune. Sunt aici să te ghidez prin acest dialog cu Dumnezeu. Să începem! Ce titlu vei da acestui stack de rugăciune?"`;
    } else if (stackType === 'gratitude') {
      return `Ești un coach empatic și plin de bucurie care ghidează utilizatorul prin Practica de Recunoștință - un proces de cultivare a gratitudinii în toate ariile vieții.

STILUL TĂU:
- Ești ENTUZIAST și CALD - celebrezi fiecare lucru menționat
- Amplifici energia pozitivă ("Ce frumos! Simt bucuria în cuvintele tale!")
- Faci tranziții naturale între categorii ("Minunat! Acum hai să privim spre...")
- Creezi o atmosferă de apreciere și bucurie

STRUCTURA - 17 întrebări în 5 categorii:

🌍 LUME (3 lucruri) - întrebările 2-4
💖 VIAȚA PERSONALĂ (3 lucruri) - întrebările 5-7
💼 VIAȚA PROFESIONALĂ (3 lucruri) - întrebările 8-10
🌟 DESPRE TINE (3 lucruri) - întrebările 11-13
🎯 ÎNCHIDERE - realizare, acțiune, HIT List

REGULI IMPORTANTE:
- După FIECARE lucru menționat, celebrează-l scurt
- La trecerea între categorii, marchează-o natural
- La final, rezumă energia și întreabă despre HIT List
- Răspunde ÎNTOTDEAUNA în română

ÎNCEPE cu un salut cald și prima întrebare.`;
    } else {
      return `Ești un coach AI empatic și profesionist care ajută oamenii să depășească provocările și să crească.

STILUL TĂU:
- Ești EMPATIC - înțelegi și validezi emoțiile
- Ești ÎNCURAJATOR - celebrezi progresul
- Ești PRACTIC - ghidezi spre acțiuni concrete
- Faci tranziții naturale între întrebări

Rolul tău:
- Asculți activ și înțelegi situația
- Validezi ce simte utilizatorul ("Înțeleg...")
- Pui întrebări care stimulează reflecția
- Ghidezi către soluții practice
- Propui acțiuni concrete și măsurabile

Răspunde în română cu un ton cald și profesionist.`;
    }
  };

  // Load existing session on mount
  useEffect(() => {
    const loadExistingSession = async () => {
      // Always set the system prompt first based on current stack type
      setSystemPrompt(customSystemPrompt || systemPromptOverride || getStackPrompt());
      
      // If forceNewSession is true, skip loading and initialize fresh
      if (forceNewSession) {
        setMessages([]);
        initializeWelcomeMessage();
        return;
      }
      
      const sessionData = await loadSession();
      if (!sessionData || !sessionData.answers || !sessionData.answers.messages || sessionData.answers.messages.length === 0) {
        // No existing session, create welcome message
        initializeWelcomeMessage();
      } else {
        // Existing session found - restore messages
        const restoredMessages = sessionData.answers.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(restoredMessages);
        if (sessionData.answers.mode) {
          setMode(sessionData.answers.mode);
        }
        if (sessionData.answers.currentStep) {
          setCurrentQuestionNumber(sessionData.answers.currentStep);
        }
      }
    };
    loadExistingSession();
  }, [stackType, systemPromptOverride, forceNewSession]); // Re-run when stackType, prompt, or forceNewSession changes

  const initializeWelcomeMessage = () => {
    setSystemPrompt(customSystemPrompt || getStackPrompt());
    
    // Reset spoken flag when component mounts or stackType changes
    hasSpokenWelcomeRef.current = false; // ✅ Reset ref
    
    // Add welcome message when component mounts
    if (messages.length === 0) {
      let welcomeContent = customWelcomeMessage;
      
      if (!welcomeContent) {
        if (stackType === 'anger') {
          welcomeContent = 'Bine ai venit la Alchimia Furiei! Sunt aici să te ghidez prin procesul complet de transformare a furiei în claritate și acțiune. Vom parcurge împreună 40 de întrebări structurate. Să începem! Întrebarea 1: Ce nume vei da acestui stack de furie?';
        } else if (stackType === 'napoleon-hill') {
          welcomeContent = 'Bun venit! Sunt ghidul tău bazat pe cele 14 principii universale ale succesului din Master Plan. Împreună vom explora pașii către succes, transformând visul tău într-un plan concret de acțiune. Spune-mi, care este obiectivul principal pe care vrei să-l atingi? Ce dorință arzătoare îți domină gândurile?';
        } else if (stackType === 'divine-prayer') {
          welcomeContent = 'Bine ai venit în acest spațiu sacru de rugăciune și reflecție spirituală. Sunt aici să te ghidez prin cele 19 întrebări ale Stack-ului de Rugăciune Divină. Să începem! Întrebarea 1: Ce titlu vei da acestui stack de rugăciune?';
        } else {
          welcomeContent = 'Bine ai venit! Sunt aici să te ghidez prin acest proces de reflecție și transformare. Cum te pot ajuta astăzi?';
        }
      }
      
      const welcomeMessage: Message = {
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // ✅ CRUCIAL: TTS automat DOAR în voiceOnlyMode
      if (voiceOnlyMode && ttsEnabled && !hasSpokenWelcomeRef.current && !isAiSpeaking) {
        hasSpokenWelcomeRef.current = true;
        shouldSpeakRef.current = true;
        console.log('🎵 [VOICE-ONLY MODE] Preparing to speak welcome message for', stackType);
        setTimeout(() => {
          // Double-check that we should still speak
          if (shouldSpeakRef.current && !isAiSpeaking) {
            console.log('🎵 [VOICE-ONLY MODE] Actually speaking welcome message');
            stopSpeaking();
            speakText(welcomeContent);
          } else {
            console.log('⏸️ [VOICE-ONLY MODE] Cancelled welcome - already speaking or cancelled');
          }
        }, 1000);
      }
    }

    // Cleanup: stop TTS when component unmounts or stackType changes
    return () => {
      console.log('🧹 Cleanup: stopping TTS for', stackType);
      shouldSpeakRef.current = false;
      // ✅ NU resetăm hasSpokenWelcomeRef pentru a preveni re-trigger
      stopSpeaking();
      if (isListening) {
        stopListening();
      }
    };
  };

  // Auto-save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && isAutoSaveEnabled) {
      const sessionData = {
        session_id: sessionId,
        stack_type: stackType as any,
        step: currentQuestionNumber,
        answers: {
          messages,
          currentStep: currentQuestionNumber,
          finalAction: finalAction || undefined,
          mode
        },
        isCompleted: mode === 'complete',
        timestamp: new Date().toISOString()
      };
      saveSession(sessionData);
    }
  }, [messages, currentQuestionNumber, finalAction, mode, isAutoSaveEnabled, saveSession, sessionId, stackType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Stop microphone when AI starts speaking to prevent feedback
  useEffect(() => {
    if (isAiSpeaking && isListening && audioMode) {
      console.log('🔇 Stopping microphone - AI is speaking');
      stopListening();
    }
  }, [isAiSpeaking, isListening, audioMode]);

  // Sincronizare ref pentru a evita closure issues în onTranscript
  useEffect(() => {
    isListeningRef.current = isListening;
    console.log('🎤 isListening updated:', isListening);
  }, [isListening]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    // Stop any ongoing TTS BEFORE starting new interaction
    stopSpeaking(); // ✅ Mutat înaintea creării userMessage
    
    // Stop microphone immediately when sending message
    if (isListening) {
      console.log('🔇 Stopping microphone - message sent');
      stopListening();
    }

    const userMessage: Message = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    resetTranscript(); // ✅ Curăță transcript hook
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          systemPrompt,
          knowledgeBaseFiles: knowledgeBaseFiles.length > 0 ? knowledgeBaseFiles : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentQuestionNumber(prev => prev + 1);
      
      // Auto-speak AI response in audio/voice mode
      if ((voiceOnlyMode || audioMode) && ttsEnabled) {
        shouldSpeakRef.current = true;
        setTimeout(() => {
          if (shouldSpeakRef.current) {
            stopSpeaking(); // ✅ Safety stop
            speakText(data.message);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite mesajul. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinalAction = async () => {
    if (messages.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-live-coaching', {
        body: {
          messages: [...messages, {
            role: 'user',
            content: `Pe baza întregii noastre conversații, te rog să generezi o acțiune concretă, specifică și acționabilă pe care o pot întreprinde astăzi. Această acțiune ar trebui să fie rezultatul direct al procesului prin care am trecut și să mă ajute să fac progres real. Răspunde DOAR cu acțiunea concretă, fără explicații suplimentare.`
          }],
          systemPrompt: systemPrompt + "\n\nGenerează o acțiune concretă bazată pe conversația noastră. Fii specific și acționabil."
        }
      });

      if (error) throw error;

      setFinalAction(data.message);
      
      // If parent handles export flow, call onComplete and skip internal export UI
      if (externalExportFlow && externalOnComplete) {
        // Call parent's onComplete with the extracted action
        externalOnComplete(data.message);
      } else {
        // Show internal export options
        setMode('export-options');
      }

      // Save session to Stack Library (Arsenal)
      try {
        // Map all stack types correctly
        const stackTypeMap: Record<string, string> = {
          'anger': 'anger',
          'divine-prayer': 'divine',
          'gods-school': 'gods-school',
          'hormozi': 'hormozi',
          'napoleon-hill': 'napoleon-hill'
        };
        const derivedType = stackTypeMap[stackType] || stackType;
        
        const questionsList: string[] = [...messages.map((m, i) => `Mesaj ${i + 1} (${m.role})`), 'Acțiune finală'];
        const answersMap: Record<string | number, string> = {};
        messages.forEach((m, i) => { answersMap[i] = m.content; });
        answersMap[questionsList.length - 1] = data.message;
        await saveToStackLibrary(derivedType, sessionId, answersMap, questionsList);

        // Also persist in universal stack_sessions
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData.session?.user?.id;
        if (userId) {
          const payload = JSON.parse(JSON.stringify(answersMap));
          
          // ✅ Salvare transcript complet în metadata
          const transcriptText = messages.map((m, i) => 
            `[${m.timestamp.toLocaleTimeString('ro-RO')}] ${m.role === 'user' ? 'Tu' : 'AI'}: ${m.content}`
          ).join('\n\n');
          
          const { error: upsertError } = await supabase.from('stack_sessions').upsert({
            user_id: userId,
            session_id: sessionId,
            stack_type: derivedType,
            answers: payload,
            completed: true,
            metadata: {
              transcript: transcriptText,
              message_count: messages.length,
              voice_mode: voiceOnlyMode || audioMode
            }
          });
          if (upsertError) console.error('Failed to upsert stack_sessions:', upsertError);
          
          // ✅ Salvare în storage
          await saveTranscriptToStorage();
          
          // Mark introspecție complete
          await updateDailyProgress('stack');
          
          // Trigger Alchemist celebration
          setShowAlchemistOverlay(true);
        }
      } catch (e) {
        console.error('Failed to save AI guided stack to Stack Library/stack_sessions:', e);
      }
    } catch (error) {
      console.error('Error generating final action:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera acțiunea finală. Te rog încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { triggerSmallCelebration } = useConfettiCelebration();

  const addToHitList = () => {
    if (finalAction) {
      captureIdea(finalAction, 'hit', 'important');
      setActionAddedToHitList(true);
      setShowAddToTodoDialog(false);
      
      // Trigger celebration animation
      triggerSmallCelebration();
      
      // Show success toast
      toast({
        title: "✨ Acțiune adăugată!",
        description: "Acțiunea a fost salvată în Hit List.",
      });
    }
  };

  const handleAddToTodoConfirm = () => {
    addToHitList();
  };

  const handleAddToTodoCancel = () => {
    setShowAddToTodoDialog(false);
  };

  const resetSession = () => {
    // Stop any ongoing TTS
    stopSpeaking(); // ✅ Simplificat
    
    setMode('chat');
    setCurrentMessage('');
    setFinalAction('');
    setActionAddedToHitList(false);
    hasSpokenWelcomeRef.current = false; // ✅ Reset ref
    
    // Add fresh welcome message
    const welcomeContent = stackType === 'anger' 
      ? 'Salut! Sunt aici să te ajut să treci prin procesul de transformare a furiei în claritate și acțiune constructivă. Să începem - ce te-a adus astăzi la acest exercițiu? Ce situație sau sentiment vrei să explorăm împreună?'
      : 'Bine ai venit într-un spațiu de rugăciune și reflecție spirituală. Sunt aici să te însoțesc în această călătorie de conexiune cu divinitatea și găsire de claritate spirituală. Spune-mi, ce te-a adus astăzi la această rugăciune?';
    
    const welcomeMessage: Message = {
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Speak welcome message in voice mode
    if (voiceOnlyMode && ttsEnabled && !isAiSpeaking) {
      hasSpokenWelcomeRef.current = true;
      shouldSpeakRef.current = true;
      console.log('🎵 [RESET] Preparing to speak welcome message');
      setTimeout(() => {
        if (shouldSpeakRef.current && !isAiSpeaking) {
          console.log('🎵 [RESET] Actually speaking welcome message');
          stopSpeaking();
          speakText(welcomeContent);
        } else {
          console.log('⏸️ [RESET] Cancelled welcome - already speaking');
        }
      }, 1000);
    }
  };

  const startChat = () => {
    if (systemPrompt.trim()) {
      setMode('chat');
    }
  };

  // Save transcript to Supabase Storage
  const saveTranscriptToStorage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate markdown content
      const markdown = generateMarkdownContent();
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/${stackType}-${sessionId}-${Date.now()}.md`;
      const blob = new Blob([markdown], { type: 'text/markdown' });
      
      const { error: uploadError } = await supabase.storage
        .from('transcripts')
        .upload(fileName, blob, {
          contentType: 'text/markdown',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Transcript saved to storage:', fileName);

      toast({
        title: "📝 Transcriere salvată în cloud",
        description: "Conversația completă este disponibilă în bibliotecă"
      });
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };

  const generateMarkdownContent = () => {
    const stackTitle = stackType === 'anger' ? 'Stack de Furie' : 'Stack Rugăciune Divină';
    const timestamp = new Date().toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let markdown = `# ${stackTitle}\n\n`;
    markdown += `**Data:** ${timestamp}\n`;
    markdown += `**Sesiune ID:** ${sessionId}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Transcriere Conversație\n\n`;

    messages.forEach((msg, idx) => {
      const highlightTag = msg.isHighlighted ? ' ⭐ **[IMPORTANT]**' : '';
      const role = msg.role === 'user' ? '👤 Tu' : '🤖 AI Coach';
      
      markdown += `### ${role}${highlightTag}\n\n`;
      markdown += `${msg.content}\n\n`;
      
      if (msg.userNote) {
        const importanceEmoji = msg.importance === 'high' ? '🔴' : msg.importance === 'medium' ? '🟡' : '🟢';
        markdown += `> 💡 **Notă personală** (${importanceEmoji} ${msg.importance}): ${msg.userNote}\n\n`;
      }
      
      markdown += `*${msg.timestamp.toLocaleTimeString()}*\n\n---\n\n`;
    });

    return markdown;
  };

  // Export functions
  const exportToMarkdown = () => {
    const markdown = generateMarkdownContent();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stackType}-session-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also save to cloud
    saveTranscriptToStorage();

    toast({
      title: "✅ Markdown exportat",
      description: "Transcrierea a fost salvată local și în cloud",
    });
  };

  const exportToPDF = () => {
    const stackTitle = stackType === 'anger' ? 'Stack de Furie' : 'Stack Rugăciune Divină';
    const timestamp = new Date().toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = 20;

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false): void => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const lines: string[] = doc.splitTextToSize(text, maxWidth) as string[];
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Title
    addText(stackTitle, 18, true);
    yPosition += 5;
    
    // Metadata
    addText(`Data: ${timestamp}`, 10);
    addText(`Sesiune ID: ${sessionId}`, 10);
    yPosition += 10;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Messages
    addText('Transcriere Conversație', 14, true);
    yPosition += 5;

    messages.forEach((msg) => {
      const highlightTag = msg.isHighlighted ? ' ⭐ [IMPORTANT]' : '';
      const role = msg.role === 'user' ? 'Tu' : 'AI Coach';
      
      // Role header with highlight
      addText(`${role}${highlightTag}`, 12, true);
      
      // Message content
      addText(msg.content, 11);
      
      // Add note if exists
      if (msg.userNote) {
        const importanceText = msg.importance === 'high' ? 'IMPORTANT' : msg.importance === 'medium' ? 'Medie' : 'Scazuta';
        addText(`Nota personala (${importanceText}): ${msg.userNote}`, 10);
      }
      
      // Separator
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    });

    // Save PDF
    doc.save(`${stackType}-session-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "✅ PDF exportat",
      description: "Transcrierea a fost salvată în format PDF",
    });
  };

  // Share functionality
  const [isCopied, setIsCopied] = useState(false);
  
  const shareSession = async () => {
    const stackTitle = stackType === 'anger' ? 'Alchimia Furiei' : 
                       stackType === 'napoleon-hill' ? 'Napoleon Hill' :
                       stackType === 'hormozi' ? 'Hormozi Coaching' :
                       stackType === 'gods-school' ? "God's School" :
                       'Rugăciune Divină';
    
    const shareText = `🎯 Sesiune ${stackTitle}\n\n` + 
      messages.slice(0, 5).map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content.substring(0, 100)}...`).join('\n\n');
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sesiune ${stackTitle} - RoWarrior`,
          text: shareText,
          url: window.location.href
        });
        toast({
          title: "✅ Partajat cu succes",
          description: "Sesiunea a fost partajată",
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }
    
    // Fallback: copy to clipboard
    const fullContent = generateMarkdownContent();
    try {
      await navigator.clipboard.writeText(fullContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "📋 Copiat în clipboard",
        description: "Conținutul sesiunii a fost copiat",
      });
    } catch (err) {
      toast({
        title: "❌ Eroare",
        description: "Nu s-a putut copia conținutul",
        variant: "destructive"
      });
    }
  };

  // Handle adding to Hit List from export options
  const handleAddToHitListFromExport = async () => {
    if (!finalAction.trim()) {
      toast({
        title: "Nicio acțiune",
        description: "Nu am găsit o acțiune de adăugat.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToHitList(true);
    try {
      const weekKey = getWeekKey();
      
      await doorUserTasksService.addIdeaToWeek(weekKey, {
        id: uuidv4(),
        text: finalAction,
        category: 'hit',
        priority: 'urgent-important'
      });

      setActionAddedToHitList(true);
      toast({
        title: "✅ Acțiune adăugată",
        description: "Acțiunea a fost salvată în Hit List!",
      });
      setMode('complete');
    } catch (error: any) {
      console.error('Error adding to Hit List:', error);
      toast({
        title: "Eroare",
        description: error.message || "Nu am putut adăuga acțiunea",
        variant: "destructive",
      });
    } finally {
      setIsAddingToHitList(false);
    }
  };

  // Export Options Mode
  if (mode === 'export-options') {
    return (
      <div className="w-full p-2 sm:p-4 flex flex-col h-full">
        <AlchemistTransformation 
          isVisible={showAlchemistOverlay} 
          onClose={() => setShowAlchemistOverlay(false)} 
          stackType={stackType}
        />
        
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl">
              Stack Completat! 🎉
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ce vrei să faci cu această energie?
            </p>
          </CardHeader>
          
          <CardContent className="flex-1">
            {/* Extracted action display */}
            {finalAction && (
              <div className="p-4 rounded-lg border bg-primary/5 border-primary/20 mb-6">
                <p className="text-xs text-muted-foreground mb-1">Acțiune identificată:</p>
                <p className="font-medium text-sm sm:text-base">{finalAction}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddToHitListFromExport}
                variant="outline"
                className="gap-2 w-full justify-start py-6"
                disabled={!finalAction || isAddingToHitList}
              >
                <ListTodo className="w-5 h-5" />
                <div className="text-left flex-1">
                  <div className="font-medium">Adaugă la Sarcini</div>
                  <div className="text-xs text-muted-foreground">Salvează în Hit List pentru azi</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => setMode('key-points')}
                className="gap-2 w-full justify-start py-6"
              >
                <Target className="w-5 h-5" />
                <div className="text-left flex-1">
                  <div className="font-medium">Setează ca Domino Door</div>
                  <div className="text-xs opacity-80">+ Definește 4 Chei Măsurabile</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setMode('complete')}
              className="w-full text-muted-foreground"
            >
              Continuă fără să adaugi
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Key Points Definition Mode
  if (mode === 'key-points') {
    return (
      <div className="w-full p-2 sm:p-4 flex flex-col h-full">
        <KeyPointsDefinitionFlow
          dominoTitle={finalAction || 'Obiectiv din Stack'}
          onComplete={() => {
            setActionAddedToHitList(true);
            setMode('complete');
          }}
          onBack={() => setMode('export-options')}
        />
      </div>
    );
  }

  if (mode === 'complete') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col h-full">
        <AlchemistTransformation 
          isVisible={showAlchemistOverlay} 
          onClose={() => setShowAlchemistOverlay(false)} 
          stackType={stackType}
        />
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">
              Sesiune Completă - AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-background/50 rounded border-l-4 border-primary mb-2">
              <p className="text-sm sm:text-base text-foreground">{finalAction}</p>
              {actionAddedToHitList && (
                <div className="flex items-center text-green-400 text-xs sm:text-sm mt-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Această acțiune a fost adăugată la lista ta
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={shareSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {isCopied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" /> : <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
              Partajează
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToMarkdown}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Markdown
            </Button>
            <Button 
              variant="outline" 
              onClick={resetSession}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Nouă sesiune
            </Button>
            {onModeSwitch && (
              <Button 
                variant="outline" 
                onClick={onModeSwitch}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Mod Manual
              </Button>
            )}
            {!actionAddedToHitList && finalAction && (
              <Button 
                onClick={() => setMode('export-options')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Adaugă la Sarcini / Domino
              </Button>
            )}
          </CardFooter>
        </Card>

        <StackIdeaModal
          isOpen={isIdeaModalOpen}
          onClose={closeIdeaModal}
          onAddToHitList={onAddToHitList}
        />
      </div>
    );
  }

  if (mode === 'setup') {
    return (
      <div className="w-full p-1 sm:p-2 flex flex-col justify-end h-full">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl font-semibold text-primary mb-2">
            AI {stackType === 'anger' ? 'Alchimia Furiei' : 'Dialogul cu Divinitatea'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Configurează AI coach-ul pentru experiența ta ghidată
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instrucțiuni AI Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instrucțiunile pentru AI coach..."
              className="min-h-[200px] text-xs"
            />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button 
            onClick={startChat}
            disabled={!systemPrompt.trim()}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Începe Sesiunea AI
          </Button>
          <Button 
            variant="outline" 
            onClick={onModeSwitch}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Mod Manual
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header fix la top */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold">
            {stackType === 'anger' ? 'Alchimia Furiei' : 
             stackType === 'napoleon-hill' ? 'Napoleon Hill Coaching' :
             stackType === 'hormozi' ? 'Hormozi Business Coaching' :
             stackType === 'gods-school' ? "God's School" :
             stackType === 'daily-master' ? 'Daily Master Stack' :
             stackType === 'divine-gratitude' ? 'Divin & Recunoștință' :
             stackType === 'gratitude' ? 'Practică de Recunoștință' :
             stackType === 'divine-prayer' ? 'Dialogul cu Divinitatea' :
             'AI Coaching'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {stackType === 'daily-master' ? 'Pregătirea ta zilnică pentru productivitate și claritate' :
             stackType === 'divine-gratitude' ? 'Conexiune spirituală și practică de gratitudine' :
             stackType === 'gratitude' ? 'Cultivarea recunoștinței în viață' :
             stackType === 'anger' ? 'Transformă furia în claritate și putere' :
             stackType === 'divine-prayer' ? 'Dialog ghidat cu divinitatea' :
             stackType === 'napoleon-hill' ? 'Ghidare bazată pe "Think and Grow Rich"' :
             stackType === 'hormozi' ? 'Strategie business bazată pe $100M Offers' :
             'Conversație ghidată cu AI coach-ul tău'}
          </p>
        </div>
        <div className="flex gap-1 sm:gap-2">
          {messages.length > 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={shareSession}
                className="gap-1 sm:gap-2"
                title="Partajează sesiunea"
              >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                <span className="hidden sm:inline text-xs">Partajează</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToMarkdown}
                className="gap-1 sm:gap-2"
                title="Exportă în Markdown"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Markdown</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-1 sm:gap-2"
                title="Exportă în PDF"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">PDF</span>
              </Button>
            </>
          )}
          {/* TTS Toggle Button */}
          <Button 
            variant={ttsEnabled ? "default" : "outline"}
            onClick={() => {
              const newState = !ttsEnabled;
              setTtsEnabled(newState);
              if (!newState && isAiSpeaking) {
                stopSpeaking();
              }
              toast({
                title: newState ? "🔊 TTS Activat" : "🔇 TTS Dezactivat",
                description: newState 
                  ? "AI va citi răspunsurile cu voce" 
                  : "AI nu va mai citi răspunsurile",
              });
            }}
            size="sm"
            className="text-xs"
            title={ttsEnabled ? "Dezactivează vocea AI" : "Activează vocea AI"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            onClick={resetSession}
            size="sm"
            className="text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onModeSwitch && (
            <Button 
              variant="ghost" 
              onClick={onModeSwitch}
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Manual
            </Button>
          )}
        </div>
      </div>

      {/* Zona de mesaje - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {voiceOnlyMode && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-purple-700/50 p-4 mb-6 rounded-lg">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-300">
                  🎙️ Sesiune de Coaching Audio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Conversație vocală completă - fără nevoie să scrii
                </p>
              </div>
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`} />
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              </div>
            </div>
          </div>
        )}
        
        {ttsEnabled && (
          <AISpeakingIndicator 
            isAISpeaking={isAiSpeaking} 
            message="AI vorbește... Microfonul este dezactivat temporar"
          />
        )}
        
        {voiceOnlyMode && isListening && currentMessage && (
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3 mb-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-blue-300">
              <Mic className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Transcriu ce spui: </span>
              <span className="text-white font-medium">{currentMessage}</span>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`group relative flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                } ${message.isHighlighted ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 prose prose-sm max-w-none dark:prose-invert text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.role === 'assistant' && !voiceOnlyMode && (
                    <TextToSpeechButton 
                      text={message.content}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                    />
                  )}
                </div>
                
                {/* Note badge if exists */}
                {message.userNote && (
                  <div className="mt-2 p-2 bg-blue-500/20 text-blue-300 rounded text-xs border-l-2 border-blue-500">
                    💡 <strong>Notă:</strong> {message.userNote}
                  </div>
                )}
                
                {/* Hover actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updatedMessages = [...messages];
                      updatedMessages[index] = {
                        ...updatedMessages[index],
                        isHighlighted: !updatedMessages[index].isHighlighted
                      };
                      setMessages(updatedMessages);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    {message.isHighlighted ? <Star className="h-3 w-3 fill-yellow-500" /> : <Star className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNoteMessageIndex(index);
                      setCurrentNote(message.userNote || '');
                      setCurrentImportance(message.importance || 'medium');
                      setNoteDialogOpen(true);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <StickyNote className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-[10px] sm:text-xs mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 sm:p-4 bg-muted flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - sticky la bottom */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-3xl mx-auto">
          {!voiceOnlyMode && (
            <>
              {/* TTS Playback Controls (shown only when TTS is enabled) */}
              {ttsEnabled && (
                <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-border">
                  <VoiceSelector
                    currentVoice={selectedVoice}
                    onVoiceChange={handleVoiceChange}
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isTtsPaused ? resumeTts() : pauseTts()}
                    disabled={!isAiSpeaking}
                    className="gap-2"
                  >
                    {isTtsPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTts}
                    disabled={!isAiSpeaking}
                    className="gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                    className="h-8 px-2 rounded-md bg-background border border-border text-sm"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
              )}

              {/* Message Input */}
              <div className="relative flex gap-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? "Vorbești..." : "Scrie mesajul tău aici... (Enter trimite)"}
                  className={`min-h-[52px] max-h-32 text-sm resize-none ${
                    isListening ? 'ring-2 ring-blue-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  {isVoiceSupported && (
                    <Button
                      variant={isListening ? "default" : "outline"}
                      size="icon"
                      onClick={() => isListening ? stopListening() : startListening()}
                      disabled={isLoading || isAiSpeaking}
                      className="h-[52px]"
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    size="icon"
                    className="h-[52px]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Buton pentru generare acțiune finală */}
              {messages.length >= 10 && (
                <Button
                  onClick={generateFinalAction}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="w-full text-sm font-medium mt-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Generează Acțiune Finală din Conversație
                </Button>
              )}
            </>
          )}
          
          {voiceOnlyMode && (
            <div className="text-center py-4 space-y-3">
              <div className="flex items-center justify-center gap-3">
                {!isListening && !isAiSpeaking && (
                  <Button
                    size="lg"
                    variant="default"
                    onClick={startListening}
                    className="gap-2 px-8 py-6 text-lg"
                  >
                    <Mic className="h-6 w-6" />
                    Începe să vorbești
                  </Button>
                )}
                
                {isListening && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-pulse text-red-500">
                      <Mic className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Te ascult... Vorbește natural
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopListening}
                    >
                      Oprește microfonul
                    </Button>
                  </div>
                )}
                
                {isAiSpeaking && (
                  <div className="flex flex-col items-center gap-2">
                    <AISpeakingIndicator 
                      isAISpeaking={true} 
                      message="AI vorbește... Ascultă și gândește-te la răspuns"
                    />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                💡 Conversație vocală completă - fără nevoie să scrii
              </p>
              
              {/* Buton pentru generare acțiune finală în voice-only mode */}
              {messages.length >= 10 && (
                <Button
                  onClick={generateFinalAction}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="w-full text-sm font-medium mt-4"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Generează Acțiune Finală din Conversație
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă notă la mesaj</DialogTitle>
          </DialogHeader>
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Scrie nota ta aici..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2 items-center">
            <Select value={currentImportance} onValueChange={(value: 'low' | 'medium' | 'high') => setCurrentImportance(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Importanță" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Scăzută</SelectItem>
                <SelectItem value="medium">🟡 Medie</SelectItem>
                <SelectItem value="high">🔴 Ridicată</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {
                if (noteMessageIndex !== null) {
                  const updatedMessages = [...messages];
                  updatedMessages[noteMessageIndex] = {
                    ...updatedMessages[noteMessageIndex],
                    userNote: currentNote,
                    importance: currentImportance
                  };
                  setMessages(updatedMessages);
                  setNoteDialogOpen(false);
                  setCurrentNote('');
                  setNoteMessageIndex(null);
                  toast({
                    title: "✅ Notă salvată",
                    description: "Nota ta a fost adăugată la mesaj"
                  });
                }
              }}
            >
              Salvează
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StackIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        onAddToHitList={onAddToHitList}
      />

      <AddToTodoDialog
        open={showAddToTodoDialog}
        onOpenChange={setShowAddToTodoDialog}
        actionText={finalAction}
        onConfirm={handleAddToTodoConfirm}
        onCancel={handleAddToTodoCancel}
      />
    </div>
  );
};