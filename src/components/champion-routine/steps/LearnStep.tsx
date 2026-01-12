import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Headphones, Video, Sparkles, ArrowRight, Check, Settings } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { Link } from 'react-router-dom';

interface LearnStepProps {
  completed: boolean;
  notes: string | null;
  onComplete: (value: boolean) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
}

const LEARN_TYPE_CONFIG = {
  book: { icon: BookOpen, label: '📚 Citește o carte', color: 'text-blue-500' },
  podcast: { icon: Headphones, label: '🎧 Ascultă podcast', color: 'text-purple-500' },
  video: { icon: Video, label: '🎬 Urmărește video', color: 'text-red-500' },
  custom: { icon: Sparkles, label: '✨ Personalizat', color: 'text-amber-500' },
};

export function LearnStep({ completed, notes, onComplete, onNotesChange, onNext }: LearnStepProps) {
  const { settings } = useChampionRoutine();
  const [localNotes, setLocalNotes] = useState(notes || '');
  
  const learnType = (settings as any)?.learn_task_type || 'book';
  const learnDescription = (settings as any)?.learn_task_description || '';
  const typeConfig = LEARN_TYPE_CONFIG[learnType as keyof typeof LEARN_TYPE_CONFIG] || LEARN_TYPE_CONFIG.book;
  const Icon = typeConfig.icon;

  const handleConfirm = () => {
    if (localNotes.trim()) {
      onNotesChange(localNotes);
    }
    onComplete(true);
    setTimeout(() => onNext(), 500);
  };

  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20">
        {/* Icon and Title */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
            completed ? 'bg-green-500/20 scale-110' : 'bg-blue-500/20'
          }`}>
            {completed ? (
              <Check className="h-10 w-10 text-green-500" />
            ) : (
              <Icon className="h-10 w-10 text-blue-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold">Învață Ceva Nou</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Dezvoltarea continuă este cheia succesului. Ce ai învățat azi?
          </p>
        </div>

        {/* Learn task display */}
        {learnDescription ? (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className={`text-sm font-medium ${typeConfig.color} mb-1`}>
              {typeConfig.label}
            </p>
            <p className="text-foreground">{learnDescription}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Nu ai setat un task de învățare
            </p>
            <Link to="/daily-flow" className="text-xs text-primary hover:underline flex items-center justify-center gap-1">
              <Settings className="h-3 w-3" />
              Configurează în setări
            </Link>
          </div>
        )}

        {/* Notes input */}
        <div className="space-y-2">
          <Textarea
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Ce ai învățat? Notează ideile principale... (opțional)"
            className="min-h-[100px] resize-none bg-background/50 border-blue-500/30 focus:border-blue-500"
            disabled={completed}
          />
        </div>

        {/* Action button */}
        {!completed ? (
          <Button 
            onClick={handleConfirm} 
            size="lg" 
            className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <BookOpen className="h-5 w-5" />
            Am învățat ceva nou azi
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            size="lg" 
            className="w-full gap-2"
          >
            Continuă
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </Card>
    </div>
  );
}
