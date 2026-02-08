import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const emojiCategories = [
  {
    name: '😊',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  },
  {
    name: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾'],
  },
  {
    name: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '💫', '🔥', '💯', '🎯', '🏆', '🥇', '🎉', '🎊', '🎁'],
  },
  {
    name: '🚀',
    emojis: ['🚀', '💡', '📈', '📊', '💰', '💎', '🗡️', '⚔️', '🛡️', '🏋️', '🧘', '🏃', '💪', '🧠', '📚', '✍️', '📝', '🎬', '🎙️', '🎧', '💻', '📱', '⏰', '🌅', '🌄', '🏔️', '🌊', '☀️', '🌈', '🍀'],
  },
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, className }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 p-0 text-muted-foreground hover:text-foreground', className)}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start" side="top">
        {/* Category tabs */}
        <div className="flex gap-1 mb-2 border-b border-border pb-2">
          {emojiCategories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={cn(
                'text-lg p-1 rounded hover:bg-muted transition-colors',
                activeCategory === i && 'bg-muted'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
          {emojiCategories[activeCategory].emojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => handleSelect(emoji)}
              className="text-xl p-1 rounded hover:bg-muted transition-colors text-center leading-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
