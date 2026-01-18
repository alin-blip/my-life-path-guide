import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Lightbulb, Plus, X, GripVertical, Zap, ArrowRight, 
  CheckSquare, Square, Filter, MoreHorizontal, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { CategoryBadge, IdeaCategory, getCategoryOptions } from './CategoryBadge';
import { IdeaEmpowermentDialog } from './IdeaEmpowermentDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import type { DashboardWidget } from '@/types/dashboardWidget';

interface Idea {
  id: string;
  text: string;
  category: IdeaCategory;
  priority: number;
  position: number;
  completed: boolean;
  isEmpowered?: boolean;
}

interface IdeasWidgetProps {
  size: DashboardWidget['size'];
  onRemove: () => void;
  onResize: (size: DashboardWidget['size']) => void;
  dragHandleProps?: any;
}

const priorityColors: Record<number, string> = {
  0: 'border-l-muted-foreground/30',
  1: 'border-l-blue-500',
  2: 'border-l-yellow-500',
  3: 'border-l-red-500'
};

export const IdeasWidget: React.FC<IdeasWidgetProps> = ({
  size,
  onRemove,
  onResize,
  dragHandleProps
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [empowermentOpen, setEmpowermentOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);

  // Fetch ideas from user_tasks where task_type = 'hot'
  const fetchIdeas = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_type', 'hot')
        .order('position', { ascending: true });

      if (error) throw error;

      const mappedIdeas: Idea[] = (data || []).map(task => ({
        id: task.id,
        text: task.title,
        category: (task.category as IdeaCategory) || 'personal',
        priority: task.priority || 0,
        position: task.position || 0,
        completed: task.completed || false,
        isEmpowered: false // Will check empowerment table
      }));

      // Check which ideas are empowered
      if (mappedIdeas.length > 0) {
        const { data: empoweredData } = await supabase
          .from('idea_empowerment')
          .select('task_id')
          .in('task_id', mappedIdeas.map(i => i.id));

        const empoweredIds = new Set((empoweredData || []).map(e => e.task_id));
        mappedIdeas.forEach(idea => {
          idea.isEmpowered = empoweredIds.has(idea.id);
        });
      }

      setIdeas(mappedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Add new idea
  const handleAddIdea = async () => {
    if (!newIdeaText.trim() || !user?.id) return;

    const newIdea = {
      user_id: user.id,
      task_id: uuidv4(),
      title: newIdeaText.trim(),
      task_type: 'hot',
      list_type: 'hot',
      category: 'personal',
      priority: 0,
      position: ideas.length,
      completed: false
    };

    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .insert(newIdea)
        .select()
        .single();

      if (error) throw error;

      setIdeas(prev => [...prev, {
        id: data.id,
        text: data.title,
        category: 'personal',
        priority: 0,
        position: data.position || 0,
        completed: false,
        isEmpowered: false
      }]);

      setNewIdeaText('');
      setShowAddInput(false);
      
      toast({
        title: 'Idee adăugată!',
        description: 'Ideea a fost salvată în HOT list.'
      });
    } catch (error) {
      console.error('Error adding idea:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut adăuga ideea.',
        variant: 'destructive'
      });
    }
  };

  // Convert idea to HIT or DO list
  const convertToList = async (ideaId: string, targetType: 'hit' | 'do') => {
    if (!user?.id) return;

    const weekKey = `door-week-${new Date().toISOString().slice(0, 10).replace(/-/g, '-').slice(0, 7)}`;
    const days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
    const today = days[new Date().getDay()];

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({
          task_type: targetType,
          list_type: targetType,
          week_key: weekKey,
          day_of_week: today
        })
        .eq('id', ideaId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIdeas(prev => prev.filter(i => i.id !== ideaId));
      
      toast({
        title: 'Idee convertită!',
        description: `Ideea a fost mutată în ${targetType === 'hit' ? 'HIT' : 'DO'} list.`
      });
    } catch (error) {
      console.error('Error converting idea:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut converti ideea.',
        variant: 'destructive'
      });
    }
  };

  // Update category
  const updateCategory = async (ideaId: string, category: IdeaCategory) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ category })
        .eq('id', ideaId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIdeas(prev => prev.map(i => 
        i.id === ideaId ? { ...i, category } : i
      ));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  // Delete idea
  const deleteIdea = async (ideaId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIdeas(prev => prev.filter(i => i.id !== ideaId));
      
      toast({
        title: 'Idee ștearsă',
        description: 'Ideea a fost eliminată.'
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !user?.id) return;

    const items = Array.from(filteredIdeas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setIdeas(prev => {
      const otherItems = prev.filter(i => 
        selectedCategory === 'all' || i.category !== selectedCategory
      );
      return [...updatedItems, ...otherItems].sort((a, b) => a.position - b.position);
    });

    // Save to database
    try {
      for (const item of updatedItems) {
        await supabase
          .from('user_tasks')
          .update({ position: item.position })
          .eq('id', item.id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  // Open empowerment dialog
  const openEmpowerment = (idea: Idea) => {
    setSelectedIdea(idea);
    setEmpowermentOpen(true);
  };

  const handleEmpowermentComplete = (isMassive: boolean) => {
    if (selectedIdea) {
      setIdeas(prev => prev.map(i => 
        i.id === selectedIdea.id ? { ...i, isEmpowered: true } : i
      ));
    }
    fetchIdeas(); // Refresh to get updated data
  };

  const filteredIdeas = selectedCategory === 'all' 
    ? ideas 
    : ideas.filter(i => i.category === selectedCategory);

  const categoryOptions = getCategoryOptions();

  return (
    <>
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2" {...dragHandleProps}>
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-sm font-medium">Idei</CardTitle>
            <span className="text-xs text-muted-foreground">({ideas.length})</span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrează</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                  Toate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categoryOptions.map(cat => (
                  <DropdownMenuItem 
                    key={cat.value} 
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowAddInput(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>

            {/* Remove Widget */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* Add Input */}
          {showAddInput && (
            <div className="flex gap-2 mb-3">
              <Input
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder="Scrie o idee nouă..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
                autoFocus
              />
              <Button size="sm" className="h-8" onClick={handleAddIdea}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Ideas List */}
          <ScrollArea className="h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Se încarcă...
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                <Lightbulb className="h-8 w-8 opacity-30" />
                <p>Nicio idee încă</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddInput(true)}
                >
                  Adaugă prima idee
                </Button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="ideas-widget">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1.5"
                    >
                      {filteredIdeas.map((idea, index) => (
                        <Draggable key={idea.id} draggableId={idea.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                'group flex items-center gap-2 p-2 rounded-md bg-muted/30 border-l-2',
                                priorityColors[idea.priority] || priorityColors[0],
                                snapshot.isDragging && 'opacity-75 shadow-lg',
                                idea.completed && 'opacity-50'
                              )}
                            >
                              {/* Drag Handle */}
                              <div {...provided.dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100">
                                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>

                              {/* Idea Text */}
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-sm truncate',
                                  idea.completed && 'line-through'
                                )}>
                                  {idea.text}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <CategoryBadge 
                                    category={idea.category} 
                                    size="sm"
                                  />
                                  {idea.isEmpowered && (
                                    <Zap className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                {/* Empower */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => openEmpowerment(idea)}
                                  title="Împuternicește"
                                >
                                  <Zap className="h-3 w-3 text-yellow-500" />
                                </Button>

                                {/* Convert Menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => convertToList(idea.id, 'hit')}>
                                      <CheckSquare className="h-3.5 w-3.5 mr-2" />
                                      Mută în HIT List
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => convertToList(idea.id, 'do')}>
                                      <Square className="h-3.5 w-3.5 mr-2" />
                                      Mută în DO List
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* More Options */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Categorie</DropdownMenuLabel>
                                    {categoryOptions.map(cat => (
                                      <DropdownMenuItem 
                                        key={cat.value}
                                        onClick={() => updateCategory(idea.id, cat.value)}
                                      >
                                        {cat.label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteIdea(idea.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                                      Șterge
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Empowerment Dialog */}
      {selectedIdea && (
        <IdeaEmpowermentDialog
          isOpen={empowermentOpen}
          onClose={() => {
            setEmpowermentOpen(false);
            setSelectedIdea(null);
          }}
          taskId={selectedIdea.id}
          ideaText={selectedIdea.text}
          onComplete={handleEmpowermentComplete}
        />
      )}
    </>
  );
};
