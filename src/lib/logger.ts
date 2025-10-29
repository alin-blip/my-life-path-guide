/**
 * Production-safe logger utility
 * Logs only in development mode, except for errors which are always logged
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  // Errors are always logged, even in production
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  // Group logging for better organization
  group: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
  
  // Table for structured data
  table: (data: any) => {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  }
};
