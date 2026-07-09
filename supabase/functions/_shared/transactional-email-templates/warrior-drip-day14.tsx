/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { warriorName?: string; ctaUrl?: string; language?: 'ro' | 'en' }

const Email = ({ warriorName = 'Warrior', ctaUrl = '#', language = 'ro' }: Props) => {
  const en = language === 'en'
  return (
    <Html lang={language} dir="ltr">
      <Head />
      <Preview>{en ? 'Two weeks in. Time to go deeper.' : 'Două săptămâni. E momentul să mergi mai adânc.'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>⚡ DAY 14 · LEVEL UP</Text>
          <Heading style={h1}>{en ? `${warriorName}, you're built different now` : `${warriorName}, ești diferit acum`}</Heading>
          <Text style={p}>
            {en
              ? 'Two weeks of daily execution changes the operator, not just the operation. Now unlock the strategic layer: Vision Board 2026, Belief Reprogrammer, and long-horizon Domino planning.'
              : 'Două săptămâni de execuție zilnică schimbă operatorul, nu doar operațiunea. Acum deblochează stratul strategic: Vision Board 2026, Belief Reprogrammer și planificarea Domino pe orizont lung.'}
          </Text>
          <Section style={card}>
            <Text style={cardText}>
              {en ? 'Basic → Pro upgrade unlocks: 1-year Vision · Belief root-cause protocol · Deep-dive Stack sessions.' : 'Upgrade Basic → Pro deblochează: Viziunea pe 1 an · Protocol Belief root-cause · Sesiuni Stack Deep-dive.'}
            </Text>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Button href={ctaUrl} style={cta}>{en ? 'See Pro →' : 'Vezi Pro →'}</Button>
            </div>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>CEO Mind OS</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => d.language === 'en' ? '⚡ Day 14: Unlock the strategic layer' : '⚡ Ziua 14: Deblochează stratul strategic',
  displayName: 'Warrior Drip · Day 14',
  previewData: { warriorName: 'Disciplined', ctaUrl: 'https://example.com/upgrade', language: 'ro' },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container: React.CSSProperties = { maxWidth: 600, margin: '0 auto', padding: '32px 24px' }
const eyebrow: React.CSSProperties = { color: '#D4A84A', fontSize: 11, letterSpacing: 2, fontWeight: 700, margin: 0 }
const h1: React.CSSProperties = { color: '#0B1733', fontSize: 28, fontWeight: 800, margin: '12px 0 16px', lineHeight: 1.25 }
const p: React.CSSProperties = { color: '#2d3748', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px' }
const card: React.CSSProperties = { backgroundColor: '#f7f9fc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, margin: '16px 0' }
const cardText: React.CSSProperties = { color: '#2d3748', fontSize: 15, lineHeight: 1.6, margin: 0, textAlign: 'center' }
const cta: React.CSSProperties = { backgroundColor: '#D4A84A', color: '#0B1733', padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-block' }
const hr: React.CSSProperties = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer: React.CSSProperties = { color: '#718096', fontSize: 12, textAlign: 'center', margin: 0 }
