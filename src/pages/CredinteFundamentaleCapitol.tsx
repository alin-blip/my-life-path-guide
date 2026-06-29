import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileAudio, FileText, MessageCircleQuestion, Grid3x3, Save, Sparkles, ExternalLink, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { beliefChaptersService, type BeliefChapter, type ChapterProgress } from "@/services/beliefChaptersService";
import { FISHBOWL_QUESTIONS, type ChapterSlug } from "@/data/credinte-fundamentale";

function driveEmbed(url: string): string {
  // Convert https://drive.google.com/file/d/XXX/view -> /preview
  const m = url.match(/\/file\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return url;
}

export default function CredinteFundamentaleCapitol() {
  const { slug } = useParams<{ slug: ChapterSlug }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [chapter, setChapter] = useState<BeliefChapter | null>(null);
  const [progress, setProgress] = useState<ChapterProgress | null>(null);
  const [fishResponses, setFishResponses] = useState<Record<string, string>>({});
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [notes, setNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUrls, setEditingUrls] = useState(false);
  const [urlForm, setUrlForm] = useState({ audio_url: "", pptx_url: "", fishbowl_url: "" });

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      beliefChaptersService.getChapter(slug),
      beliefChaptersService.listProgress(),
      beliefChaptersService.getFishbowlResponses(slug),
    ]).then(([ch, all, fb]) => {
      setChapter(ch);
      setProgress(all[slug] ?? null);
      setNotes(all[slug]?.notes ?? "");
      if (fb) {
        setFishResponses((fb.responses as any) ?? {});
        setAiFeedback(fb.ai_feedback ?? "");
      }
      if (ch) setUrlForm({ audio_url: ch.audio_url ?? "", pptx_url: ch.pptx_url ?? "", fishbowl_url: ch.fishbowl_url ?? "" });
    });
  }, [slug]);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (!slug || !FISHBOWL_QUESTIONS[slug]) return <Navigate to="/minte/credinte-fundamentale" replace />;

  const questions = FISHBOWL_QUESTIONS[slug];

  const markPptxOpened = async () => {
    await beliefChaptersService.upsertProgress(slug, { pptx_opened: true });
    setProgress((p) => ({ ...(p as any), chapter_slug: slug, pptx_opened: true }));
  };

  const allFishAnswered = questions.every((_q, i) => (fishResponses[`q${i}`] ?? "").trim().length > 20);

  const submitFishbowl = async () => {
    setGeneratingFeedback(true);
    try {
      const { data, error } = await supabase.functions.invoke("beliefs-fishbowl-feedback", {
        body: { chapter_slug: slug, responses: fishResponses, chapter_title: chapter?.title },
      });
      if (error) throw error;
      const feedback: string = data?.feedback ?? "";
      setAiFeedback(feedback);
      await beliefChaptersService.saveFishbowlResponses(slug, fishResponses, feedback);
      await beliefChaptersService.upsertProgress(slug, { fishbowl_completed: true });
      setProgress((p) => ({ ...(p as any), chapter_slug: slug, fishbowl_completed: true }));
      toast({ title: "Reflecție salvată", description: "Alin ți-a trimis feedback." });
    } catch (e: any) {
      toast({ title: "Eroare", description: e?.message ?? "Reîncearcă", variant: "destructive" });
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const saveNotes = async () => {
    setSavingNote(true);
    try {
      await beliefChaptersService.upsertProgress(slug, { notes });
      toast({ title: "Notițe salvate" });
    } finally {
      setSavingNote(false);
    }
  };

  const saveUrls = async () => {
    await beliefChaptersService.updateChapter(slug, urlForm);
    setChapter((c) => (c ? { ...c, ...urlForm } : c));
    setEditingUrls(false);
    toast({ title: "Link-uri actualizate" });
  };

  if (!chapter) return <div className="container max-w-3xl mx-auto p-6 text-sm text-muted-foreground">Se încarcă…</div>;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>{chapter.title} | Cele 5 Credințe</title>
      </Helmet>

      <Link to="/minte/credinte-fundamentale" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Înapoi la cele 5 credințe
      </Link>

      <header className="space-y-2">
        <Badge variant="outline" style={{ borderColor: chapter.color_hex, color: chapter.color_hex }}>
          {chapter.subtitle}
        </Badge>
        <h1 className="text-3xl font-bold" style={{ color: chapter.color_hex }}>{chapter.title}</h1>
        <p className="text-muted-foreground">{chapter.description}</p>
      </header>

      {isAdmin && (
        <Card className="border-dashed">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1"><Pencil className="h-3 w-3" /> Admin — link-uri Google Drive</span>
              <Button size="sm" variant="ghost" onClick={() => setEditingUrls((v) => !v)}>{editingUrls ? "Anulează" : "Editează"}</Button>
            </div>
            {editingUrls && (
              <div className="space-y-2">
                <Input placeholder="Audio URL (Drive share link)" value={urlForm.audio_url} onChange={(e) => setUrlForm((f) => ({ ...f, audio_url: e.target.value }))} />
                <Input placeholder="PPTX URL" value={urlForm.pptx_url} onChange={(e) => setUrlForm((f) => ({ ...f, pptx_url: e.target.value }))} />
                <Input placeholder="Fish Bowl docx URL (opțional)" value={urlForm.fishbowl_url} onChange={(e) => setUrlForm((f) => ({ ...f, fishbowl_url: e.target.value }))} />
                <Button size="sm" onClick={saveUrls}>Salvează</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="audio"><FileAudio className="h-3.5 w-3.5 mr-1" /> Audio</TabsTrigger>
          <TabsTrigger value="pptx"><FileText className="h-3.5 w-3.5 mr-1" /> Prezentare</TabsTrigger>
          <TabsTrigger value="fishbowl"><MessageCircleQuestion className="h-3.5 w-3.5 mr-1" /> Fish Bowl</TabsTrigger>
          <TabsTrigger value="matrix"><Grid3x3 className="h-3.5 w-3.5 mr-1" /> Matrice</TabsTrigger>
        </TabsList>

        {/* AUDIO */}
        <TabsContent value="audio" className="space-y-3 pt-4">
          {chapter.audio_url ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="aspect-video rounded-md overflow-hidden bg-black">
                  <iframe
                    src={driveEmbed(chapter.audio_url)}
                    className="w-full h-full"
                    allow="autoplay"
                    title={`Audio ${chapter.title}`}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={() => beliefChaptersService.upsertProgress(slug, { audio_percent: 100 })}>
                  Am terminat de ascultat
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed"><CardContent className="p-6 text-sm text-muted-foreground text-center">
              Audio se adaugă curând. {isAdmin && "Folosește panoul Admin de sus pentru a adăuga link-ul Google Drive."}
            </CardContent></Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-sm">Notițele tale</h3>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ce ai înțeles, ce te-a deranjat, ce vrei să aplici…" />
              <Button size="sm" onClick={saveNotes} disabled={savingNote}><Save className="h-3.5 w-3.5 mr-1" /> Salvează</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PPTX */}
        <TabsContent value="pptx" className="space-y-3 pt-4">
          {chapter.pptx_url ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="aspect-video rounded-md overflow-hidden bg-muted">
                  <iframe src={driveEmbed(chapter.pptx_url)} className="w-full h-full" title={`Prezentare ${chapter.title}`} />
                </div>
                <div className="flex gap-2">
                  <a href={chapter.pptx_url} target="_blank" rel="noreferrer" onClick={markPptxOpened}>
                    <Button size="sm" variant="secondary"><ExternalLink className="h-3.5 w-3.5 mr-1" /> Deschide în Drive</Button>
                  </a>
                  <Button size="sm" onClick={markPptxOpened}>Am parcurs prezentarea</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed"><CardContent className="p-6 text-sm text-muted-foreground text-center">
              Prezentarea se adaugă curând.
            </CardContent></Card>
          )}
        </TabsContent>

        {/* FISH BOWL */}
        <TabsContent value="fishbowl" className="space-y-3 pt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Răspunde sincer la cele 5 întrebări. La final, Alin îți va da un feedback personalizat.
              </p>
              {questions.map((q, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-sm font-medium">{i + 1}. {q}</label>
                  <Textarea
                    rows={3}
                    value={fishResponses[`q${i}`] ?? ""}
                    onChange={(e) => setFishResponses((f) => ({ ...f, [`q${i}`]: e.target.value }))}
                    placeholder="Scrie răspunsul tău…"
                  />
                </div>
              ))}
              <Button onClick={submitFishbowl} disabled={!allFishAnswered || generatingFeedback}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                {generatingFeedback ? "Alin reflectează…" : "Trimite pentru feedback"}
              </Button>
              {!allFishAnswered && (
                <p className="text-xs text-muted-foreground">Răspunde la toate cele 5 întrebări (min. 20 caractere fiecare).</p>
              )}
            </CardContent>
          </Card>

          {aiFeedback && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Feedback de la Alin</h3>
                </div>
                <div className="text-sm whitespace-pre-wrap">{aiFeedback}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MATRIX */}
        <TabsContent value="matrix" className="space-y-3 pt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Conectează această credință cu Matricea Credințelor CEO — îți declari trei comportamente concrete pe care le instalezi săptămâna asta.
              </p>
              <Link to="/minte/credinte">
                <Button size="sm" variant="secondary" onClick={() => beliefChaptersService.upsertProgress(slug, { matrix_completed: true })}>
                  Deschide Matricea Credințelor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
