import React from 'react';
import { Save, CheckCircle } from 'lucide-react';

interface StackSaveStatusProps {
  lastSaveTime?: Date | null;
  unsavedChanges?: boolean;
  isVisible?: boolean;
  customStatus?: string;
}

export const StackSaveStatus: React.FC<StackSaveStatusProps> = ({
  lastSaveTime,
  unsavedChanges,
  isVisible,
  customStatus
}) => {
  if (customStatus) {
    return (
      <div className="flex items-center text-xs text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        <span>{customStatus}</span>
      </div>
    );
  }

  if (unsavedChanges && !isVisible) {
    return (
      <div className="flex items-center text-xs text-yellow-400">
        <Save className="w-3 h-3 mr-1 animate-pulse" />
        <span>Salvare automată...</span>
      </div>
    );
  }

  if (lastSaveTime) {
    return (
      <div className="flex items-center text-xs text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        <span>Salvat {lastSaveTime.toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
};