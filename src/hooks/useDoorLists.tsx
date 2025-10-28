import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DayOfWeek, TaskPriority } from '@/types/door';
import { doorUserTasksService } from '@/services/doorUserTasksService';
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
        // Load global hot list (permanent inbox)
        const loadedHotList = await doorUserTasksService.fetchGlobalHotList();
        
        // Load weekly hit/do lists
        const { hitList: loadedHitList, doList: loadedDoList } = await doorUserTasksService.fetchWeekLists(currentWeekKey);
        
        setHotList(loadedHotList);
        setHitList(loadedHitList);
        setDoList(loadedDoList);
      } catch (error) {
        console.error('Error loading Door data:', error);
        setHotList([]);
        setHitList([]);
        setDoList([]);
      }
    };

    loadData();

    // Set up real-time subscription for user_tasks changes
    const channel = supabase
      .channel('user-tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks'
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

  const updateHotListItemText = async (id: string, text: string) => {
    const updatedHotList = hotList.map(item => 
      item.id === id ? { ...item, text } : item
    );
    setHotList(updatedHotList);
    
    // Save global hot list immediately
    try {
      await doorUserTasksService.saveGlobalHotList(updatedHotList);
      onDataChange?.();
    } catch (error) {
      console.error('Error saving hot list:', error);
    }
    
    if (editingNewItem && text.trim() !== '') {
      setEditingNewItem(false);
    }
  };

  const updateHotListItemPriority = async (id: string, priority: TaskPriority) => {
    const updatedHotList = hotList.map(item => 
      item.id === id ? { ...item, priority } : item
    );
    setHotList(updatedHotList);
    
    // Save global hot list immediately
    try {
      await doorUserTasksService.saveGlobalHotList(updatedHotList);
      onDataChange?.();
    } catch (error) {
      console.error('Error saving hot list priority:', error);
    }
    
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

  const deleteHotListItem = async (id: string) => {
    const updatedHotList = hotList.filter(item => item.id !== id);
    setHotList(updatedHotList);
    
    // Save global hot list immediately
    try {
      await doorUserTasksService.saveGlobalHotList(updatedHotList);
      onDataChange?.();
    } catch (error) {
      console.error('Error deleting hot list item:', error);
    }
    
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
      await doorUserTasksService.saveWeekLists(currentWeekKey, {
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
      await doorUserTasksService.saveWeekLists(currentWeekKey, {
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
          await doorUserTasksService.saveGlobalHotList(updatedHotList);
          await doorUserTasksService.saveWeekLists(currentWeekKey, {
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
          await doorUserTasksService.saveGlobalHotList(updatedHotList);
          await doorUserTasksService.saveWeekLists(currentWeekKey, {
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
