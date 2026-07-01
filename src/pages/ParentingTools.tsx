import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, Heart, Minus, Plus, Sparkles, Wrench, Zap, MessageCircle, Flame, CheckCircle2, Info,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { parentingToolsService, type ParentingToolType, type DailyToolLog } from '@/services/parentingToolsService';

const T = {
  ro: {
    back: 'Înapoi',
    title: 'Tool-uri Zilnice Parentale',
    subtitle: 'Instrumente evidence-based pentru uzul zilnic. Salvezi automat. Fiecare instrument are un scop specific.',
    childScope: 'Pentru copil',
    general: 'General',
    saved: 'Salvat',
    streak: 'Serie',
    days: 'zile',
    tools: {
      ratio: '5:1 Interacțiuni',
      nobut: 'No-BUT Trainer',
      emotion: 'Emotion Coaching',
      repair: 'Repair Log',
      serve: 'Serve & Return',
    },
    ratio: {
      desc: 'Contorizează interacțiunile pozitive (validare, laudă, atenție caldă) vs. negative (critică, corecție, ridicare voce) cu copilul azi. Heuristică bazată pe cercetarea Gottman pentru relații — folosită ca ghidaj educațional, nu ca prag clinic pentru părinte-copil.',
      positives: 'Interacțiuni pozitive azi',
      negatives: 'Interacțiuni negative azi',
      ratio: 'Raport azi',
      target: 'Țintă (heuristic)',
      warning: 'Notă: raportul 5:1 e validat pentru cupluri (Gottman, 1994), NU e prag clinic în relația părinte-copil. Îl folosim ca reminder de balanță.',
    },
    nobut: {
      desc: 'După fiecare laudă, contra-mesajele („dar puteai și mai bine…") anulează efectul (Assor & Roth, 2004). Antrenează-te să tai „DAR".',
      input: 'Scrie o frază pe care ai spus-o azi (sau vrei să o spui)',
      analyze: 'Analizează',
      hasBut: 'Am detectat un „dar" / „bine, dar…"',
      clean: 'Fraza e curată — fără condiționare 👏',
      rewrite: 'Reformulare sugerată',
      todayCount: 'Fraze verificate azi',
    },
    emotion: {
      desc: 'Gottman (1997) — 5 pași pentru a coach-ui o emoție a copilului, în loc să o dismissi.',
      steps: [
        { t: '1. Observă emoția', d: 'Recunoaște emoția copilului chiar când e mică. Nu aștepta escaladarea.' },
        { t: '2. Vezi emoția ca oportunitate', d: 'Momentul de conectare = momentul emoției puternice, nu al momentelor calme.' },
        { t: '3. Ascultă empatic', d: 'Validează fără să corectezi: „văd că ești furios / trist / dezamăgit".' },
        { t: '4. Ajută-l să numească', d: 'Oferă cuvântul emoției. („Se numește frustrare — când vrei ceva și nu poți încă.")' },
        { t: '5. Rezolvă problema împreună', d: 'Setează limita, apoi găsiți soluția DUPĂ ce emoția a fost validată — nu în timpul ei.' },
      ],
      checked: 'Pași bifați azi',
      done: 'Salvează ziua',
    },
    repair: {
      desc: 'Tronick (1989) — rupture & repair. NU rupturile sunt problema; lipsa reparării E problema. Loghezi rupturile ca să nu le uiți nereparate.',
      what: 'Ce s-a întâmplat?',
      whatPh: 'Ex: am țipat când a vărsat sucul.',
      said: 'Ce ai spus (sau făcut) exact?',
      saidPh: 'Ex: „Cât ești de neatent! Ți-am spus de 100 de ori."',
      action: 'Cum vei repara (astăzi/mâine)?',
      actionPh: 'Ex: „îmi cer scuze că am țipat. Nu tu ai fost problema — eu am fost obosit."',
      save: 'Loghează reparația',
      history: 'Reparații recente',
      empty: 'Încă nicio ruptură logată. Bine — sau poate ai uitat să scrii?',
    },
    serve: {
      desc: 'Harvard Center on the Developing Child — „serve & return": copilul „servește" (privire, sunet, gest, întrebare), tu „returnezi" cu atenție validată. Fundament pentru arhitectura creierului 0-5 ani, dar valabil la orice vârstă.',
      count: 'Serve & Return azi',
      add: '+1 return',
      note: 'Notează 1 moment concret (opțional)',
      notePh: 'Ex: m-a întrebat de ce plouă, i-am răspuns și l-am întrebat ce crede el.',
    },
  },
  en: {
    back: 'Back',
    title: 'Daily Parenting Tools',
    subtitle: 'Evidence-based instruments for daily use. Auto-saved. Each tool has one specific job.',
    childScope: 'For child',
    general: 'General',
    saved: 'Saved',
    streak: 'Streak',
    days: 'days',
    tools: {
      ratio: '5:1 Interactions',
      nobut: 'No-BUT Trainer',
      emotion: 'Emotion Coaching',
      repair: 'Repair Log',
      serve: 'Serve & Return',
    },
    ratio: {
      desc: 'Count positive interactions (validation, praise, warm attention) vs. negative (criticism, correction, raised voice) with your child today. Heuristic based on Gottman research for couples — used as educational guidance, not a clinical parent-child threshold.',
      positives: 'Positive interactions today',
      negatives: 'Negative interactions today',
      ratio: 'Today\'s ratio',
      target: 'Target (heuristic)',
      warning: 'Note: 5:1 ratio is validated for couples (Gottman, 1994), NOT a clinical threshold for parent-child. We use it as a balance reminder.',
    },
    nobut: {
      desc: 'After every praise, counter-messages ("but you could\'ve done better…") cancel the effect (Assor & Roth, 2004). Train yourself to cut the "BUT."',
      input: 'Write something you said (or want to say) today',
      analyze: 'Analyze',
      hasBut: 'I detected a "but" / "well, but…"',
      clean: 'Clean phrase — no conditioning 👏',
      rewrite: 'Suggested rewrite',
      todayCount: 'Phrases checked today',
    },
    emotion: {
      desc: 'Gottman (1997) — 5 steps to coach a child\'s emotion instead of dismissing it.',
      steps: [
        { t: '1. Notice the emotion', d: 'Recognize the emotion when it\'s still small. Don\'t wait for escalation.' },
        { t: '2. See it as opportunity', d: 'Connection moment = moment of strong emotion, not of calm.' },
        { t: '3. Listen empathically', d: 'Validate without correcting: "I see you\'re angry / sad / disappointed."' },
        { t: '4. Help them name it', d: 'Offer the word. ("It\'s called frustration — when you want something and can\'t yet.")' },
        { t: '5. Problem-solve together', d: 'Set the limit, THEN find a solution AFTER the emotion is validated — not during.' },
      ],
      checked: 'Steps checked today',
      done: 'Save today',
    },
    repair: {
      desc: 'Tronick (1989) — rupture & repair. Ruptures aren\'t the problem; UNREPAIRED ruptures are. Log them so you don\'t forget.',
      what: 'What happened?',
      whatPh: 'Ex: I yelled when he spilled the juice.',
      said: 'What exactly did you say (or do)?',
      saidPh: 'Ex: "How careless! I\'ve told you 100 times."',
      action: 'How will you repair (today/tomorrow)?',
      actionPh: 'Ex: "I apologize for yelling. You weren\'t the problem — I was tired."',
      save: 'Log the repair',
      history: 'Recent repairs',
      empty: 'No ruptures logged yet. Good — or maybe you forgot to write?',
    },
    serve: {
      desc: 'Harvard Center on the Developing Child — "serve & return": child serves (look, sound, gesture, question), you return with validated attention. Foundation for brain architecture 0-5, valid at any age.',
      count: 'Serve & Return today',
      add: '+1 return',
      note: 'Note one concrete moment (optional)',
      notePh: 'Ex: asked why it rains, I answered and asked what he thinks.',
    },
  },
};

