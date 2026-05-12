import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  ebookUrl?: string
  audiobookUrl?: string
}

const Email = ({ name, language = 'ro', ebookUrl = '', audiobookUrl = '' }: Props) => {
  const ro = language === 'ro'
  const upsellUrl = ro ? 'https://ceomindos.com/ebook-upsell' : 'https://ceomindos.com/ebook-upsell-en'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Cartea + Audiobook-ul tău sunt aici 🎉' : 'Your Book + Audiobook are here 🎉'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `Mulțumesc, ${name || 'antreprenor'}! 🎉` : `Thank you, ${name || 'founder'}! 🎉`}</Heading>
          <Text style={text}>
            {ro
              ? 'Plata e confirmată. Iată cele 2 linkuri de descărcare:'
              : 'Payment confirmed. Here are your 2 download links:'}
          </Text>
          <Section style={card}>
            <Text style={cardTitle}>📘 {ro ? 'Cartea (PDF)' : 'The Book (PDF)'}</Text>
            <Button href={ebookUrl} style={btn}>{ro ? 'Descarcă PDF' : 'Download PDF'}</Button>
          </Section>
          <Section style={card}>
            <Text style={cardTitle}>🎧 {ro ? 'Audiobook (MP3)' : 'Audiobook (MP3)'}</Text>
            <Button href={audiobookUrl} style={btnSecondary}>{ro ? 'Descarcă MP3' : 'Download MP3'}</Button>
          </Section>
          <Hr style={hr} />
          <Heading style={h2}>{ro ? '🎁 Bonus: Challenge 7 Zile + 14 zile PRO gratuit' : '🎁 Bonus: 7-Day Challenge + 14 days PRO free'}</Heading>
          <Text style={text}>
            {ro
              ? 'Cartea îți dă harta. Challenge-ul de 7 zile te ține de mână să o aplici — cu video zilnic, planning ghidat și acces la platformă.'
              : 'The book gives you the map. The 7-day Challenge holds your hand to apply it — daily video, guided planning, full platform access.'}
          </Text>
          <Button href={upsellUrl} style={btn}>{ro ? '👉 Vreau Challenge-ul' : '👉 I want the Challenge'}</Button>
          <Text style={footerText}>{ro ? '— Alin F. Radu, CEO Mind OS' : '— Alin F. Radu, CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? '🎉 Your Book + Audiobook are inside' : '🎉 Cartea + Audiobook-ul tău sunt aici',
  displayName: 'Ebook delivery',
  previewData: { name: 'Alex', language: 'ro', ebookUrl: 'https://drive.google.com/...', audiobookUrl: 'https://drive.google.com/...' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 12px' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: '#10172d', margin: '20px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const card = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '20px', margin: '12px 25px', borderRadius: '12px', textAlign: 'center' as const }
const cardTitle = { fontSize: '16px', fontWeight: 'bold', color: '#10172d', margin: '0 0 12px' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }
const btnSecondary = { backgroundColor: '#10172d', color: '#fbbf24', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
