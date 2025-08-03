
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, CheckSquare, Flame, Calendar, AlertTriangle } from 'lucide-react';
import { DayOfWeek } from '@/types/door';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';

interface StackIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToHitList?: (action: string) => void;
}

export const StackIdeaModal: React.FC<StackIdeaModalProps> = ({
  isOpen,
  onClose,
  onAddToHitList
}) => {
  const [ideaText, setIdeaText] = useState('');
  const [category, setCategory] = useState<'hit' | 'do' | 'hot'>('hot');
  const [priority, setPriority] = useState<'none' | 'important' | 'urgent' | 'urgent-important'>('none');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('M');
  
  const { captureIdea } = useStackTodoIntegration({ onAddToHitList });

  const handleSubmit = () => {
    if (ideaText.trim()) {
      const dayToUse = (category === 'hit' || category === 'do') ? selectedDay : undefined;
      captureIdea(ideaText, category, priority, dayToUse);
      
      // Reset form
      setIdeaText('');
      setCategory('hot');
      setPriority('none');
      setSelectedDay('M');
      onClose();
    }
  };

  const getCategoryInfo = (cat: 'hit' | 'do' | 'hot') => {
    switch (cat) {
      case 'hit':
        return {
          icon: <Target className="w-4 h-4" />,
          label: 'HIT List',
          description: 'Obiective importante pentru săptămână',
          color: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'do':
        return {
          icon: <CheckSquare className="w-4 h-4" />,
          label: 'DO List', 
          description: 'Sarcini de executat într-o zi specifică',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      default:
        return {
          icon: <Flame className="w-4 h-4" />,
          label: 'Hot List',
          description: 'Lista de idei fierbinti pentru organizare ulterioară',
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
    }
  };

  const getPriorityInfo = (prio: 'none' | 'important' | 'urgent' | 'urgent-important') => {
    switch (prio) {
      case 'important':
        return { label: 'Important', color: 'bg-blue-500/20 text-blue-400' };
      case 'urgent':
        return { label: 'Urgent', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'urgent-important':
        return { label: 'Urgent & Important', color: 'bg-red-500/20 text-red-400' };
      default:
        return { label: 'Normal', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  const days: { value: DayOfWeek; label: string }[] = [
    { value: 'M', label: 'Luni' },
    { value: 'T', label: 'Marți' },
    { value: 'W', label: 'Miercuri' },
    { value: 'Th', label: 'Joi' },
    { value: 'F', label: 'Vineri' },
    { value: 'Sa', label: 'Sâmbătă' },
    { value: 'Su', label: 'Duminică' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-purple-400 flex items-center gap-2">
            💡 Adaugă idee de execuție
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Ideea ta:
            </label>
            <Textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Descrie ideea ta de execuție..."
              className="min-h-[100px] bg-gray-800/50 border-gray-700 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Categorie:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(['hot', 'hit', 'do'] as const).map((cat) => {
                const info = getCategoryInfo(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-md border-2 transition-all text-left ${
                      category === cat 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {info.icon}
                      <span className="font-medium text-gray-200">{info.label}</span>
                      <Badge className={`text-xs px-2 py-0 ${info.color}`}>
                        {cat.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {(category === 'hit' || category === 'do') && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ziua programată:
              </label>
              <Select value={selectedDay} onValueChange={(value: DayOfWeek) => setSelectedDay(value)}>
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Prioritate:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['none', 'important', 'urgent', 'urgent-important'] as const).map((prio) => {
                const info = getPriorityInfo(prio);
                return (
                  <button
                    key={prio}
                    onClick={() => setPriority(prio)}
                    className={`p-2 rounded-md border transition-all text-center ${
                      priority === prio
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <Badge className={`text-xs px-2 py-1 ${info.color}`}>
                      {info.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 hover:bg-gray-800"
            >
              Anulează
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!ideaText.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              Salvează
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