const ParentingTools: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { children } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang: 'ro' | 'en' = profile?.preferred_language || 'ro';
  const t = T[lang];

  const [userId, setUserId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {t.back}
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" /> {t.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Child scope selector */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{t.childScope}:</span>
            <Button
              size="sm"
              variant={childId === null ? 'default' : 'outline'}
              onClick={() => setChildId(null)}
            >
              {t.general}
            </Button>
            {children.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={childId === c.id ? 'default' : 'outline'}
                onClick={() => setChildId(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </div>
        )}

        {!userId ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Loading…</CardContent></Card>
        ) : (
          <Tabs defaultValue="ratio" className="space-y-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto">
              <TabsTrigger value="ratio" className="text-xs"><Heart className="w-3.5 h-3.5 mr-1" />{t.tools.ratio}</TabsTrigger>
              <TabsTrigger value="nobut" className="text-xs"><Zap className="w-3.5 h-3.5 mr-1" />{t.tools.nobut}</TabsTrigger>
              <TabsTrigger value="emotion" className="text-xs"><MessageCircle className="w-3.5 h-3.5 mr-1" />{t.tools.emotion}</TabsTrigger>
              <TabsTrigger value="repair" className="text-xs"><Wrench className="w-3.5 h-3.5 mr-1" />{t.tools.repair}</TabsTrigger>
              <TabsTrigger value="serve" className="text-xs"><Sparkles className="w-3.5 h-3.5 mr-1" />{t.tools.serve}</TabsTrigger>
            </TabsList>

            <TabsContent value="ratio"><RatioTool userId={userId} childId={childId} lang={lang} toast={toast} /></TabsContent>
            <TabsContent value="nobut"><NoButTool userId={userId} childId={childId} lang={lang} toast={toast} /></TabsContent>
            <TabsContent value="emotion"><EmotionCoachingTool userId={userId} childId={childId} lang={lang} toast={toast} /></TabsContent>
            <TabsContent value="repair"><RepairLogTool userId={userId} childId={childId} lang={lang} toast={toast} /></TabsContent>
            <TabsContent value="serve"><ServeReturnTool userId={userId} childId={childId} lang={lang} toast={toast} /></TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

// ================= 5:1 Ratio =================
const RatioTool: React.FC<{ userId: string; childId: string | null; lang: 'ro' | 'en'; toast: any }> = ({ userId, childId, lang, toast }) => {
  const t = T[lang].ratio;
  const [pos, setPos] = useState(0);
  const [neg, setNeg] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    parentingToolsService.getToday(userId, 'ratio_5to1', childId).then((r) => {
      setPos(r?.positives_count || 0);
      setNeg(r?.negatives_count || 0);
    });
    parentingToolsService.getStreak(userId, 'ratio_5to1', childId).then(setStreak);
  }, [userId, childId]);

  const save = async (p: number, n: number) => {
    await parentingToolsService.upsertToday({
      user_id: userId, child_id: childId, tool_type: 'ratio_5to1',
      positives_count: p, negatives_count: n,
    });
  };

  const ratio = neg === 0 ? (pos > 0 ? '∞' : '0') : (pos / neg).toFixed(1);
  const ratioNum = neg === 0 ? (pos > 0 ? 10 : 0) : pos / neg;
  const pct = Math.min(100, (ratioNum / 5) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> {T[lang].tools.ratio}</CardTitle>
            <CardDescription className="mt-1">{t.desc}</CardDescription>
          </div>
          {streak > 0 && <Badge variant="secondary"><Flame className="w-3 h-3 mr-1" />{streak} {T[lang].days}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="text-xs">{t.warning}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4 space-y-3 bg-green-50 dark:bg-green-950/20">
            <div className="text-xs font-medium text-green-800 dark:text-green-300">{t.positives}</div>
            <div className="text-4xl font-bold text-green-700 dark:text-green-400 text-center">{pos}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { const v = Math.max(0, pos - 1); setPos(v); save(v, neg); }}><Minus className="w-3 h-3" /></Button>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { const v = pos + 1; setPos(v); save(v, neg); }}><Plus className="w-3 h-3" /></Button>
            </div>
          </div>
          <div className="rounded-xl border p-4 space-y-3 bg-red-50 dark:bg-red-950/20">
            <div className="text-xs font-medium text-red-800 dark:text-red-300">{t.negatives}</div>
            <div className="text-4xl font-bold text-red-700 dark:text-red-400 text-center">{neg}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { const v = Math.max(0, neg - 1); setNeg(v); save(pos, v); }}><Minus className="w-3 h-3" /></Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => { const v = neg + 1; setNeg(v); save(pos, v); }}><Plus className="w-3 h-3" /></Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4 text-center space-y-2">
          <div className="text-xs text-muted-foreground">{t.ratio}</div>
          <div className="text-3xl font-bold">{ratio} : 1</div>
          <Progress value={pct} className="h-2" />
          <div className="text-xs text-muted-foreground">{t.target}: 5 : 1</div>
        </div>
      </CardContent>
    </Card>
  );
};

