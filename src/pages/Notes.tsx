import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Cloud, CloudOff } from 'lucide-react';
import { useNotesCloud, Note, CATEGORY_CONFIG } from '@/hooks/useNotesCloud';
import { NotesList } from '@/components/notes/NotesList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';

export { CATEGORY_CONFIG };

export const Notes: React.FC = () => {
  const { language } = useLanguage();
  const { 
    notes, 
    isLoading, 
    createNote, 
    updateNote, 
    deleteNote, 
    togglePin,
    isAuthenticated 
  } = useNotesCloud();
  
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

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    await createNote(noteData);
  };

  const handleUpdateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>) => {
    await updateNote(id, updates);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
  };

  const handleTogglePin = async (id: string) => {
    await togglePin(id);
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {language === 'en' ? 'Sacred Notes' : 'Notițe Sacre'}
              {isAuthenticated ? (
                <Cloud className="w-5 h-5 text-green-500" />
              ) : (
                <CloudOff className="w-5 h-5 text-muted-foreground" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Capture your thoughts, ideas, and inspirations' 
                : 'Capturează gândurile, ideile și inspirațiile tale'}
            </p>
          </div>
        </div>
        <Button onClick={handleNewNote} className="gap-2" disabled={!isAuthenticated}>
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'New Note' : 'Notiță Nouă'}
        </Button>
      </div>

      {/* Auth Warning */}
      {!isAuthenticated && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CloudOff className="w-4 h-4" />
          <AlertDescription>
            {language === 'en' 
              ? 'Sign in to save your notes to the cloud and access them from any device.'
              : 'Autentifică-te pentru a salva notițele în cloud și a le accesa de pe orice dispozitiv.'}
            <Link to="/auth" className="ml-2 underline font-medium">
              {language === 'en' ? 'Sign In' : 'Autentificare'}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Notes List */}
      <NotesList
        notes={notes}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        onTogglePin={handleTogglePin}
      />

      {/* Note Editor Modal */}
      <NoteEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        note={editingNote}
        onSave={handleSaveNote}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
};
