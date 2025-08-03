import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DominoKeyPoint } from '@/types/door';
import { useDoorStorageLogger } from './useDoorStorageLogger';

interface DataIntegrityCheck {
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  dominoKeyPoints: DominoKeyPoint[];
}

export function useDoorDataIntegrity() {
  const { toast } = useToast();
  const { logStorageAction } = useDoorStorageLogger();

  // Function to check data integrity
  const checkDataIntegrity = useCallback((data: DataIntegrityCheck) => {
    const issues: string[] = [];
    
    // Check for empty or corrupted week key
    if (!data.currentWeekKey || !data.currentWeekKey.includes('door-week-')) {
      issues.push('Invalid week key');
    }
    
    // Check for missing or corrupted lists
    if (!Array.isArray(data.hotList)) {
      issues.push('Hot list is corrupted');
    }
    if (!Array.isArray(data.hitList)) {
      issues.push('Hit list is corrupted');
    }
    if (!Array.isArray(data.doList)) {
      issues.push('Do list is corrupted');
    }
    if (!Array.isArray(data.dominoKeyPoints)) {
      issues.push('Domino key points are corrupted');
    }
    
    // Check for duplicate IDs in lists
    const hotIds = new Set();
    const hitIds = new Set();
    const doIds = new Set();
    
    data.hotList.forEach(item => {
      if (hotIds.has(item.id)) {
        issues.push(`Duplicate hot list item: ${item.id}`);
      }
      hotIds.add(item.id);
    });
    
    data.hitList.forEach(item => {
      if (hitIds.has(item.id)) {
        issues.push(`Duplicate hit list item: ${item.id}`);
      }
      hitIds.add(item.id);
    });
    
    data.doList.forEach(item => {
      if (doIds.has(item.id)) {
        issues.push(`Duplicate do list item: ${item.id}`);
      }
      doIds.add(item.id);
    });

    if (issues.length > 0) {
      logStorageAction('Data integrity issues found', { issues, weekKey: data.currentWeekKey });
      return { isValid: false, issues };
    }
    
    return { isValid: true, issues: [] };
  }, [logStorageAction]);

  // Function to create backup
  const createBackup = useCallback((data: DataIntegrityCheck) => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        weekKey: data.currentWeekKey,
        hotList: data.hotList,
        hitList: data.hitList,
        doList: data.doList,
        dominoKeyPoints: data.dominoKeyPoints,
        version: '1.0'
      };
      
      const backupKey = `door-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Keep only the last 5 backups
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => key.startsWith('door-backup-')).sort();
      
      if (backupKeys.length > 5) {
        const keysToRemove = backupKeys.slice(0, backupKeys.length - 5);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      logStorageAction('Backup created', { backupKey, timestamp: backupData.timestamp });
      return backupKey;
    } catch (error: any) {
      logStorageAction('Failed to create backup', { error: error.message });
      return null;
    }
  }, [logStorageAction]);

  // Function to restore from backup
  const restoreFromBackup = useCallback((backupKey?: string) => {
    try {
      let selectedBackup = backupKey;
      
      if (!selectedBackup) {
        // Find the most recent backup
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('door-backup-')).sort();
        selectedBackup = backupKeys[backupKeys.length - 1];
      }
      
      if (!selectedBackup) {
        throw new Error('No backup found');
      }
      
      const backupData = localStorage.getItem(selectedBackup);
      if (!backupData) {
        throw new Error('Backup data not found');
      }
      
      const parsedBackup = JSON.parse(backupData);
      
      // Restore the data
      localStorage.setItem('door-hot-list', JSON.stringify(parsedBackup.hotList));
      localStorage.setItem(parsedBackup.weekKey, JSON.stringify({
        hitList: parsedBackup.hitList,
        doList: parsedBackup.doList,
        dominoKeyPoints: parsedBackup.dominoKeyPoints,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      }));
      
      logStorageAction('Data restored from backup', { 
        backupKey: selectedBackup, 
        timestamp: parsedBackup.timestamp 
      });
      
      toast({
        title: "🔄 Date restaurate",
        description: `Datele au fost restaurate din backup-ul de la ${new Date(parsedBackup.timestamp).toLocaleString()}`,
      });
      
      return true;
    } catch (error: any) {
      logStorageAction('Failed to restore from backup', { error: error.message });
      toast({
        title: "❌ Eroare restaurare",
        description: "Nu s-au putut restaura datele din backup",
        variant: "destructive",
      });
      return false;
    }
  }, [logStorageAction, toast]);

  // Function to export data for manual backup
  const exportData = useCallback((data: DataIntegrityCheck) => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          weekKey: data.currentWeekKey,
          hotList: data.hotList,
          hitList: data.hitList,
          doList: data.doList,
          dominoKeyPoints: data.dominoKeyPoints
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `door-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📁 Export realizat",
        description: "Datele au fost exportate cu succes",
      });
      
      logStorageAction('Data exported', { filename: link.download });
    } catch (error: any) {
      logStorageAction('Failed to export data', { error: error.message });
      toast({
        title: "❌ Eroare export",
        description: "Nu s-au putut exporta datele",
        variant: "destructive",
      });
    }
  }, [toast, logStorageAction]);

  return {
    checkDataIntegrity,
    createBackup,
    restoreFromBackup,
    exportData
  };
}
