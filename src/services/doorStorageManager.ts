import { HotListItem, HitListItem, DoListItem, DominoKeyPoint, DayOfWeek } from '@/types/door';
import { format } from 'date-fns';

interface DoorStorageData {
  currentWeekKey: string;
  hotList: HotListItem[];
  hitList: HitListItem[];
  doList: DoListItem[];
  selectedDomino: HotListItem | null;
  dominoKeyPoints: DominoKeyPoint[];
  activeDay: DayOfWeek;
  activeList: 'hit' | 'do';
  isDominoCompleted?: boolean;
}

interface StorageVersion {
  data: DoorStorageData;
  timestamp: string;
  version: number;
}

interface StorageMetadata {
  lastBackup: string;
  backupCount: number;
  dataIntegrityChecks: number;
  lastRecovery?: string;
}

class DoorStorageManager {
  private static instance: DoorStorageManager;
  private lockKey = 'door-storage-lock';
  private metadataKey = 'door-storage-metadata';
  private backupPrefix = 'door-backup-';
  private maxBackups = 50;
  private autoBackupInterval = 5 * 60 * 1000; // 5 minutes
  private integrityCheckInterval = 30 * 1000; // 30 seconds
  private isLocked = false;
  private backupTimer?: number;
  private integrityTimer?: number;

