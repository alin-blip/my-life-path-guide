import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateDailyProgress } from '@/utils/stackProgress';

interface JournalEntryProps {
  onEntrySaved: () => void;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({ onEntrySaved }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lesson, setLesson] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Titlu necesar",
        description: "Te rugăm să adaugi un titlu pentru această intrare în jurnal.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Conținut necesar",
        description: "Te rugăm să scrii ceva în jurnal înainte de a salva.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: "Autentificare necesară",
          description: "Conectează-te pentru a salva intrări în jurnal.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          content: content.trim(),
          lesson: lesson.trim() || null,
          entry_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      toast({
        title: "Intrare salvată",
        description: "Intrarea din jurnal a fost salvată cu succes.",
      });

      await updateDailyProgress('journal', { title });

      setTitle('');
      setContent('');
      setLesson('');
      onEntrySaved();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Eroare la salvare",
        description: "Nu am putut salva intrarea. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-indigo-500/30 bg-indigo-950/10">
      <CardHeader>
        <CardTitle className="text-center text-indigo-400 flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5" />
          Intrare nouă în jurnal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Titlul intrării"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-indigo-900/30 border-indigo-700 placeholder:text-indigo-400/50"
          />
        </div>
        <div>
          <Textarea
            placeholder="Ce s-a întâmplat astăzi? Ce gânduri, emoții sau experiențe vrei să documentezi?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[250px] bg-indigo-900/30 border-indigo-700 placeholder:text-indigo-400/50"
          />
        </div>
        <div>
          <Textarea
            placeholder="Ce lecție ai învățat din această experiență?"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            className="min-h-[100px] bg-indigo-900/30 border-indigo-700 placeholder:text-indigo-400/50"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Se salvează...' : 'Salvează intrarea'}
        </Button>
      </CardFooter>
    </Card>
  );
};
