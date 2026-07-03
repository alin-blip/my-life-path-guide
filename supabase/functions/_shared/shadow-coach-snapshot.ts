// Shadow Coach snapshot builder — shared aggregator of today's user activity
// across the CEO Mind OS ecosystem.
//
// Consumed by:
//   - accountability-coach (injects into system prompt)
//   - snapshot_test.ts (unit tests per source)
//   - save-shadow-snapshot (persists daily rollup)

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ShadowAxis = 'body' | 'being' | 'balance' | 'business' | 'mind';

export interface ShadowEvent {
  axis: ShadowAxis;
  label: string;
  source: string;
  occurredAt?: string;
}

export interface ShadowSnapshot {
  date: string;                      // YYYY-MM-DD
  counts: Record<ShadowAxis, number>;
  total: number;
  events: ShadowEvent[];
  axesScores: Record<string, number>;
}

const emptyCounts = (): Record<ShadowAxis, number> => ({
  body: 0, being: 0, balance: 0, business: 0, mind: 0,
});

export async function buildShadowSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<ShadowSnapshot> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const sinceIso = start.toISOString();
  const dateStr = sinceIso.split('T')[0];

  const counts = emptyCounts();
  const events: ShadowEvent[] = [];
  const inc = (a: ShadowAxis, label: string, source: string, occurredAt?: string) => {
    counts[a] += 1;
    events.push({ axis: a, label, source, occurredAt });
  };

  const safe = async <T>(p: Promise<T>): Promise<T | null> => {
    try { return await p; } catch { return null; }
  };

  const [
    routineRes, doneTasksRes, hotRes, stacksRes, mentalitateRes,
    quizzesRes, beliefsRes, coursesRes, axesRes,
  ] = await Promise.all([
    safe(supabase.from('champion_routine_logs').select('*').eq('user_id', userId).eq('date', dateStr).maybeSingle() as any),
    safe(supabase.from('user_tasks').select('title,updated_at').eq('user_id', userId).eq('completed', true).gte('updated_at', sinceIso).limit(50) as any),
    safe(supabase.from('hot_list_items').select('title,updated_at').eq('user_id', userId).eq('completed', true).gte('updated_at', sinceIso).limit(50) as any),
    safe(supabase.from('stack_sessions').select('stack_type,updated_at,completed').eq('user_id', userId).gte('created_at', sinceIso).limit(30) as any),
    safe(supabase.from('mentalitate_stack_sessions').select('completed,updated_at').eq('user_id', userId).gte('created_at', sinceIso).limit(30) as any),
    safe(supabase.from('mind_quiz_responses').select('completed_at').eq('user_id', userId).gte('completed_at', sinceIso).limit(30) as any),
    safe(supabase.from('belief_chapter_progress').select('completed_at,updated_at').eq('user_id', userId).gte('updated_at', sinceIso).limit(30) as any),
    safe(supabase.from('user_course_progress').select('completed,updated_at').eq('user_id', userId).gte('updated_at', sinceIso).limit(30) as any),
    safe(supabase.from('mind_axis_scores').select('axis,score_healthy').eq('user_id', userId) as any),
  ]);

  const log: any = (routineRes as any)?.data;
  if (log) {
    if (log.water_drunk) inc('body', 'Hidratare', 'routine', log.updated_at);
    if (log.light_exposure) inc('body', 'Lumină de dimineață', 'routine', log.updated_at);
    if (log.exercise_completed) inc('body', 'Exerciții', 'routine', log.updated_at);
    if ((log.meals_logged?.length ?? 0) > 0) inc('body', `Mese logate (${log.meals_logged.length})`, 'routine', log.updated_at);
    if (log.meditation_duration_seconds > 0) inc('being', `Meditație ${Math.round(log.meditation_duration_seconds/60)} min`, 'routine', log.updated_at);
    if (log.autosuggestion_completed) inc('being', 'Autosugestie', 'routine', log.updated_at);
    if (log.vision_declaration_read) inc('being', 'Declarație viziune', 'routine', log.updated_at);
    if (log.visualization_completed) inc('being', 'Vizualizare', 'routine', log.updated_at);
    if (log.breathing_completed) inc('being', 'Respirație', 'routine', log.updated_at);
    if ((log.gratitude_items?.length ?? 0) > 0) inc('being', `Recunoștință (${log.gratitude_items.length})`, 'routine', log.updated_at);
    if (log.journaling_completed) inc('being', 'Jurnaling', 'routine', log.updated_at);
    if (log.reading_completed) inc('being', 'Citit', 'routine', log.updated_at);
    if (log.learn_completed) inc('business', 'Învățare', 'routine', log.updated_at);
    if (log.apply_completed) inc('business', 'Aplicare', 'routine', log.updated_at);
    if (log.content_topic) inc('business', 'Creare conținut', 'routine', log.updated_at);
    if ((log.relationship_actions?.length ?? 0) > 0) inc('balance', `Relații (${log.relationship_actions.length})`, 'routine', log.updated_at);
    if (log.emotional_transform_completed) inc('mind', 'Mind Shifting', 'routine', log.updated_at);
    if (log.stack_selection_completed) inc('mind', 'Stack ales', 'routine', log.updated_at);
  }

  ((doneTasksRes as any)?.data ?? []).forEach((t: any) =>
    inc('business', `Task: ${t.title ?? 'sarcină'}`, 'user_tasks', t.updated_at));
  ((hotRes as any)?.data ?? []).forEach((t: any) =>
    inc('business', `Hot list: ${t.title ?? 'sarcină'}`, 'hot_list_items', t.updated_at));
  ((stacksRes as any)?.data ?? []).forEach((s: any) => {
    if (s.completed) inc('mind', `Stack ${s.stack_type ?? ''} finalizat`, 'stack_sessions', s.updated_at);
  });
  ((mentalitateRes as any)?.data ?? []).forEach((s: any) => {
    if (s.completed) inc('mind', 'Mentalitate Stack finalizat', 'mentalitate_stack_sessions', s.updated_at);
  });
  ((quizzesRes as any)?.data ?? []).forEach((q: any) =>
    inc('mind', 'Test Minte', 'mind_quiz_responses', q.completed_at));
  ((beliefsRes as any)?.data ?? []).forEach((b: any) =>
    inc('being', b.completed_at ? 'Capitol credințe finalizat' : 'Progres pe credințe', 'belief_chapter_progress', b.completed_at || b.updated_at));
  ((coursesRes as any)?.data ?? []).forEach((c: any) =>
    inc('business', c.completed ? 'Modul curs finalizat' : 'Progres pe curs', 'user_course_progress', c.updated_at));

  const axesScores: Record<string, number> = {};
  ((axesRes as any)?.data ?? []).forEach((a: any) => {
    axesScores[a.axis] = Math.round(Number(a.score_healthy ?? 0));
  });

  const total = counts.body + counts.being + counts.balance + counts.business + counts.mind;
  return { date: dateStr, counts, total, events, axesScores };
}

