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

  // NOTE: Data loading is now handled ONLY by useDoorStorage/useDoorStorageLoad
  // This hook only manages state and provides CRUD operations
  // The initial load and week-change reload happen in useDoorStorage.tsx
  
  // Set up real-time subscription for live updates (but NOT initial load)
  useEffect(() => {
    if (!currentWeekKey) return;

    console.log('🔄 [useDoorLists] Setting up realtime for week:', currentWeekKey);

    // Helper to reload data (used by realtime subscription)
    const loadData = async () => {
      try {
        console.log('📥 [useDoorLists] Realtime reload for week:', currentWeekKey);
        const loadedHotList = await doorUserTasksService.fetchGlobalHotList();
        const { hitList: loadedHitList, doList: loadedDoList } = await doorUserTasksService.fetchWeekLists(currentWeekKey);
        
        console.log('✅ [useDoorLists] Realtime loaded:', {
          weekKey: currentWeekKey,
          hitCount: loadedHitList.length
        });
        
        setHotList(loadedHotList);
        setHitList(loadedHitList);
        setDoList(loadedDoList);
      } catch (error) {
        console.error('Error loading Door data:', error);
      }
    };

    // Set up real-time subscription with user_id filter to prevent false reloads
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return supabase
        .channel('user-tasks-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tasks',
            filter: `user_id=eq.${user.id}` // Only listen to current user's changes
          },
          (payload) => {
            console.log('[Realtime] User task changed:', payload);
            // Skip reload if we just saved locally (prevents flicker)
            if ((window as any).__doorLocalSaving) {
              console.log('[Realtime] Skipping reload — local save in progress');
              return;
            }
            // Set flag to suppress auto-save during realtime reload
            (window as any).__doorRealtimeReloading = true;
            loadData().finally(() => {
              // Keep flag for 2s to let state settle before auto-save kicks in
              setTimeout(() => {
                (window as any).__doorRealtimeReloading = false;
              }, 2000);
            });
          }
        )
        .subscribe();
    };

    let channelPromise = setupRealtime();

    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
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

  // Add a new idea with text directly (for input field submission)
  const addNewTargetWithText = async (text: string) => {
    if (!text.trim()) return;
    
    const newItem: HotListItem = {
      id: Date.now().toString(),
      text: text.trim(),
      selected: false,
      priority: 'none'
    };
    
    const updatedHotList = [...hotList, newItem];
    setHotList(updatedHotList);
    
    // Save immediately to database
    try {
      await doorUserTasksService.saveGlobalHotList(updatedHotList);
      onDataChange?.();
      toast({
        title: "✅ Idee adăugată",
        description: `"${text.trim()}" a fost salvată în Idei`,
      });
    } catch (error) {
      console.error('Error saving new idea:', error);
      toast({
        title: '⚠️ Eroare salvare',
        description: 'Nu s-a putut salva ideea',
        variant: 'destructive',
      });
    }
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
    
    // Suppress realtime reload during local save to prevent flicker
    (window as any).__doorLocalSaving = true;
    
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
    } finally {
      setTimeout(() => { (window as any).__doorLocalSaving = false; }, 2000);
    }
  };

  const toggleDoListItemCompletion = async (id: string) => {
    const updatedDoList = doList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setDoList(updatedDoList);
    
    // Suppress realtime reload during local save to prevent flicker
    (window as any).__doorLocalSaving = true;
    
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
    } finally {
      setTimeout(() => { (window as any).__doorLocalSaving = false; }, 2000);
    }
  };

  const moveTaskBackToHotList = async (taskId: string, listType: 'hit' | 'do') => {
    const taskToMove = listType === 'hit' 
      ? hitList.find(item => item.id === taskId)
      : doList.find(item => item.id === taskId);
    
    if (!taskToMove) return;

    // Remove from local task list
    if (listType === 'hit') {
      setHitList(prev => prev.filter(item => item.id !== taskId));
    } else {
      setDoList(prev => prev.filter(item => item.id !== taskId));
    }
    
    try {
      // Delete the task from user_tasks DB
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('user_tasks').delete().eq('id', taskId);
      
      // Add to ideas_bank instead of old hotList
      const { ideasBankService } = await import('@/services/ideasBankService');
      await ideasBankService.addIdea(taskToMove.text, 'work', 1);
      
      onDataChange?.();
      
      toast({
        title: "📋 Mutat în Idei",
        description: `"${taskToMove.text.substring(0, 30)}..." a fost mutat înapoi în Ideas Bank`,
      });
    } catch (error) {
      console.error('Error moving task to ideas:', error);
      toast({
        title: '⚠️ Eroare salvare',
        description: 'Nu s-a putut muta task-ul în Ideas Bank',
        variant: 'destructive',
      });
    }
  };

  // Manual refresh function to reload data from Supabase
  const refreshLists = async () => {
    try {
      const loadedHotList = await doorUserTasksService.fetchGlobalHotList();
      const { hitList: loadedHitList, doList: loadedDoList } = await doorUserTasksService.fetchWeekLists(currentWeekKey);
      
      setHotList(loadedHotList);
      setHitList(loadedHitList);
      setDoList(loadedDoList);
    } catch (error) {
      console.error('Error refreshing Door data:', error);
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
    addNewTargetWithText,
    toggleHotListItemSelection,
    updateHotListItemText,
    updateHotListItemPriority,
    deleteHotListItem,
    toggleHitListItemCompletion,
    toggleDoListItemCompletion,
    moveTaskBackToHotList,
    refreshLists
  };
}
