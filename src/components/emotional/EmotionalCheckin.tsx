import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionPicker, Emotion } from './EmotionPicker';
import { IntensitySlider } from './IntensitySlider';
import { Heart, Zap, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmotionalCheckinProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function EmotionalCheckin({ onSuccess, compact = false }: EmotionalCheckinProps) {
  const { user } = useAuth();
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [reaction, setReaction] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(!compact);

  const handleSubmit = async () => {
    if (!user || !emotion) {
      toast.error('Te rog să selectezi o emoție');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('emotional_checkins').insert({
        user_id: user.id,
        emotion,
        intensity,
        energy_level: energyLevel,
        trigger: trigger || null,
        reaction: reaction || null,
        result: result || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success('Check-in salvat cu succes!');
      
      // Reset form
      setEmotion(null);
      setIntensity(5);
      setEnergyLevel(5);
      setTrigger('');
      setReaction('');
      setResult('');
      setNotes('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving checkin:', error);
      toast.error('Nu am putut salva check-in-ul');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Cum te simți acum?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <EmotionPicker value={emotion} onChange={setEmotion} />

        {emotion && (
          <>
            <div className="space-y-4 pt-2">
              <IntensitySlider
                label="Intensitate emoție"
                value={intensity}
                onChange={setIntensity}
                icon={<Heart className="h-4 w-4 text-red-500" />}
              />
              
              <IntensitySlider
                label="Nivel energie"
                value={energyLevel}
                onChange={setEnergyLevel}
                icon={<Zap className="h-4 w-4 text-yellow-500" />}
              />
            </div>

            {compact && !showDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="w-full text-muted-foreground"
              >
                + Adaugă detalii (opțional)
              </Button>
            )}

            {showDetails && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Ce a declanșat această emoție?
                  </label>
                  <Textarea
                    placeholder="Ex: O conversație dificilă, o știre, un gând..."
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="resize-none h-16"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Cum ai reacționat?
                  </label>
                  <Textarea
                    placeholder="Ex: Am respirat adânc, m-am retras, am vorbit cu cineva..."
                    value={reaction}
                    onChange={(e) => setReaction(e.target.value)}
                    className="resize-none h-16"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Ce rezultat a avut reacția?
                  </label>
                  <Textarea
                    placeholder="Ex: M-am calmat, situația s-a agravat, am găsit o soluție..."
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="resize-none h-16"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Note adiționale
                  </label>
                  <Textarea
                    placeholder="Orice altceva vrei să notezi..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none h-16"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !emotion}
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Salvează check-in
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
