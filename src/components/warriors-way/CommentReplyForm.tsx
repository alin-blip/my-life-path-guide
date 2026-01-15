import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, X } from 'lucide-react';

interface CommentReplyFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CommentReplyForm: React.FC<CommentReplyFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    const success = await onSubmit(content);
    if (success) {
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scrie un răspuns..."
        className="min-h-[60px] resize-none bg-background/50 border-amber-500/20 focus:border-amber-500/50 text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Anulează
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="h-7 bg-gradient-to-r from-amber-500 to-orange-600"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5 mr-1" />
          )}
          Răspunde
        </Button>
      </div>
    </form>
  );
};