export function formatShadowPromptBlock(snap: ShadowSnapshot, historyLine?: string): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(`🕶️ SHADOW COACH — CE A FĂCUT UTILIZATORUL AZI (total ${snap.total} acțiuni):`);
  lines.push(`Distribuție pe axe: body:${snap.counts.body} · being:${snap.counts.being} · balance:${snap.counts.balance} · business:${snap.counts.business} · mind:${snap.counts.mind}`);
  if (snap.events.length) {
    snap.events.slice(0, 20).forEach(e => lines.push(`• [${e.axis}] ${e.label}`));
  } else {
    lines.push('(nicio acțiune înregistrată azi)');
  }
  if (Object.keys(snap.axesScores).length) {
    lines.push('');
    lines.push('📊 SCORURI AXE (0-100):');
    Object.entries(snap.axesScores).forEach(([axis, score]) => lines.push(`- ${axis}: ${score}`));
  }
  if (historyLine) {
    lines.push('');
    lines.push(`📈 TENDINȚĂ 7 ZILE: ${historyLine}`);
  }
  lines.push('');
  lines.push('REGULĂ SHADOW COACH — răspunde în 3 blocuri scurte:');
  lines.push('1. ✅ CE AI FINALIZAT AZI: max 3 bullets, referă doar la evenimentele reale de mai sus. Dacă total=0, spui că observi liniște și întrebi ce a făcut.');
  lines.push('2. 💪 UNDE EȘTI PUTERNIC / UNDE CREȘTI: axa cu cele mai multe acțiuni + axa cea mai neglijată azi. Fără să inventezi.');
  lines.push('3. ➡️ NEXT STEP: un singur pas concret pentru următoarele 60 min.');
  lines.push('Maxim 4-5 propoziții total. Zero halucinații — dacă snapshot-ul e gol, întreabă înainte să felicit.');
  return lines.join('\n');
}
