
import React, { createContext, useContext, ReactNode } from 'react';
import DOMPurify from 'dompurify';

interface SecurityContextType {
  sanitizeHtml: (html: string) => string;
  sanitizeInput: (input: string) => string;
  validateEmail: (email: string) => boolean;
  logSecurityEvent: (event: string, details?: any) => void;
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

  const logSecurityEvent = (event: string, details?: any) => {
    // In production, this should send to a secure logging service
    console.warn(`Security Event: ${event}`, details);
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
