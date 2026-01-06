import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Dumbbell, Brain, Users, Briefcase, Sparkles } from 'lucide-react';
import { HabitCategory, HabitGroup } from '@/hooks/useDailyHabits';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (habit: {
    name: string;
    category: string;
    habit_group: HabitGroup;
    icon: string;
    is_active: boolean;
    position: number;
  }) => Promise<any>;
  defaultCategory?: string;
  availableCategories: string[];
  onAddCategory?: (category: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  body: 'Corp',
  being: 'Spiritualitate',
  balance: 'Relații',
  business: 'Business',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  body: Dumbbell,
  being: Brain,
  balance: Users,
  business: Briefcase,
};

const ICON_OPTIONS = [
  'dumbbell', 'apple', 'heart', 'users', 'brain', 'book-open',
  'search', 'megaphone', 'pen-tool', 'message-circle', 'send',
  'handshake', 'star', 'zap', 'target', 'check-circle',
  'flame', 'coffee', 'sun', 'moon', 'music', 'camera'
];

export function AddHabitDialog({
  open,
  onOpenChange,
  onAdd,
  defaultCategory,
  availableCategories,
  onAddCategory,
}: AddHabitDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'body');
  const [icon, setIcon] = useState('star');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    // Determine which category to use
    let finalCategory = category;
    if (showNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim().toLowerCase().replace(/\s+/g, '_');
      onAddCategory?.(finalCategory);
    }

    await onAdd({
      name: name.trim(),
      category: finalCategory,
      habit_group: 'custom',
      icon,
      is_active: true,
      position: 999,
    });

    setName('');
    setCategory(defaultCategory || 'body');
    setIcon('star');
    setNewCategory('');
    setShowNewCategory(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Habit Nou</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Nume</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Citit 30 min"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Categorie</Label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat] || Sparkles;
                      return (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{CATEGORY_LABELS[cat] || cat}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewCategory(true)}
                  title="Adaugă categorie nouă"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex: Mentalitate"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategory('');
                  }}
                >
                  Anulează
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.slice(0, 12).map((iconName) => (
                <Button
                  key={iconName}
                  type="button"
                  variant={icon === iconName ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setIcon(iconName)}
                >
                  <span className="text-xs">{iconName.slice(0, 2)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? 'Se adaugă...' : 'Adaugă'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
