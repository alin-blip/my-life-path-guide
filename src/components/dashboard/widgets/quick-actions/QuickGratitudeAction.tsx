import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Heart, Plus, X } from 'lucide-react';
import { useChampionRoutine } from '@/hooks/useChampionRoutine';
import { useToast } from '@/hooks/use-toast';

interface QuickGratitudeActionProps {
  onUpdate?: () => void;
}

export function QuickGratitudeAction({ onUpdate }: QuickGratitudeActionProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const { todayLog, updateLog } = useChampionRoutine();
  const { toast } = useToast();

  useEffect(() => {
    if (open && todayLog?.gratitude_items) {
      const gratitudeItems = todayLog.gratitude_items as string[];
      setItems(gratitudeItems);
    }
  }, [open, todayLog?.gratitude_items]);

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setItems(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, text: string) => {
    setItems(prev => prev.map((item, i) => i === index ? text : item));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast({
        title: "Eroare",
        description: "Te rog adaugă cel puțin un lucru pentru care ești recunoscător.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateLog('gratitude_items', items);
      
      toast({
        title: "Salvat!",
        description: "Recunoștința a fost actualizată."
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving gratitude:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const existingItems = (todayLog?.gratitude_items as string[]) || [];
  const hasItems = existingItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          {hasItems ? (
            <>
              <Pencil className="h-3.5 w-3.5" />
              Editează
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Adaugă
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Recunoștință
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Pentru ce ești recunoscător astăzi? Adaugă cel puțin 3 lucruri.
          </p>

          {/* Existing items */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground w-5">
                  {index + 1}.
                </span>
                <Input
                  value={item}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new item */}
          {items.length < 5 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground w-5">
                {items.length + 1}.
              </span>
              <Input
                placeholder="Adaugă un lucru pentru care ești recunoscător..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Suggestions */}
          <div className="pt-2 border-t">
            <Label className="text-xs text-muted-foreground">Sugestii:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Familie', 'Sănătate', 'Prieteni', 'Oportunități', 'Natură'].map(suggestion => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    if (items.length < 5) {
                      setItems(prev => [...prev, suggestion]);
                    }
                  }}
                >
                  + {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="w-full"
          >
            {isSaving ? 'Se salvează...' : 'Salvează Recunoștința'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
