import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { enUS, ro } from "date-fns/locale";
import { ArrowLeft, Flag, Target, Crown, Dumbbell, Brain, Heart, Briefcase } from "lucide-react";

import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ObjectivesSummaryCards } from "@/components/door/tabs/ObjectivesSummaryCards";

type ObjectivesType = "monthly" | "quarterly" | "annual";

type Objective = {
  id: string;
  category: string;
  title: string;
  progress: number;
  items: string[];
};

const typeFromQuery = (raw: string | null): ObjectivesType => {
  if (raw === "quarterly" || raw === "annual") return raw;
  return "monthly";
};

const getPeriodKey = (type: ObjectivesType) => {
  const now = new Date();
  if (type === "monthly") return format(now, "yyyy-MM");
  if (type === "quarterly") {
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter}-${now.getFullYear()}`;
  }
  return `${now.getFullYear()}`;
};

const getPeriodLabel = (type: ObjectivesType, language: "en" | "ro") => {
  const now = new Date();
  if (type === "monthly") {
    return format(now, "MMMM yyyy", { locale: language === "en" ? enUS : ro });
  }
  if (type === "quarterly") {
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter} ${now.getFullYear()}`;
  }
  return `${now.getFullYear()}`;
};

const getTypeLabel = (type: ObjectivesType, language: "en" | "ro") => {
  if (type === "monthly") return language === "en" ? "Monthly Objectives" : "Obiective Lunare";
  if (type === "quarterly") return language === "en" ? "90-Day Objectives" : "Obiective 90 Zile";
  return language === "en" ? "Annual Vision" : "Viziune Anuală";
};

const CATEGORY_CONFIG: Record<
  "body" | "being" | "balance" | "business",
  {
    icon: React.ComponentType<{ className?: string }>;
    label: { en: string; ro: string };
    accentClass: string;
  }
> = {
  body: { icon: Dumbbell, label: { en: "Body", ro: "Corp" }, accentClass: "text-destructive" },
  being: { icon: Brain, label: { en: "Spirituality", ro: "Spiritualitate" }, accentClass: "text-primary" },
  balance: { icon: Heart, label: { en: "Relationships", ro: "Relații" }, accentClass: "text-accent-foreground" },
  business: { icon: Briefcase, label: { en: "Business", ro: "Business" }, accentClass: "text-secondary-foreground" },
};

const ObjectivesPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const objectivesType = useMemo<ObjectivesType>(() => typeFromQuery(searchParams.get("type")), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [objectivesByCategory, setObjectivesByCategory] = useState<Record<string, Objective[]>>({});

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setObjectivesByCategory({});
          return;
        }

        const periodKey = getPeriodKey(objectivesType);
        const missionType = objectivesType;

        const { data, error } = await supabase
          .from("missions")
          .select("*")
          .eq("user_id", session.session.user.id)
          .eq("mission_type", missionType)
          .eq("period", periodKey)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const grouped: Record<string, Objective[]> = {};
        (data || []).forEach((m: any) => {
          const category = m.category;
          grouped[category] ||= [];

          const keyActions = m.goal_data?.keyActions || [];
          const milestones = m.goal_data?.milestones || [];

          grouped[category].push({
            id: m.id,
            category,
            title: m.title || "",
            progress: m.goal_data?.progress || 0,
            items: objectivesType === "annual" ? milestones : keyActions,
          });
        });

        setObjectivesByCategory(grouped);
      } catch (e) {
        console.error("Failed to load objectives", e);
        setObjectivesByCategory({});
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [objectivesType]);

  const pageTitle = `${getTypeLabel(objectivesType, language)} | LifeOS`;
  const periodLabel = getPeriodLabel(objectivesType, language);

  const handleTypeChange = (next: string) => {
    const t = typeFromQuery(next);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("type", t);
      return sp;
    }, { replace: true });
  };

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={
            language === "en"
              ? `Review your ${getTypeLabel(objectivesType, language).toLowerCase()} for ${periodLabel}.`
              : `Vezi obiectivele tale (${getTypeLabel(objectivesType, language)}) pentru ${periodLabel}.`
          }
        />
        <link rel="canonical" href="/objectives" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/door")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === "en" ? "Back" : "Înapoi"}
              </button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-sm font-medium text-foreground">
                {getTypeLabel(objectivesType, language)}
                <span className="text-muted-foreground"> • </span>
                <span className="capitalize">{periodLabel}</span>
              </h1>
            </div>

            <div className="mt-3">
              <Tabs value={objectivesType} onValueChange={handleTypeChange} className="w-full">
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="monthly"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{language === "en" ? "Monthly" : "Lunar"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="quarterly"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Target className="w-4 h-4" />
                    <span>{language === "en" ? "90 Days" : "90 Zile"}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="annual"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{language === "en" ? "Annual" : "Anual"}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </header>

        <section className="container mx-auto px-4 py-4">
          <ObjectivesSummaryCards objectivesType={objectivesType} />
        </section>

        <section className="container mx-auto px-4 pb-10">
          <div className="border-t border-border pt-6">
            <h2 className="text-base font-semibold text-foreground">
              {language === "en" ? "All objectives" : "Toate obiectivele"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "en"
                ? "Grouped by category"
                : "Grupate pe categorie"}
            </p>

            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const list = objectivesByCategory[key] || [];

                  return (
                    <div key={key} className="rounded-xl border border-border bg-card">
                      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", cfg.accentClass)} />
                        <h3 className="text-sm font-semibold text-foreground">
                          {cfg.label[language === "en" ? "en" : "ro"]}
                        </h3>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {list.length} {language === "en" ? "items" : "obiective"}
                        </span>
                      </div>

                      {list.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-muted-foreground italic">
                          {language === "en" ? "No objectives set." : "Niciun obiectiv setat."}
                        </div>
                      ) : (
                        <div className="px-4 py-4 space-y-4">
                          {list.map((o) => (
                            <article key={o.id} className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-sm font-medium text-foreground">{o.title}</h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{o.progress}%</span>
                              </div>

                              {o.items?.length ? (
                                <ol className="pl-5 list-decimal text-sm text-muted-foreground space-y-1">
                                  {o.items.map((it, idx) => (
                                    <li key={`${o.id}-${idx}`} className="leading-relaxed">
                                      {it}
                                    </li>
                                  ))}
                                </ol>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default ObjectivesPage;
