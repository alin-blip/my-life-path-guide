import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { EisenhowerSelector } from '@/components/ui/EisenhowerSelector';
import type { BrainDumpItem as TItem } from '@/hooks/useBrainDump';

const TYPE_META: Record<TItem['type'], { icon: string; label: string; color: string }> = {
  task: { icon: '📝', label: 'Task', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  thought: { icon: '💭', label: 'Gând (Jurnal)', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  idea: { icon: '💡', label: 'Idee (Bank)', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  gratitude: { icon: '🙏', label: 'Recunoștință', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
};

const DAYS: Array<{ v: NonNullable<TItem['suggestedDay']>; label: string }> = [
  { v: 'M', label: 'L' },
  { v: 'T', label: 'Ma' },
  { v: 'W', label: 'Mi' },
  { v: 'Th', label: 'J' },
  { v: 'F', label: 'V' },
  { v: 'Sa', label: 'S' },
  { v: 'Su', label: 'D' },
];

interface Props {
  item: TItem;
  onChange: (patch: Partial<TItem>) => void;
  onRemove: () => void;
}

export const BrainDumpItem: React.FC<Props> = ({ item, onChange, onRemove }) => {
  const meta = TYPE_META[item.type];

  return (
    <div className={cn('rounded-lg border p-3 space-y-2', meta.color)}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none mt-0.5">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wide font-semibold opacity-80">{meta.label}</span>
            <button
              onClick={onRemove}
              className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Șterge"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input
            value={item.text}
            onChange={(e) => onChange({ text: e.target.value })}
            className="bg-background/50 border-border/50 text-sm h-8"
          />
        </div>
      </div>

      {item.type === 'task' && (
        <div className="flex flex-wrap items-center gap-2 pl-7">
          <EisenhowerSelector
            priority={item.priority ?? 3}
            onSelect={(p) => onChange({ priority: p as 1 | 2 | 3 | 4 })}
          />
          <div className="flex items-center gap-0.5">
            {DAYS.map((d) => (
              <button
                key={d.v}
                onClick={() => onChange({ suggestedDay: d.v })}
                className={cn(
                  'h-6 w-6 rounded text-[10px] font-medium transition-colors',
                  item.suggestedDay === d.v
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              size="sm"
              variant={item.destination === 'hit' ? 'default' : 'outline'}
              className="h-6 px-2 text-[10px]"
              onClick={() => onChange({ destination: 'hit' })}
            >
              HIT
            </Button>
            <Button
              size="sm"
              variant={item.destination === 'do' ? 'default' : 'outline'}
              className="h-6 px-2 text-[10px]"
              onClick={() => onChange({ destination: 'do' })}
            >
              DO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
