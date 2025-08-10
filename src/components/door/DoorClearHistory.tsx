import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doorUserTasksService } from '@/services/doorUserTasksService';

interface DoorClearHistoryProps {
  onHistoryCleared?: () => void;
}

export const DoorClearHistory: React.FC<DoorClearHistoryProps> = ({
  onHistoryCleared
}) => {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearHistory = async () => {
    setIsClearing(true);
    
    try {
      const deletedCount = await doorUserTasksService.clearUserHistory();
      
      toast({
        title: "🗑️ Istoric șters complet",
        description: `${deletedCount} taskuri au fost șterse din cloud. Toate datele locale au fost curățate.`,
      });

      // Notify parent component
      onHistoryCleared?.();
      
      // Refresh page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error clearing history:', error);
      toast({
        title: "⚠️ Eroare la ștergerea istoricului",
        description: error.message || "A apărut o problemă la curățarea datelor.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
        >
          <History className="w-4 h-4 mr-2" />
          Șterge Istoric
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#1E293B] border-red-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Șterge tot istoricul?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            <div className="space-y-2">
              <p>
                Această acțiune va șterge <strong>permanent</strong> toate taskurile tale:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                <li>Toate listele Hot, Hit și Do din toate săptămânile</li>
                <li>Istoricul complet din cloud (Supabase)</li>
                <li>Toate datele locale din browser (localStorage)</li>
              </ul>
              <p className="text-red-400 font-medium">
                ⚠️ Această acțiune nu poate fi anulată!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-600 hover:bg-gray-500 text-white">
            Anulează
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearHistory}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            {isClearing ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Șterg...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Da, șterge totul
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};