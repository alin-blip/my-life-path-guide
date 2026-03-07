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
    const hasDoorData = Object.keys(localStorage).some(key => 
      key.startsWith('door-') || 
      key.startsWith('objectives-') ||
      key.startsWith('weeklyObjectives-')
    );
    const hasProgress = localStorage.getItem('userProgress') !== null;
    const hasMissions = localStorage.getItem('monthlyMissions') !== null;
    const hasFactMaps = Object.keys(localStorage).some(key => 
      key.startsWith('factMaps-') || 
      key.startsWith('annualGoals-')
    );
    
    const needsMigration = hasStackSessions || hasDoorData || hasProgress || hasMissions || hasFactMaps;
    
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
        'objectives',
        'fact_maps'
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
            case 'fact_maps':
              result = await this.migrateMissions(userId, onProgress);
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
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          await this.updateMigrationStatus(userId, migrationType, 'failed', {
            error: message
          });

          if (onProgress) {
            onProgress({
              type: migrationType,
              total: 0,
              migrated: 0,
              status: 'failed',
              error: message
            });
          }

          return { success: false, error: message };
        }
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Migration error:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  private async migrateStackSessions(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const count = await stackSessionsService.migrateLocalStorageToSupabase();
      return { success: true, count };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, count: 0, error: message };
    }
  }

  private async migrateUserProgress(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      await userProgressService.migrateLocalStorageData();
      return { success: true, count: 1 };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, count: 0, error: message };
    }
  }

  private async migrateDoorTasks(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      let count = 0;
      const doorKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('door-week-') || 
        key.startsWith('door-planning-')
      );
      
      console.log(`Found ${doorKeys.length} door-related localStorage keys to migrate`);

      for (const key of doorKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Extract week key from localStorage key
          const weekKeyMatch = key.match(/door-(?:week|planning)-(.+)/);
          if (!weekKeyMatch) continue;
          
          const weekKey = `door-week-${weekKeyMatch[1]}`;
          
          // Migrate hot list, hit list, do list
          if (data.hotList || data.hitList || data.doList) {
            const hotList = (data.hotList || []).map((item: any) => ({
              user_id: userId,
              week_key: weekKey,
              item_id: item.id || `hot-${Date.now()}-${Math.random()}`,
              title: item.text || item.title || '',
              list_type: 'hot',
              selected: item.selected || false,
              priority: this.mapPriorityToNumber(item.priority),
            }));

            const hitList = (data.hitList || []).map((item: any) => ({
              user_id: userId,
              week_key: weekKey,
              item_id: item.id || `hit-${Date.now()}-${Math.random()}`,
              title: item.text || item.title || '',
              list_type: 'hit',
              day_of_week: item.day || null,
              completed: item.completed || false,
              priority: this.mapPriorityToNumber(item.priority),
            }));

            const doList = (data.doList || []).map((item: any) => ({
              user_id: userId,
              week_key: weekKey,
              item_id: item.id || `do-${Date.now()}-${Math.random()}`,
              title: item.text || item.title || '',
              list_type: 'do',
              day_of_week: item.day || null,
              completed: item.completed || false,
              priority: this.mapPriorityToNumber(item.priority),
            }));

            // Insert all lists
            const allItems = [...hotList, ...hitList, ...doList];
            if (allItems.length > 0) {
              const { error } = await supabase
                .from('hot_list_items')
                .upsert(allItems, { 
                  onConflict: 'user_id,week_key,item_id',
                  ignoreDuplicates: false 
                });

              if (error) {
                console.error(`Error migrating lists for ${weekKey}:`, error);
              } else {
                count += allItems.length;
              }
            }
          }

          // Migrate weekly planning (domino, key points, week goal)
          if (data.selectedDomino || data.dominoKeyPoints || data.weekGoal) {
            const planningData: any = {
              user_id: userId,
              week_key: weekKey,
              domino_title: data.selectedDomino?.text || data.selectedDomino?.title || null,
              week_goal: data.weekGoal || null,
              key_points: data.dominoKeyPoints || [],
            };

            const { error } = await supabase
              .from('weekly_planning')
              .upsert(planningData, { 
                onConflict: 'user_id,week_key',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error(`Error migrating planning for ${weekKey}:`, error);
            } else {
              count++;
            }
          }

          if (onProgress) {
            onProgress({
              type: 'door_tasks',
              total: doorKeys.length,
              migrated: count,
              status: 'in_progress'
            });
          }
        } catch (e) {
          console.error(`Error parsing door data for key ${key}:`, e);
        }
      }

      console.log(`✅ Migrated ${count} door-related items`);
      return { success: true, count };
    } catch (error: unknown) {
      console.error('Door migration error:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, count: 0, error: message };
    }
  }

  private mapPriorityToNumber(priority: string | number | undefined): number | null {
    if (typeof priority === 'number') return priority;
    
    switch (priority) {
      case 'urgent-important': return 4;
      case 'urgent': return 3;
      case 'important': return 2;
      case 'none': return 1;
      default: return null;
    }
  }

  private async migrateObjectives(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      let count = 0;
      const objectiveKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('objectives-week-') || 
        key.startsWith('weeklyObjectives-')
      );

      console.log(`Found ${objectiveKeys.length} objective keys to migrate`);

      for (const key of objectiveKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          
          // Extract week key
          const weekKeyMatch = key.match(/(?:objectives-week-|weeklyObjectives-)(.+)/);
          if (!weekKeyMatch) continue;
          
          const weekKey = weekKeyMatch[1];

          if (Array.isArray(data) && data.length > 0) {
            const objectives = data.map((obj: any) => ({
              user_id: userId,
              week_key: weekKey,
              category: obj.category || 'body',
              description: obj.text || obj.description || '',
              completed: obj.completed || false,
            }));

            const { error } = await supabase
              .from('objectives')
              .upsert(objectives, { 
                onConflict: 'user_id,week_key,category,description',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error(`Error migrating objectives for ${weekKey}:`, error);
            } else {
              count += objectives.length;
            }
          }

          if (onProgress) {
            onProgress({
              type: 'objectives',
              total: objectiveKeys.length,
              migrated: count,
              status: 'in_progress'
            });
          }
        } catch (e) {
          console.error(`Error parsing objectives for key ${key}:`, e);
        }
      }

      console.log(`✅ Migrated ${count} objectives`);
      return { success: true, count };
    } catch (error: unknown) {
      console.error('Objectives migration error:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, count: 0, error: message };
    }
  }

  async migrateMissions(
    userId: string,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      let count = 0;
      
      // Migrate monthly missions
      const monthlyMissionsData = localStorage.getItem('monthlyMissions');
      if (monthlyMissionsData) {
        try {
          const missions = JSON.parse(monthlyMissionsData);
          if (Array.isArray(missions) && missions.length > 0) {
            const missionRecords = missions.map((mission: any) => ({
              user_id: userId,
              category: mission.category || 'body',
              mission_type: 'monthly',
              title: mission.name || mission.title || '',
              period: `${mission.startDate || ''} - ${mission.endDate || ''}`,
              is_impossible_game: mission.isImpossibleGame || false,
              goal_data: {
                questions: mission.questions || {},
                parts: mission.parts || [],
                result: mission.result || {}
              } as any,
              measurable_result: mission.result?.measurableResult || null,
              end_goal_value: mission.result?.endGoalValue || null,
            }));

            const { error } = await (supabase as any)
              .from('missions')
              .upsert(missionRecords, { 
                ignoreDuplicates: false 
              });

            if (error) {
              console.error('Error migrating monthly missions:', error);
            } else {
              count += missionRecords.length;
            }
          }
        } catch (e) {
          console.error('Error parsing monthly missions:', e);
        }
      }

      // Migrate fact maps
      const factMapsKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('factMaps-') || 
        key.startsWith('annualGoals-') ||
        key === 'monthlyGoals'
      );

      for (const key of factMapsKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          if (key.startsWith('factMaps-')) {
            const category = key.replace('factMaps-', '');
            
            const factMapData = {
              user_id: userId,
              category,
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} Fact Map`,
              items: data.items || [],
              goals: data.goals || []
            };

            const { error } = await (supabase as any)
              .from('fact_maps')
              .upsert(factMapData, { 
                onConflict: 'user_id,category',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error(`Error migrating fact map for ${category}:`, error);
            } else {
              count++;
            }
          }
        } catch (e) {
          console.error(`Error parsing fact map for key ${key}:`, e);
        }
      }

      console.log(`✅ Migrated ${count} missions and fact maps`);
      return { success: true, count };
    } catch (error: unknown) {
      console.error('Missions migration error:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, count: 0, error: message };
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
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
