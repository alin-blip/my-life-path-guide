import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useNotes, Note } from '@/hooks/useNotes';
import { NotesList } from '@/components/notes/NotesList';
import { NoteEditor } from '@/components/notes/NoteEditor';

export const Notes: React.FC = () => {
  const { language } = useLanguage();
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin } = useNotes();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    createNote(noteData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back' : 'Înapoi'}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'en' ? 'Sacred Notes' : 'Notițe Sacre'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Capture your thoughts, ideas, and inspirations' 
                : 'Capturează gândurile, ideile și inspirațiile tale'}
            </p>
          </div>
        </div>
        <Button onClick={handleNewNote} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'New Note' : 'Notiță Nouă'}
        </Button>
      </div>

      {/* Notes List */}
      <NotesList
        notes={notes}
        onEdit={handleEditNote}
        onDelete={deleteNote}
        onTogglePin={togglePin}
      />

      {/* Note Editor Modal */}
      <NoteEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        note={editingNote}
        onSave={handleSaveNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onTogglePin={togglePin}
      />
    </div>
  );
};
