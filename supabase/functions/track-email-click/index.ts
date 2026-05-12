import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const trackingId = url.searchParams.get('t')
    const dest = url.searchParams.get('u')

    if (trackingId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      await supabase
        .from('email_sequence_log')
        .update({ clicked_at: new Date().toISOString() })
        .eq('tracking_id', trackingId)
        .is('clicked_at', null)
      console.log(`Email click: ${trackingId} -> ${dest}`)
    }

    const target = dest && /^https?:\/\//.test(dest) ? dest : 'https://ceomindos.com'
    return new Response(null, { status: 302, headers: { Location: target, 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('track-email-click error', e)
    return new Response(null, { status: 302, headers: { Location: 'https://ceomindos.com' } })
  }
})
