import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  setPasswordUrl?: string
}

const Email = ({ name, language = 'ro', setPasswordUrl = '' }: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? 'Bun venit în Challenge! Setează-ți parola pentru a accesa platforma.' : 'Welcome to the Challenge! Set your password to access the platform.'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }}>
            <Heading style={{ color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px' }}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{ro ? `Bun venit, ${name || 'antreprenor'}! 🎉` : `Welcome, ${name || 'founder'}! 🎉`}</Heading>
          <Text style={text}>
            {ro
              ? 'Plata pentru Challenge-ul de 7 zile a fost confirmată. Pentru a accesa platforma, setează-ți parola apăsând butonul de mai jos.'
              : 'Your 7-Day Challenge payment is confirmed. To access the platform, set your password using the button below.'}
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '24px 25px' }}>
            <Button href={setPasswordUrl} style={btn}>{ro ? '🔐 Setează parola & Accesează' : '🔐 Set password & Access'}</Button>
          </Section>
          <Text style={small}>
            {ro
              ? 'Linkul este valabil 24 de ore. Dacă expiră, poți cere altul de pe pagina de autentificare.'
              : 'This link is valid for 24 hours. If it expires, you can request a new one from the login page.'}
          </Text>
          <Hr style={hr} />
          <Heading style={h2}>{ro ? 'Ce urmează?' : 'What\'s next?'}</Heading>
          <Text style={text}>
            {ro
              ? 'Vei primi 7 zile de video, planning ghidat și acces la întreaga platformă PRO. Începem azi.'
              : 'You get 7 days of video, guided planning, and full PRO platform access. We start today.'}
          </Text>
          <Text style={footerText}>{ro ? '— Alin F. Radu, CEO Mind OS' : '— Alin F. Radu, CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => d?.language === 'en' ? '🔐 Set your password & access the Challenge' : '🔐 Setează-ți parola & accesează Challenge-ul',
  displayName: 'Challenge welcome — set password',
  previewData: { name: 'Alex', language: 'ro', setPasswordUrl: 'https://ceomindos.com/reset-password?token=...' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 12px' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: '#10172d', margin: '20px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const small = { fontSize: '13px', color: '#6b7280', margin: '0 25px 16px', textAlign: 'center' as const }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
