import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { napoleonHillBackupService, BackupMetadata } from '@/services/napoleonHillBackupService';
import { Cloud, Download, Trash2, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
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

export const BackupManager: React.FC = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
    // Auto-backup check on mount
    napoleonHillBackupService.autoBackupIfNeeded();
  }, []);

  const loadBackups = async () => {
    setIsLoading(true);
    const data = await napoleonHillBackupService.listBackups();
    setBackups(data);
    setIsLoading(false);
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    const result = await napoleonHillBackupService.createBackup();
    
    if (result.success) {
      toast({
        title: "✅ Backup creat",
        description: result.message,
      });
      loadBackups();
    } else {
      toast({
        title: "Eroare",
        description: result.message,
        variant: "destructive"
      });
    }
    
    setIsCreating(false);
  };

  const handleDownloadBackup = async (filename: string) => {
    const data = await napoleonHillBackupService.downloadBackup(filename);
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "📥 Backup descărcat",
        description: "Fișierul a fost salvat local."
      });
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const success = await napoleonHillBackupService.restoreFromBackup(filename);
    
    if (success) {
      toast({
        title: "✅ Backup restaurat",
        description: "Draft-urile au fost restaurate cu succes.",
      });
    } else {
      toast({
        title: "Eroare",
        description: "Nu am putut restaura backup-ul.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    const success = await napoleonHillBackupService.deleteBackup(filename);
    
    if (success) {
      toast({
        title: "🗑️ Backup șters",
        description: "Backup-ul a fost șters cu succes."
      });
      loadBackups();
    } else {
      toast({
        title: "Eroare",
        description: "Nu am putut șterge backup-ul.",
        variant: "destructive"
      });
    }
    
    setDeleteTarget(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              Backup-uri Cloud
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadBackups}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleCreateBackup}
              size="sm"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creez backup...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Creează Backup
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Backup-uri automate pentru toate draft-urile Napoleon Hill. Ultimele 10 backup-uri sunt păstrate automat.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nu există backup-uri încă</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.filename}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(backup.created_at)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatSize(backup.size)}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => handleDownloadBackup(backup.filename)}
                    variant="ghost"
                    size="sm"
                    title="Descarcă backup"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleRestoreBackup(backup.filename)}
                    variant="ghost"
                    size="sm"
                    title="Restaurează backup"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(backup.filename)}
                    variant="ghost"
                    size="sm"
                    title="Șterge backup"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergi acest backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Backup-ul va fi șters permanent din cloud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDeleteBackup(deleteTarget)}>
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};