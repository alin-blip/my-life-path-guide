import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pin, PinOff, Trash2, Save } from 'lucide-react';
import { Note, NoteCategory, CATEGORY_CONFIG } from '@/hooks/useNotes';
import { useLanguage } from '@/context/LanguageContext';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  onSave: (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  isOpen,
  onClose,
  note,
  onSave,
  onUpdate,
  onDelete,
  onTogglePin,
}) => {
  const { language } = useLanguage();
  const isEditing = !!note;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('personal');
  const [pinned, setPinned] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when note changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategory(note.category);
        setPinned(note.pinned);
      } else {
        setTitle('');
        setContent('');
        setCategory('personal');
        setPinned(false);
      }
      setShowDeleteConfirm(false);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (isEditing && onUpdate && note) {
      onUpdate(note.id, { title, content, category, pinned });
    } else {
      onSave({ title, content, category, pinned });
    }
    onClose();
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
      onClose();
    }
  };

  const handleTogglePin = () => {
    if (isEditing && note && onTogglePin) {
      onTogglePin(note.id);
      setPinned(!pinned);
    } else {
      setPinned(!pinned);
    }
  };

  const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    value: key as NoteCategory,
    label: language === 'en' ? config.label : config.labelRo,
    emoji: config.emoji,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing 
              ? (language === 'en' ? 'Edit Note' : 'Editează Notița')
              : (language === 'en' ? 'New Note' : 'Notiță Nouă')
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === 'en' ? 'Title' : 'Titlu'}
            </Label>
            <Input
              id="title"
              placeholder={language === 'en' ? 'Enter title...' : 'Introdu titlul...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {language === 'en' ? 'Category' : 'Categorie'}
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {language === 'en' ? 'Content' : 'Conținut'}
            </Label>
            <Textarea
              id="content"
              placeholder={language === 'en' ? 'Write your note...' : 'Scrie notița ta...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Left side actions */}
          <div className="flex items-center gap-2 flex-1">
            <Button
              type="button"
              variant={pinned ? "secondary" : "outline"}
              size="sm"
              onClick={handleTogglePin}
              className="gap-1"
            >
              {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {pinned 
                ? (language === 'en' ? 'Unpin' : 'Anulează') 
                : (language === 'en' ? 'Pin' : 'Fixează')
              }
            </Button>
            
            {isEditing && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      {language === 'en' ? 'Confirm Delete' : 'Confirmă Ștergerea'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {language === 'en' ? 'Cancel' : 'Anulează'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'en' ? 'Delete' : 'Șterge'}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </Button>
            <Button type="button" onClick={handleSave} className="gap-1">
              <Save className="w-4 h-4" />
              {language === 'en' ? 'Save' : 'Salvează'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
