import React from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface StackSessionIndicatorProps {
  sessionId: string;
  stackType: string;
  isVisible?: boolean;
  unsavedChanges?: boolean;
}

export const StackSessionIndicator: React.FC<StackSessionIndicatorProps> = ({
  sessionId,
  stackType,
  isVisible,
  unsavedChanges
}) => {
  const shortSessionId = sessionId.split('-').pop()?.substring(0, 6) || 'unknown';

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center">
        {isVisible ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-orange-500" />
        )}
        <span className="ml-1">
          {isVisible ? 'Activ' : 'Tab inactiv'}
        </span>
      </div>
      
      {unsavedChanges && (
        <div className="flex items-center text-yellow-500">
          <AlertCircle className="w-3 h-3" />
          <span className="ml-1">Modificări nesalvate</span>
        </div>
      )}
      
      <div className="text-gray-400">
        Sesiune: {shortSessionId}
      </div>
    </div>
  );
};