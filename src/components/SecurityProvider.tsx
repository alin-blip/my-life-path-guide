
import React, { createContext, useContext, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  sanitizeHtml: (html: string) => string;
  sanitizeInput: (input: string) => string;
  validateEmail: (email: string) => boolean;
  logSecurityEvent: (event: string, details?: any, severity?: 'low' | 'medium' | 'high' | 'critical') => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  };

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const logSecurityEvent = (
    event: string, 
    details?: any, 
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    console.warn(`Security Event: ${event}`, details);
    
    // Fire-and-forget with short timeout to never block UI
    const LOG_TIMEOUT_MS = 2000;
    
    const doLog = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LOG_TIMEOUT_MS);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('security_events').insert({
          user_id: user?.id || null,
          event_type: event,
          event_details: details || {},
          severity,
          user_agent: navigator.userAgent
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        // Silent fail - logging should never block UI
        console.warn('Security event logging skipped:', error);
      }
    };
    
    // Execute without awaiting
    doLog();
  };

  return (
    <SecurityContext.Provider value={{
      sanitizeHtml,
      sanitizeInput,
      validateEmail,
      logSecurityEvent
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
