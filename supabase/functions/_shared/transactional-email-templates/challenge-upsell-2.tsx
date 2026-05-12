import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; language?: 'ro' | 'en'; trackingId?: string }
const FN = 'https://exsbnfmaadjyfblperas.supabase.co/functions/v1'
const trackUrl = (u: string, t?: string) => t ? `${FN}/track-email-click?t=${t}&u=${encodeURIComponent(u)}` : u
const pixelUrl = (t?: string) => t ? `${FN}/track-email-open?t=${t}` : ''

const Email = ({ name, language = 'ro', trackingId }: Props) => {
  const ro = language === 'ro'
  const baseUrl = ro ? 'https://ceomindos.com/ebook-upsell' : 'https://ceomindos.com/ebook-upsell-en'
  const url = trackUrl(baseUrl, trackingId)
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Last call pentru 14 zile PRO gratuit' : 'Last call for 14 days PRO free'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Hei'}, ultima dată...` : `${name || 'Hey'}, last time...`}</Heading>
          <Text style={text}>
            {ro
              ? 'Acum 3 zile ți-ai luat cartea. Felicitări — ești în top 10% care chiar acționează.'
              : '3 days ago you got the book. Congrats — you\'re in the top 10% who actually take action.'}
          </Text>
          <Text style={text}>
            {ro
              ? 'Dar harta singură nu te duce nicăieri fără pași. Challenge-ul de 7 zile e ghidul de implementare — și are 14 zile PRO gratuit incluse.'
              : 'But a map alone takes you nowhere without steps. The 7-day Challenge is the implementation guide — with 14 days PRO free included.'}
          </Text>
          <Section style={urgency}>
            <Text style={urgencyText}>
              {ro ? '⏰ Nu îți mai scriu despre Challenge. După azi, ofertă standard.' : '⏰ Last email about the Challenge. After today, standard pricing.'}
            </Text>
          </Section>
          <Button href={url} style={btn}>{ro ? '👉 Da, vreau Challenge-ul + 14 zile PRO' : '👉 Yes, I want the Challenge + 14d PRO'}</Button>
          <Text style={footerText}>{ro ? '— Alin' : '— Alin'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? 'Last call: 14 days PRO free with the Challenge' : 'Last call: 14 zile PRO gratuit cu Challenge-ul',
  displayName: 'Challenge upsell 2 (72h)',
  previewData: { name: 'Alex', language: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const urgency = { backgroundColor: '#fef3c7', border: '1px solid #fbbf24', padding: '14px 20px', margin: '16px 25px', borderRadius: '8px' }
const urgencyText = { fontSize: '15px', color: '#10172d', fontWeight: 'bold', margin: 0 }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
