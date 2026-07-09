import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Dna, Library, Volume2, VolumeX, Plus, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { reprogrammerService, LibraryEntry } from '@/services/reprogrammerService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TierLockOverlay } from '@/components/access/TierLockOverlay';

export default function BeliefLibrary() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => reprogrammerService.listLibrary().then(setEntries).catch((e) => toast.error(e.message)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggleMantras = async (entry: LibraryEntry, active: boolean) => {
    try {
      await (supabase as any).from('belief_mantras').update({ active }).eq('library_id', entry.id);
      toast.success(active ? 'Mantre reactivate' : 'Mantre puse pe pauză');
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (entry: LibraryEntry) => {
    if (!confirm('Ștergi această credință din bibliotecă? Mantrele asociate se șterg și ele.')) return;
    try {
      await (supabase as any).from('belief_reprogrammer_library').delete().eq('id', entry.id);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Biblioteca Credințelor Rescrise | CEO Mind OS</title>
      </Helmet>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-5">
        <Button variant="ghost" size="sm" onClick={() => navigate('/minte/credinte-fundamentale')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Credințe Fundamentale
        </Button>

        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center">
              <Library className="w-6 h-6 text-fuchsia-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Biblioteca mea de credințe</h1>
              <p className="text-sm text-muted-foreground">Credințele rescrise + progresul de instalare.</p>
            </div>
          </div>
          <Button onClick={() => navigate('/minte/credinte-fundamentale/reprogrammer')} className="gap-2">
            <Plus className="w-4 h-4" /> Rescrie o credință nouă
          </Button>
        </header>

        {loading ? (
          <Card className="p-5 text-sm text-muted-foreground">Se încarcă...</Card>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center">
            <Dna className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Nicio credință rescrisă încă. Începe prima sesiune de Reprogramming.</p>
            <Button onClick={() => navigate('/minte/credinte-fundamentale/reprogrammer')}>Începe acum</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => {
              const progress = Math.min(100, Math.round((e.times_repeated / Math.max(1, e.days_target)) * 100));
              return (
                <Card key={e.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap items-center gap-2">
                      {e.axis && <Badge variant="outline" className="text-[10px]">Axa {e.axis}</Badge>}
                      <Badge variant={e.installation_status === 'installed' ? 'default' : 'secondary'} className="text-[10px]">
                        {e.installation_status === 'installed' ? 'Instalată' : e.installation_status === 'active' ? 'În instalare' : 'Pauză'}
                      </Badge>
                      {e.source_age_range && <Badge variant="outline" className="text-[10px]">Vârstă sursă {e.source_age_range}</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(e)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-rose-500/5 border-l-2 border-rose-500/50">
                      <div className="text-[10px] uppercase tracking-wide text-rose-600 mb-1">Vechi cod sursă</div>
                      <p className="text-sm line-through opacity-70">{e.old_belief}</p>
                    </div>
                    <div className="p-3 rounded bg-emerald-500/5 border-l-2 border-emerald-500/50">
                      <div className="text-[10px] uppercase tracking-wide text-emerald-600 mb-1">Nou cod sursă</div>
                      <p className="text-sm font-medium">{e.new_belief}</p>
                    </div>
                  </div>

                  {(e.mantra_morning || e.mantra_evening) && (
                    <div className="space-y-1 text-sm">
                      {e.mantra_morning && <p>🌅 <em>„{e.mantra_morning}"</em></p>}
                      {e.mantra_evening && <p>🌙 <em>„{e.mantra_evening}"</em></p>}
                    </div>
                  )}

                  {e.weekly_task && (
                    <div className="p-2 rounded bg-amber-500/5 border-l-2 border-amber-500/50 text-sm">
                      <span className="font-medium">Task săptămânal:</span> {e.weekly_task}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Instalare neuronală</span>
                      <span>{e.times_repeated} / {e.days_target} repetiții</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleMantras(e, e.installation_status !== 'active')} className="gap-2">
                      {e.installation_status === 'active' ? <><VolumeX className="w-3 h-3" /> Pauză mantre</> : <><Volume2 className="w-3 h-3" /> Activează mantre</>}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
