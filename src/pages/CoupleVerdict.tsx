import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Scale, ArrowRight, ArrowLeft, Loader2, Lock, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SeoHead } from "@/components/seo/SeoHead";
import { trackLead, trackEvent } from "@/lib/facebook-pixel";

type Lang = "ro" | "en";

const T = {
  ro: {
    seoTitle: "Cine are dreptate? — Verdict obiectiv pentru conflictul de cuplu | CEO Mind OS",
    seoDesc: "Descrie cearta, perspectiva ta și a partenerului. Primești gratuit un verdict obiectiv: fapte vs. interpretări și nevoile emoționale ale fiecăruia.",
    badge: "Gratuit · 3 minute",
    h1: "Cine are dreptate?",
    sub: "Descrie conflictul din perspectiva ta și a partenerului. Coach îți dă un verdict obiectiv, de mediator: ce e fapt, ce e interpretare și de ce are nevoie fiecare.",
    start: "Analizează conflictul",
    bullets: ["Fapte vs. interpretări", "Nevoile emoționale ale fiecăruia", "Procent de responsabilitate, fără vină", "O frază de reconectare pentru azi"],
    steps: ["Situația", "Perspectiva ta", "Perspectiva partenerului", "Unde trimitem verdictul"],
    q: [
      { label: "Ce s-a întâmplat?", hint: "Descrie faptele cât mai neutru: când, unde, ce s-a spus sau făcut.", ph: "Ex: Aseară am ajuns acasă la 22:00 fără să anunț. El/ea m-a așteptat cu cina..." },
      { label: "Cum vezi tu situația?", hint: "Ce ai simțit, ce ai gândit, de ce ai reacționat așa.", ph: "Eu cred că..." },
      { label: "Cum crezi că o vede partenerul?", hint: "Pune-te sincer în pielea lui/ei. Ce ar spune dacă ar fi aici?", ph: "El/ea ar spune că..." },
    ],
    name: "Prenume", email: "Email",
    consent: "Vreau să primesc și sfaturi pentru relație pe email (mă pot dezabona oricând).",
    privacy: "Datele tale sunt private. Nu trimitem nimic partenerului.",
    next: "Continuă", back: "Înapoi", submit: "Vezi verdictul",
    analyzing: "Coach analizează conflictul...",
    min: (n: number) => `Mai scrie puțin (minim ${n} caractere).`,
    invalid: "Verifică numele și emailul.",
    verdictFor: (n: string) => `Verdictul pentru ${n}`,
    facts: "Fapte", interp: "Interpretări", needsMe: "Nevoile tale", needsPartner: "Nevoile partenerului",
    resp: "Responsabilitate în conflict", you: "Tu", partner: "Partener", who: "Deci, cine are dreptate?",
    distortions: "Distorsiuni de gândire detectate", phrase: "Spune-i azi",
    offerTitle: "Verdictul arată problema. Planul o rezolvă.",
    offerSub: "Primește protocolul tău personalizat de de-escaladare, construit pe exact acest conflict.",
    offerItems: ["7 zile, câte o acțiune de sub 15 minute", "Script de reparare — ce să spui, cuvânt cu cuvânt", "Întrebări pentru o conversație calmă", "Protocol de urgență dacă cearta reizbucnește"],
    buy7: "Deblochează planul — 5 €", buy7Sub: "plată unică",
    buyM: "Acces lunar Marriage Stack — 9,97 €/lună", buyMSub: "analize nelimitate + planuri noi, anulezi oricând",
    planTitle: "Protocolul tău de de-escaladare — 7 zile", day: "Ziua", intention: "Intenție",
    repair: "Script de reparare", questions: "Întrebări de explorare", emergency: "Dacă cearta reizbucnește",
    generating: "Coach îți construiește planul...", canceled: "Plata a fost anulată. Poți încerca oricând.",
    emailSent: "Ți-am trimis verdictul și pe email.", restart: "Analizează alt conflict",
    currency: "€",
  },
  en: {
    seoTitle: "Who is right? — An objective verdict for your couple conflict | CEO Mind OS",
    seoDesc: "Describe the fight, your perspective and your partner's. Get a free objective verdict: facts vs. interpretations and each partner's emotional needs.",
    badge: "Free · 3 minutes",
    h1: "Who is right?",
    sub: "Describe the conflict from your side and your partner's. Coach gives you an objective, mediator-style verdict: what is fact, what is interpretation, and what each of you needs.",
    start: "Analyze the conflict",
    bullets: ["Facts vs. interpretations", "Each partner's emotional needs", "Responsibility split, without blame", "A reconnection phrase for today"],
    steps: ["The situation", "Your perspective", "Your partner's perspective", "Where to send the verdict"],
    q: [
      { label: "What happened?", hint: "Describe the facts as neutrally as possible: when, where, what was said or done.", ph: "E.g. Last night I got home at 10pm without texting. My partner had waited with dinner..." },
      { label: "How do you see it?", hint: "What you felt, what you thought, why you reacted that way.", ph: "I think that..." },
      { label: "How do you think your partner sees it?", hint: "Honestly step into their shoes. What would they say if they were here?", ph: "They would say that..." },
    ],
    name: "First name", email: "Email",
    consent: "Send me relationship tips by email too (unsubscribe anytime).",
    privacy: "Your data is private. Nothing is sent to your partner.",
    next: "Continue", back: "Back", submit: "See the verdict",
    analyzing: "Coach is analyzing the conflict...",
    min: (n: number) => `Write a bit more (at least ${n} characters).`,
    invalid: "Check your name and email.",
    verdictFor: (n: string) => `The verdict for ${n}`,
    facts: "Facts", interp: "Interpretations", needsMe: "Your needs", needsPartner: "Your partner's needs",
    resp: "Responsibility in the conflict", you: "You", partner: "Partner", who: "So, who is right?",
    distortions: "Thinking distortions detected", phrase: "Tell them today",
    offerTitle: "The verdict shows the problem. The plan fixes it.",
    offerSub: "Get your personalized de-escalation protocol, built on exactly this conflict.",
    offerItems: ["7 days, one action under 15 minutes each", "Repair script — what to say, word for word", "Questions for a calm conversation", "Emergency protocol if the fight flares up"],
    buy7: "Unlock the plan — $5", buy7Sub: "one-time payment",
    buyM: "Monthly Marriage Stack access — $9.97/mo", buyMSub: "unlimited analyses + new plans, cancel anytime",
    planTitle: "Your de-escalation protocol — 7 days", day: "Day", intention: "Intention",
    repair: "Repair script", questions: "Exploration questions", emergency: "If the fight flares up",
    generating: "Coach is building your plan...", canceled: "Payment was canceled. You can try again anytime.",
    emailSent: "We also emailed you the verdict.", restart: "Analyze another conflict",
    currency: "$",
  },
} as const;

