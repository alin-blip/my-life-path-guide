import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DayOfWeek } from '@/types/door';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getActiveWeekKey } from '@/utils/weekUtils';

interface StackIdea {
  id: string;
  text: string;
  category: 'hit' | 'do' | 'hot';
  priority: 'none' | 'important' | 'urgent' | 'urgent-important';
  day?: DayOfWeek;
  timestamp: string;
}

interface UseStackTodoIntegrationProps {
  onAddToHitList?: (action: string) => void;
}

export function useStackTodoIntegration({ onAddToHitList }: UseStackTodoIntegrationProps = {}) {
  const [capturedIdeas, setCapturedIdeas] = useState<StackIdea[]>([]);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState('');
  const { toast } = useToast();

  const captureIdea = useCallback((
    text: string, 
    category: 'hit' | 'do' | 'hot' = 'hot',
    priority: 'none' | 'important' | 'urgent' | 'urgent-important' = 'none',
    day?: DayOfWeek
  ) => {
    if (!text.trim()) return;

    const newIdea: StackIdea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      category,
      priority,
      day,
      timestamp: new Date().toISOString()
    };

    setCapturedIdeas(prev => [...prev, newIdea]);
    
    // Salvează imediat în TODO list (fără toast duplicat)
    saveIdeaToTodoList(newIdea);
  }, []);

  const saveIdeaToTodoList = useCallback(async (idea: StackIdea) => {
    try {
      // Generate current week key - consistent with DOOR format using centralized utility
      // Uses getActiveWeekKey to respect Sunday planning (saves to next week on Sunday)
      const currentWeekKey = getActiveWeekKey();
      
      console.log('💾 Saving idea to Supabase:', { idea, currentWeekKey });
      
      // Check if user is authenticated first
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.warn('⚠️ User not authenticated - saving to localStorage only');
        
        // Save to localStorage as fallback
        const localStorageKey = `todo-ideas-${currentWeekKey}`;
        const existingIdeas = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        existingIdeas.push(idea);
        localStorage.setItem(localStorageKey, JSON.stringify(existingIdeas));
        
        toast({
          title: '⚠️ Salvat local',
          description: 'Loghează-te pentru a salva în cloud. Task-ul a fost salvat local.',
          variant: 'default',
        });
        
        // Trigger event for Door interface updates
        window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
          detail: { type: 'ideaAdded', idea, local: true } 
        }));
        
        return;
      }
      
      // Save directly to Supabase using the unified service
      await doorUserTasksService.addIdeaToWeek(currentWeekKey, {
        id: idea.id,
        text: idea.text,
        category: idea.category,
        priority: idea.priority,
        day: idea.day
      });
      
      console.log('✅ Successfully saved to Supabase');
      
      // Trigger event for Door interface updates
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
        detail: { type: 'ideaAdded', idea } 
      }));
      
      // Success toast
      toast({
        title: '✅ Salvat în To Do',
        description: `Task-ul "${idea.text.substring(0, 50)}${idea.text.length > 50 ? '...' : ''}" a fost adăugat cu succes`,
      });
      
      // Compatibility with existing function
      if (onAddToHitList) {
        onAddToHitList(idea.text);
      }
      
    } catch (error) {
      console.error("❌ Error saving idea to Supabase:", error);
      
      // Try localStorage fallback
      try {
        const now = new Date();
        const currentWeekKey = getActiveWeekKey(now);
        const localStorageKey = `todo-ideas-${currentWeekKey}`;
        const existingIdeas = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        existingIdeas.push(idea);
        localStorage.setItem(localStorageKey, JSON.stringify(existingIdeas));
        
        toast({
          title: '⚠️ Salvat local',
          description: 'Conexiunea a eșuat. Task-ul a fost salvat local.',
          variant: 'default',
        });
      } catch (localError) {
        toast({
          title: "❌ Eroare salvare",
          description: "Nu s-a putut salva ideea. Încearcă din nou.",
          variant: "destructive",
        });
      }
    }
  }, [onAddToHitList, toast]);

  const removeIdea = useCallback((ideaId: string) => {
    setCapturedIdeas(prev => prev.filter(idea => idea.id !== ideaId));
  }, []);

  const openIdeaModal = useCallback(() => {
    setIsIdeaModalOpen(true);
  }, []);

  const closeIdeaModal = useCallback(() => {
    setIsIdeaModalOpen(false);
    setCurrentIdea('');
  }, []);

  const submitIdea = useCallback((
    category: 'hit' | 'do' | 'hot' = 'hot',
    priority: 'none' | 'important' | 'urgent' | 'urgent-important' = 'none',
    day?: DayOfWeek
  ) => {
    if (currentIdea.trim()) {
      captureIdea(currentIdea, category, priority, day);
      closeIdeaModal();
    }
  }, [currentIdea, captureIdea, closeIdeaModal]);

  return {
    capturedIdeas,
    isIdeaModalOpen,
    currentIdea,
    setCurrentIdea,
    captureIdea,
    removeIdea,
    openIdeaModal,
    closeIdeaModal,
    submitIdea
  };
}
