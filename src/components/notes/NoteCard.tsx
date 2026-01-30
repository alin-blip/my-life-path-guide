import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, Trash2, Edit } from 'lucide-react';
import { Note, CATEGORY_CONFIG } from '@/hooks/useNotes';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const { language } = useLanguage();
  const categoryConfig = CATEGORY_CONFIG[note.category];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        "bg-card/50 backdrop-blur-sm border-border/50",
        note.pinned && "ring-2 ring-primary/30"
      )}
      onClick={() => onEdit(note)}
    >
      <CardContent className="p-4">
        {/* Header with pin indicator and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {note.pinned && (
              <Pin className="w-4 h-4 text-primary flex-shrink-0" />
            )}
            <h3 className="font-semibold text-foreground truncate">
              {note.title || (language === 'en' ? 'Untitled' : 'Fără titlu')}
            </h3>
          </div>
          
          {/* Action buttons - visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.pinned 
                ? (language === 'en' ? 'Unpin' : 'Anulează fixare') 
                : (language === 'en' ? 'Pin' : 'Fixează')
              }
            >
              {note.pinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content preview */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {truncateContent(note.content) || (language === 'en' ? 'No content' : 'Fără conținut')}
        </p>

        {/* Footer with category and date */}
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            categoryConfig.color
          )}>
            {categoryConfig.emoji} {language === 'en' ? categoryConfig.label : categoryConfig.labelRo}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(note.updated_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
