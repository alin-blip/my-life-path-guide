import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MeditationItem } from './MeditationItem';
import { useMeditationRecommendation } from '@/hooks/useMeditationRecommendation';

interface Meditation {
  id: string;
  title: string;
  is_favorite: boolean;
  created_at: string;
  duration_seconds?: number | null;
  objectives_snapshot?: Record<string, string> | null;
}

interface MeditationSelectorProps {
  meditations: Meditation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const TIME_LABELS: Record<string, string> = {
  morning: 'dimineață',
  afternoon: 'după-amiază',
  evening: 'seară',
  night: 'noapte'
};

export function MeditationSelector({
  meditations,
  selectedId,
  onSelect,
  onToggleFavorite,
  onDelete
}: MeditationSelectorProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  const { recommendation } = useMeditationRecommendation(meditations);
  
  const favorites = meditations.filter(m => m.is_favorite);
  const others = meditations.filter(m => !m.is_favorite);
  
  // Show max 3 in "others" section unless expanded
  const visibleOthers = showAll ? others : others.slice(0, 3);
  const hasMoreOthers = others.length > 3;

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const meditationToDelete = deleteId 
    ? meditations.find(m => m.id === deleteId) 
    : null;

  return (
    <div className="space-y-4 mb-6">
      {/* AI Recommendation */}
      {recommendation && recommendation.meditation && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-purple-400 font-medium">
                💡 Recomandat pentru {TIME_LABELS[recommendation.timeOfDay]}
              </p>
              <p className="font-medium truncate">{recommendation.meditation.title}</p>
              <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelect(recommendation.meditation!.id)}
              className="shrink-0"
            >
              Ascultă
            </Button>
          </div>
        </Card>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-1">
            ⭐ Favorite ({favorites.length})
          </h4>
          <div className="space-y-2">
            {favorites.map(meditation => (
              <MeditationItem
                key={meditation.id}
                meditation={meditation}
                isSelected={selectedId === meditation.id}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Meditations Section */}
      {others.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            📚 {favorites.length > 0 ? 'Alte meditații' : 'Meditațiile tale'} ({others.length})
          </h4>
          <div className="space-y-2">
            {visibleOthers.map(meditation => (
              <MeditationItem
                key={meditation.id}
                meditation={meditation}
                isSelected={selectedId === meditation.id}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
                onDelete={setDeleteId}
              />
            ))}
          </div>
          
          {hasMoreOthers && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Arată mai puține
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Arată toate ({others.length - 3} mai multe)
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Generate New Link */}
      <Button variant="outline" className="w-full" asChild>
        <Link to="/empowerment-meditation">
          <Plus className="h-4 w-4 mr-2" />
          Generează o meditație nouă
        </Link>
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergi meditația?</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi "{meditationToDelete?.title}"? 
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Se șterge...' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
