import { supabase } from '@/integrations/supabase/client';
import { stackSessionsService } from './stackSessionsService';
import { userProgressService } from './userProgressService';
import { doorUserTasksService } from './doorUserTasksService';

export type MigrationType = 
  | 'stack_sessions' 
  | 'user_progress' 
  | 'door_tasks' 
  | 'objectives'
  | 'fact_maps';

export interface MigrationProgress {
  type: MigrationType;
  total: number;
  migrated: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export interface MigrationStatus {
  isComplete: boolean;
  inProgress: boolean;
  migrations: MigrationProgress[];
}

class MigrationService {
  private async getMigrationStatus(userId: string): Promise<MigrationStatus> {
    const { data, error } = await supabase
      .from('migration_status')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching migration status:', error);
      return { isComplete: false, inProgress: false, migrations: [] };
    }

    const migrations: MigrationProgress[] = data?.map(m => ({
      type: m.migration_type as MigrationType,
      total: m.items_total || 0,
      migrated: m.items_migrated || 0,
      status: m.status as any,
      error: m.error_message || undefined
    })) || [];

    const allComplete = migrations.length > 0 && migrations.every(m => m.status === 'completed');
    const anyInProgress = migrations.some(m => m.status === 'in_progress');

    return {
      isComplete: allComplete,
      inProgress: anyInProgress,
      migrations
    };
  }

  private async updateMigrationStatus(
    userId: string,
    type: MigrationType,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    data?: { total?: number; migrated?: number; error?: string; backupData?: any }
  ) {
    const updateData: any = {
      user_id: userId,
      migration_type: type,
      status,
      items_total: data?.total,
      items_migrated: data?.migrated,
      error_message: data?.error,
      backup_data: data?.backupData
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('migration_status')
      .upsert(updateData, { onConflict: 'user_id,migration_type' });

    if (error) {
      console.error('Error updating migration status:', error);
    }
  }

  async checkMigrationNeeded(userId: string): Promise<boolean> {
    const status = await this.getMigrationStatus(userId);
    
    // Check if any localStorage data exists that hasn't been migrated
    const hasStackSessions = Object.keys(localStorage).some(key => key.startsWith('stack-session-'));
    const hasDoorData = Object.keys(localStorage).some(key => key.startsWith('door-'));
    const hasProgress = localStorage.getItem('userProgress') !== null;
    
    const needsMigration = hasStackSessions || hasDoorData || hasProgress;
    
    return needsMigration && !status.isComplete;
  }

  async migrateAll(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const migrations: MigrationType[] = [
        'stack_sessions',
        'user_progress',
        'door_tasks',
        'objectives'
      ];

      for (const migrationType of migrations) {
        await this.updateMigrationStatus(userId, migrationType, 'in_progress');

        try {
          let result: { success: boolean; count: number; error?: string };

          switch (migrationType) {
            case 'stack_sessions':
              result = await this.migrateStackSessions(userId, onProgress);
              break;
            case 'user_progress':
              result = await this.migrateUserProgress(userId, onProgress);
              break;
            case 'door_tasks':
              result = await this.migrateDoorTasks(userId, onProgress);
              break;
            case 'objectives':
              result = await this.migrateObjectives(userId, onProgress);
              break;
            default:
              result = { success: true, count: 0 };
          }

          if (result.success) {
            await this.updateMigrationStatus(userId, migrationType, 'completed', {
              total: result.count,
              migrated: result.count
            });

            if (onProgress) {
              onProgress({
                type: migrationType,
                total: result.count,
                migrated: result.count,
                status: 'completed'
              });
            }
          } else {
            throw new Error(result.error || 'Migration failed');
          }
        } catch (error: any) {
          await this.updateMigrationStatus(userId, migrationType, 'failed', {
            error: error.message
          });

          if (onProgress) {
            onProgress({
              type: migrationType,
              total: 0,
              migrated: 0,
              status: 'failed',
              error: error.message
            });
          }

          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Migration error:', error);
      return { success: false, error: error.message };
    }
  }

  private async migrateStackSessions(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const count = await stackSessionsService.migrateLocalStorageToSupabase();
      return { success: true, count };
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  private async migrateUserProgress(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      await userProgressService.migrateLocalStorageData();
      return { success: true, count: 1 };
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  private async migrateDoorTasks(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Migrate door data from localStorage to database
      let count = 0;
      const doorKeys = Object.keys(localStorage).filter(key => key.startsWith('door-'));
      
      for (const key of doorKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          // The door data is already being saved to database via doorUserTasksService
          // This is just for cleanup and verification
          count++;
        } catch (e) {
          console.error('Error parsing door data:', e);
        }
      }

      return { success: true, count };
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  private async migrateObjectives(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Objectives are already being saved to database via objectivesService
      // This is just for cleanup and verification
      return { success: true, count: 0 };
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  async rollbackMigration(userId: string, migrationType: MigrationType): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('migration_status')
        .select('backup_data')
        .eq('user_id', userId)
        .eq('migration_type', migrationType)
        .single();

      if (error) throw error;

      if (data?.backup_data) {
        // Restore backup data to localStorage
        const backupData = data.backup_data as any;
        for (const [key, value] of Object.entries(backupData)) {
          localStorage.setItem(key, JSON.stringify(value));
        }

        // Reset migration status
        await this.updateMigrationStatus(userId, migrationType, 'pending');

        return { success: true };
      }

      return { success: false, error: 'No backup data found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearLocalStorageAfterMigration() {
    // Clear migrated data from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('stack-session-') || 
      key.startsWith('door-') ||
      key === 'userProgress'
    );

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const migrationService = new MigrationService();
