import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  daysLeft?: number
  upgradeUrl?: string
}

const TrialReminderEmail = ({ name, language = 'ro', daysLeft = 2, upgradeUrl = 'https://ceomindos.com/pricing' }: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? `Mai ai ${daysLeft} zile de trial` : `${daysLeft} days left in your trial`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Războinicule'}, mai ai ${daysLeft} zile` : `${name || 'Founder'}, ${daysLeft} days left`}</Heading>
          <Text style={text}>
            {ro
              ? 'Trial-ul tău se apropie de final. Vestea bună: nu trebuie să faci nimic — abonamentul continuă automat și accesul rămâne neîntrerupt.'
              : 'Your trial ends soon. The good news: you don\'t need to do anything — your subscription continues automatically and access stays uninterrupted.'}
          </Text>
          <Section style={box}>
            <Text style={boxTitle}>{ro ? '🔥 Ce ai deblocat până acum:' : '🔥 What you\'ve unlocked so far:'}</Text>
            <Text style={boxItem}>✓ {ro ? 'Rutina Războinicului (Body, Being, Balance, Business)' : 'Warrior Routine (Body, Being, Balance, Business)'}</Text>
            <Text style={boxItem}>✓ {ro ? 'Domino Door — planificare săptămânală strategică' : 'Domino Door — strategic weekly planning'}</Text>
            <Text style={boxItem}>✓ {ro ? 'Mind Coach + Stack-uri (Kill It Today, Anger, Mentalitate)' : 'Mind Coach + Stacks (Kill It Today, Anger, Mindset)'}</Text>
          </Section>
          <Button href={upgradeUrl} style={btn}>{ro ? '👉 Vezi planul tău' : '👉 View your plan'}</Button>
          <Hr style={hr} />
          <Text style={smallText}>
            {ro
              ? 'Nu vrei să continui? Anulează oricând din Setări → Membership, fără taxe.'
              : 'Not continuing? Cancel anytime from Settings → Membership, no fees.'}
          </Text>
          <Text style={footerText}>— Alin F. Radu, CEO Mind OS</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TrialReminderEmail,
  subject: (d: any) => d?.language === 'en'
    ? `${d?.daysLeft || 2} days left in your CEO Mind OS trial`
    : `Mai ai ${d?.daysLeft || 2} zile de trial CEO Mind OS`,
  displayName: 'Trial reminder',
  previewData: { name: 'Alex', language: 'ro', daysLeft: 2 },
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
const smallText = { fontSize: '13px', color: '#6b7280', margin: '0 25px 8px', lineHeight: '1.5' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '16px 25px 24px' }
