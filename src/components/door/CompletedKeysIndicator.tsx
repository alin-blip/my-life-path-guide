import React from 'react';
import { CheckCircle, Circle, Key } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CompletedKeyInfo } from '@/utils/doorPlanningContext';

interface CompletedKeysIndicatorProps {
  completedKeys: CompletedKeyInfo[];
}

const TOTAL_KEYS = 4;

export const CompletedKeysIndicator: React.FC<CompletedKeysIndicatorProps> = ({ completedKeys }) => {
  const completedCount = completedKeys.length;
  const completedNumbers = new Set(completedKeys.map(k => k.keyNumber));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant={completedCount > 0 ? 'default' : 'secondary'}
          className={`cursor-pointer gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${
            completedCount > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              : 'hover:bg-muted'
          }`}
        >
          <Key className="w-3 h-3" />
          {completedCount}/{TOTAL_KEYS} chei
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Rezumat Chei Definite</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount} din {TOTAL_KEYS} chei completate
          </p>
        </div>

        <ScrollArea className="max-h-72">
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4].map((keyNum) => {
              const keyInfo = completedKeys.find(k => k.keyNumber === keyNum);

              if (keyInfo) {
                return (
                  <CompletedKeyCard key={keyNum} keyInfo={keyInfo} />
                );
              }

              return (
                <div key={keyNum} className="flex items-center gap-2 py-1.5 text-muted-foreground">
                  <Circle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Cheia {keyNum}: Nedefinită încă</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

const CompletedKeyCard: React.FC<{ keyInfo: CompletedKeyInfo }> = ({ keyInfo }) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <span className="text-sm font-medium leading-tight">
        Cheia {keyInfo.keyNumber}: "{keyInfo.title}"
      </span>
    </div>

    {keyInfo.steps.length > 0 && (
      <div className="pl-6 space-y-0.5">
        {keyInfo.steps.map((step, idx) => (
          <p key={idx} className="text-xs text-muted-foreground">
            {idx + 1}. {step.text} –{' '}
            <span className="font-medium text-foreground">{step.day}</span>{' '}
            <span className={`font-semibold ${step.type === 'HIT' ? 'text-orange-500' : 'text-blue-500'}`}>
              ({step.type})
            </span>
          </p>
        ))}
      </div>
    )}

    <div className="pl-6">
      <p className="text-xs text-muted-foreground">
        Responsabil: <span className="font-medium text-foreground">{keyInfo.responsible}</span>
        {' | '}
        DL: <span className="font-medium text-foreground">{keyInfo.deadline}</span>
      </p>
    </div>
  </div>
);
