import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notesService, Note, NoteCategory } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';

export type { Note, NoteCategory };

export const useNotesCloud = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Load notes from Supabase
  const loadNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const cloudNotes = await notesService.fetchNotes(user.id);
      setNotes(cloudNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut încărca notițele.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Check and migrate local notes on first load
  useEffect(() => {
    const migrateAndLoad = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check for local notes to migrate
      if (!hasMigrated && notesService.hasLocalNotes()) {
        try {
          const result = await notesService.migrateLocalNotes(user.id);
          if (result.migrated > 0) {
            toast({
              title: 'Notițe sincronizate',
              description: `${result.migrated} notițe au fost salvate în cloud.`,
            });
          }
          setHasMigrated(true);
        } catch (error) {
          console.error('Migration error:', error);
        }
      }

      await loadNotes();
    };

    migrateAndLoad();
  }, [user, hasMigrated, loadNotes, toast]);

  // Create a new note
  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: 'Autentificare necesară',
        description: 'Te rog să te autentifici pentru a salva notițe.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const newNote = await notesService.createNote(user.id, noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut crea notița.',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast]);

  // Update an existing note
  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const updatedNote = await notesService.updateNote(id, updates);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut actualiza notița.',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    try {
      await notesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut șterge notița.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Toggle pin status
  const togglePin = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const updatedNote = await notesService.togglePin(id, note.pinned);
      setNotes(prev => {
        const updated = prev.map(n => n.id === id ? updatedNote : n);
        // Re-sort: pinned first, then by updated_at
        return updated.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  }, [notes]);

  // Get a note by ID
  const getNoteById = useCallback((id: string) => {
    return notes.find(note => note.id === id);
  }, [notes]);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    getNoteById,
    refreshNotes: loadNotes,
    isAuthenticated: !!user
  };
};

export const CATEGORY_CONFIG: Record<NoteCategory, { label: string; labelRo: string; emoji: string; color: string }> = {
  personal: { label: 'Personal', labelRo: 'Personal', emoji: '👤', color: 'bg-blue-500/20 text-blue-400' },
  business: { label: 'Business', labelRo: 'Business', emoji: '💼', color: 'bg-amber-500/20 text-amber-400' },
  health: { label: 'Health', labelRo: 'Sănătate', emoji: '💪', color: 'bg-green-500/20 text-green-400' },
  relationships: { label: 'Relationships', labelRo: 'Relații', emoji: '❤️', color: 'bg-pink-500/20 text-pink-400' },
  ideas: { label: 'Ideas', labelRo: 'Idei', emoji: '💡', color: 'bg-purple-500/20 text-purple-400' },
  other: { label: 'Other', labelRo: 'Altele', emoji: '📝', color: 'bg-gray-500/20 text-gray-400' },
};
