/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { T, type EmailLang } from './i18n.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  language?: EmailLang
}

export const SignupEmail = ({ siteUrl, confirmationUrl, language = 'ro' }: SignupEmailProps) => {
  const t = T.signup[language]
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
            <Text style={text}>{t.body}</Text>
            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Button style={button} href={confirmationUrl}>{t.cta}</Button>
            </Section>
            <Text style={text}>{t.orCopy}</Text>
            <Text style={linkBox}>{confirmationUrl}</Text>
            <Text style={footer}>{t.footer}</Text>
            <Text style={signoff}>{t.signoff}<br /><a href={siteUrl} style={link}>ceomindos.com</a></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0' }
const headerBand = { background: '#10172d', padding: '24px 28px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0, fontWeight: 700 }
const tagline = { color: '#f59e0b', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '6px 0 0' }
const content = { padding: '28px' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: '#f59e0b', color: '#10172d', fontSize: '15px', fontWeight: 700, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const linkBox = { fontSize: '12px', color: '#64748b', wordBreak: 'break-all' as const, background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', margin: '0 0 24px' }
const link = { color: '#f59e0b', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0' }
const signoff = { fontSize: '13px', color: '#64748b', margin: '20px 0 0' }
