import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { Heart, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Lang = "ro" | "en";

const QUESTIONS: Record<Lang, string[]> = {
  ro: [
    // Cognitivă (gânduri / narațiuni)
    "Mă surprind interpretând acțiunile partenerului meu cu generozitate, nu cu suspiciune.",
    "Atunci când apare un conflict, separ faptele de interpretările mele înainte să reacționez.",
    "Îmi spun frecvent: „Nu mă mai înțelege, e degeaba.”", // reverse
    "Am o imagine clară a punctelor forte ale partenerului meu, nu doar a frustrărilor.",
    // Afectivă (emoții / intimitate)
    "În ultima lună am simțit conexiune emoțională reală cu partenerul meu.",
    "Pot exprima vulnerabilitate fără să mă tem că voi fi judecat(ă).",
    "Mă simt singur(ă) în relație chiar și când suntem împreună.", // reverse
    "Intimitatea fizică & emoțională este vie, nu un automatism.",
    // Comportamentală (ritualuri / prezență)
    "Avem cel puțin un ritual săptămânal doar al nostru (cină, plimbare, conversație fără ecrane).",
    "Sunt prezent(ă) când vorbim — telefon jos, focus pe el/ea.",
    "Telefonul / laptopul intră des între noi seara.", // reverse
    "Inițiez gesturi mici de afecțiune fără să aștept ocazii speciale.",
    // Volitivă (decizii / angajament)
    "Iau decizii importante împreună cu partenerul, nu doar îl/o anunț.",
    "Sunt 100% angajat(ă) în această relație pe termen lung.",
    "Mă gândesc serios dacă merită să continui.", // reverse
    "Îmi asum partea mea de responsabilitate când lucrurile nu merg.",
    // Profesională (echilibrul muncă-familie)
    "Reușesc să las munca la ușă suficient cât să fiu prezent(ă) acasă.",
    "Partenerul meu înțelege presiunea afacerii mele, dar nu o suportă singur(ă).",
    "Stresul de business se descarcă des asupra partenerului.", // reverse
    "Avem o conversație lunară clară despre bani, business și familie.",
    // Profesională... wait we need 4 here: indices 16-19. Above is correct (16,17,18,19).
    // Spirituală (valori / sens comun)
    "Avem valori comune clare (familie, principii, misiune).",
    "Sărbătorim împreună reușitele — nu doar pe ale unuia.",
    "Simt că trăim vieți paralele, nu o viață împreună.", // reverse
    "Avem o viziune clară pentru următorii 3-5 ani ca pereche.",
    // Overall (24)
    "Per ansamblu, sunt mulțumit(ă) de starea relației mele acum.",
  ],
  en: [
    "I tend to interpret my partner's actions with generosity, not suspicion.",
    "When conflict arises, I separate facts from my interpretations before reacting.",
    "I often think: \"They don't understand me anymore, it's pointless.\"",
    "I have a clear picture of my partner's strengths, not just frustrations.",
    "In the last month I've felt real emotional connection with my partner.",
    "I can express vulnerability without fearing judgment.",
    "I feel lonely in the relationship even when we're together.",
    "Physical & emotional intimacy is alive, not on autopilot.",
    "We have at least one weekly ritual just for us (dinner, walk, screen-free talk).",
    "I'm present when we talk — phone down, focus on them.",
    "Phone / laptop often gets between us in the evening.",
    "I initiate small acts of affection without waiting for special occasions.",
    "I make important decisions WITH my partner, not just inform them.",
    "I'm 100% committed to this relationship long term.",
    "I seriously wonder whether it's worth continuing.",
    "I own my part of responsibility when things go wrong.",
    "I manage to leave work at the door enough to be present at home.",
    "My partner understands my business pressure but doesn't carry it alone.",
    "Business stress often spills onto my partner.",
    "We have a clear monthly conversation about money, business and family.",
    "We have clear shared values (family, principles, mission).",
    "We celebrate wins together — not just one of us.",
    "I feel we live parallel lives, not one life together.",
    "We have a clear vision for the next 3-5 years as a couple.",
    "Overall, I'm satisfied with the state of my relationship right now.",
  ],
};

const COPY: Record<Lang, Record<string, string>> = {
  ro: {
    metaTitle: "Evaluează-ți căsătoria | Audit gratuit pentru antreprenori - CEO Mind OS",
    metaDesc: "Audit gratuit în 8 minute pentru antreprenori: scor pe 6 axe + plan personalizat AI pentru a repara și îmbunătăți relația ta.",
    pretitle: "Executive Marriage Audit",
    title: "Evaluează-ți căsătoria.\nApoi reparează-o.",
    subtitle: "25 de întrebări. 8 minute. Scor pe 6 axe + plan personalizat AI trimis pe email. Gratuit.",
    forWhom: "Pentru antreprenori care vor o familie pe care merită să o conduci, nu doar un business.",
    start: "Începe auditul",
    of: "din",
    next: "Continuă",
    back: "Înapoi",
    progress: "Progres",
    scale1: "Total dezacord",
    scale5: "Total de acord",
    finalTitle: "Ultimul pas: primește raportul tău",
    finalSub: "Îți trimitem pe email scorul, diagnoza și planul de 30 de zile.",
    namePh: "Prenumele tău (opțional)",
    emailPh: "Email-ul tău",
    consent: "Vreau să primesc și alte resurse pentru antreprenori (poți dezabona oricând).",
    submit: "Trimite-mi raportul",
    sending: "Generăm raportul tău...",
    requiredEmail: "Te rog introdu un email valid",
    requiredAns: "Răspunde la toate întrebările",
    yourScore: "Scorul tău",
    diagnosis: "Diagnoză",
    strengths: "Puncte forte",
    risks: "Atenție la",
    plan: "Plan 30 de zile",
    today: "Primul pas — astăzi",
    week: "Săpt.",
    ctaTitle: "Vrei o analiză profundă pe un conflict real?",
    ctaSub: "Marriage Stack analizează screenshots WhatsApp/SMS, audio sau text și îți dă Triunghiul Realității (ce zice ea, ce zici tu, ce vede coach-ul).",
    ctaBtn: "Deschide Marriage Stack",
    emailSent: "Raportul a fost trimis pe email",
    bandLabels: {
      excelent: "Excelent",
      sanatos: "Sănătos",
      atentie: "Atenție",
      fragil: "Fragil",
      critic: "Critic",
    } as any,
    axes: {
      cognitiva: "Cognitivă",
      afectiva: "Afectivă",
      comportamentala: "Comportamentală",
      volitiva: "Volitivă",
      profesionala: "Profesională",
      spirituala: "Spirituală",
    } as any,
  },
  en: {
    metaTitle: "Evaluate your marriage | Free audit for entrepreneurs - CEO Mind OS",
    metaDesc: "Free 8-minute audit for entrepreneurs: score across 6 axes + AI personalized plan to repair and improve your relationship.",
    pretitle: "Executive Marriage Audit",
    title: "Evaluate your marriage.\nThen repair it.",
    subtitle: "25 questions. 8 minutes. Score on 6 axes + AI personalized plan sent to your email. Free.",
    forWhom: "For founders who want a family worth leading, not just a business.",
    start: "Start the audit",
    of: "of",
    next: "Continue",
    back: "Back",
    progress: "Progress",
    scale1: "Strongly disagree",
    scale5: "Strongly agree",
    finalTitle: "Last step: get your report",
    finalSub: "We'll email you the score, diagnosis and 30-day plan.",
    namePh: "Your first name (optional)",
    emailPh: "Your email",
    consent: "I also want to receive other resources for founders (unsubscribe anytime).",
    submit: "Send me the report",
    sending: "Generating your report...",
    requiredEmail: "Please enter a valid email",
    requiredAns: "Please answer all questions",
    yourScore: "Your score",
    diagnosis: "Diagnosis",
    strengths: "Strengths",
    risks: "Watch out for",
    plan: "30-day plan",
    today: "First step — today",
    week: "Week",
    ctaTitle: "Want a deep analysis on a real conflict?",
    ctaSub: "Marriage Stack analyzes WhatsApp/SMS screenshots, audio or text and gives you the Reality Triangle (what she says, what you say, what the coach sees).",
    ctaBtn: "Open Marriage Stack",
    emailSent: "Report has been emailed to you",
    bandLabels: {
      excelent: "Excellent",
      sanatos: "Healthy",
      atentie: "Caution",
      fragil: "Fragile",
      critic: "Critical",
    } as any,
    axes: {
      cognitiva: "Cognitive",
      afectiva: "Affective",
      comportamentala: "Behavioral",
      volitiva: "Volitional",
      profesionala: "Professional",
      spirituala: "Spiritual",
    } as any,
  },
};

type Result = {
  scores: Record<string, number>;
  overall: number;
  band: string;
  ai: {
    diagnosis?: string;
    strengths?: string[];
    risks?: string[];
    plan_30_days?: { week: number; focus: string; action: string }[];
    first_step_today?: string;
  };
  emailSent: boolean;
};

const MarriageQuiz: React.FC = () => {
  const [lang, setLang] = useState<Lang>("ro");
  const t = COPY[lang];
  const questions = QUESTIONS[lang];

  const [stage, setStage] = useState<"intro" | "quiz" | "form" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(25).fill(null));
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const progress = useMemo(() => {
    const filled = answers.filter((a) => a !== null).length;
    return Math.round((filled / 25) * 100);
  }, [answers]);

  const setAnswer = (val: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    setTimeout(() => {
      if (idx < 24) setIdx((i) => i + 1);
      else setStage("form");
    }, 180);
  };

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t.requiredEmail);
      return;
    }
    if (answers.some((a) => a === null)) {
      toast.error(t.requiredAns);
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("marriage-quiz-analyze", {
        body: {
          email: email.trim(),
          firstName: firstName.trim() || null,
          language: lang,
          marketingConsent: consent,
          answers: answers as number[],
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || "error");
      setResult(data as Result);
      setStage("result");
      if (data.emailSent) toast.success(t.emailSent);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const radarData = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.scores).map(([k, v]) => ({
      axis: (t.axes as any)[k] ?? k,
      score: v,
    }));
  }, [result, t]);

  const bandColor = (s: number) =>
    s >= 65 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="min-h-screen" style={{ background: "#10172d", color: "#e2e8f0" }}>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <link rel="canonical" href="https://www.ceomindos.com/marriage-quiz" />
      </Helmet>

      {/* Top bar */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-white">CEO Mind OS</span>
            <span className="text-xs text-slate-400 hidden sm:inline">· Executive Marriage Audit</span>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setLang("ro")}
              className={`px-2 py-1 rounded ${lang === "ro" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
            >RO</button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded ${lang === "en" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
            >EN</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* INTRO */}
        {stage === "intro" && (
          <div className="text-center py-10 animate-in fade-in duration-500">
            <div className="text-amber-400 text-sm uppercase tracking-[0.2em] mb-4">{t.pretitle}</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white whitespace-pre-line leading-tight">
              {t.title}
            </h1>
            <p className="text-lg text-slate-300 mt-6 max-w-xl mx-auto">{t.subtitle}</p>
            <p className="text-sm text-slate-400 mt-3 max-w-lg mx-auto">{t.forWhom}</p>

            <Button
              size="lg"
              onClick={() => setStage("quiz")}
              className="mt-8 bg-amber-400 hover:bg-amber-300 text-[#10172d] font-bold px-8"
            >
              {t.start} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="grid grid-cols-3 gap-4 mt-12 text-center text-xs text-slate-400 max-w-md mx-auto">
              <div><div className="text-2xl font-bold text-white">25</div>{lang === "ro" ? "întrebări" : "questions"}</div>
              <div><div className="text-2xl font-bold text-white">6</div>{lang === "ro" ? "axe analizate" : "axes analyzed"}</div>
              <div><div className="text-2xl font-bold text-white">8 min</div>{lang === "ro" ? "timp total" : "total time"}</div>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {stage === "quiz" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-slate-400">{idx + 1} {t.of} 25</span>
              <span className="text-slate-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 mb-8" />

            <Card className="bg-[#0b1226] border-white/10 p-6 sm:p-8">
              <p className="text-xl sm:text-2xl text-white leading-snug mb-8 min-h-[80px]">
                {questions[idx]}
              </p>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((v) => {
                  const selected = answers[idx] === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setAnswer(v)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        selected
                          ? "bg-amber-400/15 border-amber-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-200 hover:border-amber-400/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {v === 1 && t.scale1}
                          {v === 2 && (lang === "ro" ? "Dezacord" : "Disagree")}
                          {v === 3 && (lang === "ro" ? "Neutru" : "Neutral")}
                          {v === 4 && (lang === "ro" ? "De acord" : "Agree")}
                          {v === 5 && t.scale5}
                        </span>
                        <span className="text-xs text-slate-400">{v}/5</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  disabled={idx === 0}
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  className="text-slate-300"
                >
                  {t.back}
                </Button>
                {answers[idx] !== null && idx < 24 && (
                  <Button
                    onClick={() => setIdx((i) => i + 1)}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {t.next} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* FORM */}
        {stage === "form" && (
          <div className="animate-in fade-in duration-500">
            <Card className="bg-[#0b1226] border-white/10 p-8 max-w-lg mx-auto">
              <div className="text-center mb-6">
                <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white">{t.finalTitle}</h2>
                <p className="text-slate-400 mt-2">{t.finalSub}</p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder={t.namePh}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={80}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
                <Input
                  type="email"
                  placeholder={t.emailPh}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
                <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(c) => setConsent(!!c)}
                    className="mt-0.5"
                  />
                  <span>{t.consent}</span>
                </label>

                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-[#10172d] font-bold py-6 text-base"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.sending}</>
                  ) : (
                    <>{t.submit} <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && result && (
          <div className="animate-in fade-in duration-500 space-y-6">
            {result.emailSent && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center">
                <CheckCircle2 className="h-4 w-4" /> {t.emailSent}
              </div>
            )}

            {/* Overall + Radar */}
            <Card className="bg-[#0b1226] border-white/10 p-6 sm:p-8">
              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.yourScore}</div>
                <div className={`text-6xl font-extrabold mt-2 ${bandColor(result.overall)}`}>
                  {result.overall}<span className="text-2xl text-slate-500">/100</span>
                </div>
                <div className="text-slate-300 mt-1 capitalize">
                  {(t.bandLabels as any)[result.band] ?? result.band}
                </div>
              </div>

              <div className="h-72 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Radar dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Diagnosis */}
            {result.ai.diagnosis && (
              <Card className="bg-[#0b1226] border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{t.diagnosis}</h3>
                <p className="text-slate-200 leading-relaxed">{result.ai.diagnosis}</p>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {result.ai.strengths?.length ? (
                <Card className="bg-[#0b1226] border-emerald-500/20 p-5">
                  <h3 className="text-emerald-400 font-semibold mb-2">{t.strengths}</h3>
                  <ul className="space-y-2 text-slate-200 text-sm">
                    {result.ai.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </Card>
              ) : null}
              {result.ai.risks?.length ? (
                <Card className="bg-[#0b1226] border-rose-500/20 p-5">
                  <h3 className="text-rose-400 font-semibold mb-2">{t.risks}</h3>
                  <ul className="space-y-2 text-slate-200 text-sm">
                    {result.ai.risks.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </Card>
              ) : null}
            </div>

            {/* Plan */}
            {result.ai.plan_30_days?.length ? (
              <Card className="bg-[#0b1226] border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t.plan}</h3>
                <div className="space-y-3">
                  {result.ai.plan_30_days.map((p, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
                        {t.week} {p.week}
                      </div>
                      <div>
                        <div className="text-white font-medium">{p.focus}</div>
                        <div className="text-slate-300 text-sm">{p.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            {result.ai.first_step_today && (
              <Card className="bg-amber-400/10 border-amber-400/40 p-5">
                <div className="text-amber-400 text-xs uppercase tracking-[0.2em] mb-1">{t.today}</div>
                <div className="text-white">{result.ai.first_step_today}</div>
              </Card>
            )}

            {/* CTA to Marriage Stack */}
            <Card className="bg-gradient-to-br from-amber-400/20 to-amber-500/5 border-amber-400/30 p-6 sm:p-8 text-center">
              <h3 className="text-2xl font-bold text-white">{t.ctaTitle}</h3>
              <p className="text-slate-200 mt-2 max-w-xl mx-auto">{t.ctaSub}</p>
              <Link to="/marriage">
                <Button className="mt-5 bg-amber-400 hover:bg-amber-300 text-[#10172d] font-bold px-8">
                  {t.ctaBtn} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-500 py-8">
        © {new Date().getFullYear()} CEO Mind OS · Executive Marriage Audit
      </footer>
    </div>
  );
};

export default MarriageQuiz;
