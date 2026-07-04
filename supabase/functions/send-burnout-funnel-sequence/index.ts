import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 10-day burnout story sequence. One email per day per lead.
// Day 1 fires as soon as the lead exists (or immediately for backfilled leads on
// first cron run). Day N fires when (now - firstSendAt) >= (N-1)*24h.
// Stops when: lead unsubscribed/suppressed, purchased ebook, or subscribed to
// challenge/plan. Idempotent via email_sequence_log unique(email, sequence_type,
// day_number).

const SEQUENCE_TYPE = 'burnout_story'
const TOTAL_DAYS = 10
const DAY_MS = 24 * 60 * 60 * 1000
// Send at most one story email per lead per invocation to avoid flooding.
// Also enforce a soft grace window so the first backfill wave doesn't send
// day 2+ immediately just because a lead is old.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = Date.now()
  const stats: Record<string, number> = { sent: 0, skipped_stopped: 0, skipped_waiting: 0, completed: 0, errors: 0 }
  const perDay: Record<number, number> = {}

  // Suppression / conversion stop-lists
  const [{ data: suppressed }, { data: subs }, { data: bookBuyers }] = await Promise.all([
    supabase.from('suppressed_emails').select('email'),
    supabase.from('subscribers').select('email').eq('subscribed', true),
    supabase.from('ebook_purchases').select('email'),
  ])
  const stopSet = new Set<string>([
    ...(suppressed || []).map((r: any) => (r.email || '').toLowerCase()),
    ...(subs || []).map((r: any) => (r.email || '').toLowerCase()),
    ...(bookBuyers || []).map((r: any) => (r.email || '').toLowerCase()),
  ])

  // All burnout leads (no time cutoff — we backfill everyone).
  const { data: leads, error: leadsErr } = await supabase
    .from('email_leads')
    .select('id, email, name, created_at, language, metadata')
    .eq('lead_magnet', 'burnout_test')
    .eq('subscribed', true)
    .order('created_at', { ascending: true })

  if (leadsErr) {
    console.error('leads fetch error', leadsErr)
    return new Response(JSON.stringify({ error: leadsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const send = async (email: string, name: string, language: string, dayNumber: number, leadId: string) => {
    const trackingId = crypto.randomUUID()
    try {
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'burnout-story',
          recipientEmail: email,
          idempotencyKey: `burnout-story-${leadId}-day-${dayNumber}`,
          templateData: { name, language, dayNumber, trackingId },
        },
      })
      if (error) throw error
      await supabase.from('email_sequence_log').insert({
        lead_id: leadId,
        email,
        sequence_type: SEQUENCE_TYPE,
        day_number: dayNumber,
        tracking_id: trackingId,
      })
      return true
    } catch (e) {
      console.error('send fail', email, dayNumber, e)
      stats.errors += 1
      return false
    }
  }

  for (const lead of leads || []) {
    const email = (lead.email || '').toLowerCase()
    if (!email) continue

    if (stopSet.has(email)) {
      stats.skipped_stopped += 1
      continue
    }

    // Language: explicit column wins; metadata fallback; default RO
    const meta = (lead.metadata as any) || {}
    const language = lead.language === 'en' || meta.language === 'en' ? 'en' : 'ro'
    const name = lead.name || ''

    // Pull all story sends for this lead
    const { data: sentRows } = await supabase
      .from('email_sequence_log')
      .select('day_number, sent_at')
      .eq('email', email)
      .eq('sequence_type', SEQUENCE_TYPE)
      .order('day_number', { ascending: true })

    const sentDays = new Set<number>((sentRows || []).map((r: any) => r.day_number))
    if (sentDays.size >= TOTAL_DAYS) {
      stats.completed += 1
      continue
    }

    // Determine "clock start" = first sent_at if any, else NOW.
    // This means backfilled leads get day 1 today, day 2 tomorrow, etc.
    const firstSend = (sentRows || [])[0]
    const clockStart = firstSend ? new Date(firstSend.sent_at).getTime() : now

    // Which day should the lead be on right now?
    // Day 1 at clockStart, day 2 at +24h, ...
    const daysElapsed = Math.floor((now - clockStart) / DAY_MS)
    const currentDay = Math.min(TOTAL_DAYS, daysElapsed + 1)

    // Find the next unsent day up to currentDay
    let nextDay: number | null = null
    for (let d = 1; d <= currentDay; d++) {
      if (!sentDays.has(d)) {
        nextDay = d
        break
      }
    }

    if (nextDay === null) {
      stats.skipped_waiting += 1
      continue
    }

    const ok = await send(email, name, language, nextDay, lead.id)
    if (ok) {
      stats.sent += 1
      perDay[nextDay] = (perDay[nextDay] || 0) + 1
    }
  }

  const result = { ok: true, sequence: SEQUENCE_TYPE, stats, perDay, timestamp: new Date().toISOString() }
  console.log('burnout-story stats', JSON.stringify(result))
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
