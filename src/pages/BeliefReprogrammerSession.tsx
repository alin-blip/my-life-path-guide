import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2, Check, ArrowRight, Sparkles, MessageCircle, Heart, Scissors, Pencil } from 'lucide-react';
import { reprogrammerService, ReprogrammerSession, Phase } from '@/services/reprogrammerService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ChatMsg { role: 'user' | 'assistant'; content: string }

const PHASES: { key: Exclude<Phase, 'completed'>; label: string; icon: any; tone: string }[] = [
  { key: 'audit', label: 'Audit', icon: MessageCircle, tone: 'text-fuchsia-500' },
  { key: 'decupling', label: 'Decuplare', icon: Scissors, tone: 'text-amber-500' },
  { key: 'forgiveness', label: 'Iertare', icon: Heart, tone: 'text-rose-500' },
  { key: 'rewriting', label: 'Rescriere', icon: Pencil, tone: 'text-emerald-500' },
];

export default function BeliefReprogrammerSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ReprogrammerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    reprogrammerService.getSession(sessionId)
      .then(setSession)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Sesiunea nu există.</div>;

  const phaseIdx = PHASES.findIndex((p) => p.key === session.current_phase);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-5">
        <Button variant="ghost" size="sm" onClick={() => navigate('/minte/credinte-fundamentale/reprogrammer')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Sesiunile mele
        </Button>

        {/* Stepper */}
        <Card className="p-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {PHASES.map((p, i) => {
              const Icon = p.icon;
              const isActive = i === phaseIdx || session.current_phase === 'completed';
              const isDone = (session.current_phase === 'completed') || i < phaseIdx;
              return (
                <div key={p.key} className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive || isDone ? '' : 'text-muted-foreground'}`}>{i + 1}. {p.label}</span>
                  {i < PHASES.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </Card>

        {session.current_phase === 'audit' && (
          <AuditPhase session={session} onComplete={(s) => setSession(s)} />
        )}
        {session.current_phase === 'decupling' && (
          <DecuplingPhase session={session} onComplete={(s) => setSession(s)} />
        )}
        {session.current_phase === 'forgiveness' && (
          <ForgivenessPhase session={session} onComplete={(s) => setSession(s)} />
        )}
        {session.current_phase === 'rewriting' && (
          <RewritingPhase session={session} onComplete={(s) => setSession(s)} />
        )}
        {session.current_phase === 'completed' && (
          <CompletedView session={session} />
        )}
      </div>
    </div>
  );
}

/* ---------- AUDIT (chat) ---------- */
function AuditPhase({ session, onComplete }: { session: ReprogrammerSession; onComplete: (s: ReprogrammerSession) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Spune-mi în 1-2 fraze: ce credință despre tine sau despre lume te blochează acum în business sau în viață?' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reprogrammerService.getArtifact(session.id, 'audit').then((a) => {
      if (a?.payload?.messages) setMessages(a.payload.messages);
    });
  }, [session.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    const newMsgs: ChatMsg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    try {
      const res = await reprogrammerService.callAI('audit_chat', { messages: newMsgs });
      const finalMsgs: ChatMsg[] = [...newMsgs, { role: 'assistant', content: res.assistant || 'OK.' }];
      setMessages(finalMsgs);
      await reprogrammerService.saveArtifact(session.id, 'audit', { messages: finalMsgs, completion: res.completion });
      if (res.completion?.root_belief) {
        await reprogrammerService.updateSession(session.id, {
          current_phase: 'decupling',
          root_belief: res.completion.root_belief,
          source_event: res.completion.source_event,
          source_age_range: res.completion.source_age_range,
          source_who: res.completion.source_who,
          axis: res.completion.axis,
          title: session.title || res.completion.root_belief.slice(0, 60),
        });
        const updated = await reprogrammerService.getSession(session.id);
        if (updated) onComplete(updated);
      }
    } catch (e: any) {
      toast.error(e.message || 'Eroare AI');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <header>
        <Badge variant="outline" className="mb-2 text-fuchsia-600 border-fuchsia-500/40">Faza 1 — Audit Istoric</Badge>
        <h2 className="font-display text-xl font-semibold">Scanarea Copilăriei</h2>
        <p className="text-sm text-muted-foreground mt-1">AI Coach-ul te ghidează să descoperi DE UNDE vine credința distructivă. Răspunde scurt și onest.</p>
      </header>

      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="bg-muted p-3 rounded-2xl text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Alin scrie...</div></div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrie aici..."
          rows={2}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
        />
        <Button onClick={send} disabled={busy || !input.trim()} className="self-end">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ---------- DECUPLARE (form) ---------- */
function DecuplingPhase({ session, onComplete }: { session: ReprogrammerSession; onComplete: (s: ReprogrammerSession) => void }) {
  const [present, setPresent] = useState('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    reprogrammerService.getArtifact(session.id, 'decupling').then((a) => {
      if (a?.payload) { setPresent(a.payload.present_situation || ''); setResult(a.payload.result); }
    });
  }, [session.id]);

  const analyze = async () => {
    if (!present.trim()) return;
    setBusy(true);
    try {
      const r = await reprogrammerService.callAI('decupling_analysis', {
        payload: {
          root_belief: session.root_belief,
          source_event: session.source_event,
          source_age_range: session.source_age_range,
          source_who: session.source_who,
          present_situation: present,
        },
      });
      setResult(r);
      await reprogrammerService.saveArtifact(session.id, 'decupling', { present_situation: present, result: r });
    } catch (e: any) {
      toast.error(e.message || 'Eroare AI');
    } finally {
      setBusy(false);
    }
  };

  const advance = async () => {
    await reprogrammerService.updateSession(session.id, { current_phase: 'forgiveness' });
    const updated = await reprogrammerService.getSession(session.id);
    if (updated) onComplete(updated);
  };

  return (
    <Card className="p-5 space-y-4">
      <header>
        <Badge variant="outline" className="mb-2 text-amber-600 border-amber-500/40">Faza 2 — Decuplare</Badge>
        <h2 className="font-display text-xl font-semibold">Separarea Trecutului de Prezent</h2>
        <p className="text-sm text-muted-foreground mt-1">Credința rădăcină: <em>„{session.root_belief}"</em></p>
      </header>

      <div className="space-y-2">
        <Label>O situație din ULTIMA SĂPTĂMÂNĂ în care a fost activată această credință</Label>
        <Textarea value={present} onChange={(e) => setPresent(e.target.value)} rows={4} placeholder="Ex: La ședința cu echipa, când X mi-a spus Y, am simțit Z și am reacționat..." />
        <Button onClick={analyze} disabled={busy || !present.trim()} className="gap-2">
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Analizează cu AI
        </Button>
      </div>

      {result && (
        <div className="space-y-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Match trecut ↔ prezent</span>
            <Badge variant="destructive">{result.pattern_match_score}/100</Badge>
          </div>
          {result.distortion_named && <p className="text-sm"><span className="font-semibold">Distorsiune:</span> {result.distortion_named}</p>}
          {result.trecut_vs_prezent && <p className="text-sm">{result.trecut_vs_prezent}</p>}
          {result.current_reality_facts && (
            <ul className="text-sm list-disc ml-5 space-y-1">
              {result.current_reality_facts.map((f: string, i: number) => <li key={i}>{f}</li>)}
            </ul>
          )}
          {result.evidence_reframe && (
            <p className="text-sm font-medium p-3 bg-background rounded border-l-2 border-amber-500">{result.evidence_reframe}</p>
          )}
          <Button onClick={advance} className="w-full gap-2">Mergi la Iertare <ArrowRight className="w-4 h-4" /></Button>
        </div>
      )}
    </Card>
  );
}

/* ---------- IERTARE (chat) ---------- */
function ForgivenessPhase({ session, onComplete }: { session: ReprogrammerSession; onComplete: (s: ReprogrammerSession) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: `Acum mergem la iertare. Începem cu tine: copilul de ${session.source_age_range || 'atunci'} a reacționat cum a știut. Spune-mi — pentru ce anume vrei să te ierți tu pe tine, ca adult care privește înapoi?` },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reprogrammerService.getArtifact(session.id, 'forgiveness').then((a) => {
      if (a?.payload?.messages) setMessages(a.payload.messages);
    });
  }, [session.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    const newMsgs: ChatMsg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    try {
      const res = await reprogrammerService.callAI('forgiveness_chat', { messages: newMsgs });
      const finalMsgs: ChatMsg[] = [...newMsgs, { role: 'assistant', content: res.assistant || 'OK.' }];
      setMessages(finalMsgs);
      await reprogrammerService.saveArtifact(session.id, 'forgiveness', { messages: finalMsgs, completion: res.completion });
      if (res.completion?.release_declaration) {
        await reprogrammerService.updateSession(session.id, { current_phase: 'rewriting' });
        const updated = await reprogrammerService.getSession(session.id);
        if (updated) onComplete(updated);
      }
    } catch (e: any) {
      toast.error(e.message || 'Eroare AI');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <header>
        <Badge variant="outline" className="mb-2 text-rose-600 border-rose-500/40">Faza 3 — Iertare</Badge>
        <h2 className="font-display text-xl font-semibold">Tăierea Rădăcinii</h2>
      </header>

      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="bg-muted p-3 rounded-2xl text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Alin scrie...</div></div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Scrie aici..." rows={2} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} />
        <Button onClick={send} disabled={busy || !input.trim()} className="self-end"><Send className="w-4 h-4" /></Button>
      </div>
    </Card>
  );
}

/* ---------- RESCRIERE (form + AI generate + commit) ---------- */
function RewritingPhase({ session, onComplete }: { session: ReprogrammerSession; onComplete: (s: ReprogrammerSession) => void }) {
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [newBelief, setNewBelief] = useState('');
  const [mantraMorning, setMantraMorning] = useState('');
  const [mantraEvening, setMantraEvening] = useState('');
  const [weeklyTask, setWeeklyTask] = useState('');
  const [askMantras, setAskMantras] = useState(false);
  const [installMantras, setInstallMantras] = useState(true);

  useEffect(() => {
    reprogrammerService.getArtifact(session.id, 'rewriting').then((a) => {
      if (a?.payload?.result) {
        applyResult(a.payload.result);
      }
    });
  }, [session.id]);

  const applyResult = (r: any) => {
    setResult(r);
    setNewBelief(r.new_belief || '');
    setMantraMorning(r.mantra_morning || '');
    setMantraEvening(r.mantra_evening || '');
    setWeeklyTask(r.weekly_observable_task || '');
  };

  const generate = async () => {
    setBusy(true);
    try {
      const [audit, decup, forg] = await Promise.all([
        reprogrammerService.getArtifact(session.id, 'audit'),
        reprogrammerService.getArtifact(session.id, 'decupling'),
        reprogrammerService.getArtifact(session.id, 'forgiveness'),
      ]);
      const r = await reprogrammerService.callAI('rewriting_generate', {
        payload: {
          root_belief: session.root_belief,
          source_event: session.source_event,
          source_age_range: session.source_age_range,
          source_who: session.source_who,
          axis: session.axis,
          decupling: decup?.payload?.result,
          forgiveness: forg?.payload?.completion,
          audit_summary: audit?.payload?.completion,
        },
      });
      applyResult(r);
      await reprogrammerService.saveArtifact(session.id, 'rewriting', { result: r });
    } catch (e: any) {
      toast.error(e.message || 'Eroare AI');
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!newBelief.trim()) {
      toast.error('Scrie credința nouă înainte de a salva');
      return;
    }
    setBusy(true);
    try {
      const entry = await reprogrammerService.createLibraryEntry({
        session_id: session.id,
        old_belief: session.root_belief || '',
        new_belief: newBelief,
        source_event: session.source_event,
        source_age_range: session.source_age_range,
        axis: session.axis,
        mantra_morning: mantraMorning || null,
        mantra_evening: mantraEvening || null,
        weekly_task: weeklyTask || null,
      });
      if (installMantras) {
        await reprogrammerService.createMantras(entry.id, mantraMorning, mantraEvening);
      }
      await reprogrammerService.updateSession(session.id, {
        current_phase: 'completed',
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      toast.success('Credința rescrisă a fost adăugată în Bibliotecă!');
      const updated = await reprogrammerService.getSession(session.id);
      if (updated) onComplete(updated);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <header>
        <Badge variant="outline" className="mb-2 text-emerald-600 border-emerald-500/40">Faza 4 — Rescriere</Badge>
        <h2 className="font-display text-xl font-semibold">Noul Cod Sursă</h2>
        <p className="text-sm text-muted-foreground mt-1">AI generează propunerea — tu o editezi cu cuvintele tale înainte de a o instala.</p>
      </header>

      {!result && (
        <Button onClick={generate} disabled={busy} size="lg" className="w-full gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generează noua credință + mantrele
        </Button>
      )}

      {result && (
        <div className="space-y-4">
          <div>
            <Label>Credința nouă (la persoana 1, prezentativă)</Label>
            <Textarea value={newBelief} onChange={(e) => setNewBelief(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Mantra de dimineață</Label>
              <Input value={mantraMorning} onChange={(e) => setMantraMorning(e.target.value)} />
            </div>
            <div>
              <Label>Mantra de seară</Label>
              <Input value={mantraEvening} onChange={(e) => setMantraEvening(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Task observabil pentru săptămâna asta</Label>
            <Textarea value={weeklyTask} onChange={(e) => setWeeklyTask(e.target.value)} rows={2} />
          </div>

          {!askMantras ? (
            <Button variant="outline" onClick={() => setAskMantras(true)} className="w-full">
              Continuă către instalare →
            </Button>
          ) : (
            <Card className="p-4 bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <p className="text-sm font-medium">Vrei să injectez mantrele automat în Warrior Routine (Power Declaration)?</p>
              <p className="text-xs text-muted-foreground">Le vei vedea/asculta zilnic timp de 66 de zile, până devin un circuit neuronal automat.</p>
              <div className="flex gap-2">
                <Button variant={installMantras ? 'default' : 'outline'} size="sm" onClick={() => setInstallMantras(true)}>Da, instalează-le</Button>
                <Button variant={!installMantras ? 'default' : 'outline'} size="sm" onClick={() => setInstallMantras(false)}>Nu acum</Button>
              </div>
              <Button onClick={commit} disabled={busy} size="lg" className="w-full gap-2">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvează în Bibliotecă și finalizează
              </Button>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}

function CompletedView({ session }: { session: ReprogrammerSession }) {
  const navigate = useNavigate();
  return (
    <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30">
      <Check className="w-12 h-12 text-emerald-500 mx-auto" />
      <h2 className="font-display text-2xl font-semibold">Sesiune completă</h2>
      <p className="text-muted-foreground">Credința rescrisă a fost adăugată în biblioteca ta. Acum începe instalarea — 66 de zile de repetiție.</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <Button onClick={() => navigate('/biblioteca-credintelor')}>Vezi Biblioteca</Button>
        <Button variant="outline" onClick={() => navigate('/minte/credinte-fundamentale/reprogrammer')}>Sesiunile mele</Button>
      </div>
    </Card>
  );
}
