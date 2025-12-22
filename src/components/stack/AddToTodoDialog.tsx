import React from 'react';
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
import { ListTodo, X } from 'lucide-react';

interface AddToTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AddToTodoDialog: React.FC<AddToTodoDialogProps> = ({
  open,
  onOpenChange,
  actionText,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Adaugă la Idei?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <p>Acțiunea generată:</p>
            <div className="bg-muted p-3 rounded-lg border text-foreground font-medium">
              "{actionText.length > 150 ? actionText.substring(0, 150) + '...' : actionText}"
            </div>
            <p className="text-sm">
              Vrei să adaugi această acțiune în lista de idei pentru a o executa mai târziu?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Nu
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="gap-2 bg-primary hover:bg-primary/90">
            <ListTodo className="h-4 w-4" />
            Da, adaugă
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
