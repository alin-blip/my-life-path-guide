import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface StackResetConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCreateBackup?: () => void;
  stackType: string;
  currentStep: number;
  totalSteps: number;
  hasAnswers: boolean;
}

export const StackResetConfirmation: React.FC<StackResetConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCreateBackup,
  stackType,
  currentStep,
  totalSteps,
  hasAnswers
}) => {
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const handleBackupAndReset = async () => {
    if (onCreateBackup) {
      setIsCreatingBackup(true);
      try {
        await onCreateBackup();
        setTimeout(() => {
          onConfirm();
          onClose();
        }, 500);
      } catch (error) {
        console.error('Error creating backup:', error);
        toast({
          title: "Eroare backup",
          description: "Nu s-a putut crea backup-ul. Resetarea a fost anulată.",
          variant: "destructive",
        });
      } finally {
        setIsCreatingBackup(false);
      }
    } else {
      onConfirm();
      onClose();
    }
  };

  const handleDirectReset = () => {
    onConfirm();
    onClose();
    
    toast({
      title: "Stack resetat",
      description: `${stackType} a fost resetat la început.`,
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Confirmare Reset
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Ești pe punctul să resetezi {stackType}. Toate răspunsurile și progresul vor fi pierdute.
            </p>
            
            {hasAnswers && (
              <div className="p-3 bg-background/50 rounded border border-orange-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progres curent:</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pasul {currentStep} din {totalSteps}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Vrei să salvezi progresul actual ca backup înainte de reset?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full">
            <AlertDialogCancel className="flex-1">
              Anulează
            </AlertDialogCancel>
            
            <Button
              variant="outline"
              onClick={handleDirectReset}
              className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset Direct
            </Button>
          </div>
          
          {onCreateBackup && hasAnswers && (
            <AlertDialogAction
              onClick={handleBackupAndReset}
              disabled={isCreatingBackup}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Creez backup...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Salvează & Reset
                </>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};