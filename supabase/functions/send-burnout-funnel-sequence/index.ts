import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = Date.now()
  const stats = { recovery1: 0, recovery2: 0, recovery3: 0, upsell1: 0, upsell2: 0 }

  const send = async (template: string, email: string, data: Record<string, any>, idemKey: string) => {
    try {
      await supabase.functions.invoke('send-transactional-email', {
        body: { templateName: template, recipientEmail: email, idempotencyKey: idemKey, templateData: data },
      })
      return true
    } catch (e) {
      console.error('send fail', template, email, e)
      return false
    }
  }

  // === BURNOUT RECOVERY (leads who did test, didn't buy book) ===
  const { data: leads } = await supabase
    .from('email_leads')
    .select('id, email, name, created_at, metadata')
    .eq('lead_magnet', 'burnout_test')
    .eq('subscribed', true)
    .gte('created_at', new Date(now - 5 * 24 * 3600 * 1000).toISOString())

  for (const lead of leads || []) {
    const email = lead.email.toLowerCase()
    // Check if bought
    const { data: purchase } = await supabase
      .from('ebook_purchases')
      .select('id')
      .ilike('email', email)
      .maybeSingle()
    if (purchase) continue

    const ageHours = (now - new Date(lead.created_at).getTime()) / 3600000
    const language = (lead.metadata as any)?.language === 'en' ? 'en' : 'ro'
    const name = lead.name || ''

    // Check sequence log
    const { data: sent } = await supabase
      .from('email_sequence_log')
      .select('day_number')
      .eq('email', email)
      .eq('sequence_type', 'burnout_recovery')

    const sentDays = new Set((sent || []).map(s => s.day_number))

    let target: number | null = null
    let template = ''
    if (ageHours >= 24 && ageHours < 48 && !sentDays.has(1)) { target = 1; template = 'burnout-recovery-1' }
    else if (ageHours >= 48 && ageHours < 72 && !sentDays.has(2)) { target = 2; template = 'burnout-recovery-2' }
    else if (ageHours >= 72 && !sentDays.has(3)) { target = 3; template = 'burnout-recovery-3' }

    if (target && template) {
      const ok = await send(template, email, { name, language }, `${template}-${lead.id}`)
      if (ok) {
        await supabase.from('email_sequence_log').insert({
          lead_id: lead.id, email, sequence_type: 'burnout_recovery', day_number: target,
        })
        stats[`recovery${target}` as 'recovery1'] += 1
      }
    }
  }

  // === CHALLENGE UPSELL (bought book, didn't upgrade) ===
  const { data: purchases } = await supabase
    .from('ebook_purchases')
    .select('id, email, name, language, purchased_at, upsell_purchased_at, upsell_email_1_sent_at, upsell_email_2_sent_at')
    .is('upsell_purchased_at', null)
    .gte('purchased_at', new Date(now - 7 * 24 * 3600 * 1000).toISOString())

  for (const p of purchases || []) {
    const ageHours = (now - new Date(p.purchased_at).getTime()) / 3600000
    if (ageHours >= 24 && ageHours < 72 && !p.upsell_email_1_sent_at) {
      const ok = await send('challenge-upsell-1', p.email, { name: p.name || '', language: p.language }, `upsell-1-${p.id}`)
      if (ok) {
        await supabase.from('ebook_purchases').update({ upsell_email_1_sent_at: new Date().toISOString() }).eq('id', p.id)
        stats.upsell1 += 1
      }
    } else if (ageHours >= 72 && !p.upsell_email_2_sent_at) {
      const ok = await send('challenge-upsell-2', p.email, { name: p.name || '', language: p.language }, `upsell-2-${p.id}`)
      if (ok) {
        await supabase.from('ebook_purchases').update({ upsell_email_2_sent_at: new Date().toISOString() }).eq('id', p.id)
        stats.upsell2 += 1
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, stats }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