  private constructor() {
    this.initializeMetadata();
    this.startAutoBackup();
    this.startIntegrityMonitoring();
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  public static getInstance(): DoorStorageManager {
    if (!DoorStorageManager.instance) {
      DoorStorageManager.instance = new DoorStorageManager();
    }
    return DoorStorageManager.instance;
  }

  private async acquireLock(): Promise<boolean> {
    if (this.isLocked) return false;
    
    const lockTime = Date.now().toString();
    const existingLock = localStorage.getItem(this.lockKey);
    
    // Check if lock is stale (older than 30 seconds)
    if (existingLock && (Date.now() - parseInt(existingLock)) < 30000) {
      return false;
    }
    
    localStorage.setItem(this.lockKey, lockTime);
    this.isLocked = true;
    return true;
  }

  private releaseLock(): void {
    if (this.isLocked) {
      localStorage.removeItem(this.lockKey);
      this.isLocked = false;
    }
  }

  private initializeMetadata(): void {
    const metadata = this.getMetadata();
    if (!metadata.lastBackup) {
      this.updateMetadata({
        lastBackup: new Date().toISOString(),
        backupCount: 0,
        dataIntegrityChecks: 0
      });
    }
  }

  private getMetadata(): StorageMetadata {
    try {
      const data = localStorage.getItem(this.metadataKey);
      return data ? JSON.parse(data) : {
        lastBackup: '',
        backupCount: 0,
        dataIntegrityChecks: 0
      };
    } catch {
      return {
        lastBackup: '',
        backupCount: 0,
        dataIntegrityChecks: 0
      };
    }
  }

  private updateMetadata(updates: Partial<StorageMetadata>): void {
    const metadata = { ...this.getMetadata(), ...updates };
    localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
  }

  public async saveData(data: DoorStorageData): Promise<boolean> {
    if (!await this.acquireLock()) {
      console.warn('🔒 Storage is locked, skipping save');
      return false;
    }

    try {
      // Validate data integrity before saving
      if (!this.validateData(data)) {
        throw new Error('Data validation failed');
      }

      // Check if domino is complete
      const isDominoComplete = data.dominoKeyPoints.length > 0 && 
        data.dominoKeyPoints.every(point => 
          point.text && point.text.trim() !== '' && point.completed === true
        );

      // Save hotList separately (shared across weeks)
      const hotListBackup = this.createBackup({
        ...data,
        isDominoCompleted: isDominoComplete
      });
      localStorage.setItem('door-hot-list', JSON.stringify(data.hotList));
      localStorage.setItem(`${this.backupPrefix}hot-list-${Date.now()}`, JSON.stringify(hotListBackup));

      // Save week-specific data with versioning
      const weekData = {
        hitList: data.hitList,
        doList: data.doList,
        selectedDomino: data.selectedDomino,
        dominoKeyPoints: data.dominoKeyPoints,
        activeDay: data.activeDay,
        activeList: data.activeList,
        isDominoCompleted: isDominoComplete,
        lastSaved: new Date().toISOString(),
        version: '2.0',
        checksum: this.generateChecksum(data)
      };

      localStorage.setItem(data.currentWeekKey, JSON.stringify(weekData));
      
      // Create versioned backup
      const versionedBackup = this.createBackup({
        ...data,
        isDominoCompleted: isDominoComplete
      });
      localStorage.setItem(`${this.backupPrefix}${data.currentWeekKey}-${Date.now()}`, JSON.stringify(versionedBackup));

      this.cleanupOldBackups();
      
      console.log('💾 Data saved successfully', {
        weekKey: data.currentWeekKey,
        timestamp: weekData.lastSaved,
        checksum: weekData.checksum
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to save data:', error);
      await this.attemptRecovery(data.currentWeekKey);
      return false;
    } finally {
      this.releaseLock();
    }
  }

  public loadData(weekKey: string): DoorStorageData | null {
    try {
      // Load week-specific data
      const weekDataStr = localStorage.getItem(weekKey);
      const weekData = weekDataStr ? JSON.parse(weekDataStr) : null;

      // Load shared hotList
      const hotListStr = localStorage.getItem('door-hot-list');
      const hotList = hotListStr ? JSON.parse(hotListStr) : [];

      if (!weekData) {
        return {
          currentWeekKey: weekKey,
          hotList,
          hitList: [],
          doList: [],
          selectedDomino: null,
          dominoKeyPoints: [],
          activeDay: 'M' as DayOfWeek,
          activeList: 'hit' as 'hit' | 'do',
          isDominoCompleted: false
        };
      }

      // Verify data integrity
      const loadedData: DoorStorageData = {
        currentWeekKey: weekKey,
        hotList,
        hitList: weekData.hitList || [],
        doList: weekData.doList || [],
        selectedDomino: weekData.selectedDomino || null,
        dominoKeyPoints: weekData.dominoKeyPoints || [],
        activeDay: this.normalizeDay(weekData.activeDay || 'M'),
        activeList: weekData.activeList || 'hit',
        isDominoCompleted: weekData.isDominoCompleted || false
      };

      if (weekData.checksum && !this.verifyChecksum(loadedData, weekData.checksum)) {
        console.warn('⚠️ Data integrity check failed, attempting recovery');
        return this.attemptRecovery(weekKey) || loadedData;
      }

      return loadedData;
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      return this.attemptRecovery(weekKey);
    }
  }

  private validateData(data: DoorStorageData): boolean {
    return !!(
      data.currentWeekKey &&
      Array.isArray(data.hotList) &&
      Array.isArray(data.hitList) &&
      Array.isArray(data.doList) &&
      Array.isArray(data.dominoKeyPoints) &&
      data.activeDay &&
      data.activeList
    );
  }

  private generateChecksum(data: DoorStorageData): string {
    const content = JSON.stringify({
      hitList: data.hitList,
      doList: data.doList,
      dominoKeyPoints: data.dominoKeyPoints
    });
    return btoa(content).slice(0, 16);
  }

  private verifyChecksum(data: DoorStorageData, expectedChecksum: string): boolean {
    return this.generateChecksum(data) === expectedChecksum;
  }

  private normalizeDay(d: any): DayOfWeek {
    if (typeof d !== 'string') return (d as DayOfWeek) || 'M';
    const map: Record<string, DayOfWeek> = {
      monday: 'M',
      tuesday: 'T',
      wednesday: 'W',
      thursday: 'Th',
      friday: 'F',
      saturday: 'Sa',
      sunday: 'Su',
      m: 'M',
      t: 'T',
      w: 'W',
      th: 'Th',
      f: 'F',
      sa: 'Sa',
      su: 'Su',
    };
    const key = d.toLowerCase();
    return map[key] || (d as DayOfWeek) || 'M';
  }

  private createBackup(data: DoorStorageData): StorageVersion {
    return {
      data,
      timestamp: new Date().toISOString(),
      version: Date.now()
    };
  }

  private startAutoBackup(): void {
    this.backupTimer = window.setInterval(() => {
      this.performBackup();
    }, this.autoBackupInterval);
  }

  private startIntegrityMonitoring(): void {
    this.integrityTimer = window.setInterval(() => {
      this.performIntegrityCheck();
    }, this.integrityCheckInterval);
  }

  private performBackup(): void {
    try {
      const allKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('door-week-') || key === 'door-hot-list'
      );

      allKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const backupKey = `${this.backupPrefix}auto-${key}-${Date.now()}`;
          localStorage.setItem(backupKey, data);
        }
      });

      this.updateMetadata({
        lastBackup: new Date().toISOString(),
        backupCount: this.getMetadata().backupCount + 1
      });

      console.log('🔄 Auto backup completed');
    } catch (error) {
      console.error('❌ Auto backup failed:', error);
    }
  }

  private performIntegrityCheck(): void {
    try {
      const metadata = this.getMetadata();
      this.updateMetadata({
        dataIntegrityChecks: metadata.dataIntegrityChecks + 1
      });

      // Check for corruption in critical data
      const hotListStr = localStorage.getItem('door-hot-list');
      if (hotListStr) {
        JSON.parse(hotListStr); // Will throw if corrupted
      }

      const weekKeys = Object.keys(localStorage).filter(key => key.startsWith('door-week-'));
      weekKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Will throw if corrupted
        }
      });
    } catch (error) {
      console.error('🚨 Data corruption detected:', error);
      this.handleDataCorruption();
    }
  }

  private handleDataCorruption(): void {
    console.log('🔧 Attempting automatic data recovery...');
    
    // Try to recover from the most recent backup
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.backupPrefix))
      .sort((a, b) => {
        const aTime = parseInt(a.split('-').pop() || '0');
        const bTime = parseInt(b.split('-').pop() || '0');
        return bTime - aTime;
      });

    if (backupKeys.length > 0) {
      try {
        const latestBackup = localStorage.getItem(backupKeys[0]);
        if (latestBackup) {
          const backupData: StorageVersion = JSON.parse(latestBackup);
          console.log('✅ Data recovered from backup:', backupData.timestamp);
          
          this.updateMetadata({
            lastRecovery: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Recovery failed:', error);
      }
    }

    console.error('🚨 Unable to recover data automatically');
  }

  private attemptRecovery(weekKey: string): DoorStorageData | null {
    console.log('🔧 Attempting data recovery for week:', weekKey);
    
    // Find the most recent backup for this week
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.includes(weekKey) && key.startsWith(this.backupPrefix))
      .sort((a, b) => {
        const aTime = parseInt(a.split('-').pop() || '0');
        const bTime = parseInt(b.split('-').pop() || '0');
        return bTime - aTime;
      });

    if (backupKeys.length > 0) {
      try {
        const backupData = localStorage.getItem(backupKeys[0]);
        if (backupData) {
          const backup: StorageVersion = JSON.parse(backupData);
          console.log('✅ Data recovered from backup:', backup.timestamp);
          
          this.updateMetadata({
            lastRecovery: new Date().toISOString()
          });
          
          return backup.data;
        }
      } catch (error) {
        console.error('❌ Recovery failed:', error);
      }
    }

    return null;
  }

  private cleanupOldBackups(): void {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.backupPrefix))
      .sort((a, b) => {
        const aTime = parseInt(a.split('-').pop() || '0');
        const bTime = parseInt(b.split('-').pop() || '0');
        return bTime - aTime;
      });

    // Keep only the most recent backups
    if (backupKeys.length > this.maxBackups) {
      const toDelete = backupKeys.slice(this.maxBackups);
      toDelete.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 Cleaned up ${toDelete.length} old backups`);
    }
  }

  public exportData(): string {
    const allData: { [key: string]: any } = {};
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('door-')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            allData[key] = JSON.parse(value);
          } catch {
            allData[key] = value;
          }
        }
      }
    });

    return JSON.stringify({
      exportTime: new Date().toISOString(),
      version: '2.0',
      metadata: this.getMetadata(),
      data: allData
    }, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.data) {
        Object.entries(importData.data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        
        console.log('✅ Data imported successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Import failed:', error);
      return false;
    }
  }

  public getStorageStatus() {
    const metadata = this.getMetadata();
    const stats = {
      totalKeys: 0,
      doorKeys: 0,
      backupKeys: 0,
      totalSize: 0,
      weekKeys: [] as string[]
    };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        stats.totalKeys++;
        const value = localStorage.getItem(key) || '';
        stats.totalSize += key.length + value.length;
        
        if (key.startsWith('door-')) {
          stats.doorKeys++;
          if (key.startsWith('door-week-')) {
            stats.weekKeys.push(key);
          }
        }
        
        if (key.startsWith(this.backupPrefix)) {
          stats.backupKeys++;
        }
      }
    }
    
    return {
      ...stats,
      metadata,
      sizeInKB: Math.round(stats.totalSize / 1024),
      isHealthy: stats.doorKeys > 0 && stats.backupKeys > 0
    };
  }

  private cleanup(): void {
    if (this.backupTimer) {
      window.clearInterval(this.backupTimer);
    }
    if (this.integrityTimer) {
      window.clearInterval(this.integrityTimer);
    }
    this.releaseLock();
  }
}

export const doorStorageManager = DoorStorageManager.getInstance();
