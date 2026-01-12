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
import { Zap, AlertTriangle } from 'lucide-react';
import { ROUTINE_XP_REWARDS } from '@/hooks/useRoutineXP';

interface SkipConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepName: string;
  onConfirmSkip: () => void;
}

export function SkipConfirmDialog({
  open,
  onOpenChange,
  stepName,
  onConfirmSkip,
}: SkipConfirmDialogProps) {
  const xpLoss = ROUTINE_XP_REWARDS.step_completed;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            Sari peste pas?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Ești sigur că vrei să sari peste <strong className="text-foreground">{stepName}</strong>?
            </p>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">
                Pierzi <strong>{xpLoss} XP</strong> dacă sari
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Poți oricând reveni și completa acest pas mai târziu.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="flex-1">
            Rămân aici
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmSkip}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Sar peste
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
