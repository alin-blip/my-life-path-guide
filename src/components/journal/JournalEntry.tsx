
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
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Try to save to Supabase
        // TODO: Implement proper database insertion with authentication
        // For now, using local storage until authentication is implemented
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const newEntry = {
          id: crypto.randomUUID(),
          title,
          content,
          lesson: lesson.trim() || null,
          user_id: 'temp-user',
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        };
        journalEntries.push(newEntry);
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        const error = null;

        if (error) {
          console.error("Error saving to Supabase:", error);
          throw error;
        }

        toast({
          title: "Intrare salvată",
          description: "Intrarea din jurnal a fost salvată cu succes în cloud.",
        });
      } else {
        // Not logged in, save to localStorage
        saveToLocalStorage(title, content, lesson);
        toast({
          title: "Intrare salvată local",
          description: "Intrarea din jurnal a fost salvată local. Conectează-te pentru a o salva în cloud.",
        });
      }
      
      // Update daily progress when journal entry is saved
      console.log("Updating daily progress for journal");
      await updateDailyProgress('journal', { title });
      
      // Reset form after save
      setTitle('');
      setContent('');
      setLesson('');
      onEntrySaved();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      saveToLocalStorage(title, content, lesson);
      toast({
        title: "Eroare la salvare în cloud",
        description: "Intrarea din jurnal a fost salvată local ca backup.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveToLocalStorage = (title: string, content: string, lesson: string) => {
    try {
      const now = new Date();
      const entryDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const entryId = `journal-${Date.now()}`;
      
      // Get existing journal entries
      const storedEntries = localStorage.getItem('journal-entries') || '[]';
      const entries = JSON.parse(storedEntries);
      
      // Add new entry
      entries.push({
        id: entryId,
        title,
        content,
        lesson,
        date: entryDate,
        timestamp: now.toISOString()
      });
      
      // Save back to localStorage
      localStorage.setItem('journal-entries', JSON.stringify(entries));
      
      toast({
        title: "Intrare salvată local",
        description: "Intrarea din jurnal a fost salvată local.",
      });
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Eroare la salvare",
        description: "Nu am putut salva intrarea. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
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
