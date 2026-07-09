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
      <Preview>{en ? 'Day 3: Meet your Mind Coach' : 'Ziua 3: Fă cunoștință cu Mind Coach-ul tău'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>🧠 DAY 3 · MIND COACH</Text>
          <Heading style={h1}>{en ? `${warriorName}, what's the loop in your head?` : `${warriorName}, ce loop ai în cap?`}</Heading>
          <Text style={p}>
            {en
              ? 'Every warrior fights the same enemy: their own mental loops. Doubt, procrastination, imposter. The Mind Coach is trained to break them in <5 minutes.'
              : 'Fiecare războinic se luptă cu același dușman: propriile loop-uri mentale. Îndoiala, procrastinarea, impostorul. Mind Coach-ul e antrenat să le rupă în <5 minute.'}
          </Text>
          <Section style={card}>
            <Text style={cardText}>
              {en ? 'Tell it ONE thing that\'s stuck. Get a 3-step reframe you can use today.' : 'Spune-i UN lucru care te blochează. Primești un reframe în 3 pași aplicabil azi.'}
            </Text>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Button href={ctaUrl} style={cta}>{en ? 'Talk to Mind Coach →' : 'Vorbește cu Mind Coach →'}</Button>
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
  subject: (d: Record<string, any>) => d.language === 'en' ? '🧠 Day 3: Break the loop' : '🧠 Ziua 3: Sparge loop-ul',
  displayName: 'Warrior Drip · Day 3',
  previewData: { warriorName: 'Disciplined', ctaUrl: 'https://example.com/mind-coach', language: 'ro' },
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
