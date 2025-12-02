import { supabase } from '@/integrations/supabase/client';

export interface BackupMetadata {
  filename: string;
  created_at: string;
  size: number;
  draftsCount?: number;
  projectsCount?: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  user_id: string;
  drafts: any[];
  projects: any[];
  metadata: {
    total_drafts: number;
    total_projects: number;
    backup_type: string;
  };
}

export const napoleonHillBackupService = {
  // Create a new backup
  async createBackup(): Promise<{ success: boolean; message: string; filename?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('napoleon-hill-backup', {
        body: {}
      });

      if (error) {
        console.error('Backup error:', error);
        return { success: false, message: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error creating backup:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // List all backups for current user
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.storage
        .from('napoleon-hill-backups')
        .list(user.id, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error listing backups:', error);
        return [];
      }

      return data.map(file => ({
        filename: file.name,
        created_at: file.created_at,
        size: file.metadata?.size || 0
      }));
    } catch (error) {
      console.error('Error in listBackups:', error);
      return [];
    }
  },

  // Download a specific backup
  async downloadBackup(filename: string): Promise<BackupData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.storage
        .from('napoleon-hill-backups')
        .download(`${user.id}/${filename}`);

      if (error) {
        console.error('Error downloading backup:', error);
        return null;
      }

      const text = await data.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error in downloadBackup:', error);
      return null;
    }
  },

  // Restore from backup
  async restoreFromBackup(filename: string): Promise<boolean> {
    try {
      const backupData = await this.downloadBackup(filename);
      if (!backupData) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Restore drafts
      for (const draft of backupData.drafts) {
        const { error } = await supabase
          .from('napoleon_hill_principle_drafts')
          .upsert({
            ...draft,
            user_id: user.id // Ensure correct user_id
          }, {
            onConflict: 'project_id,principle_number'
          });

        if (error) {
          console.error('Error restoring draft:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in restoreFromBackup:', error);
      return false;
    }
  },

  // Delete a backup
  async deleteBackup(filename: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.storage
        .from('napoleon-hill-backups')
        .remove([`${user.id}/${filename}`]);

      if (error) {
        console.error('Error deleting backup:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteBackup:', error);
      return false;
    }
  },

  // Auto-backup: Create backup if last one is older than 24 hours
  async autoBackupIfNeeded(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length === 0) {
        // No backups exist, create one
        await this.createBackup();
        return;
      }

      const lastBackup = backups[0];
      const lastBackupDate = new Date(lastBackup.created_at);
      const now = new Date();
      const hoursSinceLastBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastBackup >= 24) {
        console.log('🔄 Auto-backup triggered (>24h since last backup)');
        await this.createBackup();
      }
    } catch (error) {
      console.error('Error in autoBackupIfNeeded:', error);
    }
  }
};