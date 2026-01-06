import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface JournalWidgetProps {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const JournalWidget: React.FC<JournalWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lesson, setLesson] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Scrie ceva în jurnal pentru a salva');
      return;
    }

    setIsSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const entryTitle = title.trim() || `Jurnal ${format(new Date(), 'dd MMM yyyy')}`;

    try {
      if (user) {
        const { error } = await supabase
          .from('daily_progress')
          .upsert({
            user_id: user.id,
            date: today,
            notes: content,
            progress_data: {
              title: entryTitle,
              content: content,
              lesson: lesson,
              timestamp: new Date().toISOString()
            }
          }, {
            onConflict: 'user_id,date'
          });

        if (error) throw error;

        // Update daily tracking
        await supabase
          .from('daily_tracking')
          .upsert({
            user_id: user.id,
            date: today,
            journal_completed: true
          }, {
            onConflict: 'user_id,date'
          });

        toast.success('Intrare salvată în jurnal!');
      } else {
        // Save to localStorage for non-authenticated users
        const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
        entries.unshift({
          id: crypto.randomUUID(),
          title: entryTitle,
          content,
          lesson,
          date: today,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('journal_entries', JSON.stringify(entries));
        toast.success('Intrare salvată local!');
      }

      // Reset form
      setTitle('');
      setContent('');
      setLesson('');
    } catch (error) {
      console.error('Error saving journal:', error);
      toast.error('Eroare la salvare');
    } finally {
      setIsSaving(false);
    }
  };

  const isCompact = size === 'small';

  return (
    <WidgetContainer
      title="Jurnal"
      icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
      className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
    >
      <div className="space-y-3">
        {!isCompact && (
          <Input
            placeholder="Titlu (opțional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 text-sm"
          />
        )}
        
        <Textarea
          placeholder="Ce ai pe suflet astăzi? Scrie gândurile, experiențele sau reflecțiile tale..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 resize-none text-sm ${
            isCompact ? 'h-20' : size === 'medium' ? 'h-24' : 'h-32'
          }`}
        />

        {!isCompact && (
          <Textarea
            placeholder="Ce lecție ai învățat astăzi?"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="bg-background/50 border-indigo-500/20 focus:border-indigo-500/40 resize-none text-sm h-16"
          />
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          size={isCompact ? 'sm' : 'default'}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Se salvează...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvează în jurnal
            </>
          )}
        </Button>
      </div>
    </WidgetContainer>
  );
};
