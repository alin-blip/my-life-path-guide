import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Brain } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ALL_MIND_QUIZZES } from "@/data/mind-quizzes";
import {
  mindQuizService,
  type MindQuizResponseRow,
} from "@/services/mindQuizService";

export default function MinteTeste() {
  const { language } = useLanguage();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";
  const [responses, setResponses] = useState<Record<string, MindQuizResponseRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mindQuizService.getAllLatestResponses().then((map) => {
      setResponses(map);
      setLoading(false);
    });
  }, []);

  const t = (en: string, ro: string) => (lang === "en" ? en : ro);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>{t("Mind Tests | CEO Mind OS", "Teste de Minte | CEO Mind OS")}</title>
        <meta
          name="description"
          content={t(
            "Identify destructive thinking patterns blocking your growth as an entrepreneur.",
            "Identifică tiparele de gândire distructivă care îți blochează creșterea ca antreprenor.",
          )}
        />
        <link rel="canonical" href="/minte/teste" />
      </Helmet>

      <div>
        <Link to="/minte" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("Mind", "Minte")}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <Brain className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">{t("Mind Tests", "Teste de Minte")}</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {t(
            "8 short quizzes (10 questions each) to map your destructive thinking patterns. Results feed the Brain Map and AI Coach.",
            "8 chestionare scurte (câte 10 întrebări) pentru a cartografia tiparele tale de gândire distructivă. Rezultatele alimentează Brain Map-ul și AI Coach-ul.",
          )}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("Loading…", "Se încarcă…")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {ALL_MIND_QUIZZES.map((quiz) => {
            const r = responses[quiz.slug];
            const title = lang === "en" ? quiz.title_en : quiz.title_ro;
            const description = lang === "en" ? quiz.description_en : quiz.description_ro;
            const completed = r != null;
            const score = r?.score_healthy;
            const tone =
              score == null
                ? ""
                : score >= 70
                  ? "text-emerald-500"
                  : score >= 40
                    ? "text-amber-500"
                    : "text-rose-500";
            return (
              <Card key={quiz.slug} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>
                    {completed && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold tabular-nums ${tone}`}>{score}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {t("score", "scor")}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {quiz.questions.length} {t("questions", "întrebări")}
                    </Badge>
                    {completed && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("Completed", "Completat")}
                      </Badge>
                    )}
                  </div>
                  <Link to={`/minte/teste/${quiz.slug}`}>
                    <Button size="sm" variant={completed ? "outline" : "default"} className="w-full">
                      {completed ? t("Retake", "Refă testul") : t("Start", "Începe")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
