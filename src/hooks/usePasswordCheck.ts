import { useState, useEffect, useCallback, useRef } from 'react';
import { checkPasswordBreached, HIBPResult, formatBreachCount } from '@/services/hibpService';

const DEBOUNCE_MS = 500;
const MIN_PASSWORD_LENGTH = 6;

export interface PasswordCheckState {
  isChecking: boolean;
  result: HIBPResult | null;
  formattedCount: string;
}

export interface PasswordCheckMessages {
  checking: string;
  breached: string;
  safe: string;
}

/**
 * Hook for checking password against HIBP with debouncing
 * Only checks when mode is 'signup' and password meets minimum length
 */
export function usePasswordCheck(
  password: string,
  isSignupMode: boolean
): PasswordCheckState {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HIBPResult | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedRef = useRef<string>('');

  const checkPassword = useCallback(async (pwd: string) => {
    if (lastCheckedRef.current === pwd) {
      return; // Already checked this password
    }
    
    lastCheckedRef.current = pwd;
    setIsChecking(true);
    
    try {
      const hibpResult = await checkPasswordBreached(pwd);
      setResult(hibpResult);
    } catch (error) {
      // Fail open - don't block on errors
      setResult({ isBreached: false, breachCount: 0, error: 'CHECK_ERROR' });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only check in signup mode with valid password
    if (!isSignupMode || password.length < MIN_PASSWORD_LENGTH) {
      setResult(null);
      setIsChecking(false);
      lastCheckedRef.current = '';
      return;
    }

    // Debounce the check
    setIsChecking(true);
    timeoutRef.current = setTimeout(() => {
      checkPassword(password);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [password, isSignupMode, checkPassword]);

  return {
    isChecking,
    result,
    formattedCount: result?.breachCount ? formatBreachCount(result.breachCount) : '',
  };
}

/**
 * Get localized messages for password check states
 */
export function getPasswordCheckMessages(language: 'en' | 'ro'): PasswordCheckMessages {
  return {
    checking: language === 'ro' 
      ? 'Se verifică securitatea parolei...' 
      : 'Checking password security...',
    breached: language === 'ro'
      ? 'Această parolă a fost expusă în breșe de securitate. Alege altă parolă.'
      : 'This password has been exposed in data breaches. Choose a different password.',
    safe: language === 'ro'
      ? 'Parola nu apare în breșe cunoscute'
      : 'Password not found in known breaches',
  };
}
