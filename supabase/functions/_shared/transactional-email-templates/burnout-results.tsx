import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  totalScore?: number
  bodyScore?: number
  beingScore?: number
  balanceScore?: number
  businessScore?: number
}

const interpret = (s: number, lang: 'ro' | 'en') => {
  if (s >= 75) return lang === 'ro' ? 'Excelent 🟢' : 'Excellent 🟢'
  if (s >= 50) return lang === 'ro' ? 'Bun, dar de îmbunătățit 🟡' : 'Good, room to improve 🟡'
  if (s >= 25) return lang === 'ro' ? 'Atenție — risc de burnout 🟠' : 'Caution — burnout risk 🟠'
  return lang === 'ro' ? 'Critic — burnout activ 🔴' : 'Critical — active burnout 🔴'
}

const BurnoutResultsEmail = ({ name, language = 'ro', totalScore = 0, bodyScore = 0, beingScore = 0, balanceScore = 0, businessScore = 0 }: Props) => {
  const ro = language === 'ro'
  const heading = ro ? `Rezultatele tale, ${name || 'antreprenor'}` : `Your results, ${name || 'founder'}`
  const sub = ro ? 'Iată unde te afli pe cei 4 piloni:' : 'Here is where you stand on the 4 pillars:'
  const ctaLabel = ro ? '👉 Vezi cartea — 27 LEI' : '👉 Get the book — $9'
  const url = ro ? 'https://ceomindos.com/ebook' : 'https://ceomindos.com/ebook-en'

  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? `Scor burnout: ${totalScore}/100` : `Burnout score: ${totalScore}/100`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{heading}</Heading>
          <Text style={text}>{sub}</Text>
          <Section style={scoreBox}>
            <Text style={bigScore}>{totalScore}/100</Text>
            <Text style={scoreLabel}>{interpret(totalScore, language)}</Text>
          </Section>
          <Hr style={hr} />
          <Pillar label={ro ? '💪 Body (Energie & Sănătate)' : '💪 Body (Energy & Health)'} score={bodyScore} lang={language} />
          <Pillar label={ro ? '🧠 Being (Mindset & Claritate)' : '🧠 Being (Mindset & Clarity)'} score={beingScore} lang={language} />
          <Pillar label={ro ? '⚖️ Balance (Relații & Timp)' : '⚖️ Balance (Relationships & Time)'} score={balanceScore} lang={language} />
          <Pillar label={ro ? '🚀 Business (Execuție & Cash)' : '🚀 Business (Execution & Cash)'} score={businessScore} lang={language} />
          <Hr style={hr} />
          <Heading style={h2}>{ro ? 'Următorul pas:' : 'Next step:'}</Heading>
          <Text style={text}>
            {ro
              ? 'Cartea „De la Burnout la Peak Performance" îți arată exact cum să refaci toți cei 4 piloni în 90 de zile — sistemul folosit de antreprenori care lucrează 60h/săptămână și încă au energie pentru familie.'
              : 'The book "From Burnout to Peak Performance" shows you exactly how to rebuild all 4 pillars in 90 days — the system used by founders working 60h/week who still have energy for family.'}
          </Text>
          <Button href={url} style={btn}>{ctaLabel}</Button>
          <Text style={footerText}>{ro ? '— Alin F. Radu, CEO Mind OS' : '— Alin F. Radu, CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const Pillar = ({ label, score, lang }: { label: string; score: number; lang: 'ro' | 'en' }) => (
  <Section style={{ margin: '12px 0' }}>
    <Text style={pillarLabel}>{label}</Text>
    <Text style={pillarScore}>{score}/100 — {interpret(score, lang)}</Text>
  </Section>
)

export const template = {
  component: BurnoutResultsEmail,
  subject: (d: any) => d?.language === 'en' ? `Your burnout score: ${d?.totalScore || 0}/100` : `Scorul tău burnout: ${d?.totalScore || 0}/100`,
  displayName: 'Burnout test results',
  previewData: { name: 'Alex', language: 'ro', totalScore: 42, bodyScore: 35, beingScore: 50, balanceScore: 40, businessScore: 45 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBand = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 8px' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: '#10172d', margin: '20px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const scoreBox = { textAlign: 'center' as const, backgroundColor: '#f9fafb', padding: '24px', margin: '16px 25px', borderRadius: '12px', border: '2px solid #fbbf24' }
const bigScore = { fontSize: '48px', fontWeight: 'bold', color: '#10172d', margin: '0' }
const scoreLabel = { fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }
const pillarLabel = { fontSize: '14px', fontWeight: 'bold', color: '#10172d', margin: '0 25px 2px' }
const pillarScore = { fontSize: '13px', color: '#6b7280', margin: '0 25px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
