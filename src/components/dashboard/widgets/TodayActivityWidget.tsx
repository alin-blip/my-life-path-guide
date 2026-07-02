import React, { useMemo } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { WidgetSize } from '@/types/dashboardWidget';
import { useTodayActivity } from '@/hooks/useTodayActivity';
import { ActivityAxis } from '@/services/dailyActivityService';
import { Sparkles, Dumbbell, Heart, Brain, Briefcase, Users, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const AXIS_META: Record<ActivityAxis, { label: string; Icon: any; color: string; ring: string }> = {
  body: { label: 'Corp', Icon: Dumbbell, color: 'text-red-500', ring: 'border-red-500/30 bg-red-500/5' },
  being: { label: 'Ființă', Icon: Heart, color: 'text-purple-500', ring: 'border-purple-500/30 bg-purple-500/5' },
  balance: { label: 'Echilibru', Icon: Users, color: 'text-pink-500', ring: 'border-pink-500/30 bg-pink-500/5' },
  business: { label: 'Business', Icon: Briefcase, color: 'text-blue-500', ring: 'border-blue-500/30 bg-blue-500/5' },
  mind: { label: 'Minte', Icon: Brain, color: 'text-amber-500', ring: 'border-amber-500/30 bg-amber-500/5' },
};

const formatTime = (iso?: string) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

interface Props {
  size: WidgetSize;
  onRemove: () => void;
  onResize: (size: WidgetSize) => void;
  dragHandleProps?: any;
}

export const TodayActivityWidget: React.FC<Props> = ({ size, onRemove, onResize, dragHandleProps }) => {
  const { snapshot, isLoading } = useTodayActivity();

  const groupedByAxis = useMemo(() => {
    const groups: Record<ActivityAxis, typeof snapshot['items']> = {
      body: [], being: [], balance: [], business: [], mind: [],
    } as any;
    (snapshot?.items ?? []).forEach((it) => groups[it.axis].push(it));
    return groups;
  }, [snapshot]);

  const total = snapshot?.totalCount ?? 0;

  return (
    <WidgetContainer
      title="Ce am făcut azi"
      icon={<Sparkles className="h-5 w-5 text-amber-500" />}
      size={size}
      onRemove={onRemove}
      onResize={onResize}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Sincron cu rutina, task-urile, stack-urile și cursurile</span>
          <span className="text-xs font-medium">{isLoading ? '…' : `${total} acțiuni`}</span>
        </div>

        {!isLoading && total === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Nicio acțiune azi încă. Începe cu un pas mic — apoi apare aici automat.
          </p>
        )}

        {total > 0 && (
          <>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(AXIS_META) as ActivityAxis[]).map((axis) => {
                const { Icon, label, color, ring } = AXIS_META[axis];
                const c = snapshot!.countsByAxis[axis];
                return (
                  <div key={axis} className={cn('rounded-md border p-1.5 text-center', ring, c === 0 && 'opacity-40')}>
                    <Icon className={cn('w-3.5 h-3.5 mx-auto mb-0.5', color)} />
                    <div className="text-sm font-semibold leading-none">{c}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(Object.keys(AXIS_META) as ActivityAxis[]).map((axis) => {
                const list = groupedByAxis[axis];
                if (!list?.length) return null;
                const { Icon, label, color } = AXIS_META[axis];
                return (
                  <div key={axis} className="space-y-1">
                    <div className={cn('flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide', color)}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                    <ul className="space-y-0.5 pl-4">
                      {list.slice(0, 5).map((it) => (
                        <li key={it.id} className="flex items-center gap-1.5 text-xs text-foreground/90">
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                          <span className="flex-1 truncate">{it.title}</span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />{formatTime(it.occurredAt)}
                          </span>
                        </li>
                      ))}
                      {list.length > 5 && (
                        <li className="text-[10px] text-muted-foreground">+{list.length - 5} mai multe</li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </WidgetContainer>
  );
};
