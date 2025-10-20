import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { stackSessionsService, StackSessionData } from '@/services/stackSessionsService';

interface UseStackSessionProps {
  stackType: string;
  sessionId: string;
  onSessionRestore?: (data: StackSessionData) => void;
  currentAnswer?: string;
}

export function useStackSession({ stackType, sessionId, onSessionRestore, currentAnswer }: UseStackSessionProps) {
  const { toast } = useToast();
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getSessionKey = useCallback(() => `stack-session-${stackType}-${sessionId}`, [stackType, sessionId]);
  
  const saveSession = useCallback(async (data: Partial<StackSessionData>) => {
    if (!isAutoSaveEnabled) return;

    try {
      const sessionKey = getSessionKey();
      const existingData = localStorage.getItem(sessionKey);
      const currentData = existingData ? JSON.parse(existingData) : {};
      
      const updatedData: StackSessionData = {
        session_id: sessionId,
        stack_type: stackType as any,
        timestamp: new Date().toISOString(),
        isCompleted: false,
        answers: {},
        ...currentData,
        ...data
      };

      // Salvăm în localStorage ca backup local
      localStorage.setItem(sessionKey, JSON.stringify(updatedData));
      
      // Salvăm în Supabase (primary source of truth)
      await stackSessionsService.saveStackSession(updatedData);
      
      setLastSaveTime(new Date());
      setUnsavedChanges(false);
      
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Stack Session Auto-saved to Supabase:`, {
        stackType,
        step: updatedData.step,
        answersCount: Object.keys(updatedData.answers || {}).length
      });
    } catch (error) {
      console.error('Error saving stack session:', error);
    }
  }, [isAutoSaveEnabled, stackType, sessionId, getSessionKey]);

  const saveSessionDebounced = useCallback((data: Partial<StackSessionData>) => {
    setUnsavedChanges(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveSession(data);
    }, 2000); // Save after 2 seconds of inactivity
  }, [saveSession]);

  const loadSession = useCallback(async (): Promise<StackSessionData | null> => {
    try {
      const sessionKey = getSessionKey();
      
      // Încercăm să încărcăm din Supabase (primary)
      const supabaseData = await stackSessionsService.loadStackSession(sessionId, stackType);
      
      if (supabaseData) {
        // Sincronizăm și în localStorage
        localStorage.setItem(sessionKey, JSON.stringify(supabaseData));
        console.log(`📥 [${new Date().toLocaleTimeString()}] Stack Session Loaded from Supabase:`, {
          stackType: supabaseData.stack_type,
          answersCount: Object.keys(supabaseData.answers || {}).length
        });
        return supabaseData;
      }
      
      // Fallback la localStorage dacă Supabase nu returnează date
      const savedData = localStorage.getItem(sessionKey);
      if (savedData) {
        const data = JSON.parse(savedData) as StackSessionData;
        console.log(`📥 [${new Date().toLocaleTimeString()}] Stack Session Loaded from localStorage:`, {
          stackType: data.stack_type
        });
        return data;
      }
    } catch (error) {
      console.error('Error loading stack session:', error);
    }
    return null;
  }, [getSessionKey, sessionId, stackType]);

  const clearSession = useCallback(async () => {
    try {
      const sessionKey = getSessionKey();
      
      // Ștergem din localStorage
      localStorage.removeItem(sessionKey);
      
      // Ștergem din Supabase
      await stackSessionsService.clearStackSession(sessionId, stackType);
      
      setLastSaveTime(null);
      setUnsavedChanges(false);
      
      console.log(`🗑️ [${new Date().toLocaleTimeString()}] Stack Session Cleared from both localStorage and Supabase:`, { stackType });
    } catch (error) {
      console.error('Error clearing stack session:', error);
    }
  }, [getSessionKey, stackType, sessionId]);

  const createBackup = useCallback(() => {
    try {
      const sessionKey = getSessionKey();
      const backupKey = `${sessionKey}-backup-${Date.now()}`;
      const currentData = localStorage.getItem(sessionKey);
      
      if (currentData) {
        localStorage.setItem(backupKey, currentData);
        console.log(`💾 [${new Date().toLocaleTimeString()}] Stack Session Backup Created:`, { backupKey });
        
        toast({
          title: "Backup creat",
          description: "Sesiunea curentă a fost salvată ca backup.",
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }, [getSessionKey, toast]);

  const detectUnexpectedReload = useCallback(async () => {
    const isReload = performance.navigation && performance.navigation.type === 1;
    const savedSession = await loadSession();
    const hasUnsavedData = savedSession && !savedSession.isCompleted;
    
    if (isReload && hasUnsavedData) {
      toast({
        title: "Sesiune recuperată",
        description: "Am detectat o sesiune întreruptă și am restaurat progresul tău.",
        duration: 5000,
      });
    }
  }, [loadSession, toast]);

  // Check for session recovery on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = await loadSession();
      if (savedSession && !savedSession.isCompleted && onSessionRestore) {
        onSessionRestore(savedSession);
      }
    };
    
    restoreSession();
    detectUnexpectedReload();
  }, [detectUnexpectedReload]);

  // Handle visibility change to save immediately when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isNowVisible = !document.hidden;
      setIsVisible(isNowVisible);
      
      if (!isNowVisible && unsavedChanges && currentAnswer) {
        // Save immediately when tab becomes hidden
        console.log(`💾 [${new Date().toLocaleTimeString()}] Emergency save triggered by tab switch`);
        saveSession({
          currentAnswer,
          draftAnswer: currentAnswer,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        // Emergency save before unload
        if (currentAnswer) {
          saveSession({
            currentAnswer,
            draftAnswer: currentAnswer,
            timestamp: new Date().toISOString()
          });
        }
        e.preventDefault();
        e.returnValue = 'Ai modificări nesalvate. Ești sigur că vrei să părăsești pagina?';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges, currentAnswer, saveSession]);

  // Auto-save current answer when it changes (debounced 2s)
  useEffect(() => {
    if (currentAnswer && currentAnswer.trim() !== '') {
      setUnsavedChanges(true);
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Save after 2 seconds of inactivity (optimizat pentru Supabase)
      saveTimeoutRef.current = setTimeout(() => {
        saveSession({
          currentAnswer,
          draftAnswer: currentAnswer,
          timestamp: new Date().toISOString()
        });
      }, 2000);
    }
  }, [currentAnswer, saveSession]);

  return {
    saveSession: saveSessionDebounced,
    saveSessionImmediate: saveSession,
    loadSession,
    clearSession,
    createBackup,
    isAutoSaveEnabled,
    setIsAutoSaveEnabled,
    lastSaveTime,
    unsavedChanges,
    isVisible
  };
}