import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';
import { ReactionType, ReactionCount, REACTION_EMOJIS } from '@/hooks/useCommentReactions';
import { cn } from '@/lib/utils';

interface CommentReactionsProps {
  commentId: string;
  reactionCounts: ReactionCount[];
  onToggleReaction: (commentId: string, type: ReactionType) => void;
  canReact: boolean;
}

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  commentId,
  reactionCounts,
  onToggleReaction,
  canReact
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (type: ReactionType) => {
    onToggleReaction(commentId, type);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Display existing reactions */}
      {reactionCounts.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => canReact && handleReaction(reaction.type)}
          disabled={!canReact}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
            reaction.hasUserReacted
              ? "bg-amber-500/20 border border-amber-500/50 text-amber-400"
              : "bg-muted/50 border border-transparent hover:bg-muted",
            canReact && "cursor-pointer hover:scale-105"
          )}
        >
          <span>{REACTION_EMOJIS[reaction.type]}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {canReact && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-amber-500/10"
            >
              <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex gap-1">
              {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(([type, emoji]) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className="text-xl p-1.5 hover:bg-muted rounded-md transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
