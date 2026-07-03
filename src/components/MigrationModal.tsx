import React, { useState, useEffect } from 'react';
import { useMigration } from '@/context/MigrationContext';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cloud, Database, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { migrationService } from '@/services/migrationService';
import { useToast } from '@/hooks/use-toast';

export const MigrationModal: React.FC = () => {
  const { showMigrationUI, isMigrating, progress, startMigration, skipMigration } = useMigration();
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if migration just completed
    if (!isMigrating && progress.length > 0 && progress.every(p => p.status === 'completed')) {
      setMigrationComplete(true);
      setShowCleanupDialog(true);
    }
  }, [isMigrating, progress]);

  const getMigrationIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  const getMigrationLabel = (type: string): string => {
    switch (type) {
      case 'stack_sessions':
        return 'Stack Sessions';
      case 'user_progress':
        return 'User Progress';
      case 'door_tasks':
        return 'Door Tasks';
      case 'objectives':
        return 'Objectives';
      case 'fact_maps':
        return 'Fact Maps';
      default:
        return type;
    }
  };

  const totalProgress = progress.length > 0
    ? Math.round((progress.filter(p => p.status === 'completed').length / progress.length) * 100)
    : 0;

  const handleCleanup = async () => {
    try {
      await migrationService.clearLocalStorageAfterMigration();
      toast({
        title: 'Cleanup complete',
        description: 'Local storage has been cleared. Your data is now safely stored in the cloud.',
      });
      setShowCleanupDialog(false);
      skipMigration();
    } catch (error: any) {
      toast({
        title: 'Cleanup failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSkipCleanup = () => {
    setShowCleanupDialog(false);
    skipMigration();
  };

  return (
    <>
      <ResponsiveModal open={showMigrationUI && !showCleanupDialog} onOpenChange={(open) => !open && !isMigrating && skipMigration()} className="sm:max-w-md">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-primary" />
            <Database className="w-5 h-5 text-primary" />
          </div>
          <ResponsiveModalTitle>Migrate to Cloud</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {isMigrating
              ? 'Migrating your local data to the cloud...'
              : 'We detected local data that can be migrated to the cloud for better sync and backup.'}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {isMigrating && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} />
            </div>

            <div className="space-y-2">
              {progress.map((item) => (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getMigrationIcon(item.status)}
                    <span className="text-muted-foreground">{getMigrationLabel(item.type)}</span>
                  </div>
                  {item.total > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {item.migrated}/{item.total}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {progress.some(p => p.error) && (
              <div className="text-sm text-red-500">
                {progress.find(p => p.error)?.error}
              </div>
            )}
          </div>
        )}

        {!isMigrating && (
          <ResponsiveModalFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={skipMigration}>
              Skip for Now
            </Button>
            <Button onClick={startMigration}>
              Migrate to Cloud
            </Button>
          </ResponsiveModalFooter>
        )}
      </ResponsiveModal>

      {/* Cleanup Confirmation Dialog */}
      <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <AlertDialogTitle>Migration Complete!</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Your data has been successfully migrated to the cloud.
              </p>
              <p>
                Would you like to clear the old data from local storage? This will free up space
                and prevent any sync conflicts. Your data is safely stored in the cloud.
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 flex items-start gap-2">
                <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  You can always manage this later in Settings → Cloud Migration
                </span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipCleanup}>
              Keep Local Data
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCleanup} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Local Storage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
