import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, HandHeart, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MentalitateStackFlow } from '@/components/mentalitate/MentalitateStackFlow';
import { DeepDiveSelector } from '@/components/mentalitate/DeepDiveSelector';
import { SessionHistory } from '@/components/mentalitate/SessionHistory';

export default function MentalitateStack() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('daily');
  const [deepDiveAxis, setDeepDiveAxis] = useState<string | undefined>();
  const [flowKey, setFlowKey] = useState(0); // reset trigger

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Reconstrucția Mentală — Mentalitate Stack | CEO Mind OS</title>
        <meta
          name="description"
          content="Blueprint Mental în 5 faze, 14 întrebări. Metodă de reconstrucție psiho-mentală integrată în rutina ta zilnică."
        />
      </Helmet>

      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/minte')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Minte
          </Button>
        </div>

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/15 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reconstrucția Mentală</h1>
              <p className="text-sm text-muted-foreground">
                Blueprint Mental în 5 faze. Repara centrul de comandă, accelerează rezultatele.
              </p>
            </div>
          </div>
        </header>

        {/* Forgiveness Protocol — Credința Iertării */}
        <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <HandHeart className="h-4 w-4 text-amber-600" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Forgiveness Protocol</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">Resentimentul ascuns blochează reconstrucția.</span> Dacă mintea revine la aceeași persoană sau eveniment, instalează iertarea cu un act observabil săptămâna asta.
              </p>
            </div>
            <Button size="sm" variant="default" className="gap-2 shrink-0" onClick={() => navigate('/credinte/forgiveness')}>
              Deschide protocolul <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setDeepDiveAxis(undefined); setFlowKey((k) => k + 1); }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="daily">Zilnic</TabsTrigger>
            <TabsTrigger value="deep">Deep-Dive</TabsTrigger>
            <TabsTrigger value="history">Istoric</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <MentalitateStackFlow
              key={`daily-${flowKey}`}
              mode="daily"
              source="stack_page"
              onComplete={() => setFlowKey((k) => k + 1)}
            />
          </TabsContent>

          <TabsContent value="deep" className="mt-4 space-y-4">
            {deepDiveAxis ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setDeepDiveAxis(undefined)}>
                  <ArrowLeft className="w-3 h-3 mr-1" /> Schimbă axa
                </Button>
                <MentalitateStackFlow
                  key={`deep-${deepDiveAxis}-${flowKey}`}
                  mode="deep_dive"
                  deepDiveAxis={deepDiveAxis}
                  source="stack_page_deep"
                  onComplete={() => { setDeepDiveAxis(undefined); setFlowKey((k) => k + 1); }}
                />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Alege axa pe care vrei să o explorezi în profunzime. Axele cu scor mic sunt afișate primele.
                </p>
                <DeepDiveSelector onSelect={(a) => setDeepDiveAxis(a)} />
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <SessionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
