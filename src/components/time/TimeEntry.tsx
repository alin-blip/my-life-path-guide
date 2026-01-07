import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryPicker, TimeCategory } from "./CategoryPicker";
import { EnergySlider } from "./EnergySlider";
import { Clock, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeEntryProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TimeEntry({ onSuccess, onCancel }: TimeEntryProps) {
  const [category, setCategory] = useState<TimeCategory | null>(null);
  const [activity, setActivity] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [energyBefore, setEnergyBefore] = useState(5);
  const [energyAfter, setEnergyAfter] = useState(5);
  const [satisfaction, setSatisfaction] = useState(5);
  const [wasPlanned, setWasPlanned] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(0, endMinutes - startMinutes);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async () => {
    if (!category || !activity) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Selectează o categorie și descrie activitatea",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const duration = calculateDuration();
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('time_entries').insert({
        user_id: user.id,
        date: today,
        category,
        activity,
        started_at: startTime ? `${today}T${startTime}:00` : null,
        ended_at: endTime ? `${today}T${endTime}:00` : null,
        duration_minutes: duration || 30,
        energy_before: energyBefore,
        energy_after: energyAfter,
        satisfaction,
        was_planned: wasPlanned,
        notes: notes || null
      });

      if (error) throw error;

      toast({
        title: "Salvat! ✓",
        description: `${formatDuration(duration || 30)} logat în ${category}`
      });

      // Reset form
      setCategory(null);
      setActivity("");
      setStartTime("");
      setEndTime("");
      setEnergyBefore(5);
      setEnergyAfter(5);
      setSatisfaction(5);
      setWasPlanned(false);
      setNotes("");
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut salva intrarea",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = calculateDuration();

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Loghează Timpul
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Categorie</label>
          <CategoryPicker selected={category} onSelect={setCategory} />
        </div>

        {/* Activity */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ce ai făcut?</label>
          <Input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="ex: Meeting cu echipa, Antrenament, Citit..."
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-2 block">De la</label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Până la</label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {duration > 0 && (
          <div className="text-center py-2 bg-primary/5 rounded-lg">
            <span className="text-lg font-semibold text-primary">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        {/* Energy Sliders */}
        <div className="space-y-4 pt-2">
          <EnergySlider
            value={energyBefore}
            onChange={setEnergyBefore}
            label="Energie ÎNAINTE"
          />
          <EnergySlider
            value={energyAfter}
            onChange={setEnergyAfter}
            label="Energie DUPĂ"
          />
          <EnergySlider
            value={satisfaction}
            onChange={setSatisfaction}
            label="Satisfacție"
            showIcon={false}
          />
        </div>

        {/* Was Planned */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="planned"
            checked={wasPlanned}
            onCheckedChange={(checked) => setWasPlanned(!!checked)}
          />
          <label htmlFor="planned" className="text-sm cursor-pointer">
            A fost planificat
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Note (opțional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observații, învățăminte..."
            rows={2}
          />
        </div>

        {/* Submit */}
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isSubmitting || !category || !activity}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Se salvează..." : "Salvează"}
        </Button>
      </CardContent>
    </Card>
  );
}
