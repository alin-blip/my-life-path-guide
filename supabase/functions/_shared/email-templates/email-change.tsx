/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Confirmă schimbarea emailului · CEO Mind OS</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBand}>
          <Heading style={brand}>CEO MIND OS</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Confirmă schimbarea emailului</Heading>
          <Text style={text}>
            Ai cerut să schimbi adresa de email de la{' '}
            <Link href={`mailto:${oldEmail}`} style={mono}>{oldEmail}</Link>{' '}
            la{' '}
            <Link href={`mailto:${newEmail}`} style={mono}>{newEmail}</Link>.
          </Text>
          <Text style={text}>Apasă butonul de mai jos pentru a confirma:</Text>
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button style={button} href={confirmationUrl}>
              Confirmă schimbarea →
            </Button>
          </Section>
          <Text style={footer}>
            Dacă nu ai cerut tu această schimbare, securizează-ți contul imediat.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0' }
const headerBand = { background: '#10172d', padding: '24px 28px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0, fontWeight: 700 }
const content = { padding: '28px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const mono = { color: '#0f172a', fontWeight: 700 as const, textDecoration: 'underline' }
const button = { backgroundColor: '#f59e0b', color: '#10172d', fontSize: '15px', fontWeight: 700, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0' }
