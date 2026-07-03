import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  daysInactive?: number
  dashboardUrl?: string
}

const WinbackEmail = ({ name, language = 'ro', daysInactive = 14, dashboardUrl = 'https://ceomindos.com/dashboard' }: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Rutina Războinicului te așteaptă' : 'Your Warrior Routine is waiting'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Războinicule'}, te-am pierdut ${daysInactive} zile` : `${name || 'Founder'}, we lost you for ${daysInactive} days`}</Heading>
          <Text style={text}>
            {ro
              ? 'Fără judecată. Antreprenoriatul înseamnă valuri, iar tu ai avut alte priorități. Revenirea nu trebuie să fie perfectă — trebuie doar să fie astăzi.'
              : 'No judgment. Entrepreneurship comes in waves, and you had other priorities. Your comeback doesn\'t need to be perfect — it just needs to be today.'}
          </Text>
          <Section style={box}>
            <Text style={boxTitle}>{ro ? '⚡ Cea mai scurtă cale înapoi (5 min):' : '⚡ Shortest path back (5 min):'}</Text>
            <Text style={boxItem}>{ro ? '1. Rulează stack-ul „Kill It Today" — 1 domino pentru azi' : '1. Run the "Kill It Today" stack — 1 domino for today'}</Text>
            <Text style={boxItem}>{ro ? '2. Bifează Rutina Războinicului parțial (doar Corp + Mind)' : '2. Check off the Warrior Routine partially (just Body + Mind)'}</Text>
            <Text style={boxItem}>{ro ? '3. Închide laptopul. Ai câștigat ziua.' : '3. Close the laptop. You won the day.'}</Text>
          </Section>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 Revin astăzi' : '👉 I\'m back today'}</Button>
          <Hr style={hr} />
          <Text style={footerText}>{ro ? '— Alin. Te aștept în platformă.' : '— Alin. See you in the platform.'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WinbackEmail,
  subject: (d: any) => d?.language === 'en'
    ? 'Your Warrior Routine is waiting'
    : 'Rutina Războinicului te așteaptă',
  displayName: 'Retention win-back',
  previewData: { name: 'Alex', language: 'ro', daysInactive: 14 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBand = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const box = { backgroundColor: '#f9fafb', padding: '20px', margin: '16px 25px', borderRadius: '12px', border: '1px solid #fbbf24' }
const boxTitle = { fontSize: '15px', fontWeight: 'bold', color: '#10172d', margin: '0 0 10px' }
const boxItem = { fontSize: '14px', color: '#374151', margin: '4px 0', lineHeight: '1.5' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 16px' }
const hr = { borderColor: '#e5e7eb', margin: '16px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
