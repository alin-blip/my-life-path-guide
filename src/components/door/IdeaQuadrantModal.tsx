import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Brain, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EISENHOWER_QUADRANTS, getSelectableQuadrants } from '@/types/eisenhower';

interface IdeaQuadrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaText: string;
  onSelectQuadrant: (priority: number) => void;
  onSkip: () => void;
  onAnalyze: () => void;
  isMobile?: boolean;
}

interface QuadrantCellProps {
  config: typeof EISENHOWER_QUADRANTS.q1_reactor;
  onClick: () => void;
  position: 'tl' | 'tr' | 'bl' | 'br';
}

const QuadrantCell: React.FC<QuadrantCellProps> = ({ config, onClick, position }) => {
  const roundedClasses = {
    tl: 'rounded-tl-xl',
    tr: 'rounded-tr-xl',
    bl: 'rounded-bl-xl',
    br: 'rounded-br-xl',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 transition-all duration-200",
        "border hover:scale-[1.02] active:scale-[0.98]",
        config.bgColor,
        config.borderColor,
        config.hoverBgColor,
        roundedClasses[position]
      )}
    >
      <span className="text-2xl mb-1">{config.icon}</span>
      <span className={cn("font-semibold text-sm", config.color)}>
        {config.labelRo.toUpperCase()}
      </span>
      <span className="text-xs text-muted-foreground mt-0.5">
        {config.actionRo}
      </span>
    </button>
  );
};

const ModalContent: React.FC<Omit<IdeaQuadrantModalProps, 'isOpen' | 'onClose' | 'isMobile'>> = ({
  ideaText,
  onSelectQuadrant,
  onSkip,
  onAnalyze,
}) => {
  const quadrants = getSelectableQuadrants();
  // Order: Q1 Reactor (top-left), Q2 Creator (top-right), Q3 Delegator (bottom-left), Q4 Eliminator (bottom-right)
  const q1 = EISENHOWER_QUADRANTS.q1_reactor;
  const q2 = EISENHOWER_QUADRANTS.q2_creator;
  const q3 = EISENHOWER_QUADRANTS.q3_delegator;
  const q4 = EISENHOWER_QUADRANTS.q4_eliminator;

  return (
    <div className="space-y-4">
      {/* Idea Preview */}
      <div className="p-3 bg-muted/50 rounded-lg border">
        <p className="text-sm text-foreground font-medium line-clamp-2">
          📝 "{ideaText}"
        </p>
      </div>

      {/* Quadrant Grid */}
      <div className="space-y-1">
        {/* Labels */}
        <div className="flex justify-center gap-4 text-[10px] text-muted-foreground font-medium tracking-wider">
          <span>← URGENT</span>
          <span>NU URGENT →</span>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 gap-1">
          {/* Important row */}
          <QuadrantCell
            config={q1}
            onClick={() => onSelectQuadrant(q1.priority)}
            position="tl"
          />
          <QuadrantCell
            config={q2}
            onClick={() => onSelectQuadrant(q2.priority)}
            position="tr"
          />
          
          {/* Not Important row */}
          <QuadrantCell
            config={q3}
            onClick={() => onSelectQuadrant(q3.priority)}
            position="bl"
          />
          <QuadrantCell
            config={q4}
            onClick={() => onSelectQuadrant(q4.priority)}
            position="br"
          />
        </div>

        {/* Side labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span className="font-medium">↑ IMPORTANT</span>
          <span className="font-medium">↓ NEIMPORTANT</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-11 text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          <SkipForward className="w-4 h-4" />
          <span>Sări peste (clasifici mai târziu)</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-11 border-primary/30 hover:bg-primary/10 hover:border-primary"
          onClick={onAnalyze}
        >
          <Brain className="w-4 h-4 text-primary" />
          <span>Analizează cu AI</span>
        </Button>
      </div>
    </div>
  );
};

export const IdeaQuadrantModal: React.FC<IdeaQuadrantModalProps> = ({
  isOpen,
  onClose,
  ideaText,
  onSelectQuadrant,
  onSkip,
  onAnalyze,
  isMobile = false,
}) => {
  const title = "Clasifică ideea ta";

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">{title}</SheetTitle>
          </SheetHeader>
          <ModalContent
            ideaText={ideaText}
            onSelectQuadrant={onSelectQuadrant}
            onSkip={onSkip}
            onAnalyze={onAnalyze}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <ModalContent
          ideaText={ideaText}
          onSelectQuadrant={onSelectQuadrant}
          onSkip={onSkip}
          onAnalyze={onAnalyze}
        />
      </DialogContent>
    </Dialog>
  );
};
