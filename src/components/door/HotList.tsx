
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, GripVertical, Search, Plus, Star, Flag, AlertCircle, KeyRound, Target } from 'lucide-react';
import { HotListItem, TaskPriority } from '@/types/door';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';

interface HotListProps {
  filteredHotList: HotListItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleHotListItemSelection: (id: string) => void;
  updateHotListItemText: (id: string, text: string) => void;
  updateHotListItemPriority: (id: string, priority: TaskPriority) => void;
  addNewTarget: () => void;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (editingNewItem && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingNewItem]);

  return (
    <div className={isMobile ? 'max-h-[70vh] overflow-auto' : ''}>
      <div className={`flex justify-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Button
          onClick={addNewTarget}
          size="sm"
          className="text-blue-600 hover:bg-blue-50 border border-blue-200"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isMobile ? 'Add' : 'Adaugă'}
        </Button>
      </div>
      
      <div className={`relative ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Search className={`absolute left-3 top-2.5 text-gray-500 ${isMobile ? 'w-3 h-3 top-2' : 'h-4 w-4'}`} />
        <Input
          placeholder={t('searchItems')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`bg-[#232B3C] border-0 focus-visible:ring-1 focus-visible:ring-blue-500 ${
            isMobile ? 'pl-8 text-sm h-8' : 'pl-10'
          }`}
        />
      </div>
      
      <div className={`space-y-2 hot-list-container ${
        isMobile ? 'max-h-[calc(70vh-150px)] overflow-y-auto space-y-1.5' : ''
      }`}>
        {filteredHotList.length > 0 ? (
          filteredHotList.map(item => {
            const isEditing = editingItems[item.id];
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center rounded-md hot-list-item ${
                  item.selected ? 'bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30' : 'bg-[#232B3C]'
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
                  className={`cursor-pointer mr-2 text-gray-400 ${isMobile ? 'p-0.5' : 'p-1'}`}
                  onMouseDown={() => {
                    if (!isEditing) toggleHotListItemSelection(item.id);
                  }}
                >
                  {item.selected ? (
                    <Check className={`text-blue-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  ) : (
                    <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  )}
                </div>
                
                {isEditing ? (
                  <Input
                    value={editValues[item.id] || item.text}
                    onChange={(e) => setEditValues({...editValues, [item.id]: e.target.value})}
                    autoFocus
                    onBlur={() => {
                      if (editValues[item.id] !== undefined) {
                        updateHotListItemText(item.id, editValues[item.id]);
                      }
                      setEditingItems({...editingItems, [item.id]: false});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editValues[item.id] !== undefined) {
                          updateHotListItemText(item.id, editValues[item.id]);
                        }
                        setEditingItems({...editingItems, [item.id]: false});
                      }
                    }}
                    className={`flex-grow bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-white ${
                      isMobile ? 'p-1 text-sm' : 'p-1'
                    }`}
                  />
                ) : (
                  <span 
                    className={`flex-grow text-gray-300 cursor-pointer ${isMobile ? 'text-sm' : ''}`}
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
                    className={`text-gray-400 hover:text-purple-400 transition-colors focus:ring-0 ${
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
                        className={`text-gray-400 hover:text-blue-500 transition-colors focus:ring-0 ${
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
                    <DropdownMenuContent className="bg-[#1E293B] border-[#2A3A53] text-gray-200">
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-[#2A3A53]"
                        onClick={() => updateHotListItemPriority(item.id, 'none')}
                      >
                        <Star className={`mr-2 text-gray-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('normal')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-[#2A3A53]"
                        onClick={() => updateHotListItemPriority(item.id, 'important')}
                      >
                        <Star className={`mr-2 text-green-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('important')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-[#2A3A53]"
                        onClick={() => updateHotListItemPriority(item.id, 'urgent')}
                      >
                        <Flag className={`mr-2 text-orange-500 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        <span className={`${isMobile ? 'text-sm' : ''}`}>{t('urgent')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-[#2A3A53]"
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
                    className={`text-gray-400 hover:text-red-500 transition-colors focus:ring-0 ${
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
          <div className={`text-center text-gray-500 ${isMobile ? 'py-8' : 'py-6'}`}>
            <p className={`${isMobile ? 'text-sm' : ''}`}>{t('yourIdeaListEmpty')}</p>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
              {t('addNewItemsToStart')}
            </p>
          </div>
        )}
      </div>
      
      <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
        <Button
          onClick={addNewTarget}
          className={`w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none ${
            isMobile ? 'py-2 text-sm' : ''
          }`}
        >
          <Plus className={`mr-2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          {t('addItem')}
        </Button>
      </div>
    </div>
  );
};