interface Verdict {
  headline: string; summary: string; facts: string[]; interpretations: string[];
  my_needs: string[]; partner_needs: string[]; responsibility_me: number; responsibility_partner: number;
  who_is_right: string; distortions: { name: string; evidence: string }[]; reconnect_phrase: string;
}
interface Plan {
  intro: string; days: { day: number; title: string; action: string; intention: string }[];
  repair_script: string[]; exploration_questions: string[]; emergency_protocol: string[];
}

const MINS = [20, 10, 10];

async function fnError(error: any, fallback: string) {
  try { const b = await error?.context?.json?.(); return b?.message || fallback; } catch { return fallback; }
}

export default function CoupleVerdict() {
  const location = useLocation();
  const lang: Lang = location.pathname.startsWith("/who-is-right") ? "en" : "ro";
  const t = T[lang];
  const [params, setParams] = useSearchParams();
  const token = params.get("t");
  const sessionId = params.get("session_id");

  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [leadName, setLeadName] = useState("");
  const [paid, setPaid] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      setLoading(true);
      if (sessionId) setPlanLoading(true);
      const { data, error } = await supabase.functions.invoke("couple-verdict-get", { body: { token, session_id: sessionId || undefined } });
      if (!active) return;
      setLoading(false); setPlanLoading(false);
      if (error || !data?.verdict) { toast.error(await fnError(error, lang === "ro" ? "Rezultatul nu a fost găsit." : "Result not found.")); return; }
      setVerdict(data.verdict); setLeadName(data.name); setPaid(!!data.paid); setPlan(data.plan);
      if (data.plan_error) toast.message(data.plan_error);
      if (sessionId && data.paid) {
        trackEvent("Purchase", { value: data.paid_plan === "couple-monthly" ? 9.97 : 5, currency: lang === "en" ? "USD" : "EUR", content_name: "couple-verdict" });
        const p = new URLSearchParams(params); p.delete("session_id"); setParams(p, { replace: true });
      }
      if (params.get("canceled")) toast.message(t.canceled);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const next = () => {
    if (step < 3 && answers[step].trim().length < MINS[step]) { toast.error(t.min(MINS[step])); return; }
    setStep(step + 1);
  };

  const submit = async () => {
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error(t.invalid); return; }
    setLoading(true);
    const utm: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v.slice(0, 500); });
    const { data, error } = await supabase.functions.invoke("couple-verdict-analyze", {
      body: { name: name.trim(), email: email.trim(), language: lang, marketingConsent: consent, situation: answers[0], my_perspective: answers[1], partner_perspective: answers[2], utm },
    });
    setLoading(false);
    if (error || !data?.token) { toast.error(await fnError(error, lang === "ro" ? "Nu am putut genera verdictul." : "Could not generate the verdict.")); return; }
    trackLead({ content_name: "couple-verdict", language: lang });
    setVerdict(data.verdict); setLeadName(name.trim());
    setParams({ t: data.token }, { replace: true });
    toast.success(t.emailSent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buy = async (planId: "couple-plan-7d" | "couple-monthly") => {
    if (!token) return;
    setBuying(planId);
    trackEvent("InitiateCheckout", { content_name: planId, value: planId === "couple-monthly" ? 9.97 : 5, currency: lang === "en" ? "USD" : "EUR" });
    const { data, error } = await supabase.functions.invoke("couple-verdict-checkout", { body: { token, plan: planId } });
    if (error || !data?.url) { setBuying(null); toast.error(await fnError(error, lang === "ro" ? "Nu am putut deschide plata." : "Could not open checkout.")); return; }
    window.location.href = data.url;
  };

  const seo = <SeoHead title={t.seoTitle} description={t.seoDesc} path={lang === "en" ? "/en/who-is-right" : "/cine-are-dreptate"} locale={lang} roPath="/cine-are-dreptate" enPath="/en/who-is-right" noindex={!!token} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        {seo}
        <Scale className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-lg font-medium text-foreground">{token ? "…" : t.analyzing}</p>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ===== RESULT =====
  if (verdict) {
    const me = Math.max(0, Math.min(100, verdict.responsibility_me));
    return (
      <div className="min-h-screen bg-background">
        {seo}
        <div className="container max-w-3xl mx-auto px-4 py-10 space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-widest text-primary font-semibold">{t.verdictFor(leadName)}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{verdict.headline}</h1>
            <p className="text-muted-foreground text-lg">{verdict.summary}</p>
          </div>

          <Card className="p-6 space-y-3">
            <h2 className="font-semibold text-foreground">{t.resp}</h2>
            <div className="flex justify-between text-sm text-muted-foreground"><span>{t.you} · {me}%</span><span>{100 - me}% · {t.partner}</span></div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: `${me}%` }} />
              <div className="bg-accent h-full flex-1" />
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <ListCard title={t.facts} items={verdict.facts} />
            <ListCard title={t.interp} items={verdict.interpretations} />
            <ListCard title={t.needsMe} items={verdict.my_needs} />
            <ListCard title={t.needsPartner} items={verdict.partner_needs} />
          </div>

          <Card className="p-6 border-primary/40">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Scale className="h-5 w-5 text-primary" />{t.who}</h2>
            <p className="text-foreground leading-relaxed">{verdict.who_is_right}</p>
          </Card>

          {verdict.distortions?.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3">{t.distortions}</h2>
              <ul className="space-y-3">
                {verdict.distortions.map((d, i) => (
                  <li key={i}><p className="font-medium text-foreground">{d.name}</p><p className="text-sm text-muted-foreground">{d.evidence}</p></li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6 bg-primary/5 border-primary/30">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">{t.phrase}</p>
            <p className="text-xl font-medium text-foreground">„{verdict.reconnect_phrase}”</p>
          </Card>

          {paid ? (
            plan ? <PlanView plan={plan} t={t} /> : (
              <Card className="p-8 text-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-foreground">{t.generating}</p>
                {!planLoading && <Button variant="outline" onClick={() => window.location.reload()}>↻</Button>}
              </Card>
            )
          ) : (
            <Card className="p-6 md:p-8 border-2 border-primary space-y-5">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{t.offerTitle}</h2>
                <p className="text-muted-foreground">{t.offerSub}</p>
              </div>
              <ul className="space-y-2">
                {t.offerItems.map((it) => <li key={it} className="flex gap-2 text-foreground"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" />{it}</li>)}
              </ul>
              <div className="space-y-3">
                <Button size="lg" className="w-full h-auto py-4 flex-col" disabled={!!buying} onClick={() => buy("couple-plan-7d")}>
                  <span className="text-base font-bold flex items-center gap-2">{buying === "couple-plan-7d" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}{t.buy7}</span>
                  <span className="text-xs opacity-80">{t.buy7Sub}</span>
                </Button>
                <Button size="lg" variant="outline" className="w-full h-auto py-3 flex-col whitespace-normal" disabled={!!buying} onClick={() => buy("couple-monthly")}>
                  <span className="font-semibold">{buying === "couple-monthly" && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}{t.buyM}</span>
                  <span className="text-xs text-muted-foreground">{t.buyMSub}</span>
                </Button>
              </div>
            </Card>
          )}

          <div className="text-center">
            <Button variant="ghost" onClick={() => { setVerdict(null); setPlan(null); setPaid(false); setStep(-1); setAnswers(["", "", ""]); setParams({}, { replace: true }); }}>{t.restart}</Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== INTRO =====
  if (step === -1) {
    return (
      <div className="min-h-screen bg-background">
        {seo}
        <div className="container max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <HeartHandshake className="h-4 w-4" />{t.badge}
          </div>
          <div className="space-y-4">
            <Scale className="h-14 w-14 mx-auto text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t.h1}</h1>
            <p className="text-lg text-muted-foreground">{t.sub}</p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-left">
            {t.bullets.map((b) => <li key={b} className="flex gap-2 items-start text-foreground"><CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />{b}</li>)}
          </ul>
          <Button size="lg" className="px-8 py-6 text-base font-bold" onClick={() => setStep(0)}>
            {t.start}<ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><ShieldCheck className="h-4 w-4" />{t.privacy}</p>
        </div>
      </div>
    );
  }

  // ===== WIZARD =====
  return (
    <div className="min-h-screen bg-background">
      {seo}
      <div className="container max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{step + 1}/4 · {t.steps[step]}</p>
          <Progress value={((step + 1) / 4) * 100} />
        </div>
        <Card className="p-6 space-y-4">
          {step < 3 ? (
            <>
              <h2 className="text-2xl font-bold text-foreground">{t.q[step].label}</h2>
              <p className="text-sm text-muted-foreground">{t.q[step].hint}</p>
              <Textarea
                value={answers[step]}
                onChange={(e) => { const a = [...answers]; a[step] = e.target.value.slice(0, 3000); setAnswers(a); }}
                placeholder={t.q[step].ph}
                rows={8}
                maxLength={3000}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-right">{answers[step].length}/3000</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground">{t.steps[3]}</h2>
              <div className="space-y-3">
                <Input placeholder={t.name} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
                <Input type="email" placeholder={t.email} value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} />
                <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />{t.consent}
                </label>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-4 w-4" />{t.privacy}</p>
              </div>
            </>
          )}
        </Card>
        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-1" />{t.back}</Button>
          {step < 3
            ? <Button onClick={next}>{t.next}<ArrowRight className="h-4 w-4 ml-1" /></Button>
            : <Button onClick={submit} className="font-bold">{t.submit}<Scale className="h-4 w-4 ml-2" /></Button>}
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-4">
        {(items || []).map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </Card>
  );
}

function PlanView({ plan, t }: { plan: Plan; t: (typeof T)[Lang] }) {
  return (
    <div className="space-y-4">
      <Card className="p-6 border-2 border-primary">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.planTitle}</h2>
        <p className="text-muted-foreground">{plan.intro}</p>
      </Card>
      {plan.days.map((d) => (
        <Card key={d.day} className="p-5 border-l-4 border-l-primary">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">{t.day} {d.day}</p>
          <p className="font-semibold text-foreground mt-1">{d.title}</p>
          <p className="text-foreground mt-1">{d.action}</p>
          <p className="text-sm text-muted-foreground mt-2"><span className="font-medium">{t.intention}:</span> {d.intention}</p>
        </Card>
      ))}
      <ListCard title={t.repair} items={plan.repair_script} />
      <ListCard title={t.questions} items={plan.exploration_questions} />
      <ListCard title={t.emergency} items={plan.emergency_protocol} />
    </div>
  );
}
