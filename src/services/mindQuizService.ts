// Mind Quiz Service — submit & load responses, compute axis scores.
import { supabase } from "@/integrations/supabase/client";
import { getMindQuiz, scoreMindQuiz } from "@/data/mind-quizzes";
import type { BandKey, MindAxisId } from "@/data/mind-quizzes/types";

export interface MindQuizResponseRow {
  id: string;
  quiz_slug: string;
  answers: Record<string, BandKey>;
  raw_score: number | null;
  max_score: number | null;
  score_healthy: number | null;
  band: BandKey | null;
  axes_distribution: Record<string, number> | null;
  language: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MindAxisScoreRow {
  axis: MindAxisId;
  score_healthy: number;
  contributing_quizzes: number;
  status: string | null;
  details: Record<string, unknown> | null;
  last_computed_at: string;
}

export interface MindQuizDraftRow {
  user_id: string;
  quiz_slug: string;
  answers: Record<string, BandKey>;
  current_index: number;
  language: string;
  updated_at: string;
}

export const mindQuizService = {
  async saveDraft(
    quizSlug: string,
    answers: Record<string, BandKey>,
    currentIndex: number,
    language: "ro" | "en" = "ro",
  ): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("mind_quiz_drafts")
      .upsert(
        {
          user_id: userId,
          quiz_slug: quizSlug,
          answers: answers as any,
          current_index: currentIndex,
          language,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,quiz_slug" },
      );

    if (error) {
      console.error("saveDraft:", error);
      return false;
    }
    return true;
  },

  async loadDraft(quizSlug: string): Promise<MindQuizDraftRow | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("mind_quiz_drafts")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_slug", quizSlug)
      .maybeSingle();

    if (error) {
      console.error("loadDraft:", error);
      return null;
    }
    return data as MindQuizDraftRow | null;
  },

  async clearDraft(quizSlug: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    await supabase
      .from("mind_quiz_drafts")
      .delete()
      .eq("user_id", userId)
      .eq("quiz_slug", quizSlug);
  },

  async submitQuiz(
    quizSlug: string,
    answers: Record<string, BandKey>,
    language: "ro" | "en" = "ro",
  ) {
    const quiz = getMindQuiz(quizSlug);
    if (!quiz) throw new Error(`Quiz not found: ${quizSlug}`);

    const result = scoreMindQuiz(quiz, answers);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("mind_quiz_responses")
      .insert({
        user_id: userId,
        quiz_slug: quizSlug,
        answers: answers as any,
        raw_score: result.raw,
        max_score: result.max,
        score_healthy: result.scoreHealthy,
        band: result.band,
        axes_distribution: result.axesDistribution as any,
        language,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Recompute axis scores from all quiz responses
    await this.recomputeAxisScores(userId);

    return { row: data as MindQuizResponseRow, result };
  },

  async getLatestResponseForQuiz(quizSlug: string): Promise<MindQuizResponseRow | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("mind_quiz_responses")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_slug", quizSlug)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("getLatestResponseForQuiz:", error);
      return null;
    }
    return data as MindQuizResponseRow | null;
  },

  async getAllLatestResponses(): Promise<Record<string, MindQuizResponseRow>> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return {};

    const { data, error } = await supabase
      .from("mind_quiz_responses")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("getAllLatestResponses:", error);
      return {};
    }

    const latest: Record<string, MindQuizResponseRow> = {};
    for (const row of (data ?? []) as MindQuizResponseRow[]) {
      if (!latest[row.quiz_slug]) latest[row.quiz_slug] = row;
    }
    return latest;
  },

  async recomputeAxisScores(userId: string) {
    const { data, error } = await supabase
      .from("mind_quiz_responses")
      .select("quiz_slug, score_healthy, axes_distribution, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (error || !data) return;

    // Latest response per quiz
    const latest: Record<string, { axes: Record<string, number>; score: number }> = {};
    for (const row of data as any[]) {
      if (!latest[row.quiz_slug]) {
        latest[row.quiz_slug] = {
          axes: (row.axes_distribution ?? {}) as Record<string, number>,
          score: Number(row.score_healthy ?? 0),
        };
      }
    }

    // Aggregate by axis
    const agg: Record<string, { sum: number; count: number }> = {};
    for (const slug of Object.keys(latest)) {
      const axes = latest[slug].axes;
      for (const axis of Object.keys(axes)) {
        if (!agg[axis]) agg[axis] = { sum: 0, count: 0 };
        agg[axis].sum += axes[axis];
        agg[axis].count += 1;
      }
    }

    // Upsert
    for (const axis of Object.keys(agg)) {
      const { sum, count } = agg[axis];
      const score = Math.round(sum / count);
      const status =
        score >= 75 ? "healthy" :
        score >= 55 ? "balanced" :
        score >= 35 ? "warning" : "needs-attention";

      await supabase
        .from("mind_axis_scores")
        .upsert(
          {
            user_id: userId,
            axis,
            score_healthy: score,
            contributing_quizzes: count,
            status,
            last_computed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,axis" },
        );
    }
  },

  async getAxisScores(): Promise<MindAxisScoreRow[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from("mind_axis_scores")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("getAxisScores:", error);
      return [];
    }
    return (data ?? []) as MindAxisScoreRow[];
  },
};
