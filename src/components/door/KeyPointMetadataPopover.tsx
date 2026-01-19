import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DominoKeyPoint } from '@/types/door';
import { Info, Target, Lightbulb, TrendingUp, TrendingDown, ListChecks, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyPointMetadataPopoverProps {
  keyPoint: DominoKeyPoint;
  children: React.ReactNode;
}

export const KeyPointMetadataPopover: React.FC<KeyPointMetadataPopoverProps> = ({
  keyPoint,
  children,
}) => {
  const hasMetadata = keyPoint.metadata && (
    keyPoint.metadata.objective ||
    keyPoint.metadata.why ||
    keyPoint.metadata.positiveImpact ||
    keyPoint.metadata.negativeImpact ||
    keyPoint.metadata.steps ||
    keyPoint.metadata.responsible ||
    keyPoint.metadata.deadline
  );

  if (!hasMetadata) {
    return <>{children}</>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group cursor-pointer">
          {children}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/20 hover:bg-blue-500/30 rounded-full"
          >
            <Info className="w-3 h-3 text-blue-400" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 space-y-3" side="right">
        <div className="font-semibold text-base border-b pb-2 mb-2">
          📌 Detalii Cheie
        </div>

        {keyPoint.metadata?.objective && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Obiectiv</span>
            </div>
            <p className="text-sm pl-6">{keyPoint.metadata.objective}</p>
          </div>
        )}

        {keyPoint.metadata?.why && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              <span>De ce?</span>
            </div>
            <p className="text-sm pl-6">{keyPoint.metadata.why}</p>
          </div>
        )}

        {keyPoint.metadata?.positiveImpact && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Impact Pozitiv</span>
            </div>
            <p className="text-sm pl-6 text-green-700 dark:text-green-400">
              {keyPoint.metadata.positiveImpact}
            </p>
          </div>
        )}

        {keyPoint.metadata?.negativeImpact && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>Impact Negativ (dacă nu se face)</span>
            </div>
            <p className="text-sm pl-6 text-red-700 dark:text-red-400">
              {keyPoint.metadata.negativeImpact}
            </p>
          </div>
        )}

        {keyPoint.metadata?.steps && keyPoint.metadata.steps.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ListChecks className="w-4 h-4" />
              <span>Pași</span>
            </div>
            <ul className="text-sm pl-6 space-y-1 list-disc">
              {keyPoint.metadata.steps.map((step, idx) => {
                // Handle both string format and object format {text, day, listType}
                if (typeof step === 'string') {
                  return <li key={idx}>{step}</li>;
                }
                const stepObj = step as { text: string; day?: string; listType?: string };
                return (
                  <li key={idx} className="flex items-center gap-2">
                    <span>{stepObj.text}</span>
                    {stepObj.day && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {stepObj.day === 'M' ? 'Luni' : 
                         stepObj.day === 'T' ? 'Marți' : 
                         stepObj.day === 'W' ? 'Miercuri' : 
                         stepObj.day === 'Th' ? 'Joi' : 
                         stepObj.day === 'F' ? 'Vineri' : stepObj.day}
                        {stepObj.listType && ` • ${stepObj.listType === 'hit' ? 'HIT' : 'DO'}`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {keyPoint.metadata?.responsible && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Responsabil</span>
            </div>
            <p className="text-sm pl-6 font-medium">{keyPoint.metadata.responsible}</p>
          </div>
        )}

        {keyPoint.metadata?.deadline && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Deadline</span>
            </div>
            <p className="text-sm pl-6 font-medium text-orange-600 dark:text-orange-400">
              {keyPoint.metadata.deadline}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
