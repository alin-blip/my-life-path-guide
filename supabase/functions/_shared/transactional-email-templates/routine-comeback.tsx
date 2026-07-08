import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  daysMissed?: number
  lastStreak?: number
  dashboardUrl?: string
}

const RoutineComebackEmail = ({
  name,
  language = 'ro',
  daysMissed = 3,
  lastStreak = 0,
  dashboardUrl = 'https://ceomindos.com/daily-flow',
}: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Rutina te așteaptă — 5 minute azi ajung' : 'The routine is waiting — 5 minutes is enough today'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Războinicule'}, ne vedem înapoi în ring?` : `${name || 'Warrior'}, ready to step back in?`}</Heading>
          <Text style={text}>
            {ro
              ? `Au trecut ${daysMissed} zile de la ultima rutină. Nu-i judecată — e realitate. Războinicii nu sunt cei care nu cad, ci cei care se ridică.`
              : `It's been ${daysMissed} days since your last routine. No judgment — just reality. Warriors aren't those who never fall, but those who get back up.`}
          </Text>
          {lastStreak > 0 && (
            <Section style={box}>
              <Text style={boxTitle}>{ro ? '📊 Ultimul streak:' : '📊 Last streak:'}</Text>
              <Text style={boxItem}>{ro ? `${lastStreak} zile consecutive — dovadă că poți.` : `${lastStreak} days in a row — proof you can.`}</Text>
            </Section>
          )}
          <Text style={text}>
            {ro
              ? 'Azi nu trebuie perfecțiune. Un singur pas: deschide rutina, fă un item. Restul vine.'
              : "Today doesn't need perfection. Just one step: open the routine, do one item. The rest follows."}
          </Text>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 5 minute — Start' : '👉 5 minutes — Start'}</Button>
          <Hr style={hr} />
          <Text style={footerText}>{ro ? '— Alin F. Radu, Fondator CEO Mind OS' : '— Alin F. Radu, Founder CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: RoutineComebackEmail,
  subject: (d: any) => d?.language === 'en'
    ? '⚡ The routine is waiting — 5 minutes is enough'
    : '⚡ Rutina te așteaptă — 5 minute ajung',
  displayName: 'Routine comeback (3+ days missed)',
  previewData: { name: 'Alex', language: 'ro', daysMissed: 4, lastStreak: 12 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBand = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const box = { backgroundColor: '#f9fafb', padding: '20px', margin: '16px 25px', borderRadius: '12px', border: '1px solid #fbbf24' }
const boxTitle = { fontSize: '15px', fontWeight: 'bold', color: '#10172d', margin: '0 0 8px' }
const boxItem = { fontSize: '14px', color: '#374151', margin: '4px 0', lineHeight: '1.5' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
