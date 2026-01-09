import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { HabitCategory } from '@/hooks/useDailyHabits';

interface HabitQuickEditProps {
  habitId: string;
  habitName: string;
  habitCategory: HabitCategory;
  onSave: (id: string, name: string, category: HabitCategory) => Promise<void>;
  children?: React.ReactNode;
}

const CATEGORIES: { value: HabitCategory; labelRo: string; labelEn: string }[] = [
  { value: 'body', labelRo: 'Body', labelEn: 'Body' },
  { value: 'being', labelRo: 'Being', labelEn: 'Being' },
  { value: 'balance', labelRo: 'Balance', labelEn: 'Balance' },
  { value: 'business', labelRo: 'Business', labelEn: 'Business' },
];

export const HabitQuickEdit = ({ 
  habitId, 
  habitName, 
  habitCategory, 
  onSave,
  children 
}: HabitQuickEditProps) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habitName);
  const [category, setCategory] = useState<HabitCategory>(habitCategory);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onSave(habitId, name.trim(), category);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(habitName);
    setCategory(habitCategory);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="font-medium text-sm">
            {language === 'ro' ? 'Editează Habit' : 'Edit Habit'}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-xs">
              {language === 'ro' ? 'Nume' : 'Name'}
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ro' ? 'Numele habit-ului' : 'Habit name'}
              className="h-8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-category" className="text-xs">
              {language === 'ro' ? 'Categorie' : 'Category'}
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === 'ro' ? cat.labelRo : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              {language === 'ro' ? 'Anulează' : 'Cancel'}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
            >
              <Check className="h-4 w-4 mr-1" />
              {language === 'ro' ? 'Salvează' : 'Save'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
