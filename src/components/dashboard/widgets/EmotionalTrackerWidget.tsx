import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { getEmotionInfo, Emotion, EMOTIONS } from '@/components/emotional/EmotionPicker';
import { toast } from 'sonner';

interface WidgetProps {
  id: string;
  onRemove?: () => void;
}

export function EmotionalTrackerWidget({ id }: WidgetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lastCheckin, setLastCheckin] = useState<{
    emotion: Emotion;
    intensity: number;
    created_at: string;
  } | null>(null);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLastCheckin();
    }
  }, [user]);

  const fetchLastCheckin = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('emotional_checkins')
      .select('emotion, intensity, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setLastCheckin(data as { emotion: Emotion; intensity: number; created_at: string });
    }
  };

  const handleQuickCheckin = async (emotion: Emotion) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('emotional_checkins').insert({
        user_id: user.id,
        emotion,
        intensity: 5,
        energy_level: 5,
      });

      if (error) throw error;

      toast.success('Check-in salvat!');
      setIsQuickMode(false);
      fetchLastCheckin();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Eroare la salvare');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Emotional Tracker
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => navigate('/emotional-tracker')}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isQuickMode ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">Cum te simți?</p>
            <div className="grid grid-cols-4 gap-1">
              {EMOTIONS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => handleQuickCheckin(e.value)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-lg disabled:opacity-50"
                >
                  {e.emoji}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsQuickMode(false)}
            >
              Anulează
            </Button>
          </div>
        ) : (
          <>
            {lastCheckin ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span className="text-2xl">{getEmotionInfo(lastCheckin.emotion)?.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {getEmotionInfo(lastCheckin.emotion)?.labelRo}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(lastCheckin.created_at), "EEEE, HH:mm", { locale: ro })}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {lastCheckin.intensity}/10
                </Badge>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs py-2">
                Niciun check-in astăzi
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsQuickMode(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Quick Check-in
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
