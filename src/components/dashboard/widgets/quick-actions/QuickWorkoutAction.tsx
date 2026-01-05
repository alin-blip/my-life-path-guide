import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Dumbbell, Check, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkoutSession {
  id: string;
  activity_type: string;
  duration_seconds: number | null;
  notes: string | null;
  date: string;
}

interface QuickWorkoutActionProps {
  onUpdate?: () => void;
}

export function QuickWorkoutAction({ onUpdate }: QuickWorkoutActionProps) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    activityType: 'workout',
    minutes: '',
    notes: ''
  });
  const { toast } = useToast();

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activity_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.minutes || parseInt(formData.minutes) <= 0) {
      toast({
        title: "Eroare",
        description: "Te rog introdu durata în minute.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('activity_sessions')
        .insert({
          user_id: user.id,
          activity_type: formData.activityType,
          date: today,
          duration_seconds: parseInt(formData.minutes) * 60,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Salvat!",
        description: "Activitatea a fost adăugată."
      });

      setFormData({ activityType: 'workout', minutes: '', notes: '' });
      fetchSessions();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva activitatea.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const activityTypes = [
    { value: 'workout', label: 'Antrenament', icon: '🏋️' },
    { value: 'running', label: 'Alergare', icon: '🏃' },
    { value: 'cycling', label: 'Ciclism', icon: '🚴' },
    { value: 'walking', label: 'Mers', icon: '🚶' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
    { value: 'swimming', label: 'Înot', icon: '🏊' },
  ];

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Adaugă
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-red-500" />
            Antrenament Rapid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Today's sessions summary */}
          {sessions.length > 0 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Astăzi:</span>
                <span className="font-medium text-green-600">
                  {sessions.length} sesiuni • {totalMinutes} min
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {sessions.slice(0, 3).map(session => (
                  <div key={session.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="capitalize">{session.activity_type}</span>
                    <span>•</span>
                    <span>{session.duration_seconds ? Math.round(session.duration_seconds / 60) : 0} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity type selection */}
          <div className="space-y-2">
            <Label>Tip activitate</Label>
            <div className="grid grid-cols-3 gap-2">
              {activityTypes.map(type => (
                <Button
                  key={type.value}
                  variant={formData.activityType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, activityType: type.value }))}
                  className="flex-col h-auto py-2"
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Duration input */}
          <div className="space-y-2">
            <Label htmlFor="minutes">Durată (minute)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="minutes"
                type="number"
                placeholder="ex: 30"
                value={formData.minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
                className="pl-10"
                min="1"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note (opțional)</Label>
            <Input
              id="notes"
              placeholder="ex: Antrenament picioare"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Se salvează...' : 'Adaugă Activitate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
