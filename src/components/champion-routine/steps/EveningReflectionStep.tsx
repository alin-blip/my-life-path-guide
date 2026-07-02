import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Moon,
  ArrowRight,
  Sparkles,
  Dumbbell,
  Heart,
  Brain,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTodayActivity } from '@/hooks/useTodayActivity';
import { ActivityAxis } from '@/services/dailyActivityService';
import { upsertTodayShadowSnapshot } from '@/hooks/useShadowCoachHistory';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface Props {
  doneWell: string | null;
  learned: string | null;
  notDone: string | null;
  onChange: (
    field: 'evening_reflection_done_well' | 'evening_reflection_learned' | 'evening_reflection_not_done',
    value: string
  ) => void;
  onComplete: (value: boolean) => void;
  onNext: () => void;
}

const AXIS_META: Record<ActivityAxis, { label: string; Icon: any; color: string; ring: string }> = {
  body: { label: 'Corp', Icon: Dumbbell, color: 'text-red-500', ring: 'border-red-500/30 bg-red-500/5' },
  being: { label: 'Ființă', Icon: Heart, color: 'text-purple-500', ring: 'border-purple-500/30 bg-purple-500/5' },
  balance: { label: 'Echilibru', Icon: Users, color: 'text-pink-500', ring: 'border-pink-500/30 bg-pink-500/5' },
  business: { label: 'Business', Icon: Briefcase, color: 'text-blue-500', ring: 'border-blue-500/30 bg-blue-500/5' },
  mind: { label: 'Minte', Icon: Brain, color: 'text-amber-500', ring: 'border-amber-500/30 bg-amber-500/5' },
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export function EveningReflectionStep({
  doneWell,
  learned,
  notDone,
  onChange,
  onComplete,
  onNext,
}: Props) {
  const { snapshot, isLoading } = useTodayActivity();
  const { user } = useAuth();

  const groupedByAxis = useMemo(() => {
    const groups: Record<ActivityAxis, typeof snapshot['items']> = {
      body: [], being: [], balance: [], business: [], mind: [],
    } as any;
    (snapshot?.items ?? []).forEach((it) => groups[it.axis].push(it));
    return groups;
  }, [snapshot]);

  const canFinish = (doneWell?.trim().length ?? 0) > 0;

  const handleFinish = async () => {
    onComplete(true);
    // Persist today's snapshot for Shadow Coach history
    if (user?.id && snapshot) {
      try {
        await upsertTodayShadowSnapshot({
          userId: user.id,
          countsByAxis: snapshot.countsByAxis,
          totalCount: snapshot.totalCount,
          topEvents: snapshot.items.slice(0, 25).map(it => ({
            axis: it.axis, label: it.title, source: it.source, occurredAt: it.occurredAt,
          })),
          reflection: { done_well: doneWell, learned, not_done: notDone },
        });
      } catch (e) { /* silent */ }
    }
    setTimeout(onNext, 400);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent">
        <CardContent className="p-5 flex items-start gap-3">
          <Moon className="w-7 h-7 text-indigo-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-lg">Reflecție de seară</h3>
            <p className="text-sm text-muted-foreground">
              Privește înapoi la ziua ta. Iată ce ai făcut, adunat din rutină, sarcini, stack-uri, teste și cursuri.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today activity feed grouped by axis */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Ce am făcut azi
            </h4>
            <span className="text-xs text-muted-foreground">
              {isLoading ? 'Se încarcă…' : `${snapshot?.totalCount ?? 0} acțiuni`}
            </span>
          </div>

          {!isLoading && snapshot && snapshot.totalCount === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nicio acțiune înregistrată azi încă. Fiecare pas contează — mâine e o zi nouă.
            </p>
          )}

          {!isLoading && snapshot && snapshot.totalCount > 0 && (
            <>
              {/* Axis counters */}
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(AXIS_META) as ActivityAxis[]).map((axis) => {
                  const { Icon, label, color, ring } = AXIS_META[axis];
                  const count = snapshot.countsByAxis[axis];
                  return (
                    <div
                      key={axis}
                      className={cn(
                        'rounded-lg border p-2 text-center transition-opacity',
                        ring,
                        count === 0 && 'opacity-40'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
                      <div className="text-lg font-semibold leading-none">{count}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline per axis */}
              <div className="space-y-3">
                {(Object.keys(AXIS_META) as ActivityAxis[]).map((axis) => {
                  const list = groupedByAxis[axis];
                  if (!list || list.length === 0) return null;
                  const { Icon, label, color } = AXIS_META[axis];
                  return (
                    <div key={axis} className="space-y-1.5">
                      <div className={cn('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide', color)}>
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </div>
                      <ul className="space-y-1 pl-5">
                        {list.slice(0, 8).map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center gap-2 text-sm text-foreground/90"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            <span className="flex-1 truncate">{it.title}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(it.occurredAt)}
                            </span>
                          </li>
                        ))}
                        {list.length > 8 && (
                          <li className="text-[11px] text-muted-foreground pl-5">
                            +{list.length - 8} mai multe
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reflection questions */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold">Reflecție</h4>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">
              Ce a mers cel mai bine azi? <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={doneWell ?? ''}
              onChange={(e) => onChange('evening_reflection_done_well', e.target.value)}
              placeholder="Un moment, o victorie, o alegere bună…"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">Ce am învățat?</label>
            <Textarea
              value={learned ?? ''}
              onChange={(e) => onChange('evening_reflection_learned', e.target.value)}
              placeholder="O lecție, o observație, un pattern…"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/90">Ce nu am făcut și vreau mâine?</label>
            <Textarea
              value={notDone ?? ''}
              onChange={(e) => onChange('evening_reflection_not_done', e.target.value)}
              placeholder="Ce las în urmă și duc mai departe…"
              rows={2}
            />
          </div>

          <Button
            onClick={handleFinish}
            disabled={!canFinish}
            className="w-full"
          >
            Închide ziua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {!canFinish && (
            <p className="text-xs text-muted-foreground text-center">
              Scrie măcar un cuvânt la „Ce a mers cel mai bine azi”.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
