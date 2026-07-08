// Runs daily via pg_cron. Sends lifecycle app emails:
//  - welcome (once, to users created in the last 48h without a welcome sent)
//  - trial-reminder (once, when Stripe subscription is trialing and trial ends in <= 2 days)
//  - retention-winback (once every 30 days, to users inactive for 14+ days)
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'
import { requireCronOrAdmin } from "../_shared/require-cron-or-admin.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const log = (msg: string, meta: Record<string, unknown> = {}) =>
  console.log(JSON.stringify({ fn: 'send-lifecycle-emails', msg, ...meta }))

async function alreadySent(email: string, template: string, sinceHours: number | null = null) {
  let q = supabase
    .from('email_send_log')
    .select('id')
    .eq('recipient_email', email)
    .eq('template_name', template)
    .limit(1)
  if (sinceHours) {
    q = q.gte('created_at', new Date(Date.now() - sinceHours * 3600 * 1000).toISOString())
  }
  const { data } = await q
  return (data?.length ?? 0) > 0
}

async function getLanguage(userId: string | null, email: string): Promise<'ro' | 'en'> {
  if (userId) {
    const { data } = await supabase.from('user_preferences').select('language').eq('user_id', userId).maybeSingle()
    if (data?.language === 'en' || data?.language === 'ro') return data.language
  }
  const { data } = await supabase.rpc('get_user_language_by_email', { _email: email })
  return (data === 'en' ? 'en' : 'ro')
}

async function enqueue(templateName: string, recipientEmail: string, idempotencyKey: string, templateData: Record<string, unknown>) {
  const { error } = await supabase.functions.invoke('send-transactional-email', {
    body: { templateName, recipientEmail, idempotencyKey, templateData },
  })
  if (error) log('enqueue-error', { templateName, recipientEmail, error: error.message })
  else log('enqueued', { templateName, recipientEmail })
}

async function runWelcome() {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 200 })
  if (error) { log('listUsers-error', { error: error.message }); return 0 }
  const recent = (users?.users ?? []).filter(u => u.email && u.created_at && u.created_at >= since)
  let sent = 0
  for (const u of recent) {
    if (!u.email) continue
    if (await alreadySent(u.email, 'welcome')) continue
    const lang = await getLanguage(u.id, u.email)
    const name = (u.user_metadata as any)?.display_name || (u.user_metadata as any)?.full_name || u.email.split('@')[0]
    await enqueue('welcome', u.email, `welcome-${u.id}`, { name, language: lang })
    sent++
  }
  return sent
}

async function runTrialReminder() {
  // subscribers where status = 'trialing' and subscription_end (used as trial end when trialing) within 48h
  const soon = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, user_id, subscription_end, subscription_status')
    .eq('subscription_status', 'trialing')
    .lte('subscription_end', soon)
    .gte('subscription_end', new Date().toISOString())
  if (error) { log('trial-query-error', { error: error.message }); return 0 }
  let sent = 0
  for (const s of data ?? []) {
    if (!s.email) continue
    if (await alreadySent(s.email, 'trial-reminder')) continue
    const daysLeft = Math.max(1, Math.ceil((new Date(s.subscription_end!).getTime() - Date.now()) / (24 * 3600 * 1000)))
    const lang = await getLanguage(s.user_id ?? null, s.email)
    await enqueue('trial-reminder', s.email, `trial-reminder-${s.email}-${s.subscription_end}`, { language: lang, daysLeft })
    sent++
  }
  return sent
}

async function runWinback() {
  // Users with no activity_sessions in last 14 days; skip if welcome sent < 14d ago; send at most every 30 days.
  const cutoff = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
  const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 500 })
  if (error) { log('winback-listUsers-error', { error: error.message }); return 0 }
  let sent = 0
  for (const u of users?.users ?? []) {
    if (!u.email || !u.created_at) continue
    if (u.created_at > cutoff) continue // account younger than 14d
    // check activity
    const { data: sess } = await supabase
      .from('activity_sessions')
      .select('id')
      .eq('user_id', u.id)
      .gte('created_at', cutoff)
      .limit(1)
    if ((sess?.length ?? 0) > 0) continue
    if (await alreadySent(u.email, 'retention-winback', 30 * 24)) continue
    const lang = await getLanguage(u.id, u.email)
    const name = (u.user_metadata as any)?.display_name || u.email.split('@')[0]
    await enqueue('retention-winback', u.email, `winback-${u.id}-${new Date().toISOString().slice(0, 10)}`, { name, language: lang, daysInactive: 14 })
    sent++
    if (sent >= 100) break // safety cap per run
  }
  return sent
}

async function runRoutineComeback() {
  // Users whose last daily_flow_session is between 3 and 13 days ago; send once per 7 days.
  const now = Date.now()
  const min = new Date(now - 13 * 24 * 3600 * 1000).toISOString()
  const max = new Date(now - 3 * 24 * 3600 * 1000).toISOString()
  // Grab distinct user_ids with a last session in that window
  const { data: rows, error } = await supabase
    .from('daily_flow_sessions')
    .select('user_id, date')
    .gte('date', min.slice(0, 10))
    .lte('date', max.slice(0, 10))
    .order('date', { ascending: false })
    .limit(500)
  if (error) { log('comeback-query-error', { error: error.message }); return 0 }
  const seen = new Set<string>()
  let sent = 0
  for (const r of rows ?? []) {
    if (seen.has(r.user_id)) continue
    seen.add(r.user_id)
    // Ensure no session in last 2 days (still inactive)
    const recentCutoff = new Date(now - 2 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    const { data: recent } = await supabase
      .from('daily_flow_sessions')
      .select('id')
      .eq('user_id', r.user_id)
      .gte('date', recentCutoff)
      .limit(1)
    if ((recent?.length ?? 0) > 0) continue
    const { data: u } = await supabase.auth.admin.getUserById(r.user_id)
    const email = u?.user?.email
    if (!email) continue
    if (await alreadySent(email, 'routine-comeback', 7 * 24)) continue
    const lang = await getLanguage(r.user_id, email)
    const name = (u.user.user_metadata as any)?.display_name || email.split('@')[0]
    const daysMissed = Math.floor((now - new Date(r.date + 'T00:00:00Z').getTime()) / (24 * 3600 * 1000))
    const { data: stats } = await supabase.from('user_statistics').select('longest_streak').eq('user_id', r.user_id).maybeSingle()
    await enqueue('routine-comeback', email, `comeback-${r.user_id}-${new Date().toISOString().slice(0, 10)}`, {
      name, language: lang, daysMissed, lastStreak: stats?.longest_streak ?? 0,
    })
    sent++
    if (sent >= 100) break
  }
  return sent
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
  const authFail = await requireCronOrAdmin(req, corsHeaders);
  if (authFail) return authFail;

    const [welcome, trial, winback] = await Promise.all([runWelcome(), runTrialReminder(), runWinback()])
    log('done', { welcome, trial, winback })
    return new Response(JSON.stringify({ ok: true, welcome, trial, winback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    log('fatal', { error: e instanceof Error ? e.message : String(e) })
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
