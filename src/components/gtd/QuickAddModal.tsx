import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Flame, Target, Flag, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ListType = 'hot' | 'hit' | 'do';
type Core4Category = 'body' | 'being' | 'balance' | 'business';

const CORE4_OPTIONS = [
  { id: 'body', label: 'Body', icon: '🏋️', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
  { id: 'being', label: 'Being', icon: '🧘', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { id: 'balance', label: 'Balance', icon: '👨‍👩‍👧', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  { id: 'business', label: 'Business', icon: '💼', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
];

const LIST_OPTIONS = [
  { id: 'hot', label: 'Hot List', icon: Flame, color: 'text-orange-500' },
  { id: 'hit', label: 'Hit List', icon: Target, color: 'text-blue-500' },
  { id: 'do', label: 'Do List', icon: Flag, color: 'text-green-500' },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [selectedList, setSelectedList] = useState<ListType>('hot');
  const [selectedCategory, setSelectedCategory] = useState<Core4Category | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    // Here you would add the task to the appropriate list
    // For now, just show a toast
    toast({
      title: language === 'en' ? 'Task Added' : 'Sarcină Adăugată',
      description: `"${title}" → ${LIST_OPTIONS.find(l => l.id === selectedList)?.label}`,
    });

    setTitle('');
    setSelectedCategory(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Input Area */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'en' ? 'Add a new task...' : 'Adaugă o sarcină nouă...'}
                className="border-0 p-0 h-auto text-lg focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* List Selection */}
          <div className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'en' ? 'Add to:' : 'Adaugă în:'}
            </p>
            <div className="flex gap-2">
              {LIST_OPTIONS.map((list) => (
                <Button
                  key={list.id}
                  type="button"
                  variant={selectedList === list.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedList(list.id as ListType)}
                  className="gap-2"
                >
                  <list.icon className={cn("w-4 h-4", selectedList !== list.id && list.color)} />
                  {list.label}
                </Button>
              ))}
            </div>
          </div>

          {/* CORE 4 Category (Optional) */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'en' ? 'Category (optional):' : 'Categorie (opțional):'}
            </p>
            <div className="flex gap-2">
              {CORE4_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id as Core4Category
                  )}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all",
                    selectedCategory === cat.id
                      ? cat.color + " border-current"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/20">
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd>
              <span className="mx-1">+</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd>
              <span className="ml-2">{language === 'en' ? 'to open' : 'pentru a deschide'}</span>
            </p>
            <Button type="submit" disabled={!title.trim()}>
              {language === 'en' ? 'Add Task' : 'Adaugă'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
