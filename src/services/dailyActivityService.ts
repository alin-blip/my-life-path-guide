import { supabase } from '@/integrations/supabase/client';

export type ActivityAxis = 'body' | 'being' | 'balance' | 'business' | 'mind';

export interface ActivityItem {
  id: string;
  axis: ActivityAxis;
  source: string;
  title: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface DailyActivitySnapshot {
  date: string;
  items: ActivityItem[];
  countsByAxis: Record<ActivityAxis, number>;
  totalCount: number;
}

const emptyCounts = (): Record<ActivityAxis, number> => ({
  body: 0, being: 0, balance: 0, business: 0, mind: 0,
});

const startOfTodayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const todayDateStr = () => new Date().toISOString().split('T')[0];

async function safe<T>(p: Promise<T>): Promise<T | null> {
  try { return await p; } catch { return null; }
}

/**
 * Aggregates today's user activity from existing tables — no new tables required.
 * Silent on any per-source failure.
 */
export async function getTodayActivity(userId: string): Promise<DailyActivitySnapshot> {
  const since = startOfTodayIso();
  const today = todayDateStr();
  const items: ActivityItem[] = [];

  // 1. Champion routine steps completed today
  const routine = await safe(
    supabase
      .from('champion_routine_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle() as any
  );
  const log: any = routine && (routine as any).data;
  if (log) {
    const push = (axis: ActivityAxis, title: string, key: string) =>
      items.push({
        id: `routine:${key}`,
        axis,
        source: 'routine',
        title,
        occurredAt: log.updated_at || log.created_at || since,
      });
    if (log.water_drunk) push('body', 'Hidratare', 'water');
    if (log.light_exposure) push('body', 'Lumină de dimineață', 'light');
    if (log.exercise_completed) push('body', 'Exerciții', 'exercise');
    if ((log.meals_logged?.length ?? 0) > 0) push('body', `Mese logate (${log.meals_logged.length})`, 'meals');
    if (log.meditation_duration_seconds > 0)
      push('being', `Meditație ${Math.round(log.meditation_duration_seconds / 60)} min`, 'meditation');
    if (log.autosuggestion_completed) push('being', 'Autosugestie', 'autosuggestion');
    if (log.vision_declaration_read) push('being', 'Declarație de viziune', 'vision');
    if (log.visualization_completed) push('being', 'Vizualizare', 'visualization');
    if (log.breathing_completed) push('being', 'Respirație', 'breathing');
    if ((log.gratitude_items?.length ?? 0) > 0) push('being', `Recunoștință (${log.gratitude_items.length})`, 'gratitude');
    if (log.journaling_completed) push('being', 'Jurnaling', 'journaling');
    if (log.reading_completed) push('being', 'Citit', 'reading');
    if (log.learn_completed) push('business', 'Învățare', 'learn');
    if (log.apply_completed) push('business', 'Aplicare', 'apply');
    if (log.content_topic || log.content_script) push('business', 'Creare de conținut', 'content');
    if ((log.relationship_actions?.length ?? 0) > 0)
      push('balance', `Relații (${log.relationship_actions.length} acțiuni)`, 'relationships');
    if (log.emotional_transform_completed) push('mind', 'Mind Shifting', 'mindShift');
    if (log.stack_selection_completed) push('mind', 'Stack ales', 'stackSelected');
  }

  // 2. Tasks completed today (user_tasks + hot_list_items)
  const tasks = await safe(
    supabase
      .from('user_tasks')
      .select('id,title,task_type,updated_at,completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('updated_at', since)
      .order('updated_at', { ascending: false })
      .limit(30) as any
  );
  ((tasks as any)?.data ?? []).forEach((t: any) => {
    items.push({
      id: `task:${t.id}`,
      axis: 'business',
      source: 'task',
      title: t.title || 'Sarcină finalizată',
      occurredAt: t.updated_at,
      metadata: { task_type: t.task_type },
    });
  });

  const hot = await safe(
    supabase
      .from('hot_list_items')
      .select('id,text,list_type,updated_at,completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('updated_at', since)
      .limit(30) as any
  );
  ((hot as any)?.data ?? []).forEach((t: any) => {
    items.push({
      id: `hot:${t.id}`,
      axis: 'business',
      source: 'hot_list',
      title: t.text || 'Sarcină din lista Hot',
      occurredAt: t.updated_at,
      metadata: { list_type: t.list_type },
    });
  });

  // 3. Stack sessions today
  const stacks = await safe(
    supabase
      .from('stack_sessions')
      .select('id,emotion,created_at,completed_at')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(15) as any
  );
  ((stacks as any)?.data ?? []).forEach((s: any) => {
    items.push({
      id: `stack:${s.id}`,
      axis: 'mind',
      source: 'stack',
      title: `Stack — ${s.emotion || 'emoție'}`,
      occurredAt: s.completed_at || s.created_at,
    });
  });

  const mentalitate = await safe(
    supabase
      .from('mentalitate_stack_sessions')
      .select('id,created_at,completed_at,completed')
      .eq('user_id', userId)
      .gte('created_at', since)
      .limit(15) as any
  );
  ((mentalitate as any)?.data ?? []).forEach((s: any) => {
    items.push({
      id: `mentalitate:${s.id}`,
      axis: 'mind',
      source: 'mentalitate_stack',
      title: s.completed ? 'Mentalitate Stack finalizat' : 'Mentalitate Stack început',
      occurredAt: s.completed_at || s.created_at,
    });
  });

  // 4. Mind quizzes / tests today
  const quizzes = await safe(
    supabase
      .from('mind_quiz_responses')
      .select('id,completed_at')
      .eq('user_id', userId)
      .gte('completed_at', since)
      .limit(10) as any
  );
  ((quizzes as any)?.data ?? []).forEach((q: any) => {
    items.push({
      id: `quiz:${q.id}`,
      axis: 'mind',
      source: 'mind_quiz',
      title: 'Test Minte completat',
      occurredAt: q.completed_at,
    });
  });

  // 5. Belief chapter progress today
  const beliefs = await safe(
    supabase
      .from('belief_chapter_progress')
      .select('id,updated_at,completed_at')
      .eq('user_id', userId)
      .gte('updated_at', since)
      .limit(10) as any
  );
  ((beliefs as any)?.data ?? []).forEach((b: any) => {
    items.push({
      id: `belief:${b.id}`,
      axis: 'being',
      source: 'belief',
      title: b.completed_at ? 'Capitol de credințe finalizat' : 'Progres pe capitol de credințe',
      occurredAt: b.completed_at || b.updated_at,
    });
  });

  // 6. Course progress today
  const courses = await safe(
    supabase
      .from('user_course_progress')
      .select('id,updated_at,completed')
      .eq('user_id', userId)
      .gte('updated_at', since)
      .limit(10) as any
  );
  ((courses as any)?.data ?? []).forEach((c: any) => {
    items.push({
      id: `course:${c.id}`,
      axis: 'business',
      source: 'course',
      title: c.completed ? 'Modul de curs finalizat' : 'Progres pe curs',
      occurredAt: c.updated_at,
    });
  });

  // Sort chronological desc
  items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  // Deduplicate by id (routine keys are stable)
  const seen = new Set<string>();
  const deduped = items.filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });

  const countsByAxis = emptyCounts();
  deduped.forEach((it) => { countsByAxis[it.axis] += 1; });

  return {
    date: today,
    items: deduped,
    countsByAxis,
    totalCount: deduped.length,
  };
}
