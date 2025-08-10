import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DayOfWeek } from '@/types/door';
import { doorSupabaseService } from '@/services/doorSupabaseService';
import { getWeek, getYear } from 'date-fns';

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
    
    // Salvează imediat în TODO list
    saveIdeaToTodoList(newIdea);
    
    toast({
      title: "💡 Idee capturată",
      description: `"${text.length > 50 ? text.substring(0, 50) + '...' : text}" a fost adăugată în ${category === 'hit' ? 'HIT List' : category === 'do' ? 'DO List' : 'Lista de idei'}`,
    });
  }, [toast]);

  const saveIdeaToTodoList = useCallback(async (idea: StackIdea) => {
    try {
      // Generate current week key
      const now = new Date();
      const currentWeekKey = `door-week-${now.getFullYear()}-${getWeek(now)}`;
      
      // Save directly to Supabase
      await doorSupabaseService.addIdeaToWeek(currentWeekKey, {
        id: idea.id,
        text: idea.text,
        category: idea.category,
        priority: idea.priority,
        day: idea.day
      });
      
      // Trigger event pentru actualizarea interfței Door
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
        detail: { type: 'ideaAdded', idea } 
      }));
      
      // Compatibilitate cu funcția existentă
      if (onAddToHitList && idea.category === 'hit') {
        onAddToHitList(idea.text);
      }
      
    } catch (error) {
      console.error("Error saving idea to Supabase:", error);
      toast({
        title: "⚠️ Eroare salvare",
        description: "Nu s-a putut salva ideea în cloud. Încearcă din nou.",
        variant: "destructive",
      });
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
