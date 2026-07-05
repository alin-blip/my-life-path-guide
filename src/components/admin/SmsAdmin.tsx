import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Send, MessageSquare } from 'lucide-react';

type Sequence = {
  id: string; key: string; name: string; description: string | null;
  sequence_type: string; trigger_event: string | null; is_active: boolean;
  requires_consent_type: string; language: string;
};
type Step = {
  id: string; sequence_id: string; step_order: number; day_number: number;
  delay_hours: number; message_ro: string; message_en: string | null; is_active: boolean;
};
type LogRow = {
  id: string; phone_e164: string; message_body: string; status: string;
  error_message: string | null; sent_at: string | null; created_at: string;
};

export const SmsAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [steps, setSteps] = useState<Record<string, Step[]>>({});
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [settings, setSettings] = useState<{ from_number: string; messaging_service_sid: string; daily_send_cap: number }>({
    from_number: '', messaging_service_sid: '', daily_send_cap: 5000,
  });
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, opted_in: 0 });

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastLang, setBroadcastLang] = useState<'ro' | 'en' | ''>('');
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [seqRes, logRes, setRes, statRes, prefRes] = await Promise.all([
      supabase.from('sms_sequences').select('*').order('name'),
      supabase.from('sms_send_log').select('id, phone_e164, message_body, status, error_message, sent_at, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('sms_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('sms_send_log').select('status'),
      supabase.from('user_sms_preferences').select('sms_consent', { count: 'exact', head: true }).eq('sms_consent', true),
    ]);
    setSequences(seqRes.data ?? []);
    setLogs(logRes.data ?? []);
    if (setRes.data) setSettings({
      from_number: setRes.data.from_number ?? '',
      messaging_service_sid: setRes.data.messaging_service_sid ?? '',
      daily_send_cap: setRes.data.daily_send_cap ?? 5000,
    });
    const total = statRes.data?.length ?? 0;
    setStats({
      total,
      sent: statRes.data?.filter(r => ['sent', 'delivered'].includes(r.status)).length ?? 0,
      failed: statRes.data?.filter(r => ['failed', 'undelivered'].includes(r.status)).length ?? 0,
      opted_in: prefRes.count ?? 0,
    });

    // Load steps for each
    const stepMap: Record<string, Step[]> = {};
    for (const s of seqRes.data ?? []) {
      const { data } = await supabase.from('sms_sequence_steps').select('*').eq('sequence_id', s.id).order('step_order');
      stepMap[s.id] = data ?? [];
    }
    setSteps(stepMap);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const saveSettings = async () => {
    const { error } = await supabase.from('sms_settings').update({
      from_number: settings.from_number || null,
      messaging_service_sid: settings.messaging_service_sid || null,
      daily_send_cap: settings.daily_send_cap,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    else toast({ title: 'Setări salvate' });
  };

  const toggleSequence = async (id: string, is_active: boolean) => {
    await supabase.from('sms_sequences').update({ is_active }).eq('id', id);
    loadAll();
  };

  const updateStep = async (step: Step) => {
    await supabase.from('sms_sequence_steps').update({
      day_number: step.day_number, delay_hours: step.delay_hours,
      message_ro: step.message_ro, message_en: step.message_en, is_active: step.is_active,
    }).eq('id', step.id);
    toast({ title: 'Pas actualizat' });
  };

  const addStep = async (sequenceId: string) => {
    const existing = steps[sequenceId] ?? [];
    const nextOrder = (existing[existing.length - 1]?.step_order ?? 0) + 1;
    const { error } = await supabase.from('sms_sequence_steps').insert({
      sequence_id: sequenceId, step_order: nextOrder, day_number: nextOrder,
      message_ro: 'Mesaj nou...', is_active: true,
    });
    if (error) toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    else loadAll();
  };

  const deleteStep = async (id: string) => {
    if (!confirm('Șterge pas?')) return;
    await supabase.from('sms_sequence_steps').delete().eq('id', id);
    loadAll();
  };

  const sendBroadcast = async (asTest = false) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('sms-broadcast', {
        body: {
          message: broadcastMsg,
          language: broadcastLang || undefined,
          test_phone: asTest ? testPhone : undefined,
        },
      });
      if (error) throw error;
      toast({ title: asTest ? 'Test trimis' : 'Broadcast trimis', description: JSON.stringify(data) });
      loadAll();
    } catch (e) {
      toast({ title: 'Eroare', description: (e as Error).message, variant: 'destructive' });
    } finally { setSending(false); }
  };

  const runProcessor = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('sms-process-sequences', { body: {} });
      if (error) throw error;
      toast({ title: 'Procesare rulată', description: JSON.stringify(data) });
      loadAll();
    } catch (e) {
      toast({ title: 'Eroare', description: (e as Error).message, variant: 'destructive' });
    } finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Trimise</div><div className="text-2xl font-bold">{stats.sent}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Eșuate</div><div className="text-2xl font-bold text-destructive">{stats.failed}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total loguri</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Opt-in useri</div><div className="text-2xl font-bold">{stats.opted_in}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="sequences">
        <TabsList>
          <TabsTrigger value="sequences">📩 Secvențe</TabsTrigger>
          <TabsTrigger value="broadcast">📣 Broadcast</TabsTrigger>
          <TabsTrigger value="logs">📜 Istoric trimiteri</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Setări Twilio</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={runProcessor} disabled={sending} variant="outline" size="sm">
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Rulează procesarea acum
            </Button>
          </div>
          {sequences.map(seq => (
            <Card key={seq.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {seq.name}
                      <Badge variant={seq.is_active ? 'default' : 'secondary'}>{seq.sequence_type}</Badge>
                    </CardTitle>
                    <CardDescription>{seq.description} · Trigger: <code>{seq.trigger_event ?? '—'}</code> · Consent: <code>{seq.requires_consent_type}</code></CardDescription>
                  </div>
                  <Switch checked={seq.is_active} onCheckedChange={(v) => toggleSequence(seq.id, v)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(steps[seq.id] ?? []).map(step => (
                  <div key={step.id} className="border rounded p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge>#{step.step_order}</Badge>
                      <Label className="text-xs">Ziua</Label>
                      <Input type="number" value={step.day_number} className="w-20" onChange={e => setSteps(s => ({ ...s, [seq.id]: s[seq.id].map(x => x.id === step.id ? { ...x, day_number: parseInt(e.target.value || '0') } : x) }))} />
                      <Label className="text-xs">+ore</Label>
                      <Input type="number" value={step.delay_hours} className="w-20" onChange={e => setSteps(s => ({ ...s, [seq.id]: s[seq.id].map(x => x.id === step.id ? { ...x, delay_hours: parseInt(e.target.value || '0') } : x) }))} />
                      <Switch checked={step.is_active} onCheckedChange={v => setSteps(s => ({ ...s, [seq.id]: s[seq.id].map(x => x.id === step.id ? { ...x, is_active: v } : x) }))} />
                      <div className="flex-1" />
                      <Button size="sm" variant="outline" onClick={() => updateStep(step)}>Salvează</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteStep(step.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <Textarea value={step.message_ro} rows={2} maxLength={480} onChange={e => setSteps(s => ({ ...s, [seq.id]: s[seq.id].map(x => x.id === step.id ? { ...x, message_ro: e.target.value } : x) }))} placeholder="Mesaj RO..." />
                    <Textarea value={step.message_en ?? ''} rows={2} maxLength={480} onChange={e => setSteps(s => ({ ...s, [seq.id]: s[seq.id].map(x => x.id === step.id ? { ...x, message_en: e.target.value } : x) }))} placeholder="Mesaj EN (opțional)..." />
                    <div className="text-xs text-muted-foreground">{step.message_ro.length}/480 caractere · include mereu STOP=off</div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addStep(seq.id)}><Plus className="w-4 h-4 mr-1" />Adaugă pas</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Trimite Broadcast</CardTitle>
              <CardDescription>Merge doar la useri cu <code>marketing_opt_in = true</code>. Testează întâi pe un număr propriu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea rows={4} maxLength={1600} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Mesaj (include STOP=off)..." />
              <div className="text-xs text-muted-foreground">{broadcastMsg.length}/1600</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Filtrare limbă</Label>
                  <Select value={broadcastLang} onValueChange={(v: any) => setBroadcastLang(v)}>
                    <SelectTrigger><SelectValue placeholder="Toate limbile" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toate</SelectItem>
                      <SelectItem value="ro">Română</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Test pe număr (E.164)</Label>
                  <Input placeholder="+40712345678" value={testPhone} onChange={e => setTestPhone(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={!broadcastMsg || !testPhone || sending} onClick={() => sendBroadcast(true)}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Trimite test
                </Button>
                <Button disabled={!broadcastMsg || sending} onClick={() => { if (confirm('Trimiți la toți userii opted-in?')) sendBroadcast(false); }}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2 max-h-[600px] overflow-auto">
                {logs.map(l => (
                  <div key={l.id} className="text-sm border-b py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={['sent', 'delivered'].includes(l.status) ? 'default' : l.status === 'pending' ? 'secondary' : 'destructive'}>{l.status}</Badge>
                      <code className="text-xs">{l.phone_e164}</code>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(l.created_at).toLocaleString('ro-RO')}</span>
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground truncate">{l.message_body}</div>
                    {l.error_message && <div className="text-xs text-destructive mt-1">⚠ {l.error_message}</div>}
                  </div>
                ))}
                {logs.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Niciun SMS trimis încă</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurație Twilio</CardTitle>
              <CardDescription>Setează numărul emitent Twilio (sau Messaging Service SID pentru sender pool).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Număr Twilio (E.164)</Label>
                <Input placeholder="+15017122661" value={settings.from_number} onChange={e => setSettings(s => ({ ...s, from_number: e.target.value }))} />
              </div>
              <div>
                <Label>Messaging Service SID (opțional, override)</Label>
                <Input placeholder="MGxxxxxxxxxxxxxx" value={settings.messaging_service_sid} onChange={e => setSettings(s => ({ ...s, messaging_service_sid: e.target.value }))} />
              </div>
              <div>
                <Label>Cap trimiteri / zi</Label>
                <Input type="number" value={settings.daily_send_cap} onChange={e => setSettings(s => ({ ...s, daily_send_cap: parseInt(e.target.value || '0') }))} />
              </div>
              <Button onClick={saveSettings}>Salvează setări</Button>
              <div className="text-xs text-muted-foreground pt-3 border-t space-y-1">
                <p><strong>Webhook inbound (STOP + status):</strong></p>
                <code className="block p-2 bg-muted rounded text-xs break-all">
                  {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sms-webhook`}
                </code>
                <p className="mt-2">Setează acest URL în Twilio Console → Phone Numbers → Messaging → "A message comes in" și "Status callback".</p>
                <p className="mt-2 text-amber-600">⚠ Activează SMS Pumping Protection & Geo Permissions în Twilio pentru siguranță.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
