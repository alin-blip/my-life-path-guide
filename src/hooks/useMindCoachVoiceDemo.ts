import { useCallback, useRef, useEffect } from 'react';
import { useVoiceConversationDemo } from './useVoiceConversationDemo';
import { useVoiceInput } from './useVoiceInput';

interface UseMindCoachVoiceDemoOptions {
  onUserMessage: (text: string) => void;
  onAIResponse?: (text: string) => void;
  language: 'ro' | 'en';
  voiceId?: string;
  silenceThreshold?: number;
  playbackRate?: number;
}

export const useMindCoachVoiceDemo = (options: UseMindCoachVoiceDemoOptions) => {
  const {
    onUserMessage,
    onAIResponse,
    language,
    voiceId = 'EXAVITQu4vr4xnSDxMaL', // Sarah - natural Romanian/multilingual
    silenceThreshold = 3000,
    playbackRate = 1.15
  } = options;

  const onUserMessageRef = useRef(onUserMessage);
  const accumulatedTextRef = useRef('');

  // Keep callback ref updated
  useEffect(() => {
    onUserMessageRef.current = onUserMessage;
  }, [onUserMessage]);

  // Voice conversation hook for Call mode (uses demo TTS - no auth required)
  const voiceConversation = useVoiceConversationDemo({
    onUserMessage: (text) => {
      console.log('📞 Demo Call mode - user said:', text);
      onUserMessageRef.current(text);
    },
    onAIResponse,
    silenceThreshold,
    autoStartDelay: 1500,
    language: language === 'ro' ? 'ro-RO' : 'en-US',
    voiceId,
    playbackRate
  });

  // Voice input hook for Speak (push-to-talk) mode
  const voiceInput = useVoiceInput({
    onTranscript: (text) => {
      console.log('🎤 Demo Speak mode - transcript:', text);
      accumulatedTextRef.current += ' ' + text;
    },
    onMicStop: () => {
      const finalText = accumulatedTextRef.current.trim();
      if (finalText) {
        console.log('🎤 Demo Speak mode - sending:', finalText);
        onUserMessageRef.current(finalText);
        accumulatedTextRef.current = '';
      }
    },
    voiceLanguage: language === 'ro' ? 'ro-RO' : 'en-US',
    enabled: true
  });

  // Speak button press handlers
  const handleSpeakStart = useCallback(() => {
    accumulatedTextRef.current = '';
    voiceInput.startVoice();
  }, [voiceInput]);

  const handleSpeakStop = useCallback(() => {
    voiceInput.stopVoice();
    // onMicStop callback will handle sending the message
  }, [voiceInput]);

  // Call mode controls
  const startCall = useCallback((initialMessage?: string) => {
    console.log('📞 Starting demo call mode');
    voiceConversation.startConversation();
    
    // If there's an initial message, speak it first, then start listening
    if (initialMessage) {
      console.log('📞 Speaking initial message:', initialMessage);
      setTimeout(() => {
        voiceConversation.speakAI(initialMessage);
      }, 300);
    } else {
      // No initial message - start listening immediately
      setTimeout(() => {
        if (voiceConversation.startListening) {
          console.log('📞 Auto-starting listening in demo call mode');
          voiceConversation.startListening();
        }
      }, 500);
    }
  }, [voiceConversation]);

  const endCall = useCallback(() => {
    console.log('📞 Ending demo call mode');
    voiceConversation.stopConversation();
  }, [voiceConversation]);

  const speakAIResponse = useCallback((text: string) => {
    if (voiceConversation.isActive) {
      voiceConversation.speakAI(text);
    }
  }, [voiceConversation]);

  const skipAISpeaking = useCallback(() => {
    voiceConversation.skipAISpeaking();
  }, [voiceConversation]);

  const manualSendInCall = useCallback(() => {
    voiceConversation.manualSend();
  }, [voiceConversation]);

  // Start listening manually in call mode
  const startListeningInCall = useCallback(() => {
    if (voiceConversation.isActive && !voiceConversation.isAISpeaking) {
      voiceConversation.startListening?.();
    }
  }, [voiceConversation.isActive, voiceConversation.isAISpeaking, voiceConversation.startListening]);

  return {
    // Speak mode (push-to-talk)
    isSpeaking: voiceInput.isMicOn,
    isUserSpeaking: voiceInput.isUserSpeaking,
    handleSpeakStart,
    handleSpeakStop,

    // Call mode
    isInCall: voiceConversation.isActive,
    isAISpeaking: voiceConversation.isAISpeaking,
    isListening: voiceConversation.isListening,
    isProcessing: voiceConversation.isProcessing,
    isTTSLoading: voiceConversation.isTTSLoading,
    currentTranscript: voiceConversation.currentTranscript,
    silenceTimer: voiceConversation.silenceTimer,
    audioLevel: voiceConversation.audioLevel,
    startCall,
    endCall,
    speakAIResponse,
    skipAISpeaking,
    manualSendInCall,
    startListeningInCall,

    // Language
    voiceLanguage: voiceInput.voiceLanguage,
    changeVoiceLanguage: voiceInput.changeVoiceLanguage
  };
};

