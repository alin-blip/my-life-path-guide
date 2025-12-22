import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, GripVertical, Search, Plus, Star, Flag, AlertCircle, KeyRound, Target } from 'lucide-react';
import { HotListItem, TaskPriority } from '@/types/door';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleAddTemplate = (text: string) => {
    if (addNewTargetWithText) {
      addNewTargetWithText(text);
    } else {
      // Fallback: add empty item and focus
      addNewTarget();
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      addNewTarget();
      setNewItemText('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={isMobile ? 'max-h-[70vh] overflow-auto' : ''}>
      {/* Simplified Add Button */}
      <div className={`flex gap-2 justify-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Button
          onClick={addNewTarget}
          size="sm"
          className="text-primary hover:bg-primary/10 border border-primary/20 w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-1" />
          {t('addItem')}
        </Button>
      </div>
      
      {/* Quick Add Input */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
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
          placeholder="Tastează task nou și apasă Enter..."
          className={`bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all ${
            isMobile ? 'text-sm h-8' : ''
          }`}
        />
      </div>
      
      {/* Search Input */}
      <div className={`relative ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Search className={`absolute left-3 top-2.5 text-muted-foreground ${isMobile ? 'w-3 h-3 top-2' : 'h-4 w-4'}`} />
        <Input
          placeholder={t('searchItems')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary ${
            isMobile ? 'pl-8 text-sm h-8' : 'pl-10'
          }`}
        />
      </div>
      
      <div className={`space-y-2 hot-list-container ${
        isMobile ? 'max-h-[calc(70vh-200px)] overflow-y-auto space-y-1.5' : ''
      }`}>
        {filteredHotList.length > 0 ? (
          filteredHotList.map(item => {
            const isEditing = editingItems[item.id];
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center rounded-md hot-list-item ${
                  item.selected ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
                } ${
                  item.priority === 'important' ? 'border-l-4 border-l-green-500' :
                  item.priority === 'urgent' ? 'border-l-4 border-l-orange-500' :
                  item.priority === 'urgent-important' ? 'border-l-4 border-l-red-500' : ''
                } ${isMobile ? 'p-2' : 'p-2'}`}
                draggable={!isEditing}
                onDragStart={(e) => {
                  handleDragStart(e, item);
                  handleDragStartToDomino(e, item);
                }}
                onDragEnd={handleDragEnd}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setEditingItems({ ...editingItems, [item.id]: true });
                }}
              >
                <div 
                  className={`cursor-pointer mr-2 text-muted-foreground ${isMobile ? 'p-0.5' : 'p-1'}`}
                  onMouseDown={() => {
                    if (!isEditing) toggleHotListItemSelection(item.id);
                  }}
                >
                  {item.selected ? (
                    <Check className={`text-primary ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  ) : (
                    <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  )}
                </div>
                
                {isEditing ? (
                  <Input
                    value={editValues[item.id] || item.text}
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
                      isMobile ? 'p-1 text-sm' : 'p-1'
                    }`}
                    placeholder="Editează și apasă Enter..."
                  />
                ) : (
                  <span 
                    className={`flex-grow text-foreground cursor-pointer hover:text-primary transition-colors ${isMobile ? 'text-sm' : ''}`}
                    onClick={() => setEditingItems({...editingItems, [item.id]: true})}
                  >
                    {item.text}
                  </span>
                )}
                
                <div className="flex items-center space-x-1">
                  {item.isKeyPoint && (
                    <span className="text-blue-400">
                      <KeyRound className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    </span>
                  )}

                  {/* Select as Weekly Focus */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-muted-foreground hover:text-primary transition-colors focus:ring-0 ${
                      isMobile ? 'p-1 h-auto' : 'p-1 h-auto'
                    }`}
                    title={t('setWeeklyFocus')}
                    onClick={() => handleDominoSelection(item)}
                  >
                    <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-muted-foreground hover:text-primary transition-colors focus:ring-0 ${
                          isMobile ? 'p-1 h-auto' : 'p-1 h-auto'
                        }`}
                      >
                        {item.priority === 'important' ? (
                          <Star className={`text-green-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : item.priority === 'urgent' ? (
                          <Flag className={`text-orange-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : item.priority === 'urgent-important' ? (
                          <AlertCircle className={`text-red-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : (
                          <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover border-border text-foreground">
                      <DropdownMenuItem 
                      className="flex items-center cursor-pointer hover:bg-accent"
                        onClick={() => updateHotListItemPriority(item.id, 'none')}
                      >
                        <Star className={`mr-2 text-muted-foreground ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('normal')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                      className="flex items-center cursor-pointer hover:bg-accent"
                        onClick={() => updateHotListItemPriority(item.id, 'important')}
                      >
                        <Star className={`mr-2 text-green-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('important')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                      className="flex items-center cursor-pointer hover:bg-accent"
                        onClick={() => updateHotListItemPriority(item.id, 'urgent')}
                      >
                        <Flag className={`mr-2 text-orange-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('urgent')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-accent"
                        onClick={() => updateHotListItemPriority(item.id, 'urgent-important')}
                      >
                        <AlertCircle className={`mr-2 text-red-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('urgentImportant')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-muted-foreground hover:text-destructive transition-colors focus:ring-0 ${
                      isMobile ? 'p-1 h-auto' : 'p-1 h-auto'
                    }`}
                    onClick={() => deleteHotListItem(item.id)}
                  >
                    <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <DoorEmptyState 
            onAddItem={addNewTarget}
            onAddTemplate={handleAddTemplate}
          />
        )}
      </div>
    </div>
  );
};
