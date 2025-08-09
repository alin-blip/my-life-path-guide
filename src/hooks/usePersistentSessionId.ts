import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provides a persistent sessionId per stackType.
 * It stores the id in localStorage so navigating away and back reuses the same session.
 * Call resetSessionId() when the user explicitly starts a new stack.
 */
export function usePersistentSessionId(stackType: string) {
  const storageKey = `stack-session-id-${stackType}`;

  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      const id = `${stackType}-${uuidv4()}`;
      localStorage.setItem(storageKey, id);
      return id;
    } catch {
      // Fallback if localStorage not available
      return `${stackType}-${uuidv4()}`;
    }
  });

  const resetSessionId = () => {
    try {
      const id = `${stackType}-${uuidv4()}`;
      localStorage.setItem(storageKey, id);
      setSessionId(id);
    } catch {
      setSessionId(`${stackType}-${uuidv4()}`);
    }
  };

  return { sessionId, resetSessionId };
}
