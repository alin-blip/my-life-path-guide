/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

import { T, type EmailLang } from './i18n.ts'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
  language?: EmailLang
}

export const InviteEmail = ({ siteUrl, confirmationUrl, language = 'ro' }: InviteEmailProps) => {
  const t = T.invite[language]
  // Body has a <strong> tag inline → split around it
  const [pre, post] = t.body.split('<strong>CEO Mind OS</strong>')
  return (
    <Html lang={language} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
            <Text style={tagline}>The Founder Operating System</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>{t.heading}</Heading>
            <Text style={text}>
              {pre}
              <Link href={siteUrl} style={link}><strong>CEO Mind OS</strong></Link>
              {post}
            </Text>
            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Button style={button} href={confirmationUrl}>{t.cta}</Button>
            </Section>
            <Text style={footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0' }
const headerBand = { background: '#10172d', padding: '24px 28px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0, fontWeight: 700 }
const tagline = { color: '#f59e0b', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '6px 0 0' }
const content = { padding: '28px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: '#f59e0b', textDecoration: 'none' }
const button = { backgroundColor: '#f59e0b', color: '#10172d', fontSize: '15px', fontWeight: 700, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0' }
