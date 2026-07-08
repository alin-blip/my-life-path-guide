/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  warriorName?: string
  magicLink?: string
  language?: 'ro' | 'en'
}

const Email = ({ warriorName = 'Warrior', magicLink = '#', language = 'ro' }: Props) => {
  const en = language === 'en'
  return (
    <Html lang={language} dir="ltr">
      <Head />
      <Preview>{en ? 'Your Warrior routine is live — jump in' : 'Rutina ta Warrior e activă — intră acum'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center', padding: '24px 0' }}>
            <Text style={eyebrow}>⚔️ WELCOME, WARRIOR</Text>
            <Heading style={h1}>
              {en ? `You're in, ${warriorName}!` : `Ești înăuntru, ${warriorName}!`}
            </Heading>
            <Text style={sub}>
              {en
                ? 'Your 7-day trial has started and your personalized routine is now active.'
                : 'Trialul de 7 zile a pornit și rutina ta personalizată e activă acum.'}
            </Text>
          </Section>

          <Section style={card}>
            <Text style={cardText}>
              {en
                ? 'Tap below to open your account and start your first Daily Flow session.'
                : 'Apasă mai jos ca să-ți deschizi contul și să pornești prima sesiune Daily Flow.'}
            </Text>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button href={magicLink} style={cta}>
                {en ? 'Open my routine →' : 'Deschide rutina mea →'}
              </Button>
            </div>
          </Section>

          <Hr style={hr} />

          <Section>
            <Heading as="h3" style={h3}>{en ? 'What happens next' : 'Ce urmează'}</Heading>
            <Text style={bullet}>
              {en ? '· Day 1-7: Free trial — full access.' : '· Ziua 1-7: Trial gratuit — acces complet.'}
            </Text>
            <Text style={bullet}>
              {en ? '· Day 8: Automatic charge €7/month. Cancel anytime.' : '· Ziua 8: Charge automat 7€/lună. Anulezi oricând.'}
            </Text>
            <Text style={bullet}>
              {en ? '· Any day: Adjust or pause from Settings.' : '· Orice zi: Ajustezi sau pui pauză din Setări.'}
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            {en ? 'CEO Mind OS · The Founder Operating System' : 'CEO Mind OS · Sistemul de operare al fondatorului'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data.language === 'en'
      ? `⚔️ Welcome ${data.warriorName || 'Warrior'} — your routine is live`
      : `⚔️ Bun venit ${data.warriorName || 'Warrior'} — rutina ta e activă`,
  displayName: 'Warrior Welcome',
  previewData: { warriorName: 'Disciplined', magicLink: 'https://example.com', language: 'ro' },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }
const eyebrow: React.CSSProperties = { color: '#D4A84A', fontSize: '11px', letterSpacing: '2px', fontWeight: 700, margin: 0 }
const h1: React.CSSProperties = { color: '#0B1733', fontSize: '30px', fontWeight: 800, margin: '12px 0 8px', lineHeight: 1.2 }
const sub: React.CSSProperties = { color: '#4a5568', fontSize: '16px', margin: 0 }
const card: React.CSSProperties = { backgroundColor: '#f7f9fc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', margin: '20px 0' }
const cardText: React.CSSProperties = { color: '#2d3748', fontSize: '15px', lineHeight: 1.6, margin: 0, textAlign: 'center' }
const cta: React.CSSProperties = { backgroundColor: '#D4A84A', color: '#0B1733', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px', display: 'inline-block' }
const h3: React.CSSProperties = { color: '#0B1733', fontSize: '18px', fontWeight: 700, margin: '8px 0 12px' }
const bullet: React.CSSProperties = { color: '#2d3748', fontSize: '14px', margin: '6px 0', lineHeight: 1.5 }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { color: '#718096', fontSize: '12px', textAlign: 'center', margin: 0 }
