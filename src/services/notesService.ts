import { supabase } from '@/integrations/supabase/client';

export type NoteCategory = 'personal' | 'business' | 'health' | 'relationships' | 'ideas' | 'other';

export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'sacred-notes';

export const notesService = {
  // Fetch notes from Supabase
  async fetchNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return (data || []).map(note => ({
      ...note,
      category: note.category as NoteCategory
    }));
  },

  // Create a new note
  async createNote(userId: string, noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        pinned: noteData.pinned
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return {
      ...data,
      category: data.category as NoteCategory
    };
  },

  // Update an existing note
  async updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return {
      ...data,
      category: data.category as NoteCategory
    };
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Toggle pin status
  async togglePin(noteId: string, currentPinned: boolean): Promise<Note> {
    return this.updateNote(noteId, { pinned: !currentPinned });
  },

  // Get notes from localStorage (for migration)
  getLocalNotes(): Note[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error reading local notes:', error);
    }
    return [];
  },

  // Check if there are local notes to migrate
  hasLocalNotes(): boolean {
    return this.getLocalNotes().length > 0;
  },

  // Migrate local notes to Supabase
  async migrateLocalNotes(userId: string): Promise<{ migrated: number; errors: number }> {
    const localNotes = this.getLocalNotes();
    let migrated = 0;
    let errors = 0;

    for (const note of localNotes) {
      try {
        await this.createNote(userId, {
          title: note.title,
          content: note.content,
          category: note.category,
          pinned: note.pinned
        });
        migrated++;
      } catch (error) {
        console.error('Error migrating note:', note.id, error);
        errors++;
      }
    }

    // Clear localStorage after successful migration
    if (migrated > 0 && errors === 0) {
      localStorage.removeItem(STORAGE_KEY);
      console.log(`✅ Migrated ${migrated} notes to cloud`);
    }

    return { migrated, errors };
  },

  // Clear local storage
  clearLocalNotes(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
