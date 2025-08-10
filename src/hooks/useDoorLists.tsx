import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DayOfWeek, TaskPriority } from '@/types/door';
import { doorSupabaseService } from '@/services/doorSupabaseService';
import { supabase } from '@/integrations/supabase/client';

interface UseDoorListsProps {
  currentWeekKey: string;
  onDataChange?: () => void;
}

export function useDoorLists({ currentWeekKey, onDataChange }: UseDoorListsProps) {
  const [hotList, setHotList] = useState<HotListItem[]>([]);
  const [hitList, setHitList] = useState<HitListItem[]>([]);
  const [doList, setDoList] = useState<DoListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeList, setActiveList] = useState<'hit' | 'do'>('hit');
  const [editingNewItem, setEditingNewItem] = useState(false);
  const { toast } = useToast();

  // Load data from Supabase and set up real-time subscriptions
  useEffect(() => {
    if (!currentWeekKey) return;

    const loadData = async () => {
      try {
        const { hotList: loadedHotList, hitList: loadedHitList, doList: loadedDoList } = await doorSupabaseService.fetchWeekLists(currentWeekKey);
        setHotList(loadedHotList);
        setHitList(loadedHitList);
        setDoList(loadedDoList);
      } catch (error) {
        console.error('Error loading Door data:', error);
        // Set default data if no data exists
        setHotList([
          { id: '1', text: 'get the transcript from 6 phase meditation and implement in the ...', selected: false, priority: 'none' },
          { id: '2', text: 'plan the webinar', selected: false, priority: 'none' },
          { id: '3', text: 'reach out to 50 peoples, that means 10 a day from leads', selected: false, priority: 'urgent' },
        ]);
      }
    };

    loadData();

    // Set up real-time subscription for hot_list_items changes
    const channel = supabase
      .channel('hot-list-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hot_list_items',
          filter: `week_key=eq.${currentWeekKey}`
        },
        () => {
          // Reload data when changes occur
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWeekKey]);

  const addNewTarget = () => {
    const newItem: HotListItem = {
      id: Date.now().toString(),
      text: '',
      selected: false,
      priority: 'none'
    };
    
    setHotList(prevList => [...prevList, newItem]);
    setEditingNewItem(true);
    
    setTimeout(() => {
      const lastItem = document.querySelector('.hot-list-container .hot-list-item:last-child input');
      if (lastItem instanceof HTMLInputElement) {
        lastItem.focus();
      }
      
      const hotListContainer = document.querySelector('.hot-list-container');
      if (hotListContainer) {
        hotListContainer.scrollTop = hotListContainer.scrollHeight;
      }
    }, 100);
  };

  const toggleHotListItemSelection = (id: string) => {
    setHotList(hotList.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateHotListItemText = (id: string, text: string) => {
    setHotList(hotList.map(item => 
      item.id === id ? { ...item, text } : item
    ));
    
    if (editingNewItem && text.trim() !== '') {
      setEditingNewItem(false);
    }
  };

  const updateHotListItemPriority = (id: string, priority: TaskPriority) => {
    setHotList(hotList.map(item => 
      item.id === id ? { ...item, priority } : item
    ));
    
    const priorityLabels = {
      'none': 'Normal',
      'important': 'Important',
      'urgent': 'Urgent',
      'urgent-important': 'Urgent & Important'
    };
    
    toast({
      title: "Priority updated",
      description: `Task priority set to: ${priorityLabels[priority]}`,
    });
  };

  const deleteHotListItem = (id: string) => {
    setHotList(hotList.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      description: "Item has been removed from the Hot List",
    });
  };

  const toggleHitListItemCompletion = async (id: string) => {
    const updatedHitList = hitList.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    
    setHitList(updatedHitList);
    
    // Immediate save to Supabase
    try {
      await doorSupabaseService.saveWeekLists(currentWeekKey, {
        hotList,
        hitList: updatedHitList,
        doList
      });
      onDataChange?.();
    } catch (error) {
      console.error('Error saving hit list completion:', error);
      toast({
        title: '⚠️ Eroare salvare',
        description: 'Nu s-a putut salva modificarea în cloud',
        variant: 'destructive',
      });
    }
  };

  const toggleDoListItemCompletion = async (id: string) => {
    const updatedDoList = doList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setDoList(updatedDoList);
    
    // Immediate save to Supabase
    try {
      await doorSupabaseService.saveWeekLists(currentWeekKey, {
        hotList,
        hitList,
        doList: updatedDoList
      });
      onDataChange?.();
    } catch (error) {
      console.error('Error saving do list completion:', error);
      toast({
        title: '⚠️ Eroare salvare',
        description: 'Nu s-a putut salva modificarea în cloud',
        variant: 'destructive',
      });
    }
  };

  const moveTaskBackToHotList = async (taskId: string, listType: 'hit' | 'do') => {
    if (listType === 'hit') {
      const taskToMove = hitList.find(item => item.id === taskId);
      
      if (taskToMove) {
        const newHotItem: HotListItem = {
          id: `task-to-hot-${Date.now()}`,
          text: taskToMove.text,
          selected: false,
          priority: taskToMove.priority || 'none'
        };
        
        const updatedHotList = [...hotList, newHotItem];
        const updatedHitList = hitList.filter(item => item.id !== taskId);
        
        setHotList(updatedHotList);
        setHitList(updatedHitList);
        
        // Immediate save to Supabase
        try {
          await doorSupabaseService.saveWeekLists(currentWeekKey, {
            hotList: updatedHotList,
            hitList: updatedHitList,
            doList
          });
          onDataChange?.();
          
          toast({
            title: "Task Moved",
            description: "Task has been moved back to the Hot List",
          });
        } catch (error) {
          console.error('Error moving task:', error);
          toast({
            title: '⚠️ Eroare salvare',
            description: 'Nu s-a putut salva mișcarea task-ului',
            variant: 'destructive',
          });
        }
      }
    } else {
      const taskToMove = doList.find(item => item.id === taskId);
      
      if (taskToMove) {
        const newHotItem: HotListItem = {
          id: `task-to-hot-${Date.now()}`,
          text: taskToMove.text,
          selected: false,
          priority: taskToMove.priority || 'none'
        };
        
        const updatedHotList = [...hotList, newHotItem];
        const updatedDoList = doList.filter(item => item.id !== taskId);
        
        setHotList(updatedHotList);
        setDoList(updatedDoList);
        
        // Immediate save to Supabase
        try {
          await doorSupabaseService.saveWeekLists(currentWeekKey, {
            hotList: updatedHotList,
            hitList,
            doList: updatedDoList
          });
          onDataChange?.();
          
          toast({
            title: "Task Moved",
            description: "Task has been moved back to the Hot List",
          });
        } catch (error) {
          console.error('Error moving task:', error);
          toast({
            title: '⚠️ Eroare salvare',
            description: 'Nu s-a putut salva mișcarea task-ului',
            variant: 'destructive',
          });
        }
      }
    }
  };

  return {
    hotList,
    setHotList,
    hitList,
    setHitList,
    doList,
    setDoList,
    searchTerm,
    setSearchTerm,
    activeList,
    setActiveList,
    editingNewItem,
    addNewTarget,
    toggleHotListItemSelection,
    updateHotListItemText,
    updateHotListItemPriority,
    deleteHotListItem,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveTaskBackToHotList
  };
}
