import { supabase } from '@/integrations/supabase/client';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly';

export interface GoalReminder {
  id: string;
  user_id: string;
  mission_id: string;
  frequency: ReminderFrequency;
  is_active: boolean;
  last_shown_at: string | null;
  next_reminder_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderWithGoal extends GoalReminder {
  mission?: {
    id: string;
    title: string;
    category: string;
    measurable_result: string;
    goal_data: any;
  };
}

function calculateNextReminder(frequency: ReminderFrequency): Date {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export const goalRemindersService = {
  async getReminder(missionId: string): Promise<GoalReminder | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;

    const { data, error } = await supabase
      .from('goal_reminders')
      .select('*')
      .eq('mission_id', missionId)
      .eq('user_id', session.session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching reminder:', error);
      return null;
    }

    return data as GoalReminder | null;
  },

  async setReminder(missionId: string, frequency: ReminderFrequency): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    const nextReminder = calculateNextReminder(frequency);

    const { error } = await supabase
      .from('goal_reminders')
      .upsert({
        user_id: session.session.user.id,
        mission_id: missionId,
        frequency,
        is_active: true,
        next_reminder_at: nextReminder.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,mission_id'
      });

    if (error) {
      console.error('Error setting reminder:', error);
      return false;
    }

    return true;
  },

  async removeReminder(missionId: string): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    const { error } = await supabase
      .from('goal_reminders')
      .delete()
      .eq('mission_id', missionId)
      .eq('user_id', session.session.user.id);

    if (error) {
      console.error('Error removing reminder:', error);
      return false;
    }

    return true;
  },

  async toggleReminder(missionId: string, isActive: boolean): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    const { error } = await supabase
      .from('goal_reminders')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('mission_id', missionId)
      .eq('user_id', session.session.user.id);

    if (error) {
      console.error('Error toggling reminder:', error);
      return false;
    }

    return true;
  },

  async getDueReminders(): Promise<ReminderWithGoal[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('goal_reminders')
      .select(`
        *,
        mission:missions(id, title, category, measurable_result, goal_data)
      `)
      .eq('user_id', session.session.user.id)
      .eq('is_active', true)
      .lte('next_reminder_at', now);

    if (error) {
      console.error('Error fetching due reminders:', error);
      return [];
    }

    return (data || []) as ReminderWithGoal[];
  },

  async markReminderShown(reminderId: string, frequency: ReminderFrequency): Promise<boolean> {
    const now = new Date();
    const nextReminder = calculateNextReminder(frequency);

    const { error } = await supabase
      .from('goal_reminders')
      .update({
        last_shown_at: now.toISOString(),
        next_reminder_at: nextReminder.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', reminderId);

    if (error) {
      console.error('Error marking reminder shown:', error);
      return false;
    }

    return true;
  },

  async getAllReminders(): Promise<ReminderWithGoal[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const { data, error } = await supabase
      .from('goal_reminders')
      .select(`
        *,
        mission:missions(id, title, category, measurable_result, goal_data)
      `)
      .eq('user_id', session.session.user.id)
      .order('next_reminder_at', { ascending: true });

    if (error) {
      console.error('Error fetching all reminders:', error);
      return [];
    }

    return (data || []) as ReminderWithGoal[];
  }
};
