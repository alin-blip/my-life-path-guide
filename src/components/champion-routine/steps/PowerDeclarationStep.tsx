import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollText, Sparkles, Eye, ArrowRight, Check, Volume2, VolumeX, Loader2, Edit2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { VoiceSelector, DEFAULT_VOICE_ID } from '@/components/stack/VoiceSelector';

interface PowerDeclarationStepProps {
  autosuggestionText: string;
  autosuggestionCompleted: boolean;
  visionDeclarationRead: boolean;
  visualizationCompleted: boolean;
  onAutosuggestionTextChange: (text: string) => void;
  onAutosuggestionComplete: (value: boolean) => void;
  onVisionComplete: (value: boolean) => void;
  onVisualizationComplete: (value: boolean) => void;
  onNext: () => void;
  onSkip?: () => void;
}

// Sub-steps within the power declaration
type SubStep = 'vision' | 'autosuggestion' | 'visualization';

const cleanTextForTTS = (text: string): string => {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]/gu, '')
    .replace(/[📌💎📋🔥✨💪💕💰🏆🎯🚀💡🎧]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\n+/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
};

export function PowerDeclarationStep({
  autosuggestionText,
  autosuggestionCompleted,
  visionDeclarationRead,
  visualizationCompleted,
  onAutosuggestionTextChange,
  onAutosuggestionComplete,
  onVisionComplete,
  onVisualizationComplete,
  onNext,
  onSkip,
}: PowerDeclarationStepProps) {
  const { language } = useLanguage();
  const isRo = language === 'ro';

  // Determine starting sub-step based on what's already done
  const getInitialSubStep = (): SubStep => {
    if (!visionDeclarationRead) return 'vision';
    if (!autosuggestionCompleted) return 'autosuggestion';
    if (!visualizationCompleted) return 'visualization';
    return 'vision'; // all done, show from start
  };

  const [currentSub, setCurrentSub] = useState<SubStep>(getInitialSubStep);
  const [visionData, setVisionData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(() =>
    localStorage.getItem('vision_voice_id') || DEFAULT_VOICE_ID
  );
  const [isEditingAffirmation, setIsEditingAffirmation] = useState(false);
  const [localAffirmation, setLocalAffirmation] = useState(autosuggestionText);
  const [activeMantras, setActiveMantras] = useState<{ id: string; text: string }[]>([]);

  // Fetch active belief mantras (morning slot) — installed via Belief Reprogrammer
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await (supabase as any)
          .from('belief_mantras')
          .select('id, text, slot')
          .eq('user_id', user.id)
          .eq('active', true)
          .in('slot', ['morning', 'both']);
        setActiveMantras((data || []).map((m: any) => ({ id: m.id, text: m.text })));
      } catch {}
    })();
  }, []);


  // Fetch vision declaration
  useEffect(() => {
    const fetchVision = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsLoading(false); return; }

        const { data } = await supabase
          .from('challenge_day1_responses')
          .select('vision_declaration')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.vision_declaration) {
          setVisionData(data.vision_declaration);
        }
      } catch (e) {
        console.error('Error fetching vision:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVision();
  }, []);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioElement) { audioElement.pause(); audioElement.src = ''; }
    };
  }, [audioElement]);

  const handleTTS = async () => {
    if (!visionData) return;
    if (isSpeaking && audioElement) {
      audioElement.pause(); audioElement.currentTime = 0; setIsSpeaking(false); return;
    }
    setIsGeneratingAudio(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Nu ești autentificat'); setIsGeneratingAudio(false); return; }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: cleanTextForTTS(visionData), voiceId: selectedVoice }),
        }
      );
      if (!response.ok) throw new Error('TTS failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioElement(audio);
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
      setIsSpeaking(true);
    } catch {
      // Fallback browser TTS
      const utterance = new SpeechSynthesisUtterance(cleanTextForTTS(visionData));
      utterance.lang = isRo ? 'ro-RO' : 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const allDone = visionDeclarationRead && autosuggestionCompleted && visualizationCompleted;

  const subStepIndicator = (step: SubStep, label: string, done: boolean) => (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
        currentSub === step
          ? 'bg-primary text-primary-foreground'
          : done
          ? 'bg-green-500/20 text-green-500'
          : 'bg-muted/50 text-muted-foreground'
      }`}
      onClick={() => setCurrentSub(step)}
    >
      {done && currentSub !== step && <Check className="h-3 w-3" />}
      {label}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
            allDone ? 'bg-green-500/20 scale-110' : 'bg-amber-500/20'
          }`}>
            {allDone ? (
              <Check className="h-10 w-10 text-green-500" />
            ) : (
              <Sparkles className="h-10 w-10 text-amber-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold">Declarație de Putere</h1>
          <p className="text-muted-foreground text-sm">
            Viziune + Autosugestie + Vizualizare — un singur ritual de putere.
          </p>
        </div>

        {/* Sub-step indicators */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {subStepIndicator('vision', '📜 Viziune', visionDeclarationRead)}
          {subStepIndicator('autosuggestion', '✨ Autosugestie', autosuggestionCompleted)}
          {subStepIndicator('visualization', '👁️ Vizualizare', visualizationCompleted)}
        </div>

        {/* Sub-step content */}
        {currentSub === 'vision' && (
          <div className="space-y-4">
            {visionData ? (
              <>
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-xl border border-amber-500/30 max-h-64 overflow-y-auto">
                  <p className="whitespace-pre-line text-foreground font-serif italic leading-relaxed text-sm">
                    {visionData}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                  <VoiceSelector
                    currentVoice={selectedVoice}
                    onVoiceChange={(v) => { setSelectedVoice(v); localStorage.setItem('vision_voice_id', v); }}
                    disabled={isGeneratingAudio || isSpeaking}
                  />
                  <Button
                    variant="default"
                    onClick={handleTTS}
                    disabled={isGeneratingAudio}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isGeneratingAudio ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    {isGeneratingAudio ? 'Se generează...' : isSpeaking ? 'Oprește' : 'Ascultă'}
                  </Button>
                </div>
                <Button
                  onClick={() => { onVisionComplete(true); setCurrentSub('autosuggestion'); }}
                  size="lg"
                  className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <ScrollText className="h-5 w-5" />
                  Am citit cu voce tare
                </Button>
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground">Nu ai încă o declarație de viziune.</p>
                <Button variant="outline" onClick={() => setCurrentSub('autosuggestion')}>
                  Sari la Autosugestie →
                </Button>
              </div>
            )}
          </div>
        )}

        {currentSub === 'autosuggestion' && (
          <div className="space-y-4">
            {!isEditingAffirmation ? (
              <div className="relative p-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-muted-foreground"
                  onClick={() => { setLocalAffirmation(autosuggestionText); setIsEditingAffirmation(true); }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <p className="text-2xl font-serif text-center italic leading-relaxed">
                  "{autosuggestionText}"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={localAffirmation}
                  onChange={(e) => setLocalAffirmation(e.target.value)}
                  className="min-h-[100px] text-lg"
                  placeholder="Scrie-ți afirmația..."
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingAffirmation(false)} className="gap-1">
                    <X className="h-4 w-4" /> Anulează
                  </Button>
                  <Button onClick={() => { onAutosuggestionTextChange(localAffirmation); setIsEditingAffirmation(false); }} className="flex-1 gap-1">
                    <Check className="h-4 w-4" /> Salvează
                  </Button>
                </div>
              </div>
            )}

            {activeMantras.length > 0 && !isEditingAffirmation && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 border border-fuchsia-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide font-semibold text-fuchsia-600">🧬 Mantre instalate (Belief Reprogrammer)</span>
                </div>
                {activeMantras.map((m) => (
                  <p key={m.id} className="text-base italic text-center">„{m.text}"</p>
                ))}
                <p className="text-[10px] text-center text-muted-foreground">Spune-le cu voce tare. Repetiția construiește circuitul.</p>
              </div>
            )}

            {!isEditingAffirmation && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3 rounded-lg bg-muted/30">
                      <span className="text-2xl font-bold text-amber-500">{n}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n === 1 ? 'Cu voce tare' : n === 2 ? 'Simte emoția' : 'Vizualizează'}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => { onAutosuggestionComplete(true); setCurrentSub('visualization'); }}
                  size="lg"
                  className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Sparkles className="h-5 w-5" />
                  Am citit afirmația de 3 ori
                </Button>
              </>
            )}
          </div>
        )}

        {currentSub === 'visualization' && (
          <div className="space-y-4">
            <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
              <p className="text-lg text-center italic text-muted-foreground">
                "Închide ochii. Imaginează-ți că ești seara acestei zile, privind înapoi la tot ce ai realizat. 
                Cum te simți? Ce ai făcut? MĂREȘTE acea imagine de 10x!"
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { emoji: '👁️', text: 'Închide ochii' },
                { emoji: '🌬️', text: 'Respiră adânc' },
                { emoji: '✨', text: 'Vizualizează' },
                { emoji: '❤️', text: 'Simte emoția' },
              ].map(({ emoji, text }) => (
                <div key={text} className="p-3 rounded-lg bg-muted/30">
                  <span className="text-xl block mb-1">{emoji}</span>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => { onVisualizationComplete(true); }}
              size="lg"
              className="w-full gap-2 bg-indigo-500 hover:bg-indigo-600"
            >
              <Eye className="h-5 w-5" />
              Am vizualizat ziua perfectă
            </Button>
          </div>
        )}

        {/* Final continue button when all done */}
        {allDone && (
          <Button onClick={onNext} size="lg" className="w-full gap-2">
            Continuă <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </Card>
    </div>
  );
}
