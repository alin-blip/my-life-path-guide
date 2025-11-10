import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getISOWeek, getYear } from 'date-fns';

interface ClearWeekButtonProps {
  currentDate: Date;
  onArchived?: () => void;
}

export const ClearWeekButton: React.FC<ClearWeekButtonProps> = ({ currentDate, onArchived }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const weekKey = `door-week-${getYear(currentDate)}-${String(getISOWeek(currentDate)).padStart(2, '0')}`;
      
      await doorUserTasksService.archiveWeekTasks(weekKey);
      
      toast({
        title: "Săptămână arhivată",
        description: "Sarcinile au fost mutate în arhivă. Le poți restaura oricând.",
      });
      
      setShowDialog(false);
      onArchived?.();
    } catch (error) {
      console.error('Archive error:', error);
      toast({
        title: "Eroare arhivare",
        description: "Nu s-au putut arhiva sarcinile. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <Archive className="h-4 w-4" />
        Clear săptămână
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arhivează săptămâna?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va muta toate sarcinile săptămânii în arhivă. 
              Datele nu vor fi șterse definitiv și le vei putea restaura oricând.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
              {isArchiving ? 'Arhivare...' : 'Arhivează'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
