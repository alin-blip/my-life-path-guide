import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { doorStorageManager } from '@/services/doorStorageManager';
import { 
  Database, 
  Download, 
  Upload, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive
} from 'lucide-react';

interface StorageStatus {
  totalKeys: number;
  doorKeys: number;
  backupKeys: number;
  totalSize: number;
  weekKeys: string[];
  metadata: {
    lastBackup: string;
    backupCount: number;
    dataIntegrityChecks: number;
    lastRecovery?: string;
  };
  sizeInKB: number;
  isHealthy: boolean;
}

export function DoorStorageMonitor() {
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateStatus = () => {
      const status = doorStorageManager.getStorageStatus();
      setStorageStatus(status);
    };

    // Initial load
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleExportData = () => {
    try {
      const exportData = doorStorageManager.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `door-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "📁 Export complet",
        description: "Toate datele au fost exportate cu succes.",
      });
    } catch (error) {
      toast({
        title: "❌ Eroare export",
        description: "A apărut o problemă la exportul datelor.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = doorStorageManager.importData(data);
        
        if (success) {
          toast({
            title: "✅ Import reușit",
            description: "Datele au fost importate cu succes.",
          });
          
          // Refresh status
          const status = doorStorageManager.getStorageStatus();
          setStorageStatus(status);
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: "❌ Eroare import",
          description: "Fișierul nu este valid sau a apărut o problemă.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? "📊 Monitoring oprit" : "📊 Monitoring pornit",
      description: isMonitoring 
        ? "Monitorizarea în timp real a fost oprită."
        : "Monitorizarea în timp real a fost pornită.",
    });
  };

  if (!storageStatus) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Database className="w-6 h-6 animate-spin mr-2" />
            Se încarcă statusul storage-ului...
          </div>
        </CardContent>
      </Card>
    );
  }

  const storageUsagePercent = Math.min((storageStatus.sizeInKB / 5000) * 100, 100); // Assume 5MB limit
  const lastBackupDate = new Date(storageStatus.metadata.lastBackup);
  const timeSinceBackup = Date.now() - lastBackupDate.getTime();
  const backupAge = Math.floor(timeSinceBackup / (1000 * 60)); // minutes

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Monitor Storage Securizat
          {storageStatus.isHealthy ? (
            <Badge variant="default" className="bg-emerald-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sănătos
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Atenție
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{storageStatus.doorKeys}</div>
            <div className="text-sm text-muted-foreground">Date Door</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{storageStatus.backupKeys}</div>
            <div className="text-sm text-muted-foreground">Backup-uri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{storageStatus.weekKeys.length}</div>
            <div className="text-sm text-muted-foreground">Săptămâni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{storageStatus.sizeInKB}</div>
            <div className="text-sm text-muted-foreground">KB Folosiți</div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Utilizare Storage</span>
            <span className="text-sm text-muted-foreground">{storageStatus.sizeInKB} KB</span>
          </div>
          <Progress value={storageUsagePercent} className="h-2" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="w-3 h-3" />
            {storageUsagePercent.toFixed(1)}% din spațiul recomandat
          </div>
        </div>

        {/* Backup Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Ultimul Backup</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {backupAge < 60 
                ? `${backupAge} minute în urmă`
                : `${Math.floor(backupAge / 60)} ore în urmă`
              }
            </div>
            <div className="text-xs">
              Total backup-uri: {storageStatus.metadata.backupCount}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verificări Integritate</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {storageStatus.metadata.dataIntegrityChecks} verificări efectuate
            </div>
            {storageStatus.metadata.lastRecovery && (
              <div className="text-xs text-orange-500">
                Ultima recuperare: {new Date(storageStatus.metadata.lastRecovery).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Date
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="import-file" className="cursor-pointer flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Import Date
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </Button>

          <Button 
            onClick={toggleMonitoring} 
            variant={isMonitoring ? "default" : "outline"} 
            size="sm"
          >
            <Database className={`w-4 h-4 mr-2 ${isMonitoring ? 'animate-pulse' : ''}`} />
            {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
          </Button>
        </div>

        {/* Real-time Status */}
        {isMonitoring && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">📊 Monitoring Activ</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>✅ Backup automat la fiecare 5 minute</div>
              <div>🔍 Verificare integritate la fiecare 30 secunde</div>
              <div>🔄 Recovery automat în caz de probleme</div>
              <div>💾 Maximum {storageStatus.backupKeys} backup-uri păstrate</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}