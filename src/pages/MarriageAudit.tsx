import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Loader2, AlertTriangle, History, User } from 'lucide-react';
import { toast } from 'sonner';
import { MarriageStackInput } from '@/components/marriage/MarriageStackInput';
import { RelationalTriangle } from '@/components/marriage/RelationalTriangle';
import { AxisDiagnosisRadar } from '@/components/marriage/AxisDiagnosisRadar';
import { MarriageTaskExportCard } from '@/components/marriage/MarriageTaskExportCard';
import { TriggerRootCard, RepairScriptCard, ExplorationQuestionsCard, SevenDayPlanCard, FollowupChat } from '@/components/marriage/MarriageAuditExtensions';
import { marriageService, MarriageAttachment, MarriageSession } from '@/services/marriageService';
import { useMarriageProfile } from '@/hooks/useMarriageStack';
import { Textarea } from '@/components/ui/textarea';

export default function MarriageAudit() {
  const navigate = useNavigate();
  const { profile } = useMarriageProfile();
  const [attachments, setAttachments] = useState<MarriageAttachment[]>([]);
  const [transcripts, setTranscripts] = useState('');
  const [userContext, setUserContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ session: MarriageSession; pattern_recurrence: number } | null>(null);

  const canAnalyze = (attachments.length > 0 || userContext.trim().length > 20) && !analyzing;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await marriageService.analyze({
        user_context: userContext,
        attachments,
        transcripts: { combined_text: transcripts },
      });
      setResult({ session: data.session, pattern_recurrence: data.pattern_recurrence });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      toast.error('Analiză eșuată: ' + (e.message || 'eroare'));
    } finally {
      setAnalyzing(false);
    }
  };

  const startNew = () => {
    setResult(null);
    setAttachments([]);
    setUserContext('');
    setTranscripts('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marriage')} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi la Marriage Dashboard
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Badge variant="outline" className="mb-2 gap-1"><Sparkles className="h-3 w-3 text-primary" /> EXECUTIVE MARRIAGE AUDIT</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Analiză conflict relațional</h1>
              <p className="text-muted-foreground mt-1">
                Încarcă evidence (screenshots, audio, text), AI Coach-ul face diagnostic pe 6 axe relaționale.
              </p>
            </div>
            {profile?.partner_name && (
              <Card className="px-4 py-2 bg-background border-border flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <div className="text-xs">
                  <div className="font-medium">{profile.partner_name}</div>
                  <div className="text-muted-foreground">{profile.relationship_years || '?'} ani împreună</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {!result ? (
          <>
            {!profile?.partner_name && (
              <Card className="p-4 bg-card border-l-4 border-l-yellow-500/60 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>Profil relațional nesetat.</strong> Pentru pattern detection și memorie persistentă, completează profilul partenerului.
                  </p>
                  <Button variant="link" className="px-0 h-auto text-sm" onClick={() => navigate('/marriage/profile')}>
                    Configurează acum →
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-5 bg-card space-y-2">
              <label className="text-sm font-medium">Context: ce s-a întâmplat? (situația concretă)</label>
              <Textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="ex: Aseară am venit acasă obosit după o zi grea la birou și ne-am certat pentru că ea voia să vorbim despre vacanță. I-am spus că nu am timp acum și a explodat. M-am simțit atacat..."
                className="min-h-[120px]"
              />
            </Card>

            <MarriageStackInput
              attachments={attachments}
              onAttachmentsChange={(atts, trans) => { setAttachments(atts); setTranscripts(trans); }}
            />

            <div className="flex justify-end">
              <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze}>
                {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {analyzing ? 'Analizez (poate dura 30-60s)...' : 'Rulează analiza'}
              </Button>
            </div>

            {analyzing && (
              <Card className="p-5 bg-card space-y-2 text-sm text-muted-foreground">
                <div>🔍 Decelare cognitivă — separ faptele de interpretare...</div>
                <div>🧠 Diagnostic pe 6 axe psiho-mentale...</div>
                <div>📐 Construiesc Triunghiul Realității Relaționale...</div>
                <div>🎯 Generez task comportamental pentru The Door...</div>
              </Card>
            )}
          </>
        ) : (
          <ResultView result={result} onNew={startNew} />
        )}
      </div>
    </div>
  );
}

const ResultView: React.FC<{ result: { session: MarriageSession; pattern_recurrence: number }; onNew: () => void }> = ({ result, onNew }) => {
  const { session, pattern_recurrence } = result;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">{session.title}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline">Analiza completă</Badge>
            {pattern_recurrence > 1 && (
              <Badge variant="destructive" className="gap-1">
                <History className="h-3 w-3" /> Tipar recurent (a {pattern_recurrence}-a oară pe Axa {session.primary_destructured_axis})
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={onNew}>Analiză nouă</Button>
      </div>

      <Card className="p-5 bg-card">
        <h3 className="font-display font-semibold mb-2">Situația factuală</h3>
        <p className="text-sm whitespace-pre-wrap">{session.factual_situation}</p>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fapt vs Interpretare</div>
          <p className="text-sm whitespace-pre-wrap">{session.fact_vs_interpretation}</p>
        </div>
      </Card>

      <div>
        <h3 className="font-display text-xl font-semibold mb-3">Triunghiul Realității Relaționale</h3>
        <RelationalTriangle session={session} />
      </div>

      <AxisDiagnosisRadar axisScores={session.axis_diagnosis} primaryDestructured={session.primary_destructured_axis} />

      {session.detected_distortions?.length > 0 && (
        <Card className="p-5 bg-card">
          <h3 className="font-display font-semibold mb-3">Distorsiuni cognitive detectate</h3>
          <div className="space-y-3">
            {session.detected_distortions.map((d, i) => (
              <div key={i} className="border-l-2 border-l-destructive/50 pl-3">
                <Badge variant="destructive" className="mb-1">{d.name}</Badge>
                <p className="text-sm text-muted-foreground italic">„{d.evidence}"</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <MarriageTaskExportCard session={session} />
    </div>
  );
};
