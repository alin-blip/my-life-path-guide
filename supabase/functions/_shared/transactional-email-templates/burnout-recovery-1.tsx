import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; language?: 'ro' | 'en'; trackingId?: string }
const FN = 'https://exsbnfmaadjyfblperas.supabase.co/functions/v1'
const trackUrl = (u: string, t?: string) => t ? `${FN}/track-email-click?t=${t}&u=${encodeURIComponent(u)}` : u
const pixelUrl = (t?: string) => t ? `${FN}/track-email-open?t=${t}` : ''

const Email = ({ name, language = 'ro', trackingId }: Props) => {
  const ro = language === 'ro'
  const baseUrl = ro ? 'https://ceomindos.com/ebook' : 'https://ceomindos.com/ebook-en'
  const url = trackUrl(baseUrl, trackingId)
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Ai uitat ceva...' : 'You forgot something...'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Hei'}, ai văzut scorul...` : `${name || 'Hey'}, you saw your score...`}</Heading>
          <Text style={text}>
            {ro
              ? 'Acum 24 de ore ai aflat unde stai cu burnout-ul. Scorul nu minte. Întrebarea reală e: ce faci cu el?'
              : 'Yesterday you saw where you stand with burnout. The score doesn\'t lie. The real question is: what will you do about it?'}
          </Text>
          <Text style={text}>
            {ro
              ? 'Cei mai mulți antreprenori îl ignoră. Continuă să împingă. Și apoi se prăbușesc — într-un an, doi, cinci.'
              : 'Most founders ignore it. They keep pushing. Then they crash — in one, two, five years.'}
          </Text>
          <Text style={text}>
            {ro
              ? 'Cartea îți dă harta de ieșire. 27 LEI. Mai puțin decât prânzul.'
              : 'The book gives you the exit map. $9. Less than lunch.'}
          </Text>
          <Button href={url} style={btn}>{ro ? '👉 Iau cartea acum — 27 LEI' : '👉 Get the book now — $9'}</Button>
          <Text style={footerText}>{ro ? '— Alin' : '— Alin'}</Text>
          {trackingId && <Img src={pixelUrl(trackingId)} width="1" height="1" alt="" style={{ display: 'none' }} />}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? 'You saw your score. Now what?' : 'Ai văzut scorul. Acum ce faci?',
  displayName: 'Burnout recovery 1 (24h)',
  previewData: { name: 'Alex', language: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '16px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
