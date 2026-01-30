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

// Re-export CATEGORY_CONFIG from the original hook for backwards compatibility
export { CATEGORY_CONFIG } from './useNotes';
