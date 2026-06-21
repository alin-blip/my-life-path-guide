import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Brain } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMindQuiz } from "@/data/mind-quizzes";
import { QuizRunner } from "@/components/mind/QuizRunner";

export default function MinteQuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lang: "ro" | "en" = language === "en" ? "en" : "ro";

  const quiz = slug ? getMindQuiz(slug) : undefined;

  if (!quiz) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-10 text-center space-y-3">
        <p className="text-muted-foreground">
          {lang === "en" ? "Quiz not found." : "Chestionar inexistent."}
        </p>
        <Link to="/minte/teste" className="text-primary text-sm">
          ← {lang === "en" ? "Back to tests" : "Înapoi la teste"}
        </Link>
      </div>
    );
  }

  const title = lang === "en" ? quiz.title_en : quiz.title_ro;
  const description = lang === "en" ? quiz.description_en : quiz.description_ro;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>{title} | CEO Mind OS</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`/minte/teste/${quiz.slug}`} />
      </Helmet>

      <div>
        <Link
          to="/minte/teste"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />{" "}
          {lang === "en" ? "All tests" : "Toate testele"}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>

      <QuizRunner quiz={quiz} />
    </div>
  );
}
