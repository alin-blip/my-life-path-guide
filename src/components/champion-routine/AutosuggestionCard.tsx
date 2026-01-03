import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Edit2, Save, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AutosuggestionCardProps {
  text: string;
  completed: boolean;
  onTextChange: (text: string) => void;
  onCompletedChange: (completed: boolean) => void;
}

export function AutosuggestionCard({
  text,
  completed,
  onTextChange,
  onCompletedChange,
}: AutosuggestionCardProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSave = () => {
    onTextChange(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-foreground">
              {t('autosuggestionTitle') || 'Autosugestie'}
            </span>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-background/50 min-h-[100px]"
              placeholder="Scrie afirmația ta..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Anulează
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Salvează
              </Button>
            </div>
          </div>
        ) : (
          <blockquote className="text-lg italic text-foreground/90 border-l-4 border-amber-500/50 pl-4 py-2">
            "{text}"
          </blockquote>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="autosuggestion-completed"
            checked={completed}
            onCheckedChange={(checked) => onCompletedChange(checked === true)}
          />
          <label
            htmlFor="autosuggestion-completed"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Am citit cu voce tare
          </label>
        </div>
      </div>
    </Card>
  );
}
