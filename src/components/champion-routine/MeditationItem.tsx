import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';

interface MeditationItemProps {
  meditation: {
    id: string;
    title: string;
    is_favorite: boolean;
    created_at: string;
    duration_seconds?: number | null;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

function getTemplateIcon(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('have it all') || titleLower.includes('vizualizare')) return '🌟';
  if (titleLower.includes('corp') || titleLower.includes('body')) return '💪';
  if (titleLower.includes('focus') || titleLower.includes('productiv')) return '🎯';
  if (titleLower.includes('pace') || titleLower.includes('inner')) return '🙏';
  if (titleLower.includes('gratitud')) return '🙏';
  if (titleLower.includes('energie') || titleLower.includes('energy')) return '⚡';
  if (titleLower.includes('stress') || titleLower.includes('relaxa')) return '🌊';
  if (titleLower.includes('somn') || titleLower.includes('sleep')) return '🌙';
  if (titleLower.includes('săptămân') || titleLower.includes('week')) return '📅';
  if (titleLower.includes('relații') || titleLower.includes('relationship')) return '❤️';
  if (titleLower.includes('balance') || titleLower.includes('echilibru')) return '⚖️';
  return '🧘';
}

export function MeditationItem({
  meditation,
  isSelected,
  onSelect,
  onToggleFavorite,
  onDelete
}: MeditationItemProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(meditation.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(meditation.id);
  };

  return (
    <div
      onClick={() => onSelect(meditation.id)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
        isSelected 
          ? "border-purple-500 bg-purple-500/10" 
          : "border-border hover:bg-muted/50"
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-lg shrink-0">
        {getTemplateIcon(meditation.title)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{meditation.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(meditation.created_at), { 
            addSuffix: true, 
            locale: ro 
          })}
          {meditation.duration_seconds && ` • ${Math.round(meditation.duration_seconds / 60)} min`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleFavoriteClick}
        >
          <Star 
            className={cn(
              "h-4 w-4 transition-colors",
              meditation.is_favorite 
                ? "text-yellow-500 fill-yellow-500" 
                : "text-muted-foreground"
            )} 
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
