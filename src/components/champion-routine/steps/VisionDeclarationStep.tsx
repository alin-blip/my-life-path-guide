import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, ArrowRight, Volume2, Check, ExternalLink, Loader2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface VisionData {
  vision_body?: string | null;
  vision_spirit?: string | null;
  vision_relationships?: string | null;
  vision_business?: string | null;
  vision_declaration?: string | null;
  target_date?: string | null;
  what_i_will_give?: string | null;
}

interface VisionDeclarationStepProps {
  completed: boolean;
  onComplete: (value: boolean) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export const VisionDeclarationStep: React.FC<VisionDeclarationStepProps> = ({
  completed,
  onComplete,
  onNext,
  onSkip
}) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const navigate = useNavigate();
  const [visionData, setVisionData] = useState<VisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVisionData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('challenge_day1_responses')
          .select('vision_body, vision_spirit, vision_relationships, vision_business, vision_declaration, target_date, what_i_will_give')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setVisionData(data);
        }
      } catch (error) {
        console.error('Error fetching vision data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisionData();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handleElevenLabsTTS = async () => {
    if (!visionData?.vision_declaration) return;
    
    // If already playing, stop
    if (isSpeaking && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeaking(false);
      return;
    }

    setIsGeneratingAudio(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: visionData.vision_declaration,
            // Using Romanian-friendly voice
            voiceId: 'onwK4e9ZLuTAKqWW03F9' // Daniel - good for Romanian
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        toast.error(isRo ? 'Eroare la redare audio' : 'Audio playback error');
      };
      
      await audio.play();
      setIsSpeaking(true);
      
    } catch (error) {
      console.error('TTS error:', error);
      toast.error(isRo ? 'Eroare la generare audio. Se folosește vocea browser-ului.' : 'Audio generation error. Using browser voice.');
      // Fallback to browser TTS
      handleBrowserTTS();
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleBrowserTTS = () => {
    if (!visionData?.vision_declaration) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(visionData.vision_declaration);
    utterance.lang = isRo ? 'ro-RO' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleMarkAsRead = () => {
    onComplete(true);
    onNext();
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  const hasVision = visionData?.vision_declaration || 
    (visionData?.vision_body && visionData?.vision_spirit && 
     visionData?.vision_relationships && visionData?.vision_business);

  // If no vision exists, show CTA to create one
  if (!hasVision) {
    return (
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto">
            <ScrollText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRo ? 'Declarația Mea de Viziune' : 'My Vision Declaration'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isRo 
              ? 'Nu ai încă o declarație de viziune. Napoleon Hill recomandă să citești zilnic viziunea ta pentru anul următor.' 
              : "You don't have a vision declaration yet. Napoleon Hill recommends reading your vision for the next year daily."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/challenge/1')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isRo ? 'Creează Declarația de Viziune' : 'Create Vision Declaration'}
          </Button>
          
          {onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="text-muted-foreground"
            >
              {isRo ? 'Sari peste acest pas' : 'Skip this step'}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 mx-auto">
          <ScrollText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {isRo ? 'Declarația Mea de Viziune' : 'My Vision Declaration'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRo 
            ? 'Napoleon Hill: "Citește această declarație cu voce tare, cu emoție și convingere"' 
            : 'Napoleon Hill: "Read this declaration aloud, with emotion and conviction"'}
        </p>
      </div>

      {/* Declaration text */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-lg border border-amber-500/30">
        <p className="whitespace-pre-line text-foreground font-serif italic leading-relaxed">
          {visionData.vision_declaration}
        </p>
      </div>

      {/* Audio buttons */}
      <div className="flex justify-center gap-3">
        <Button
          variant="default"
          size="lg"
          onClick={handleElevenLabsTTS}
          disabled={isGeneratingAudio}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isGeneratingAudio ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {isRo ? 'Se generează...' : 'Generating...'}
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="h-5 w-5 mr-2" />
              {isRo ? 'Oprește' : 'Stop'}
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5 mr-2" />
              {isRo ? '🎧 Ascultă Declarația' : '🎧 Listen to Declaration'}
            </>
          )}
        </Button>
      </div>

      {/* Completion state */}
      {completed ? (
        <div className="flex items-center justify-center gap-2 text-green-500 py-4">
          <Check className="h-5 w-5" />
          <span className="font-medium">
            {isRo ? 'Declarație citită!' : 'Declaration read!'}
          </span>
        </div>
      ) : (
        <Button 
          onClick={handleMarkAsRead}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          size="lg"
        >
          <Check className="h-4 w-4 mr-2" />
          {isRo ? 'Am citit cu voce tare' : 'I read it aloud'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Skip button if already completed */}
      {completed && (
        <Button 
          onClick={onNext}
          className="w-full"
          size="lg"
        >
          {isRo ? 'Continuă' : 'Continue'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </Card>
  );
};
