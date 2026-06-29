/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Codul tău de verificare · CEO Mind OS</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBand}>
          <Heading style={brand}>CEO MIND OS</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Confirmă-ți identitatea</Heading>
          <Text style={text}>Folosește codul de mai jos pentru a continua:</Text>
          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={footer}>
            Codul expiră în câteva minute. Dacă nu ai cerut acest cod, ignoră acest email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0' }
const headerBand = { background: '#10172d', padding: '24px 28px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0, fontWeight: 700 }
const content = { padding: '28px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = {
  display: 'inline-block',
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 700 as const,
  color: '#10172d',
  letterSpacing: '8px',
  background: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '10px',
  padding: '16px 24px',
  margin: 0,
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0' }
