import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, StickyNote } from 'lucide-react';
import { Note, NoteCategory, CATEGORY_CONFIG } from '@/hooks/useNotes';
import { NoteCard } from './NoteCard';
import { useLanguage } from '@/context/LanguageContext';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');

  const categories = [
    { value: 'all', label: language === 'en' ? 'All Categories' : 'Toate Categoriile', emoji: '📋' },
    ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      value: key,
      label: language === 'en' ? config.label : config.labelRo,
      emoji: config.emoji,
    })),
  ];

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Category filter
      if (categoryFilter !== 'all' && note.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) {
          return false;
        }
      }

      return true;
    });
  }, [notes, searchQuery, categoryFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search notes...' : 'Caută notițe...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as NoteCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <StickyNote className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-1">
            {notes.length === 0
              ? (language === 'en' ? 'No notes yet' : 'Nicio notiță încă')
              : (language === 'en' ? 'No matching notes' : 'Nicio notiță găsită')
            }
          </h3>
          <p className="text-sm text-muted-foreground/70">
            {notes.length === 0
              ? (language === 'en' 
                  ? 'Create your first note to get started' 
                  : 'Creează prima ta notiță pentru a începe')
              : (language === 'en' 
                  ? 'Try adjusting your search or filter' 
                  : 'Încearcă să ajustezi căutarea sau filtrul')
            }
          </p>
        </div>
      )}

      {/* Results count */}
      {notes.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-2">
          {language === 'en' 
            ? `Showing ${filteredNotes.length} of ${notes.length} notes`
            : `Se afișează ${filteredNotes.length} din ${notes.length} notițe`
          }
        </div>
      )}
    </div>
  );
};
