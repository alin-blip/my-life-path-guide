import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'no auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'unauth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    if (!roles?.some((r: any) => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'leads'

    if (action === 'leads') {
      const limit = parseInt(url.searchParams.get('limit') || '200')
      const search = url.searchParams.get('search')?.toLowerCase() || ''

      let q = admin.from('email_leads').select('id, email, name, created_at, metadata').eq('lead_magnet', 'burnout_test').order('created_at', { ascending: false }).limit(limit)
      if (search) q = q.ilike('email', `%${search}%`)
      const { data: leads } = await q

      const emails = (leads || []).map((l: any) => l.email.toLowerCase())
      const [{ data: purchases }, { data: subs }, { data: seq }] = await Promise.all([
        admin.from('ebook_purchases').select('email, purchased_at, upsell_purchased_at, upsell_email_1_sent_at, upsell_email_2_sent_at').in('email', emails),
        admin.from('subscribers').select('email, subscribed, subscription_tier, subscription_status').in('email', emails),
        admin.from('email_sequence_log').select('email, sequence_type, day_number, sent_at, opened_at, clicked_at').in('email', emails),
      ])

      const byEmail = (arr: any[] | null, k = 'email') => {
        const m = new Map<string, any[]>()
        for (const r of arr || []) {
          const e = r[k]?.toLowerCase()
          if (!e) continue
          const cur = m.get(e) || []
          cur.push(r)
          m.set(e, cur)
        }
        return m
      }
      const purMap = byEmail(purchases)
      const subMap = byEmail(subs)
      const seqMap = byEmail(seq)

      const enriched = (leads || []).map((l: any) => {
        const e = l.email.toLowerCase()
        const purs = purMap.get(e) || []
        const sbs = subMap.get(e) || []
        const sqs = (seqMap.get(e) || []).sort((a, b) => (b.sent_at || '').localeCompare(a.sent_at || ''))
        const opens = sqs.filter(s => s.opened_at).length
        const clicks = sqs.filter(s => s.clicked_at).length
        const recoveries = sqs.filter(s => s.sequence_type === 'burnout_recovery').length
        const upsells = sqs.filter(s => s.sequence_type === 'challenge_upsell').length
        const challenge = sbs.find(s => s.subscribed)
        return {
          id: l.id,
          email: l.email,
          name: l.name,
          language: l.metadata?.language || 'ro',
          quiz_at: l.created_at,
          book_purchased_at: purs[0]?.purchased_at || null,
          upsell_purchased_at: purs[0]?.upsell_purchased_at || null,
          challenge_subscribed: !!challenge,
          challenge_tier: challenge?.subscription_tier || null,
          recoveries_sent: recoveries,
          upsells_sent: upsells,
          opens, clicks,
          last_sequence: sqs[0] || null,
        }
      })
      return new Response(JSON.stringify({ leads: enriched }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'history') {
      const email = (url.searchParams.get('email') || '').toLowerCase()
      if (!email) return new Response(JSON.stringify({ error: 'no email' }), { status: 400, headers: corsHeaders })
      const [{ data: seq }, { data: sends }] = await Promise.all([
        admin.from('email_sequence_log').select('*').ilike('email', email).order('sent_at', { ascending: false }),
        admin.from('email_send_log').select('id, message_id, template_name, status, error_message, created_at').ilike('recipient_email', email).order('created_at', { ascending: false }).limit(100),
      ])
      // dedupe sends by message_id (latest)
      const dedup = new Map<string, any>()
      for (const s of sends || []) {
        if (!s.message_id) { dedup.set(s.id, s); continue }
        const e = dedup.get(s.message_id)
        if (!e || (s.created_at > e.created_at)) dedup.set(s.message_id, s)
      }
      return new Response(JSON.stringify({ sequence: seq || [], sends: Array.from(dedup.values()) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'summary') {
      const [{ count: totalLeads }, { count: totalBookBuyers }, { count: totalChallengeSubs }] = await Promise.all([
        admin.from('email_leads').select('id', { count: 'exact', head: true }).eq('lead_magnet', 'burnout_test'),
        admin.from('ebook_purchases').select('id', { count: 'exact', head: true }),
        admin.from('subscribers').select('id', { count: 'exact', head: true }).eq('subscribed', true),
      ])
      const { data: seqAgg } = await admin.from('email_sequence_log').select('sequence_type, day_number, opened_at, clicked_at')
      const totals = {
        sent: seqAgg?.length || 0,
        opened: seqAgg?.filter((s: any) => s.opened_at).length || 0,
        clicked: seqAgg?.filter((s: any) => s.clicked_at).length || 0,
        recovery_sent: seqAgg?.filter((s: any) => s.sequence_type === 'burnout_recovery').length || 0,
        upsell_sent: seqAgg?.filter((s: any) => s.sequence_type === 'challenge_upsell').length || 0,
      }
      return new Response(JSON.stringify({ totalLeads, totalBookBuyers, totalChallengeSubs, ...totals }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400, headers: corsHeaders })
  } catch (e) {
    console.error('funnel-leads-dashboard error', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
