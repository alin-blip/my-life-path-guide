import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StackDraftSaverProps {
  stackType: string;
  sessionId: string;
  currentStep: number;
  currentAnswer: string;
  onDraftSave?: (draft: string) => void;
  onDraftRestore?: (draft: string) => void;
}

export const StackDraftSaver: React.FC<StackDraftSaverProps> = ({
  stackType,
  sessionId,
  currentStep,
  currentAnswer,
  onDraftSave,
  onDraftRestore
}) => {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastAnswerRef = useRef<string>('');

  const getDraftKey = () => `stack-draft-${stackType}-${sessionId}-${currentStep}`;

  // Save draft with debouncing
  useEffect(() => {
    if (currentAnswer && currentAnswer !== lastAnswerRef.current) {
      lastAnswerRef.current = currentAnswer;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const draftKey = getDraftKey();
          localStorage.setItem(draftKey, JSON.stringify({
            answer: currentAnswer,
            timestamp: new Date().toISOString(),
            step: currentStep
          }));
          
          onDraftSave?.(currentAnswer);
          
          console.log(`💾 [${new Date().toLocaleTimeString()}] Draft saved for step ${currentStep}`);
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 1000); // Save draft after 1 second of inactivity
    }
  }, [currentAnswer, currentStep, stackType, sessionId, onDraftSave]);

  // Load draft on step change
  useEffect(() => {
    try {
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        const draftAge = Date.now() - new Date(draftData.timestamp).getTime();
        
        // Only restore draft if it's less than 1 hour old
        if (draftAge < 3600000 && draftData.answer && !currentAnswer) {
          onDraftRestore?.(draftData.answer);
          
          toast({
            title: "Draft restaurat",
            description: `Am găsit un răspuns parțial pentru pasul ${currentStep}.`,
            duration: 3000,
          });
          
          console.log(`📥 [${new Date().toLocaleTimeString()}] Draft restored for step ${currentStep}`);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [currentStep, stackType, sessionId]);

  // Clear old drafts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Clear drafts older than 24 hours
      try {
        const keys = Object.keys(localStorage);
        const draftPrefix = `stack-draft-${stackType}-`;
        const now = Date.now();
        
        keys.forEach(key => {
          if (key.startsWith(draftPrefix)) {
            try {
              const draftData = JSON.parse(localStorage.getItem(key) || '{}');
              const draftAge = now - new Date(draftData.timestamp).getTime();
              
              if (draftAge > 86400000) { // 24 hours
                localStorage.removeItem(key);
                console.log(`🗑️ Cleaned old draft: ${key}`);
              }
            } catch (error) {
              // Invalid draft data, remove it
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.error('Error cleaning old drafts:', error);
      }
    };
  }, [stackType]);

  // This component doesn't render anything visible
  return null;
};