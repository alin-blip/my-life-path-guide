import { supabase } from '@/integrations/supabase/client';

const LOCAL_STORAGE_KEY = 'user-preferences-local';

export interface UserPreferences {
  sound_muted: boolean;
  sound_volume: number;
  preferred_tts_voice: string | null;
  onboarding_completed: Record<string, boolean>;
  dashboard_widgets: any;
}

const defaultPreferences: UserPreferences = {
  sound_muted: false,
  sound_volume: 0.5,
  preferred_tts_voice: null,
  onboarding_completed: {},
  dashboard_widgets: null,
};

// Get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Load from localStorage (fallback for unauthenticated users)
function loadFromLocalStorage(): Partial<UserPreferences> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // JSON parse failed – return safe fallback
    return {};
  }
}

// Save to localStorage
function saveToLocalStorage(prefs: Partial<UserPreferences>): void {
  try {
    const existing = loadFromLocalStorage();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
  }
}

// Get preferences from cloud or localStorage
export async function getUserPreferences(): Promise<UserPreferences> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    // Not authenticated - use localStorage
    const local = loadFromLocalStorage();
    return { ...defaultPreferences, ...local };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user preferences:', error);
      return { ...defaultPreferences, ...loadFromLocalStorage() };
    }
    
    if (data) {
      return {
        sound_muted: data.sound_muted ?? defaultPreferences.sound_muted,
        sound_volume: Number(data.sound_volume) ?? defaultPreferences.sound_volume,
        preferred_tts_voice: data.preferred_tts_voice ?? defaultPreferences.preferred_tts_voice,
        onboarding_completed: (data.onboarding_completed as Record<string, boolean>) ?? defaultPreferences.onboarding_completed,
        dashboard_widgets: data.dashboard_widgets ?? defaultPreferences.dashboard_widgets,
      };
    }
    
    // No record exists - return defaults merged with localStorage
    return { ...defaultPreferences, ...loadFromLocalStorage() };
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return { ...defaultPreferences, ...loadFromLocalStorage() };
  }
}

// Update preferences in cloud or localStorage
export async function updateUserPreferences(updates: Partial<UserPreferences>): Promise<boolean> {
  const userId = await getCurrentUserId();
  
  // Always save to localStorage as backup
  saveToLocalStorage(updates);
  
  if (!userId) {
    // Not authenticated - localStorage only
    return true;
  }
  
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    return false;
  }
}

// Sync localStorage data to cloud when user authenticates
export async function syncLocalPreferencesToCloud(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  
  const localPrefs = loadFromLocalStorage();
  if (Object.keys(localPrefs).length === 0) return;
  
  try {
    // Check if cloud record exists
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existing) {
      // No cloud record - migrate localStorage data
      await updateUserPreferences(localPrefs);
      console.log('Synced local preferences to cloud');
    }
  } catch (error) {
    console.error('Error syncing preferences to cloud:', error);
  }
}

// Sound settings specific helpers
export async function getSoundSettings(): Promise<{ muted: boolean; volume: number }> {
  const prefs = await getUserPreferences();
  return {
    muted: prefs.sound_muted,
    volume: prefs.sound_volume,
  };
}

export async function updateSoundSettings(muted: boolean, volume: number): Promise<boolean> {
  return updateUserPreferences({
    sound_muted: muted,
    sound_volume: volume,
  });
}

// TTS voice preference
export async function getTTSVoice(): Promise<string | null> {
  const prefs = await getUserPreferences();
  return prefs.preferred_tts_voice;
}

export async function setTTSVoice(voiceId: string): Promise<boolean> {
  return updateUserPreferences({
    preferred_tts_voice: voiceId,
  });
}

// Onboarding status
export async function getOnboardingStatus(key: string): Promise<boolean> {
  const prefs = await getUserPreferences();
  return prefs.onboarding_completed[key] ?? false;
}

export async function setOnboardingCompleted(key: string, completed: boolean = true): Promise<boolean> {
  const prefs = await getUserPreferences();
  const updated = {
    ...prefs.onboarding_completed,
    [key]: completed,
  };
  return updateUserPreferences({
    onboarding_completed: updated,
  });
}
