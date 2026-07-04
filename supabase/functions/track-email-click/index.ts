import { createClient } from 'npm:@supabase/supabase-js@2'

// Only redirect to trusted destinations. Everything else falls back to home.
const ALLOWED_HOSTS = new Set<string>([
  'ceomindos.com',
  'www.ceomindos.com',
  'warriorsos.com',
  'www.warriorsos.com',
  'my-life-path-guide.lovable.app',
  'id-preview--1b85e6e6-2e97-41b8-bd1d-ef174e3bfcde.lovable.app',
])

const FALLBACK = 'https://ceomindos.com'

function safeTarget(dest: string | null): string {
  if (!dest) return FALLBACK
  try {
    const url = new URL(dest)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return FALLBACK
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return FALLBACK
    return url.toString()
  } catch {
    return FALLBACK
  }
}

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

    const target = safeTarget(dest)
    return new Response(null, { status: 302, headers: { Location: target, 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('track-email-click error', e)
    return new Response(null, { status: 302, headers: { Location: FALLBACK } })
  }
})
