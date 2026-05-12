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
      <Preview>{ro ? 'Ce spun cei care au aplicat sistemul' : 'What founders who applied the system say'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? 'Nu ești singur' : 'You\'re not alone'}</Heading>
          <Text style={text}>
            {ro
              ? `${name || 'Hei'}, peste 1.200 de antreprenori au făcut acest test. 73% au scor sub 50. Asta înseamnă: majoritatea sunt în zona galbenă/portocalie.`
              : `${name || 'Hey'}, over 1,200 founders took this test. 73% scored below 50. Meaning: most are in the yellow/orange zone.`}
          </Text>
          <Section style={quote}>
            <Text style={quoteText}>
              {ro
                ? '"Citisem zeci de cărți de productivitate. Asta e prima care m-a făcut să-mi schimb cu adevărat rutina. În 30 de zile dorm mai bine, decid mai rapid, am energie pentru copii seara."'
                : '"I had read dozens of productivity books. This is the first one that actually changed my routine. In 30 days I sleep better, decide faster, have energy for my kids at night."'}
            </Text>
            <Text style={quoteAuthor}>— Mihai R., CEO startup SaaS</Text>
          </Section>
          <Text style={text}>
            {ro
              ? 'Cartea costă 27 LEI. Tu ai pierdut deja mai mult din productivitate săptămâna asta.'
              : 'The book costs $9. You already lost more than that in productivity this week.'}
          </Text>
          <Button href={url} style={btn}>{ro ? '👉 Vreau cartea — 27 LEI' : '👉 Get the book — $9'}</Button>
          <Text style={footerText}>{ro ? '— Alin' : '— Alin'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? '73% of founders scored below 50' : '73% dintre antreprenori au scor sub 50',
  displayName: 'Burnout recovery 2 (48h)',
  previewData: { name: 'Alex', language: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const quote = { backgroundColor: '#f9fafb', borderLeft: '4px solid #fbbf24', padding: '16px 20px', margin: '16px 25px', borderRadius: '4px' }
const quoteText = { fontSize: '15px', color: '#374151', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 8px' }
const quoteAuthor = { fontSize: '13px', color: '#6b7280', margin: 0 }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '16px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
