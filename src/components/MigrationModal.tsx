import React from 'react';
import { useMigration } from '@/context/MigrationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cloud, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const MigrationModal: React.FC = () => {
  const { showMigrationUI, isMigrating, progress, startMigration, skipMigration } = useMigration();

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

  return (
    <Dialog open={showMigrationUI} onOpenChange={(open) => !open && !isMigrating && skipMigration()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-primary" />
            <Database className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle>Migrate to Cloud</DialogTitle>
          <DialogDescription>
            {isMigrating
              ? 'Migrating your local data to the cloud...'
              : 'We detected local data that can be migrated to the cloud for better sync and backup.'}
          </DialogDescription>
        </DialogHeader>

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
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={skipMigration}>
              Skip for Now
            </Button>
            <Button onClick={startMigration}>
              Migrate to Cloud
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
