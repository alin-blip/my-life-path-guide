import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  dashboardUrl?: string
}

const WelcomeEmail = ({ name, language = 'ro', dashboardUrl = 'https://ceomindos.com/dashboard' }: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Bine ai venit în CEO Mind OS 👑' : 'Welcome to CEO Mind OS 👑'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `Bine ai venit, ${name || 'războinicule'} 👑` : `Welcome, ${name || 'founder'} 👑`}</Heading>
          <Text style={text}>
            {ro
              ? 'Sistemul tău personal de operare ca CEO este activ. În următoarele 5 minute îți setezi Vision-ul anual și Rutina Războinicului — restul se construiește zi cu zi.'
              : "Your personal CEO operating system is live. In the next 5 minutes you'll set your annual Vision and Warrior Routine — the rest builds day by day."}
          </Text>
          <Section style={box}>
            <Text style={boxTitle}>{ro ? '🎯 Pașii tăi:' : '🎯 Your steps:'}</Text>
            <Text style={boxItem}>{ro ? '1. Setează obiectivele anuale (Corp, Spiritualitate, Relații, Business)' : '1. Set annual goals (Body, Being, Balance, Business)'}</Text>
            <Text style={boxItem}>{ro ? '2. Începe Rutina Războinicului dimineața' : '2. Start the Warrior Routine in the morning'}</Text>
            <Text style={boxItem}>{ro ? '3. Planifică săptămâna prin Domino Door' : '3. Plan the week with Domino Door'}</Text>
          </Section>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 Deschide Dashboard' : '👉 Open Dashboard'}</Button>
          <Hr style={hr} />
          <Text style={footerText}>{ro ? '— Alin F. Radu, Fondator CEO Mind OS' : '— Alin F. Radu, Founder CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeEmail,
  subject: (d: any) => d?.language === 'en' ? 'Welcome to CEO Mind OS 👑' : 'Bine ai venit în CEO Mind OS 👑',
  displayName: 'Welcome (new signup)',
  previewData: { name: 'Alex', language: 'ro' },
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
