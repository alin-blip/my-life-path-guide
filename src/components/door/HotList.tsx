import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, GripVertical, Search, Plus, Target } from 'lucide-react';
import { HotListItem, TaskPriority } from '@/types/door';
import { useLanguage } from '@/context/LanguageContext';
import { DoorEmptyState } from './DoorEmptyState';

interface HotListProps {
  filteredHotList: HotListItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleHotListItemSelection: (id: string) => void;
  updateHotListItemText: (id: string, text: string) => void;
  updateHotListItemPriority: (id: string, priority: TaskPriority) => void;
  addNewTarget: () => void;
  addNewTargetWithText?: (text: string) => void;
  deleteHotListItem: (id: string) => void;
  handleDragStartToDomino: (e: React.DragEvent, item: HotListItem) => void;
  handleDragStart: (e: React.DragEvent, item: HotListItem) => void;
  handleDragEnd: () => void;
  handleDominoSelection: (item: HotListItem) => void;
  editingNewItem: boolean;
  isMobile?: boolean;
}

export const HotList: React.FC<HotListProps> = ({
  filteredHotList,
  searchTerm,
  setSearchTerm,
  toggleHotListItemSelection,
  updateHotListItemText,
  updateHotListItemPriority,
  addNewTarget,
  addNewTargetWithText,
  deleteHotListItem,
  handleDragStartToDomino,
  handleDragStart,
  handleDragEnd,
  handleDominoSelection,
  editingNewItem,
  isMobile = false
}) => {
  const [editingItems, setEditingItems] = useState<{ [id: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [id: string]: string }>({});
  const [newItemText, setNewItemText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleAddItem = () => {
    if (newItemText.trim()) {
      if (addNewTargetWithText) {
        addNewTargetWithText(newItemText.trim());
      } else {
        addNewTarget();
      }
      setNewItemText('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Priority color indicator
  const getPriorityIndicator = (priority?: TaskPriority) => {
    switch (priority) {
      case 'important':
        return 'border-l-4 border-l-green-500';
      case 'urgent':
        return 'border-l-4 border-l-orange-500';
      case 'urgent-important':
        return 'border-l-4 border-l-red-500';
      default:
        return '';
    }
  };

  return (
    <div className={isMobile ? 'max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full' : ''}>
      {/* Combined Add Input - Notion style */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className="relative">
          <Plus className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isMobile ? 'w-3 h-3' : 'h-4 w-4'}`} />
          <Input
            ref={inputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder={t('addItem') + '...'}
            className={`bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all ${
              isMobile ? 'pl-8 text-sm h-9' : 'pl-10 h-10'
            }`}
          />
        </div>
      </div>
      
      {/* Search - Collapsible */}
      {filteredHotList.length > 5 && (
        <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
          {showSearch ? (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isMobile ? 'w-3 h-3' : 'h-4 w-4'}`} />
              <Input
                placeholder={t('searchItems')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => !searchTerm && setShowSearch(false)}
                autoFocus
                className={`bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary ${
                  isMobile ? 'pl-8 text-sm h-8' : 'pl-10'
                }`}
              />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setShowSearch(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>{t('searchItems')}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Task List - Clean Notion style */}
      <div className={`space-y-1 ${isMobile ? 'max-h-[calc(70vh-120px)] overflow-y-auto' : ''}`}>
        {filteredHotList.length > 0 ? (
          filteredHotList.map(item => {
            const isEditing = editingItems[item.id];
            
            return (
              <div 
                key={item.id} 
                className={`group flex items-center gap-2 rounded-lg hover:bg-muted/50 transition-colors ${
                  getPriorityIndicator(item.priority)
                } ${isMobile ? 'p-2' : 'p-2'}`}
                draggable={!isEditing}
                onDragStart={(e) => {
                  handleDragStart(e, item);
                  handleDragStartToDomino(e, item);
                }}
                onDragEnd={handleDragEnd}
              >
                {/* Drag handle */}
                <div className={`cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground ${isMobile ? '' : ''}`}>
                  <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </div>
                
                {/* Text / Edit */}
                {isEditing ? (
                  <Input
                    value={editValues[item.id] ?? item.text}
                    onChange={(e) => setEditValues({...editValues, [item.id]: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editValues[item.id] !== undefined) {
                          updateHotListItemText(item.id, editValues[item.id]);
                        }
                        setEditingItems({...editingItems, [item.id]: false});
                      } else if (e.key === 'Escape') {
                        setEditingItems({...editingItems, [item.id]: false});
                        setEditValues({...editValues, [item.id]: item.text});
                      }
                    }}
                    onBlur={() => {
                      if (editValues[item.id] !== undefined) {
                        updateHotListItemText(item.id, editValues[item.id]);
                      }
                      setEditingItems({...editingItems, [item.id]: false});
                    }}
                    autoFocus
                    className={`flex-grow bg-transparent border-none focus:ring-1 focus:ring-primary text-foreground ${
                      isMobile ? 'p-1 text-sm h-7' : 'p-1 h-7'
                    }`}
                  />
                ) : (
                  <span 
                    className={`flex-grow text-foreground cursor-text hover:text-primary transition-colors ${isMobile ? 'text-sm' : 'text-sm'}`}
                    onClick={() => {
                      setEditValues({...editValues, [item.id]: item.text});
                      setEditingItems({...editingItems, [item.id]: true});
                    }}
                  >
                    {item.text}
                  </span>
                )}
                
                {/* Actions - Only show on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Set as focus */}
                  <button
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title={t('setWeeklyFocus')}
                    onClick={() => handleDominoSelection(item)}
                  >
                    <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </button>
                  
                  {/* Delete */}
                  <button
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => deleteHotListItem(item.id)}
                  >
                    <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <DoorEmptyState 
            onAddItem={addNewTarget}
            onAddTemplate={(text) => addNewTargetWithText ? addNewTargetWithText(text) : addNewTarget()}
          />
        )}
      </div>
    </div>
  );
};
