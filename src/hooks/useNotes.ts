import { useState, useEffect, useCallback } from 'react';

export type NoteCategory = 'personal' | 'business' | 'health' | 'relationships' | 'ideas' | 'other';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'sacred-notes';

const generateId = () => crypto.randomUUID();

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever notes change
  const saveToStorage = useCallback((notesToSave: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notesToSave));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }, []);

  const createNote = useCallback((noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    
    setNotes(prev => {
      const updated = [newNote, ...prev];
      saveToStorage(updated);
      return updated;
    });
    
    return newNote;
  }, [saveToStorage]);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>) => {
    setNotes(prev => {
      const updated = prev.map(note => 
        note.id === id 
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.filter(note => note.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.map(note =>
        note.id === id
          ? { ...note, pinned: !note.pinned, updated_at: new Date().toISOString() }
          : note
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const getNoteById = useCallback((id: string) => {
    return notes.find(note => note.id === id);
  }, [notes]);

  // Sort: pinned first, then by updated_at
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return {
    notes: sortedNotes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    getNoteById,
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
