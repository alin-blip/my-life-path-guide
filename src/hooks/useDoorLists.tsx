import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { HotListItem, HitListItem, DoListItem, DayOfWeek, TaskPriority } from '@/types/door';

export function useDoorLists() {
  const [hotList, setHotList] = useState<HotListItem[]>([]);
  const [hitList, setHitList] = useState<HitListItem[]>([]);
  const [doList, setDoList] = useState<DoListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeList, setActiveList] = useState<'hit' | 'do'>('hit');
  const [editingNewItem, setEditingNewItem] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasExistingData = localStorage.getItem('door-hot-list');
    
    if (!hasExistingData) {
      setHotList([
        { id: '1', text: 'get the transcript from 6 phase meditation and implement in the ...', selected: false, priority: 'none' },
        { id: '2', text: 'plan the webinar', selected: false, priority: 'none' },
        { id: '3', text: 'reach out to 50 peoples, that means 10 a day from leads', selected: false, priority: 'urgent' },
        { id: '4', text: 'amazing intamicy night', selected: false, priority: 'important' },
        { id: '5', text: 'coachign session with her to get out of fear', selected: false, priority: 'none' },
        { id: '6', text: 'buy her a gift a meaningfull one', selected: false, priority: 'urgent-important' },
        { id: '7', text: 'sleep togheter on', selected: false, priority: 'none' },
      ]);
      
      setDoList([
        { id: '101', text: 'Review weekly goals', day: 'M', completed: false },
        { id: '102', text: 'Create content schedule', day: 'T', completed: true },
        { id: '103', text: 'Client follow-ups', day: 'W', completed: false },
        { id: '104', text: 'Team meeting prep', day: 'Th', completed: false },
        { id: '105', text: 'Weekly review', day: 'F', completed: true },
      ]);
    }
  }, []);

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

  const toggleHitListItemCompletion = (id: string) => {
    setHitList(hitList.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));
  };

  const toggleDoListItemCompletion = (id: string) => {
    setDoList(doList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const moveTaskBackToHotList = (taskId: string, listType: 'hit' | 'do') => {
    if (listType === 'hit') {
      const taskToMove = hitList.find(item => item.id === taskId);
      
      if (taskToMove) {
        const newHotItem: HotListItem = {
          id: `task-to-hot-${Date.now()}`,
          text: taskToMove.text,
          selected: false,
          priority: taskToMove.priority || 'none'
        };
        
        setHotList([...hotList, newHotItem]);
        
        setHitList(hitList.filter(item => item.id !== taskId));
        
        toast({
          title: "Task Moved",
          description: "Task has been moved back to the Hot List",
        });
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
        
        setHotList([...hotList, newHotItem]);
        
        setDoList(doList.filter(item => item.id !== taskId));
        
        toast({
          title: "Task Moved",
          description: "Task has been moved back to the Hot List",
        });
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
