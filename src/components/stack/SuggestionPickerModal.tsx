import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface SuggestionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestionPickerModal: React.FC<SuggestionPickerModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onSelect,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-purple-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Sugestii de acțiuni
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-300">Nu s-au găsit sugestii în acest moment.</p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((s, idx) => (
                <li key={idx} className="p-3 rounded-md border border-gray-700 bg-gray-800/40 flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-100 whitespace-pre-wrap flex-1">{s}</p>
                  <Button size="sm" onClick={() => onSelect(s)} className="shrink-0">Alege</Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end pt-1">
            <Button variant="outline" onClick={onClose}>Închide</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
