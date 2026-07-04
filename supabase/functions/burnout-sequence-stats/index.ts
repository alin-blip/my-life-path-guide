import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const SEQUENCE_TYPE = 'burnout_story'
const TEMPLATE = 'burnout-story'
const MAX_DAY = 10

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'no auth' }), { status: 401, headers: corsHeaders })

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'unauth' }), { status: 401, headers: corsHeaders })

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    if (!roles?.some((r: any) => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders })
    }

    // 1. Sequence log rows (sent/opened/clicked/unsubscribed per day)
    const { data: seq } = await admin
      .from('email_sequence_log')
      .select('email, day_number, sent_at, opened_at, clicked_at, unsubscribed_at')
      .eq('sequence_type', SEQUENCE_TYPE)

    // 2. Send log rows for this template (delivery status)
    const { data: sends } = await admin
      .from('email_send_log')
      .select('recipient_email, status, created_at, message_id')
      .eq('template_name', TEMPLATE)
      .order('created_at', { ascending: false })

    // Dedupe send_log by message_id → latest status
    const latestByMsg = new Map<string, any>()
    for (const s of sends || []) {
      if (!s.message_id) { latestByMsg.set(s.recipient_email + '|' + s.created_at, s); continue }
      const cur = latestByMsg.get(s.message_id)
      if (!cur || cur.created_at < s.created_at) latestByMsg.set(s.message_id, s)
    }
    // Index sends by lowercased email
    const sendsByEmail = new Map<string, any[]>()
    for (const s of latestByMsg.values()) {
      const e = (s.recipient_email || '').toLowerCase()
      if (!e) continue
      const arr = sendsByEmail.get(e) || []
      arr.push(s)
      sendsByEmail.set(e, arr)
    }

    // 3. Stopped cohort: emails that unsubscribed/purchased ebook/subscribed to challenge
    const seqEmails = Array.from(new Set((seq || []).map((r: any) => (r.email || '').toLowerCase()).filter(Boolean)))
    const [{ data: unsubs }, { data: purchases }, { data: subs }] = await Promise.all([
      admin.from('suppressed_emails').select('email').in('email', seqEmails),
      admin.from('ebook_purchases').select('email, purchased_at').in('email', seqEmails),
      admin.from('subscribers').select('email, subscribed').in('email', seqEmails),
    ])
    const unsubSet = new Set((unsubs || []).map((r: any) => r.email.toLowerCase()))
    const purchaseSet = new Set((purchases || []).map((r: any) => r.email.toLowerCase()))
    const subSet = new Set((subs || []).filter((r: any) => r.subscribed).map((r: any) => r.email.toLowerCase()))

    // Also include leads whose sequence_log has unsubscribed_at
    for (const r of seq || []) {
      if (r.unsubscribed_at) unsubSet.add((r.email || '').toLowerCase())
    }

    // 4. Compute per-day stats
    const days = Array.from({ length: MAX_DAY }, (_, i) => i + 1).map((day) => ({
      day,
      sent: 0,
      delivered: 0,
      rejected: 0,
      pending: 0,
      opened: 0,
      clicked: 0,
      stopped_unsubscribed: 0,
      stopped_ebook: 0,
      stopped_challenge: 0,
    }))

    // Track per-lead max day to attribute stopped
    const maxDayByEmail = new Map<string, number>()

    for (const row of seq || []) {
      const day = row.day_number
      if (!day || day < 1 || day > MAX_DAY) continue
      const bucket = days[day - 1]
      const emailLc = (row.email || '').toLowerCase()
      bucket.sent += 1
      if (row.opened_at) bucket.opened += 1
      if (row.clicked_at) bucket.clicked += 1

      // Correlate delivery via send_log: find send with created_at near sent_at (±60 min window)
      const sentAt = row.sent_at ? new Date(row.sent_at).getTime() : 0
      const candidates = sendsByEmail.get(emailLc) || []
      let best: any = null
      let bestDelta = Infinity
      for (const s of candidates) {
        const d = Math.abs(new Date(s.created_at).getTime() - sentAt)
        if (d < 60 * 60 * 1000 && d < bestDelta) { best = s; bestDelta = d }
      }
      if (best) {
        if (best.status === 'sent') bucket.delivered += 1
        else if (['dlq', 'failed', 'bounced', 'complained', 'suppressed'].includes(best.status)) bucket.rejected += 1
        else bucket.pending += 1
      } else {
        bucket.pending += 1
      }

      const prev = maxDayByEmail.get(emailLc) || 0
      if (day > prev) maxDayByEmail.set(emailLc, day)
    }

    // Attribute stopped to the last day the lead received
    for (const [emailLc, lastDay] of maxDayByEmail.entries()) {
      if (lastDay < 1 || lastDay > MAX_DAY) continue
      const bucket = days[lastDay - 1]
      if (unsubSet.has(emailLc)) bucket.stopped_unsubscribed += 1
      if (purchaseSet.has(emailLc)) bucket.stopped_ebook += 1
      if (subSet.has(emailLc)) bucket.stopped_challenge += 1
    }

    // Totals
    const totals = {
      unique_leads: maxDayByEmail.size,
      sent: days.reduce((a, d) => a + d.sent, 0),
      delivered: days.reduce((a, d) => a + d.delivered, 0),
      rejected: days.reduce((a, d) => a + d.rejected, 0),
      opened: days.reduce((a, d) => a + d.opened, 0),
      clicked: days.reduce((a, d) => a + d.clicked, 0),
      stopped_unsubscribed: unsubSet.size,
      stopped_ebook: purchaseSet.size,
      stopped_challenge: subSet.size,
    }

    return new Response(JSON.stringify({ days, totals }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('burnout-sequence-stats error', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
