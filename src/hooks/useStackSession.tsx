import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StackSessionData {
  sessionId: string;
  stackType: string;
  step: number;
  answers: Record<string | number, string>;
  timestamp: string;
  isCompleted: boolean;
  draftAnswer?: string;
  currentAnswer?: string;
}

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
        sessionId,
        stackType,
        timestamp: new Date().toISOString(),
        isCompleted: false,
        ...currentData,
        ...data
      };

      localStorage.setItem(sessionKey, JSON.stringify(updatedData));
      setLastSaveTime(new Date());
      setUnsavedChanges(false);
      
      console.log(`🔄 [${new Date().toLocaleTimeString()}] Stack Session Auto-saved:`, {
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

  const loadSession = useCallback((): StackSessionData | null => {
    try {
      const sessionKey = getSessionKey();
      const savedData = localStorage.getItem(sessionKey);
      
      if (savedData) {
        const data = JSON.parse(savedData) as StackSessionData;
        console.log(`📥 [${new Date().toLocaleTimeString()}] Stack Session Loaded:`, {
          stackType: data.stackType,
          step: data.step,
          timestamp: data.timestamp
        });
        return data;
      }
    } catch (error) {
      console.error('Error loading stack session:', error);
    }
    return null;
  }, [getSessionKey]);

  const clearSession = useCallback(() => {
    try {
      const sessionKey = getSessionKey();
      localStorage.removeItem(sessionKey);
      setLastSaveTime(null);
      setUnsavedChanges(false);
      
      console.log(`🗑️ [${new Date().toLocaleTimeString()}] Stack Session Cleared:`, { stackType });
    } catch (error) {
      console.error('Error clearing stack session:', error);
    }
  }, [getSessionKey, stackType]);

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

  const detectUnexpectedReload = useCallback(() => {
    const isReload = performance.navigation && performance.navigation.type === 1;
    const hasUnsavedData = loadSession() && !loadSession()?.isCompleted;
    
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
    const savedSession = loadSession();
    if (savedSession && !savedSession.isCompleted && onSessionRestore) {
      onSessionRestore(savedSession);
    }
    
    detectUnexpectedReload();
  }, [loadSession, onSessionRestore, detectUnexpectedReload]);

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

  // Auto-save current answer when it changes
  useEffect(() => {
    if (currentAnswer && currentAnswer.trim() !== '') {
      setUnsavedChanges(true);
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Save after 3 seconds of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        saveSession({
          currentAnswer,
          draftAnswer: currentAnswer,
          timestamp: new Date().toISOString()
        });
      }, 3000);
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