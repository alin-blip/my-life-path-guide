import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, BookOpen, History, Inbox, Grid3x3, Eye, AlertTriangle } from 'lucide-react';
import { MindShiftingStep } from '@/components/champion-routine/steps/MindShiftingStep';
import { MindShiftInboxTab } from '@/components/mind-shifting/MindShiftInboxTab';
import { MindShiftMatrixTab } from '@/components/mind-shifting/MindShiftMatrixTab';
import { MindShiftPerceptieTab } from '@/components/mind-shifting/MindShiftPerceptieTab';
import { MindShiftJournalTab } from '@/components/mind-shifting/MindShiftJournalTab';
import {
  mindShiftService,
  MindShiftBelief,
  MindShiftDistortion,
  MindShiftSession,
} from '@/services/mindShiftService';

export default function MindShifting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [beliefs, setBeliefs] = useState<MindShiftBelief[]>([]);
  const [distortions, setDistortions] = useState<MindShiftDistortion[]>([]);
  const [sessions, setSessions] = useState<MindShiftSession[]>([]);
  const [drafts, setDrafts] = useState<MindShiftSession[]>([]);
  const [patterns, setPatterns] = useState<Array<{ category: string; count: number; lastDate: string }>>([]);
  const [activeSession, setActiveSession] = useState<MindShiftSession | null>(null);
  const [loading, setLoading] = useState(true);

  const tab = searchParams.get('tab') ?? 'today';
  const sessionParam = searchParams.get('session');

  const setTab = (next: string) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('tab', next);
    if (next !== 'today') sp.delete('session');
    setSearchParams(sp, { replace: true });
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [b, d, allSessions, draftRows, pat] = await Promise.all([
        mindShiftService.loadBeliefs(),
        mindShiftService.loadDistortions(),
        mindShiftService.listSessions({ limit: 200, status: 'all' }),
        mindShiftService.listDrafts(),
        mindShiftService.detectPatterns(),
      ]);
      setBeliefs(b);
      setDistortions(d);
      setSessions(allSessions);
      setDrafts(draftRows);
      setPatterns(pat);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Resume session from ?session=...
  useEffect(() => {
    if (!sessionParam) {
      setActiveSession(null);
      return;
    }
    (async () => {
      const s = await mindShiftService.getSessionById(sessionParam);
      if (s) {
        setActiveSession(s);
        setTab('today');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionParam]);

  const handleResume = (s: MindShiftSession) => {
    if (!s.id) return;
    const sp = new URLSearchParams(searchParams);
    sp.set('session', s.id);
    sp.set('tab', 'today');
    setSearchParams(sp, { replace: true });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Brain className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Mind Shifting</h1>
          <Badge variant="secondary">O.N.R.A.C.</Badge>
        </div>
        <p className="text-muted-foreground">
          Observe → Name → Reframe → Activate → Commit. Reprogramează-ți mintea în 5–7 minute pe zi.
        </p>

        {/* Pattern warning */}
        {patterns.length > 0 && (
          <Card className="border-orange-500/40 bg-orange-500/5 mt-3">
            <CardContent className="p-3 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1">Pattern recurent detectat</p>
                <p className="text-muted-foreground">
                  Ai marcat ca <strong>zilnic</strong> gânduri din categoria{' '}
                  {patterns.map((p, i) => (
                    <span key={p.category}>
                      <strong>{p.category}</strong> ({p.count}x){i < patterns.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  . Probabil e o credință limitativă centrală — hai s-o demontăm.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="today" className="gap-1"><Sparkles className="h-4 w-4" /> Azi</TabsTrigger>
          <TabsTrigger value="inbox" className="gap-1">
            <Inbox className="h-4 w-4" /> Inbox
            {drafts.length > 0 && (
              <Badge className="ml-1 h-4 px-1.5 text-[10px]">{drafts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-1"><History className="h-4 w-4" /> Jurnal</TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1"><Grid3x3 className="h-4 w-4" /> Matrice</TabsTrigger>
          <TabsTrigger value="perceptie" className="gap-1"><Eye className="h-4 w-4" /> Percepție</TabsTrigger>
          <TabsTrigger value="library" className="gap-1"><BookOpen className="h-4 w-4" /> Bibliotecă</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {activeSession && (
            <Card className="mb-3 bg-muted/30 border-dashed">
              <CardContent className="p-3 flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  Continui draft: <strong>„{activeSession.automatic_thought || activeSession.title}"</strong>
                </span>
                <Button size="sm" variant="ghost" onClick={() => {
                  const sp = new URLSearchParams(searchParams);
                  sp.delete('session');
                  setSearchParams(sp, { replace: true });
                  setActiveSession(null);
                }}>
                  Renunță
                </Button>
              </CardContent>
            </Card>
          )}
          <MindShiftingStep
            key={activeSession?.id ?? 'new'}
            existingSession={activeSession ?? undefined}
            onComplete={() => {
              const sp = new URLSearchParams(searchParams);
              sp.delete('session');
              setSearchParams(sp, { replace: true });
              setActiveSession(null);
              refresh();
            }}
          />
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          {loading ? <p className="text-muted-foreground text-sm">Se încarcă…</p> : (
            <MindShiftInboxTab drafts={drafts} onResume={handleResume} onRefresh={refresh} />
          )}
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          {loading ? <p className="text-muted-foreground text-sm">Se încarcă…</p> : (
            <MindShiftJournalTab sessions={sessions} beliefs={beliefs} />
          )}
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          {loading ? <p className="text-muted-foreground text-sm">Se încarcă…</p> : (
            <MindShiftMatrixTab sessions={sessions} />
          )}
        </TabsContent>

        <TabsContent value="perceptie" className="mt-6">
          {loading ? <p className="text-muted-foreground text-sm">Se încarcă…</p> : (
            <MindShiftPerceptieTab sessions={sessions} />
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <Tabs defaultValue="beliefs">
            <TabsList>
              <TabsTrigger value="beliefs">Credințe ({beliefs.length})</TabsTrigger>
              <TabsTrigger value="distortions">Distorsiuni ({distortions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="beliefs" className="grid sm:grid-cols-2 gap-3 mt-4">
              {beliefs.map((b) => (
                <Card key={b.id}>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="text-sm">{b.short_description}</p>
                    {b.incantation && (
                      <p className="italic text-primary text-sm">„{b.incantation}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="distortions" className="grid sm:grid-cols-2 gap-3 mt-4">
              {distortions.map((d) => (
                <Card key={d.id}>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{d.name}</h3>
                    <p className="text-sm">{d.short_description}</p>
                    {d.example && <p className="text-muted-foreground text-sm">Ex: {d.example}</p>}
                    {d.reframe_template && (
                      <p className="text-primary text-sm">→ {d.reframe_template}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
