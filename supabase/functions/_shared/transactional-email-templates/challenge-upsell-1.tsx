import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string; language?: 'ro' | 'en' }

const Email = ({ name, language = 'ro' }: Props) => {
  const ro = language === 'ro'
  const url = ro ? 'https://ceomindos.com/ebook-upsell' : 'https://ceomindos.com/ebook-upsell-en'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Cartea e doar începutul. Iată cum să o aplici.' : 'The book is just the start. Here\'s how to apply it.'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `${name || 'Hei'}, ai citit deja primele capitole?` : `${name || 'Hey'}, did you read the first chapters?`}</Heading>
          <Text style={text}>
            {ro
              ? 'Dacă da, știi deja: cunoașterea fără implementare = zero rezultate.'
              : 'If yes, you know: knowledge without implementation = zero results.'}
          </Text>
          <Text style={text}>
            {ro
              ? 'De aia am construit Challenge-ul de 7 zile: te ține de mână, zi cu zi, video + planning + acces la platformă.'
              : 'That\'s why I built the 7-day Challenge: it holds your hand, day by day, video + planning + full platform.'}
          </Text>
          <Section style={offer}>
            <Text style={offerLine}>✅ {ro ? '7 zile de implementare ghidată' : '7 days of guided implementation'}</Text>
            <Text style={offerLine}>✅ {ro ? '14 zile PRO gratuit (toate uneltele)' : '14 days PRO free (all tools)'}</Text>
            <Text style={offerLine}>✅ {ro ? 'Apoi 245 LEI/lună — anulezi când vrei' : 'Then $49/month — cancel anytime'}</Text>
          </Section>
          <Button href={url} style={btn}>{ro ? '👉 Activează Challenge-ul' : '👉 Activate the Challenge'}</Button>
          <Text style={footerText}>{ro ? '— Alin' : '— Alin'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? 'The book + 14 days PRO free → next step' : 'Cartea + 14 zile PRO gratuit → pasul următor',
  displayName: 'Challenge upsell 1 (24h)',
  previewData: { name: 'Alex', language: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const offer = { backgroundColor: '#f9fafb', border: '2px solid #fbbf24', padding: '16px 20px', margin: '16px 25px', borderRadius: '12px' }
const offerLine = { fontSize: '15px', color: '#10172d', fontWeight: '600', margin: '6px 0' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
