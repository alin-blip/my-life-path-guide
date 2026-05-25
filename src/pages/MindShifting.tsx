import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, BookOpen, History } from 'lucide-react';
import { MindShiftingStep } from '@/components/champion-routine/steps/MindShiftingStep';
import {
  mindShiftService,
  MindShiftBelief,
  MindShiftDistortion,
  MindShiftSession,
} from '@/services/mindShiftService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function MindShifting() {
  const [beliefs, setBeliefs] = useState<MindShiftBelief[]>([]);
  const [distortions, setDistortions] = useState<MindShiftDistortion[]>([]);
  const [sessions, setSessions] = useState<MindShiftSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [b, d, s] = await Promise.all([
        mindShiftService.loadBeliefs(),
        mindShiftService.loadDistortions(),
        mindShiftService.listSessions(50),
      ]);
      setBeliefs(b);
      setDistortions(d);
      setSessions(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Mind Shifting</h1>
          <Badge variant="secondary">O.N.R.A.C.</Badge>
        </div>
        <p className="text-muted-foreground">
          Observe → Name → Reframe → Activate → Commit. Reprogramează-ți mintea în 5–7 minute pe zi.
        </p>
      </header>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="today" className="gap-1"><Sparkles className="h-4 w-4" /> Azi</TabsTrigger>
          <TabsTrigger value="journal" className="gap-1"><History className="h-4 w-4" /> Jurnal</TabsTrigger>
          <TabsTrigger value="beliefs" className="gap-1"><BookOpen className="h-4 w-4" /> Credințe</TabsTrigger>
          <TabsTrigger value="distortions" className="gap-1"><Brain className="h-4 w-4" /> Distorsiuni</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <MindShiftingStep onComplete={() => refresh()} />
        </TabsContent>

        <TabsContent value="journal" className="mt-6 space-y-3">
          {loading && <p className="text-muted-foreground">Se încarcă…</p>}
          {!loading && sessions.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">
              Nicio sesiune încă. Începe prima ta sesiune din tabul „Azi".
            </CardContent></Card>
          )}
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{s.date && format(new Date(s.date), 'EEEE, d MMMM yyyy', { locale: ro })}</span>
                  {s.emotion && <Badge variant="outline">{s.emotion} · {s.intensity}/10</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {s.automatic_thought && (
                  <div><span className="text-muted-foreground">Gând: </span>{s.automatic_thought}</div>
                )}
                {s.cognitive_reframe && (
                  <div><span className="text-muted-foreground">Reframe: </span>{s.cognitive_reframe}</div>
                )}
                {s.belief_slug && (
                  <div><span className="text-muted-foreground">Credința zilei: </span>{beliefs.find(b => b.slug === s.belief_slug)?.name ?? s.belief_slug}</div>
                )}
                {s.commitment_text && (
                  <div className="rounded-md bg-primary/5 border border-primary/20 p-2">
                    🎯 {s.commitment_text}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="beliefs" className="mt-6 grid sm:grid-cols-2 gap-3">
          {beliefs.map((b) => (
            <Card key={b.id}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{b.name}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>{b.short_description}</p>
                {b.incantation && (
                  <p className="italic text-primary">„{b.incantation}"</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="distortions" className="mt-6 grid sm:grid-cols-2 gap-3">
          {distortions.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{d.name}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>{d.short_description}</p>
                {d.example && <p className="text-muted-foreground">Ex: {d.example}</p>}
                {d.reframe_template && (
                  <p className="text-primary">→ {d.reframe_template}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
