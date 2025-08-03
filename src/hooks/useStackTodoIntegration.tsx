
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DayOfWeek } from '@/types/door';

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
      description: `"${text.length > 50 ? text.substring(0, 50) + '...' : text}" a fost adăugată în ${category === 'hit' ? 'HIT List' : category === 'do' ? 'DO List' : 'Hot List'}`,
    });
  }, [toast]);

  const saveIdeaToTodoList = useCallback((idea: StackIdea) => {
    try {
      if (idea.category === 'hot') {
        // Adaugă în Hot List (Lista fierbinte)
        const savedHotList = localStorage.getItem('door-hot-list') || "[]";
        const hotList = JSON.parse(savedHotList);
        
        const newHotItem = {
          id: idea.id,
          text: idea.text,
          selected: false,
          priority: idea.priority
        };
        
        hotList.push(newHotItem);
        localStorage.setItem('door-hot-list', JSON.stringify(hotList));
        
      } else if (idea.category === 'hit' || idea.category === 'do') {
        // Adaugă în HIT/DO List
        const currentWeekKey = `door-week-${new Date().getFullYear()}-${Math.ceil((new Date().getDate() + new Date().getDay()) / 7)}`;
        const savedWeekData = localStorage.getItem(currentWeekKey);
        
        const weekData = savedWeekData ? JSON.parse(savedWeekData) : {
          hitList: [],
          doList: [],
          hotList: []
        };
        
        const newTaskItem = {
          id: idea.id,
          text: idea.text,
          day: idea.day || 'M' as DayOfWeek,
          completed: false,
          priority: idea.priority
        };
        
        if (idea.category === 'hit') {
          weekData.hitList = [...(weekData.hitList || []), newTaskItem];
        } else {
          weekData.doList = [...(weekData.doList || []), newTaskItem];
        }
        
        localStorage.setItem(currentWeekKey, JSON.stringify(weekData));
        
        // Compatibilitate cu funcția existentă
        if (onAddToHitList && idea.category === 'hit') {
          onAddToHitList(idea.text);
        }
      }
      
      // Trigger event pentru actualizarea interfței Door
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { 
        detail: { type: 'ideaAdded', idea } 
      }));
      
    } catch (error) {
      console.error("Error saving idea to TODO list:", error);
      toast({
        title: "⚠️ Eroare salvare",
        description: "Nu s-a putut salva ideea în TODO list. Încearcă din nou.",
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
