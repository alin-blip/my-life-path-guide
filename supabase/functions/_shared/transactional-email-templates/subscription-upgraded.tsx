import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  tier?: string
  dashboardUrl?: string
}

const tierLabel = (tier: string, ro: boolean) => {
  const map: Record<string, [string, string]> = {
    basic: ['Basic', 'Basic'],
    pro: ['Pro', 'Pro'],
    elite: ['Elite', 'Elite'],
    accelerator: ['Warrior Accelerator', 'Warrior Accelerator'],
    lifetime: ['Lifetime', 'Lifetime'],
  }
  const [ roLabel, enLabel ] = map[tier] || [tier, tier]
  return ro ? roLabel : enLabel
}

const UpgradedEmail = ({ name, language = 'ro', tier = 'pro', dashboardUrl = 'https://ceomindos.com/dashboard' }: Props) => {
  const ro = language === 'ro'
  const label = tierLabel(tier, ro)
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? `Plan ${label} activ 🎉` : `${label} plan active 🎉`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Războinicule'}, plan ${label} activ 🎉` : `${name || 'Founder'}, ${label} plan is active 🎉`}</Heading>
          <Text style={text}>
            {ro
              ? 'Plata a fost confirmată. Ai acces complet la toate modulele CEO Mind OS și la actualizările viitoare — fără interupere.'
              : 'Your payment is confirmed. You have full access to every CEO Mind OS module and all future updates — with no interruption.'}
          </Text>
          <Section style={box}>
            <Text style={boxTitle}>{ro ? '⚡ Sugestie pentru azi:' : '⚡ Suggestion for today:'}</Text>
            <Text style={boxItem}>{ro ? '• Rulează Rutina Războinicului completă (15 min)' : '• Run the full Warrior Routine (15 min)'}</Text>
            <Text style={boxItem}>{ro ? '• Setează 1 Domino pentru săptămâna asta' : '• Set 1 Domino for this week'}</Text>
            <Text style={boxItem}>{ro ? '• Deschide Mind Coach pentru primul stack' : '• Open Mind Coach for your first stack'}</Text>
          </Section>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 Deschide Dashboard' : '👉 Open Dashboard'}</Button>
          <Hr style={hr} />
          <Text style={smallText}>{ro ? 'Factura este disponibilă în Setări → Membership → Istoric plăți.' : 'Your invoice is available in Settings → Membership → Payment history.'}</Text>
          <Text style={footerText}>— Alin F. Radu, CEO Mind OS</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: UpgradedEmail,
  subject: (d: any) => d?.language === 'en'
    ? `${tierLabel(d?.tier || 'pro', false)} plan is now active`
    : `Plan ${tierLabel(d?.tier || 'pro', true)} activ`,
  displayName: 'Subscription upgraded / active',
  previewData: { name: 'Alex', language: 'ro', tier: 'pro' },
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
