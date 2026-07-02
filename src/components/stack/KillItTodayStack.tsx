import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Send,
  Loader2,
  User as UserIcon,
  Flame,
  Target,
  Anchor,
  Heart,
  Dumbbell,
  CheckCircle2,
  Info,
  ListPlus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { killItTodayService, type KillItTodaySession } from '@/services/killItTodayService';
import { doorUserTasksService } from '@/services/doorUserTasksService';
import { getActiveWeekKey } from '@/utils/weekUtils';

interface Msg { role: 'user' | 'assistant'; content: string }

interface Props {
  onAddToHitList?: (text: string) => Promise<void> | void;
}

const PHASES = [
  { id: 'mentalitate', label: 'Mentalitate', Icon: Flame },
  { id: 'business', label: 'Win & Sarcini', Icon: Target },
  { id: 'ancora', label: 'Ancoră', Icon: Anchor },
  { id: 'spiritual', label: 'Familie', Icon: Heart },
  { id: 'corp', label: 'Corp', Icon: Dumbbell },
];

const STARTERS = [
  'Azi vreau să domin. Am nevoie să mă concentrez pe ce contează.',
  'Simt energie bună. Ajută-mă să canalizez asta în rezultate.',
  'Vreau să închei ziua cu sentimentul că am făcut ce trebuia.',
  'Setează-mă în putere. Sunt gata să lucrez.',
];

export const KillItTodayStack: React.FC<Props> = ({ onAddToHitList }) => {
  const [session, setSession] = useState<KillItTodaySession | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const s = await killItTodayService.ensureTodaySession();
      if (s) {
        setSession(s);
        if (Array.isArray(s.messages) && s.messages.length) {
          setMessages(s.messages as Msg[]);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending || !session) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('kill-it-today-coach', {
        body: { messages: next, session_id: session.id, language: 'ro' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply: Msg = { role: 'assistant', content: data.message || '…' };
      const updated = [...next, reply];
      setMessages(updated);
      await killItTodayService.saveMessages(session.id, updated as any);
      // Refresh session for state updates from server
      const fresh = await killItTodayService.getTodaySession();
      if (fresh) setSession(fresh);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Coach indisponibil');
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const saveTasksToHotList = async () => {
    if (!session?.tasks_snapshot?.length) return;
    try {
      const weekKey = getActiveWeekKey();
      for (const t of session.tasks_snapshot) {
        if (onAddToHitList) {
          await onAddToHitList(t);
        } else {
          await doorUserTasksService.addIdeaToWeek(weekKey, {
            id: `kill-it-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: t,
            category: 'hot',
            priority: 'urgent-important' as any,
          });
        }
      }
      window.dispatchEvent(new CustomEvent('doorDataUpdated', { detail: { type: 'ideaAdded' } }));
      toast.success(`${session.tasks_snapshot.length} sarcini adăugate în Hot List`);
    } catch (e: any) {
      toast.error('Nu am putut salva sarcinile');
    }
  };

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === session?.current_phase);
  const activePhaseIdx = currentPhaseIdx === -1 ? 0 : currentPhaseIdx;
  const isComplete = session?.current_phase === 'complete';

  useEffect(() => {
    if (isComplete) {
      try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`kill_it_today_done_${today}`, '1');
      } catch {}
    }
  }, [isComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4 flex flex-col min-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold leading-tight">Kill It Today</h1>
            <p className="text-xs text-muted-foreground">Setează-te în putere. Domină ziua.</p>
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-emerald-500">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Complet
            </Badge>
          )}
        </div>

        {/* Phase progress */}
        <div className="flex items-center gap-1 pt-1">
          {PHASES.map((p, i) => {
            const active = i === activePhaseIdx && !isComplete;
            const done = i < activePhaseIdx || isComplete;
            return (
              <React.Fragment key={p.id}>
                <div
                  className={`flex flex-col items-center gap-1 flex-1 transition-opacity ${
                    active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      done ? 'bg-emerald-500 text-white' :
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p.Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{p.label}</span>
                </div>
                {i < PHASES.length - 1 && (
                  <div className={`h-0.5 flex-1 mt-[-14px] ${i < activePhaseIdx || isComplete ? 'bg-emerald-500' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Live state card */}
      {session && (session.win_of_day || session.anchor_phrase || session.tasks_snapshot?.length || session.power_phrase) && (
        <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <CardContent className="p-4 space-y-2 text-sm">
            {session.win_of_day && (
              <div><span className="text-xs text-muted-foreground">Win azi: </span><span className="font-medium">{session.win_of_day}</span></div>
            )}
            {session.tasks_snapshot?.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Top sarcini:</span>
                  <Button size="sm" variant="outline" onClick={saveTasksToHotList} className="h-7 text-xs">
                    <ListPlus className="w-3 h-3 mr-1" /> Adaugă în Hot List
                  </Button>
                </div>
                <ul className="list-decimal list-inside space-y-0.5">
                  {session.tasks_snapshot.map((t, i) => (
                    <li key={i} className="text-sm">{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {session.anchor_phrase && (
              <div><span className="text-xs text-muted-foreground">Ancoră: </span><span className="italic">„{session.anchor_phrase}"</span></div>
            )}
            {session.spiritual_anchor && (
              <div><span className="text-xs text-muted-foreground">Familie: </span>{session.spiritual_anchor}</div>
            )}
            {session.workout_plan && (
              <div><span className="text-xs text-muted-foreground">Corp: </span>{session.workout_plan}</div>
            )}
            {session.power_phrase && (
              <div className="pt-2 mt-2 border-t border-orange-500/20">
                <div className="text-xs text-muted-foreground mb-1">Fraza ta de putere azi:</div>
                <div className="text-base font-bold text-orange-600 dark:text-orange-400">„{session.power_phrase}"</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription className="text-xs">
                  Recomandat când te simți echilibrat și vrei să produci. Dacă ai frustrări sau blocaje, alege întâi Reconstrucție Mentală.
                </AlertDescription>
              </Alert>
              <div className="text-xs text-muted-foreground">Începe cu:</div>
              <div className="grid gap-2">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-left rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
              }`}>
                {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Răspunde… (Enter pentru trimitere)"
          rows={2}
          className="resize-none"
        />
        <Button onClick={() => send()} disabled={sending || !input.trim()} size="lg" className="self-end">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default KillItTodayStack;
