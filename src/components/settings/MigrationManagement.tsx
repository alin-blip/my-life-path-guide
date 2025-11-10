import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { migrationService, MigrationType } from '@/services/migrationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Cloud, 
  Database, 
  Download, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface MigrationRecord {
  id: string;
  migration_type: string;
  status: string;
  items_total: number;
  items_migrated: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export const MigrationManagement: React.FC = () => {
  const [migrations, setMigrations] = useState<MigrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackType, setRollbackType] = useState<MigrationType | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [retriggerConfirmOpen, setRetriggerConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMigrationHistory();
  }, []);

  const loadMigrationHistory = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { data, error } = await supabase
        .from('migration_status')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMigrations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading migration history',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (type: MigrationType) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const result = await migrationService.rollbackMigration(userData.user.id, type);
      
      if (result.success) {
        toast({
          title: 'Rollback successful',
          description: `Data has been restored from backup for ${type}`,
        });
        await loadMigrationHistory();
      } else {
        throw new Error(result.error || 'Rollback failed');
      }
    } catch (error: any) {
      toast({
        title: 'Rollback failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setRollbackType(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { data, error } = await supabase
        .from('migration_status')
        .select('migration_type, backup_data')
        .eq('user_id', userData.user.id);

      if (error) throw error;

      const backupData = data?.reduce((acc, item) => {
        acc[item.migration_type] = item.backup_data;
        return acc;
      }, {} as Record<string, any>);

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `migration-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exported',
        description: 'Your backup data has been downloaded',
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleClearLocalStorage = async () => {
    try {
      await migrationService.clearLocalStorageAfterMigration();
      toast({
        title: 'Local storage cleared',
        description: 'Migrated data has been removed from local storage',
      });
    } catch (error: any) {
      toast({
        title: 'Clear failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setClearConfirmOpen(false);
    }
  };

  const handleRetriggerMigration = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      setRetriggerConfirmOpen(false);
      window.location.reload(); // Reload to trigger migration modal
    } catch (error: any) {
      toast({
        title: 'Retrigger failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      in_progress: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getMigrationLabel = (type: string): string => {
    switch (type) {
      case 'stack_sessions': return 'Stack Sessions';
      case 'user_progress': return 'User Progress';
      case 'door_tasks': return 'Door Tasks';
      case 'objectives': return 'Objectives';
      case 'fact_maps': return 'Fact Maps';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <Database className="w-5 h-5 text-primary" />
            <CardTitle>Cloud Migration Management</CardTitle>
          </div>
          <CardDescription>
            Manage your data migration between local storage and cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportBackup}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Backup
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setRetriggerConfirmOpen(true)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Re-trigger Migration
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setClearConfirmOpen(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Storage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration History</CardTitle>
          <CardDescription>
            View past migration attempts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : migrations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No migration history found
            </div>
          ) : (
            <div className="space-y-3">
              {migrations.map((migration) => (
                <div 
                  key={migration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(migration.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getMigrationLabel(migration.migration_type)}
                        </span>
                        {getStatusBadge(migration.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {migration.items_total > 0 && (
                          <span>
                            {migration.items_migrated}/{migration.items_total} items
                            {' • '}
                          </span>
                        )}
                        <span>
                          {format(new Date(migration.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      {migration.error_message && (
                        <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {migration.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  {migration.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRollbackType(migration.migration_type as MigrationType)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Rollback
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation Dialog */}
      <AlertDialog open={!!rollbackType} onOpenChange={() => setRollbackType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback Migration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your data from backup for {rollbackType && getMigrationLabel(rollbackType)}.
              Your cloud data will remain unchanged, but local storage will be restored.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => rollbackType && handleRollback(rollbackType)}
            >
              Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Local Storage Confirmation */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Local Storage?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all migrated data from your browser's local storage.
              Make sure your data has been successfully migrated to the cloud before proceeding.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearLocalStorage} className="bg-destructive">
              Clear Storage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Retrigger Migration Confirmation */}
      <AlertDialog open={retriggerConfirmOpen} onOpenChange={setRetriggerConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-trigger Migration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reload the page and check for any data that needs to be migrated.
              Any unmigrated local storage data will be processed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRetriggerMigration}>
              Re-trigger
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
