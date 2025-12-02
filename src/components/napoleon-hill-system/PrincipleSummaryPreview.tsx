import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, X, Loader2, RotateCw } from 'lucide-react';

interface Action {
  action: string;
  completed: boolean;
}

interface PrincipleSummaryPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (summary: string, actions: Action[]) => void;
  onRegenerate: () => void;
  initialSummary: string;
  initialActions: Action[];
  isRegenerating?: boolean;
}

export const PrincipleSummaryPreview: React.FC<PrincipleSummaryPreviewProps> = ({
  isOpen,
  onClose,
  onSave,
  onRegenerate,
  initialSummary,
  initialActions,
  isRegenerating = false,
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [newAction, setNewAction] = useState('');

  // Reset state when dialog opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setSummary(initialSummary);
      setActions(initialActions);
      setNewAction('');
    }
  }, [isOpen, initialSummary, initialActions]);

  const handleAddAction = () => {
    if (newAction.trim()) {
      setActions([...actions, { action: newAction.trim(), completed: false }]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleEditAction = (index: number, newText: string) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], action: newText };
    setActions(updatedActions);
  };

  const handleSave = () => {
    onSave(summary, actions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Previzualizare Sumar & Acțiuni</DialogTitle>
          <DialogDescription>
            Revizuiește și editează sumarul și acțiunile generate de AI înainte de salvare finală.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Section */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Sumar Principiu
            </label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Introdu sumarul principiului..."
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Rezumă esența înțelegerii tale despre acest principiu în 2-3 propoziții.
            </p>
          </div>

          {/* Actions Section */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Acțiuni Concrete
            </label>
            
            {actions.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg text-center">
                Nu există acțiuni încă. Adaugă prima acțiune mai jos.
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                {actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 bg-muted/30 p-3 rounded-lg">
                    <span className="text-sm font-medium text-primary mt-1.5">
                      {index + 1}.
                    </span>
                    <Input
                      value={action.action}
                      onChange={(e) => handleEditAction(index, e.target.value)}
                      className="flex-1 bg-background"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Action */}
            <div className="flex gap-2">
              <Input
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddAction();
                  }
                }}
                placeholder="Adaugă o acțiune nouă..."
                className="flex-1"
              />
              <Button
                onClick={handleAddAction}
                disabled={!newAction.trim()}
                size="sm"
                variant="secondary"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acțiuni măsurabile pe care le poți aplica pentru a integra acest principiu.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="w-full sm:w-auto"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerare...
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4 mr-2" />
                Regenerează cu AI
              </>
            )}
          </Button>
          <div className="flex gap-2 flex-1">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isRegenerating}
              className="flex-1"
            >
              Anulează
            </Button>
            <Button
              onClick={handleSave}
              disabled={!summary.trim() || actions.length === 0 || isRegenerating}
              className="flex-1"
            >
              Salvează Principiul
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
