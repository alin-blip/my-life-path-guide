import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, MessageCircle, Send, Loader2, Sprout, MessageSquareHeart, HelpCircle, CalendarDays, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { MarriageSession, marriageService } from '@/services/marriageService';
import { useStackTodoIntegration } from '@/hooks/useStackTodoIntegration';

export const TriggerRootCard: React.FC<{ session: MarriageSession }> = ({ session }) => {
  const tr = session.trigger_root;
  if (!tr) return null;
  return (
    <Card className="p-5 bg-card border-l-4 border-l-primary/60">
      <div className="flex items-center gap-2 mb-3">
        <Sprout className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold">Rădăcina trigger-ului</h3>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Rana din trecut</div>
          <p>{tr.past_wound}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Trigger-ul curent</div>
          <p>{tr.current_trigger}</p>
        </div>
        <div className="pt-3 border-t border-border">
          <div className="text-xs uppercase tracking-wide text-primary mb-1">Reframe cognitiv</div>
          <p className="italic">„{tr.cognitive_reframe}"</p>
        </div>
      </div>
    </Card>
  );
};

export const RepairScriptCard: React.FC<{ session: MarriageSession }> = ({ session }) => {
  const items = session.repair_script || [];
  const [copied, setCopied] = useState<number | null>(null);
  if (!items.length) return null;

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    toast.success('Copiat');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareHeart className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold">Script reparatorie</h3>
        <Badge variant="outline" className="text-xs">Ce să spui partenerului</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Fraze concrete, non-defensive. Alege una și folosește-o în următoarele 24h.</p>
      <div className="space-y-2">
        {items.map((line, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-md bg-muted/40 border border-border">
            <p className="flex-1 text-sm italic">„{line}"</p>
            <Button variant="ghost" size="sm" onClick={() => copy(line, i)} className="shrink-0 h-8 px-2">
              {copied === i ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ExplorationQuestionsCard: React.FC<{ session: MarriageSession }> = ({ session }) => {
  const items = session.exploration_questions || [];
  if (!items.length) return null;
  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold">Întrebări de explorare profundă</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Răspunde-le în jurnal sau adresează-le partenerului — descoperă nevoia reală.</p>
      <ol className="space-y-2">
        {items.map((q, i) => (
          <li key={i} className="flex items-start gap-3 p-3 rounded-md border border-border">
            <span className="text-primary font-mono text-sm mt-0.5">{i + 1}.</span>
            <div className="flex-1">
              <p className="text-sm">{q.question}</p>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {q.for === 'partner' ? 'Pentru partener' : 'Pentru tine'}
              </Badge>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export const SevenDayPlanCard: React.FC<{ session: MarriageSession }> = ({ session }) => {
  const items = session.seven_day_plan || [];
  const { captureIdea } = useStackTodoIntegration({});
  if (!items.length) return null;

  const dayCodes: any[] = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

  const exportToHit = () => {
    items.forEach((step, idx) => {
      const day = dayCodes[idx % 7];
      captureIdea(`[Marriage] Ziua ${step.day}: ${step.action}`, 'do', 'important', day);
    });
    toast.success('Plan 7 zile exportat în DO List');
  };

  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Plan 7 zile de de-escaladare</h3>
        </div>
        <Button size="sm" variant="outline" onClick={exportToHit} className="gap-2">
          <ListTodo className="h-4 w-4" /> Exportă în DO List
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((step) => (
          <div key={step.day} className="flex gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-sm">
              {step.day}
            </div>
            <div className="flex-1 pb-3 border-b border-border last:border-b-0">
              <p className="text-sm font-medium">{step.action}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.intention}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const FollowupChat: React.FC<{ session: MarriageSession }> = ({ session }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    marriageService.listFollowupMessages(session.id).then((msgs) => {
      setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
    }).catch(() => {});
  }, [open, session.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const reply = await marriageService.sendFollowup(session.id, text);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      toast.error('Eroare: ' + (e.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Card className="p-5 bg-card border-dashed border-2 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display font-semibold">Continuă cu AI Coach</h3>
            <p className="text-sm text-muted-foreground">Aprofundează nevoia reală, lucrează pe trigger, primește micro-pași.</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>Deschide conversația</Button>
      </Card>
    );
  }

  return (
    <Card className="bg-card flex flex-col" style={{ minHeight: 400 }}>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">AI Coach — follow-up</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Închide</Button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 480 }}>
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Începe de oriunde: ce simți acum despre situație? Ce întrebare îți rămâne?
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Scriu...
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Scrie-i lui Alin..."
          className="min-h-[48px] resize-none"
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
