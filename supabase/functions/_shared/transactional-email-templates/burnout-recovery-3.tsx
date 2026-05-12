import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; language?: 'ro' | 'en' }

const Email = ({ name, language = 'ro' }: Props) => {
  const ro = language === 'ro'
  const url = ro ? 'https://ceomindos.com/ebook' : 'https://ceomindos.com/ebook-en'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Ultima dată când îți scriu despre asta' : 'Last time I write to you about this'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Hei'}, fii sincer cu tine` : `${name || 'Hey'}, be honest with yourself`}</Heading>
          <Text style={text}>
            {ro
              ? 'Acum 3 zile ai făcut testul. Dacă scorul tău era bun, nu ai mai citi asta.'
              : '3 days ago you took the test. If your score was good, you wouldn\'t still be reading this.'}
          </Text>
          <Text style={text}>
            {ro
              ? 'Adevărul e că știi exact ce nu funcționează. Doar că nu ai un sistem să schimbi.'
              : 'Truth is you know exactly what isn\'t working. You just don\'t have a system to change it.'}
          </Text>
          <Text style={text}>
            {ro
              ? 'Cartea ăsta îți dă sistemul. 27 LEI, garanție 30 zile. Dacă nu vezi rezultate în prima săptămână, banii înapoi.'
              : 'This book gives you the system. $9, 30-day guarantee. If you don\'t see results in week one, money back.'}
          </Text>
          <Section style={urgency}>
            <Text style={urgencyText}>
              {ro ? '⏰ Nu îți mai scriu despre asta. Decide tu.' : '⏰ I won\'t write again about this. Your call.'}
            </Text>
          </Section>
          <Button href={url} style={btn}>{ro ? '👉 OK, iau cartea — 27 LEI' : '👉 OK, I\'ll get it — $9'}</Button>
          <Text style={footerText}>{ro ? '— Alin' : '— Alin'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? 'Last email about this — your call' : 'Ultimul email despre asta — decide tu',
  displayName: 'Burnout recovery 3 (72h)',
  previewData: { name: 'Alex', language: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const urgency = { backgroundColor: '#fef3c7', border: '1px solid #fbbf24', padding: '14px 20px', margin: '16px 25px', borderRadius: '8px' }
const urgencyText = { fontSize: '15px', color: '#10172d', fontWeight: 'bold', margin: 0 }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '16px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
