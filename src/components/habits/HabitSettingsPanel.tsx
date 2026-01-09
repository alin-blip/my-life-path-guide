import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DailyHabit, HabitCategory, HabitGroup } from '@/hooks/useDailyHabits';

interface HabitSettingsPanelProps {
  habits: DailyHabit[];
  onAdd: (habit: Omit<DailyHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<DailyHabit | null>;
  onUpdate: (id: string, updates: Partial<DailyHabit>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder?: (habits: DailyHabit[]) => Promise<void>;
}

const categoryLabels: Record<HabitCategory, string> = {
  body: 'Body',
  being: 'Being',
  balance: 'Balance',
  business: 'Business',
};

const groupLabels: Record<HabitGroup, string> = {
  core4: 'Core 4',
  biz4: 'Biz 4',
  custom: 'Custom',
};

const iconOptions = [
  'check', 'dumbbell', 'apple', 'heart', 'users', 'brain', 'book-open',
  'search', 'megaphone', 'pen-tool', 'message-circle', 'send', 'handshake',
  'star', 'target', 'coffee', 'sun', 'moon', 'music', 'camera',
];

export const HabitSettingsPanel: React.FC<HabitSettingsPanelProps> = ({
  habits,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}) => {
  const [activeTab, setActiveTab] = useState<HabitGroup>('core4');
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'business' as HabitCategory,
    icon: 'check',
  });

  const handleAddHabit = async () => {
    if (!newHabit.name.trim()) return;

    await onAdd({
      ...newHabit,
      habit_group: activeTab,
      is_active: true,
      position: habits.filter(h => h.habit_group === activeTab).length,
    });

    setNewHabit({ name: '', category: 'business', icon: 'check' });
    setIsAdding(false);
  };

  const handleDeleteHabit = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest habit?')) {
      await onDelete(id);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !onReorder) return;
    
    const groupHabits = habits.filter(h => h.habit_group === activeTab);
    const [reorderedItem] = groupHabits.splice(result.source.index, 1);
    groupHabits.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedHabits = groupHabits.map((habit, index) => ({
      ...habit,
      position: index,
    }));
    
    await onReorder(updatedHabits);
  };

  const filteredHabits = habits.filter(h => h.habit_group === activeTab);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HabitGroup)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="core4">Core 4</TabsTrigger>
          <TabsTrigger value="biz4">Biz 4</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {(['core4', 'biz4', 'custom'] as HabitGroup[]).map(group => (
          <TabsContent key={group} value={group} className="space-y-3 mt-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={`habits-${group}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {filteredHabits.map((habit, index) => (
                      <Draggable key={habit.id} draggableId={habit.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <Input
                                value={habit.name}
                                onChange={(e) => onUpdate(habit.id, { name: e.target.value })}
                                className="h-8"
                              />
                              
                              <div className="flex gap-2">
                                <Select
                                  value={habit.category}
                                  onValueChange={(v) => onUpdate(habit.id, { category: v as HabitCategory })}
                                >
                                  <SelectTrigger className="h-7 text-xs flex-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(categoryLabels).map(([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={habit.icon}
                                  onValueChange={(v) => onUpdate(habit.id, { icon: v })}
                                >
                                  <SelectTrigger className="h-7 text-xs w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {iconOptions.map(icon => (
                                      <SelectItem key={icon} value={icon}>
                                        {icon}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={habit.is_active}
                                onCheckedChange={(checked) => onUpdate(habit.id, { is_active: checked })}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteHabit(habit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {isAdding ? (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 space-y-3">
                <Input
                  placeholder="Nume habit"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
                
                <div className="flex gap-2">
                  <Select
                    value={newHabit.category}
                    onValueChange={(v) => setNewHabit(prev => ({ ...prev, category: v as HabitCategory }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newHabit.icon}
                    onValueChange={(v) => setNewHabit(prev => ({ ...prev, icon: v }))}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsAdding(false)}
                  >
                    Anulează
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleAddHabit}
                    disabled={!newHabit.name.trim()}
                  >
                    Adaugă
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Habit
              </Button>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
