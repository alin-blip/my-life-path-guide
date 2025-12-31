import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAddModal } from './QuickAddModal';
import { cn } from '@/lib/utils';

export const QuickAddButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: Ctrl+Space or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.code === 'Space') || (e.metaKey && e.code === 'KeyK')) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.code === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200 hover:scale-110",
          "flex items-center justify-center"
        )}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <QuickAddModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
