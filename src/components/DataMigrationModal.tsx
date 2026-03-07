import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { migrationService, MigrationProgress } from '@/services/migrationService';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, AlertCircle, Loader2, Database, ArrowRight } from 'lucide-react';

export function DataMigrationModal() {
  const [open, setOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    checkIfMigrationNeeded();
  }, []);

  const checkIfMigrationNeeded = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const needsMigration = await migrationService.checkMigrationNeeded(user.id);
      setOpen(needsMigration);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const result = await migrationService.migrateAll(user.id, (p) => {
        setProgress(prev => {
          const existing = prev.findIndex(x => x.type === p.type);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = p;
            return updated;
          }
          return [...prev, p];
        });
      });

      if (result.success) {
        setCompleted(true);
        // Clear localStorage after successful migration
        await migrationService.clearLocalStorageAfterMigration();
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      } else {
        setError(result.error || 'Migration failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message || 'An error occurred during migration');
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  const getMigrationLabel = (type: string) => {
    const labels: Record<string, string> = {
      stack_sessions: 'Stack Sessions',
      user_progress: 'User Progress',
      door_tasks: 'Door Planning & Tasks',
      objectives: 'Weekly Objectives',
      fact_maps: 'Missions & Fact Maps'
    };
    return labels[type] || type;
  };

  const totalProgress = progress.length > 0
    ? (progress.reduce((sum, p) => sum + (p.migrated / Math.max(p.total, 1)), 0) / progress.length) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Securizează-ți datele
          </DialogTitle>
          <DialogDescription>
            Am detectat date locale care pot fi pierdute. Migrăm acum toate datele tale către cloud pentru:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sincronizare între dispozitive</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Backup automat și securizat</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Protecție împotriva pierderii datelor</span>
            </div>
          </div>

          {/* Progress Section */}
          {migrating && (
            <div className="space-y-3">
              <Progress value={totalProgress} className="h-2" />
              <div className="space-y-1 text-sm">
                {progress.map((p) => (
                  <div key={p.type} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{getMigrationLabel(p.type)}</span>
                    <div className="flex items-center gap-2">
                      {p.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : p.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {p.migrated}/{p.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Message */}
          {completed && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-600">
                Migrare completă! Datele tale sunt acum securizate în cloud.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {!completed && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={migrating}
                className="flex-1"
              >
                Mai târziu
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={migrating}
                className="flex-1"
              >
                {migrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrare în curs...
                  </>
                ) : (
                  <>
                    Migrează acum
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
