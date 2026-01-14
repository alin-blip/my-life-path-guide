import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface WarriorVideoPlayerProps {
  moduleId: string;
  onClose: () => void;
  onComplete: () => void;
  videoUrl?: string;
}

export const WarriorVideoPlayer: React.FC<WarriorVideoPlayerProps> = ({
  moduleId,
  onClose,
  onComplete,
  videoUrl
}) => {
  // For now, show a placeholder. Video URLs will be added via admin.
  const hasVideo = !!videoUrl;

  const handleMarkComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Vizionare Modul</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="aspect-video bg-black flex items-center justify-center">
          {hasVideo ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/70 p-8">
              <p className="text-lg mb-2">Video în curs de adăugare</p>
              <p className="text-sm text-white/50">
                Acest modul va fi disponibil în curând.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Următor
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Button onClick={handleMarkComplete} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Marchează ca finalizat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