// ================= No-BUT Trainer =================
const NoButTool: React.FC<{ userId: string; childId: string | null; lang: 'ro' | 'en'; toast: any }> = ({ userId, childId, lang, toast }) => {
  const t = T[lang].nobut;
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ hasBut: boolean; rewrite: string } | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    parentingToolsService.getToday(userId, 'no_but', childId).then((r) => setCount((r?.metadata as any)?.checked_count || 0));
  }, [userId, childId]);

  const analyze = () => {
    const text = input.trim();
    if (!text) return;
    const butRegex = lang === 'en' ? /\b(but|although|however)\b/i : /\b(dar|însă|totuși)\b/i;
    const hasBut = butRegex.test(text);
    const rewrite = hasBut
      ? text.replace(butRegex, '.').replace(/\.\s*\./g, '.').trim()
      : text;
    setResult({ hasBut, rewrite });
    const newCount = count + 1;
    setCount(newCount);
    parentingToolsService.upsertToday({
      user_id: userId, child_id: childId, tool_type: 'no_but',
      metadata: { checked_count: newCount, last_input: text, had_but: hasBut },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> {T[lang].tools.nobut}</CardTitle>
        <CardDescription className="mt-1">{t.desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">{t.input}</Label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} />
          <div className="flex items-center justify-between">
            <Badge variant="outline">{t.todayCount}: {count}</Badge>
            <Button size="sm" onClick={analyze} disabled={!input.trim()}>{t.analyze}</Button>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg border p-4 space-y-2 ${result.hasBut ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-green-50 dark:bg-green-950/20 border-green-200'}`}>
            <div className="text-sm font-semibold flex items-center gap-2">
              {result.hasBut ? <><Zap className="w-4 h-4 text-red-600" /> {t.hasBut}</> : <><CheckCircle2 className="w-4 h-4 text-green-600" /> {t.clean}</>}
            </div>
            {result.hasBut && (
              <>
                <div className="text-xs text-muted-foreground">{t.rewrite}:</div>
                <div className="text-sm font-medium">„{result.rewrite}"</div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ================= Emotion Coaching (5 pași) =================
const EmotionCoachingTool: React.FC<{ userId: string; childId: string | null; lang: 'ro' | 'en'; toast: any }> = ({ userId, childId, lang, toast }) => {
  const t = T[lang].emotion;
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false, false]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    parentingToolsService.getToday(userId, 'emotion_coaching', childId).then((r) => {
      const md = (r?.metadata as any)?.steps as boolean[] | undefined;
      if (md && md.length === 5) setChecked(md);
    });
    parentingToolsService.getStreak(userId, 'emotion_coaching', childId).then(setStreak);
  }, [userId, childId]);

  const toggle = (i: number) => {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
    parentingToolsService.upsertToday({
      user_id: userId, child_id: childId, tool_type: 'emotion_coaching',
      positives_count: next.filter(Boolean).length,
      metadata: { steps: next },
    });
  };

  const done = checked.filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" /> {T[lang].tools.emotion}</CardTitle>
            <CardDescription className="mt-1">{t.desc}</CardDescription>
          </div>
          {streak > 0 && <Badge variant="secondary"><Flame className="w-3 h-3 mr-1" />{streak} {T[lang].days}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">{t.checked}: {done}/5</div>
        <Progress value={(done / 5) * 100} className="h-2" />
        <div className="space-y-2">
          {t.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${checked[i] ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${checked[i] ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                  {checked[i] && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{s.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground pt-2 border-t">Gottman, J. (1997). Raising An Emotionally Intelligent Child.</div>
      </CardContent>
    </Card>
  );
};

// ================= Repair Log =================
const RepairLogTool: React.FC<{ userId: string; childId: string | null; lang: 'ro' | 'en'; toast: any }> = ({ userId, childId, lang, toast }) => {
  const t = T[lang].repair;
  const [what, setWhat] = useState('');
  const [said, setSaid] = useState('');
  const [action, setAction] = useState('');
  const [history, setHistory] = useState<DailyToolLog[]>([]);
  const [saving, setSaving] = useState(false);

  const loadHistory = () => {
    parentingToolsService.listRecent(userId, 'repair_log', childId, 10).then(setHistory);
  };
  useEffect(loadHistory, [userId, childId]);

  const save = async () => {
    if (!what.trim() || !action.trim()) {
      toast({ title: lang === 'en' ? 'Fill "what" and "how to repair"' : 'Completează „ce" și „cum repari"', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await parentingToolsService.addRepair({
        user_id: userId, child_id: childId,
        what_happened: what.trim(),
        what_you_said: said.trim(),
        repair_action: action.trim(),
      });
      setWhat(''); setSaid(''); setAction('');
      loadHistory();
      toast({ title: lang === 'en' ? 'Repair logged' : 'Reparație logată' });
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Wrench className="w-5 h-5 text-primary" /> {T[lang].tools.repair}</CardTitle>
        <CardDescription className="mt-1">{t.desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">{t.what}</Label>
          <Textarea value={what} onChange={(e) => setWhat(e.target.value)} placeholder={t.whatPh} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t.said}</Label>
          <Textarea value={said} onChange={(e) => setSaid(e.target.value)} placeholder={t.saidPh} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t.action}</Label>
          <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder={t.actionPh} rows={2} />
        </div>
        <Button onClick={save} disabled={saving} className="w-full">{t.save}</Button>

        <div className="pt-2 border-t space-y-2">
          <div className="text-xs font-semibold">{t.history}</div>
          {history.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">{t.empty}</div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="rounded-lg border p-3 text-xs space-y-1">
                  <div className="text-[10px] text-muted-foreground">{h.log_date}</div>
                  <div><span className="font-semibold">📌 </span>{h.content}</div>
                  {(h.metadata as any)?.repair_action && (
                    <div className="text-green-700 dark:text-green-400"><span className="font-semibold">🔧 </span>{(h.metadata as any).repair_action}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground">Tronick, E. (1989). Emotions and emotional communication in infants. American Psychologist.</div>
      </CardContent>
    </Card>
  );
};

// ================= Serve & Return =================
const ServeReturnTool: React.FC<{ userId: string; childId: string | null; lang: 'ro' | 'en'; toast: any }> = ({ userId, childId, lang, toast }) => {
  const t = T[lang].serve;
  const [count, setCount] = useState(0);
  const [note, setNote] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    parentingToolsService.getToday(userId, 'serve_return', childId).then((r) => {
      setCount(r?.positives_count || 0);
      setNote(r?.content || '');
    });
    parentingToolsService.getStreak(userId, 'serve_return', childId).then(setStreak);
  }, [userId, childId]);

  const save = async (c: number, n: string) => {
    await parentingToolsService.upsertToday({
      user_id: userId, child_id: childId, tool_type: 'serve_return',
      positives_count: c, content: n,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> {T[lang].tools.serve}</CardTitle>
            <CardDescription className="mt-1">{t.desc}</CardDescription>
          </div>
          {streak > 0 && <Badge variant="secondary"><Flame className="w-3 h-3 mr-1" />{streak} {T[lang].days}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-6 text-center space-y-3 bg-primary/5">
          <div className="text-xs text-muted-foreground">{t.count}</div>
          <div className="text-5xl font-bold text-primary">{count}</div>
          <Button size="lg" onClick={() => { const v = count + 1; setCount(v); save(v, note); }}>
            <Plus className="w-4 h-4 mr-1" /> {t.add}
          </Button>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">{t.note}</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => save(count, note)} placeholder={t.notePh} rows={2} />
        </div>
        <div className="text-[10px] text-muted-foreground">Harvard University Center on the Developing Child — "Serve and Return" framework.</div>
      </CardContent>
    </Card>
  );
};

export default ParentingTools;
