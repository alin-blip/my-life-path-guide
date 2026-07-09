import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Dna, Plus, Library, Sparkles, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { reprogrammerService, ReprogrammerSession } from '@/services/reprogrammerService';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';
import { TierLockOverlay } from '@/components/access/TierLockOverlay';

const PHASE_LABEL: Record<string, string> = {
  audit: '1. Audit Istoric',
  decupling: '2. Decuplare',
  forgiveness: '3. Iertare',
  rewriting: '4. Rescriere',
  completed: 'Finalizat',
};

export default function BeliefReprogrammerHub() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ReprogrammerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    reprogrammerService.listSessions()
      .then(setSessions)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const startNew = async () => {
    setCreating(true);
    try {
      const s = await reprogrammerService.createSession();
      navigate(`/minte/credinte-fundamentale/reprogrammer/${s.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Belief Reprogrammer — Protocolul Rădăcinii | CEO Mind OS</title>
        <meta name="description" content="Identifică și rescrie credințele distructive instalate în copilărie. Audit → Decuplare → Iertare → Rescriere." />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/minte/credinte-fundamentale')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Credințe Fundamentale
        </Button>

        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center">
              <Dna className="w-6 h-6 text-fuchsia-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Belief Reprogrammer</h1>
              <p className="text-sm text-muted-foreground">Protocolul Rădăcinii — rescrie codul sursă instalat în copilărie.</p>
            </div>
          </div>

          <Card className="p-5 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent border-fuchsia-500/20">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">70% din percepția ta de azi e inventată.</span> Antreprenorul ia decizii de milioane bazat pe programe instalate la 5 ani. Acest tool merge la <em>cauză</em>, nu la efect: identifică credința distructivă, o decuplează de prezent, iertați rădăcina, instalezi noul cod.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              {(['audit', 'decupling', 'forgiveness', 'rewriting'] as const).map((p, i) => (
                <div key={p} className="flex items-center gap-2 p-2 rounded bg-background/60">
                  <span className="w-5 h-5 rounded-full bg-fuchsia-500/20 text-fuchsia-600 flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="font-medium">{PHASE_LABEL[p].split('. ')[1]}</span>
                </div>
              ))}
            </div>
          </Card>
        </header>

        <TierLockOverlay
          requiredTier="basic"
          featureName="Belief Reprogrammer — Protocolul Rădăcinii"
          teaser="Protocolul 4-fazic (Audit → Decuplare → Iertare → Rescriere) rescrie credințele instalate în copilărie. Disponibil în Basic."
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={startNew} disabled={creating} className="gap-2">
                <Plus className="w-4 h-4" /> {creating ? 'Se inițializează...' : 'Începe o sesiune nouă'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/biblioteca-credintelor')} className="gap-2">
                <Library className="w-4 h-4" /> Biblioteca mea de credințe
              </Button>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Sesiuni anterioare</h2>
              {loading ? (
                <Card className="p-5 text-sm text-muted-foreground">Se încarcă...</Card>
              ) : sessions.length === 0 ? (
                <Card className="p-8 text-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Nicio sesiune încă. Începe prima — durează ~30-45 min, dar o poți relua oricând.</p>
                  <Button onClick={startNew} disabled={creating}>Începe primul Reprogramming</Button>
                </Card>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <Card key={s.id} className="p-4 hover:border-fuchsia-500/40 cursor-pointer transition-colors" onClick={() => navigate(`/minte/credinte-fundamentale/reprogrammer/${s.id}`)}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold truncate">{s.title || s.root_belief || 'Sesiune nouă'}</h4>
                            <Badge variant={s.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                              {PHASE_LABEL[s.current_phase]}
                            </Badge>
                            {s.axis && <Badge variant="outline" className="text-[10px]">Axa {s.axis}</Badge>}
                          </div>
                          {s.root_belief && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">„{s.root_belief}"</p>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true, locale: ro })}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </TierLockOverlay>
      </div>
    </div>
  );
}
