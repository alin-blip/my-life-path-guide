import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Wrench, Sparkles, Trophy, Heart, Frown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { parentingService } from '@/services/parentingService';

type EventType = 'rupture' | 'repair' | 'breakthrough' | 'milestone' | 'concern' | 'gratitude';

const TYPE_META: Record<EventType, { ro: string; en: string; icon: React.ElementType; color: string }> = {
  rupture:      { ro: 'Ruptură',      en: 'Rupture',      icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
  repair:       { ro: 'Reparație',    en: 'Repair',       icon: Wrench,        color: 'text-green-700 bg-green-50 dark:bg-green-950/30' },
  breakthrough: { ro: 'Breakthrough', en: 'Breakthrough', icon: Sparkles,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  milestone:    { ro: 'Reper',        en: 'Milestone',    icon: Trophy,        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  concern:      { ro: 'Îngrijorare',  en: 'Concern',      icon: Frown,         color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
  gratitude:    { ro: 'Recunoștință', en: 'Gratitude',    icon: Heart,         color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
};

const ParentingTimeline: React.FC = () => {
  const { childId: routeChildId } = useParams<{ childId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang: 'ro' | 'en' = profile?.preferred_language || 'ro';

  const [userId, setUserId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(routeChildId || null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ type: EventType; title: string; description: string; intensity: number }>({
    type: 'rupture', title: '', description: '', intensity: 5,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await parentingService.listTimelineEvents(userId, childId);
      setEvents(list);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId, childId]);

  const filtered = useMemo(
    () => filter === 'all' ? events : events.filter((e) => e.event_type === filter),
    [events, filter],
  );

  const save = async () => {
    if (!userId) return;
    if (!form.title.trim()) {
      toast({ title: lang === 'en' ? 'Title required' : 'Titlul e obligatoriu', variant: 'destructive' });
      return;
    }
    try {
      await parentingService.addTimelineEvent(userId, {
        child_id: childId,
        event_type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        emotional_intensity: form.intensity,
      });
      setOpen(false);
      setForm({ type: 'rupture', title: '', description: '', intensity: 5 });
      load();
      toast({ title: lang === 'en' ? 'Event logged' : 'Eveniment logat' });
    } catch (e) {
      toast({ title: (e as Error).message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Delete this event?' : 'Ștergi acest eveniment?')) return;
    await parentingService.deleteTimelineEvent(id);
    load();
  };

  const currentChild = children.find((c) => c.id === childId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>
        </div>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              {lang === 'en' ? 'Parenting Timeline' : 'Timeline Parenting'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === 'en'
                ? 'Log ruptures, repairs, breakthroughs, milestones. Tronick: unrepaired ruptures accumulate — logging keeps you honest.'
                : 'Loghezi rupturile, reparările, breakthrough-urile, reperele. Tronick: rupturile nereparate se acumulează — jurnalul te ține onest.'}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" />{lang === 'en' ? 'New event' : 'Eveniment nou'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{lang === 'en' ? 'New timeline event' : 'Eveniment nou timeline'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Type' : 'Tip'}</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as EventType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_META) as EventType[]).map((k) => (
                        <SelectItem key={k} value={k}>{TYPE_META[k][lang]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Title' : 'Titlu'}</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={lang === 'en' ? 'Short summary' : 'Rezumat scurt'} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Details (optional)' : 'Detalii (opțional)'}</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'en' ? 'Emotional intensity (1-10)' : 'Intensitate emoțională (1-10)'}: {form.intensity}</Label>
                  <input
                    type="range" min={1} max={10} value={form.intensity}
                    onChange={(e) => setForm((f) => ({ ...f, intensity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{lang === 'en' ? 'Cancel' : 'Anulează'}</Button>
                <Button onClick={save}>{lang === 'en' ? 'Save' : 'Salvează'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Child scope */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{lang === 'en' ? 'For:' : 'Pentru:'}</span>
            <Button size="sm" variant={childId === null ? 'default' : 'outline'} onClick={() => setChildId(null)}>
              {lang === 'en' ? 'All' : 'Toți'}
            </Button>
            {children.map((c) => (
              <Button key={c.id} size="sm" variant={childId === c.id ? 'default' : 'outline'} onClick={() => setChildId(c.id)}>
                {c.name}
              </Button>
            ))}
          </div>
        )}

        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>
            {lang === 'en' ? 'All' : 'Toate'} ({events.length})
          </Button>
          {(Object.keys(TYPE_META) as EventType[]).map((k) => {
            const count = events.filter((e) => e.event_type === k).length;
            if (count === 0) return null;
            const Icon = TYPE_META[k].icon;
            return (
              <Button key={k} size="sm" variant={filter === k ? 'secondary' : 'ghost'} onClick={() => setFilter(k)}>
                <Icon className="w-3 h-3 mr-1" />{TYPE_META[k][lang]} ({count})
              </Button>
            );
          })}
        </div>

        {/* Events list */}
        {loading ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                {lang === 'en' ? 'No events yet. Log your first — even a small rupture.' : 'Niciun eveniment încă. Loghează-l pe primul — chiar și o ruptură mică.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => {
              const meta = TYPE_META[e.event_type as EventType];
              const Icon = meta.icon;
              const child = children.find((c) => c.id === e.child_id);
              return (
                <Card key={e.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">{meta[lang]}</Badge>
                              {child && <Badge variant="secondary" className="text-[10px]">{child.name}</Badge>}
                              {e.emotional_intensity && (
                                <Badge variant="outline" className="text-[10px]">🔥 {e.emotional_intensity}/10</Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(e.event_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="font-semibold text-sm mt-1">{e.title}</div>
                            {e.description && (
                              <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{e.description}</div>
                            )}
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="shrink-0 h-7 w-7">
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentingTimeline;
