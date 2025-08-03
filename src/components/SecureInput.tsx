
import React from 'react';
import { Input } from '@/components/ui/input';
import { useSecurity } from './SecurityProvider';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (value: string) => void;
}

export const SecureInput: React.FC<SecureInputProps> = ({ 
  onSecureChange, 
  onChange,
  ...props 
}) => {
  const { sanitizeInput, logSecurityEvent } = useSecurity();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue);
    
    if (rawValue !== sanitizedValue) {
      logSecurityEvent('Input sanitized', { 
        original: rawValue, 
        sanitized: sanitizedValue 
      });
    }
    
    // Update the event with sanitized value
    e.target.value = sanitizedValue;
    
    if (onSecureChange) {
      onSecureChange(sanitizedValue);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return <Input {...props} onChange={handleChange} />;
};
