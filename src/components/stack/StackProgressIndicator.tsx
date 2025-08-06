import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Save, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StackProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stackType: string;
  lastSaveTime?: Date | null;
  unsavedChanges?: boolean;
  isAutoSaveEnabled?: boolean;
}

export const StackProgressIndicator: React.FC<StackProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stackType,
  lastSaveTime,
  unsavedChanges = false,
  isAutoSaveEnabled = true
}) => {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  
  const getSaveStatusIcon = () => {
    if (!isAutoSaveEnabled) {
      return <AlertCircle className="w-3 h-3 text-orange-500" />;
    }
    
    if (unsavedChanges) {
      return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
    }
    
    if (lastSaveTime) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    
    return <Save className="w-3 h-3 text-muted-foreground" />;
  };

  const getSaveStatusText = () => {
    if (!isAutoSaveEnabled) {
      return "Auto-save dezactivat";
    }
    
    if (unsavedChanges) {
      return "Se salvează...";
    }
    
    if (lastSaveTime) {
      const timeDiff = Date.now() - lastSaveTime.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      const seconds = Math.floor((timeDiff % 60000) / 1000);
      
      if (minutes > 0) {
        return `Salvat acum ${minutes}m`;
      } else if (seconds > 30) {
        return `Salvat acum ${seconds}s`;
      } else {
        return "Salvat recent";
      }
    }
    
    return "Nesalvat";
  };

  return (
    <div className="space-y-3 p-3 bg-background/30 rounded border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {stackType}
          </h3>
          <p className="text-xs text-muted-foreground">
            Pasul {currentStep} din {totalSteps}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {progressPercentage}%
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getSaveStatusIcon()}
            <span>{getSaveStatusText()}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Început</span>
          <span>Finalizat</span>
        </div>
      </div>

      {currentStep > 0 && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-green-600">{currentStep}</div>
            <div className="text-muted-foreground">Completate</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-orange-600">{totalSteps - currentStep}</div>
            <div className="text-muted-foreground">Rămase</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">
              {Math.round(((totalSteps - currentStep) / totalSteps) * 10)}m
            </div>
            <div className="text-muted-foreground">Est. timp</div>
          </div>
        </div>
      )}
    </div>
  );
};