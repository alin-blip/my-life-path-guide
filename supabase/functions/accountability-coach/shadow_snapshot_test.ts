import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildShadowSnapshot, formatShadowPromptBlock } from "../_shared/shadow-coach-snapshot.ts";

// Minimal fake SupabaseClient that returns predetermined rows per table.
function fakeClient(sources: Record<string, any>) {
  const chain = (table: string) => {
    const state: any = { table, filters: {} };
    const api: any = {
      select: () => api,
      eq: () => api,
      gte: () => api,
      order: () => api,
      limit: () => api,
      maybeSingle: async () => ({ data: sources[table]?.single ?? null }),
      // when awaited as a promise
      then: (resolve: any) => resolve({ data: sources[table]?.list ?? [] }),
    };
    return api;
  };
  return { from: chain } as any;
}

Deno.test("empty snapshot => total 0 and prompt tells the coach to ask", async () => {
  const supa = fakeClient({});
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.total, 0);
  const prompt = formatShadowPromptBlock(snap);
  assert(prompt.includes("total 0 acțiuni"));
  assert(prompt.includes("nicio acțiune înregistrată azi"));
});

Deno.test("routine log: hydration + exercise counted as body axis", async () => {
  const supa = fakeClient({
    champion_routine_logs: { single: { water_drunk: true, exercise_completed: true } },
  });
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.counts.body, 2);
  assertEquals(snap.total, 2);
});

Deno.test("completed user_tasks add to business axis", async () => {
  const supa = fakeClient({
    user_tasks: { list: [{ title: "Ship v1", updated_at: new Date().toISOString() }] },
  });
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.counts.business, 1);
  assert(snap.events[0].label.includes("Ship v1"));
});

Deno.test("completed stack_sessions add to mind axis", async () => {
  const supa = fakeClient({
    stack_sessions: { list: [{ stack_type: "anger", completed: true, updated_at: new Date().toISOString() }] },
  });
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.counts.mind, 1);
});

Deno.test("belief_chapter_progress adds to being axis", async () => {
  const supa = fakeClient({
    belief_chapter_progress: { list: [{ completed_at: new Date().toISOString(), updated_at: null }] },
  });
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.counts.being, 1);
});

Deno.test("axesScores are surfaced in prompt block", async () => {
  const supa = fakeClient({
    mind_axis_scores: { list: [{ axis: "body", score_healthy: 72.4 }] },
  });
  const snap = await buildShadowSnapshot(supa, "u1");
  assertEquals(snap.axesScores.body, 72);
  const prompt = formatShadowPromptBlock(snap, "5 zile logate, medie 4/zi, axă dominantă: body.");
  assert(prompt.includes("- body: 72"));
  assert(prompt.includes("TENDINȚĂ 7 ZILE"));
});
