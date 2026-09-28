import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

type Kind = 'verdict' | 'followup1' | 'followup3' | 'plan'

interface Props {
  kind?: Kind
  firstName?: string
  language?: 'ro' | 'en'
  headline?: string
  summary?: string
  reconnectPhrase?: string
  resultUrl?: string
}

const T = {
  ro: {
    verdict: { pre: 'Verdictul tău „Cine are dreptate?”', h: (n?: string) => `${n || 'Salut'}, verdictul tău e gata`, body: 'Am analizat conflictul vostru separând faptele de interpretări și nevoile emoționale ale fiecăruia.', cta: 'Vezi verdictul complet' },
    followup1: { pre: 'Verdictul e primul pas. Planul e al doilea.', h: (n?: string) => `${n || 'Salut'}, ce faci azi cu verdictul?`, body: 'Să știi cine are dreptate nu repară relația. Un plan de 7 zile de de-escaladare, construit pe conflictul vostru, face asta — pas cu pas, 10 minute pe zi.', cta: 'Deblochează planul de 7 zile — 5 €' },
    followup3: { pre: 'Același conflict revine? Iată de ce.', h: (n?: string) => `${n || 'Salut'}, conflictele nerezolvate se repetă`, body: 'Dacă nu schimbi tiparul, aceeași ceartă revine sub altă formă. Planul tău personalizat îți dă scriptul de reparare, întrebările potrivite și acțiunea exactă pentru fiecare zi.', cta: 'Vreau planul personalizat' },
    plan: { pre: 'Planul tău de 7 zile e deblocat', h: (n?: string) => `${n || 'Salut'}, planul tău e deblocat`, body: 'Protocolul tău de de-escaladare de 7 zile te așteaptă. Păstrează acest email — linkul de mai jos te duce oricând la plan.', cta: 'Deschide planul' },
    phrase: 'Frază de reconectare pentru azi',
    footer: 'CEO Mind OS · Cine are dreptate?',
  },
  en: {
    verdict: { pre: 'Your "Who is right?" verdict', h: (n?: string) => `${n || 'Hi'}, your verdict is ready`, body: 'We analyzed your conflict by separating facts from interpretations and each partner\'s emotional needs.', cta: 'See the full verdict' },
    followup1: { pre: 'The verdict is step one. The plan is step two.', h: (n?: string) => `${n || 'Hi'}, what will you do with the verdict today?`, body: 'Knowing who is right does not fix the relationship. A 7-day de-escalation plan built on your conflict does — step by step, 10 minutes a day.', cta: 'Unlock the 7-day plan — $5' },
    followup3: { pre: 'Same fight coming back? Here is why.', h: (n?: string) => `${n || 'Hi'}, unresolved conflicts repeat`, body: 'If the pattern does not change, the same fight returns in a new form. Your personalized plan gives you the repair script, the right questions and the exact action for each day.', cta: 'I want my personalized plan' },
    plan: { pre: 'Your 7-day plan is unlocked', h: (n?: string) => `${n || 'Hi'}, your plan is unlocked`, body: 'Your 7-day de-escalation protocol is waiting. Keep this email — the link below always takes you to your plan.', cta: 'Open my plan' },
    phrase: 'Reconnection phrase for today',
    footer: 'CEO Mind OS · Who is right?',
  },
} as const

const CoupleVerdict = ({ kind = 'verdict', firstName, language = 'ro', headline, summary, reconnectPhrase, resultUrl = 'https://www.ceomindos.com/cine-are-dreptate' }: Props) => {
  const t = T[language] ?? T.ro
  const k = t[kind]
  return (
    <Html lang={language}>
      <Head />
      <Preview>{k.pre}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={band}><Heading style={brand}>CEO MIND OS</Heading></Section>
          <Heading style={h1}>{k.h(firstName)}</Heading>
          <Text style={text}>{k.body}</Text>
          {kind === 'verdict' && headline ? <Text style={quote}>{headline}</Text> : null}
          {kind === 'verdict' && summary ? <Text style={text}>{summary}</Text> : null}
          {kind === 'verdict' && reconnectPhrase ? (
            <Section style={box}><Text style={boxLabel}>{t.phrase}</Text><Text style={boxText}>„{reconnectPhrase}”</Text></Section>
          ) : null}
          <Section style={{ textAlign: 'center', padding: '8px 28px' }}>
            <Button href={resultUrl} style={button}>{k.cta}</Button>
          </Section>
          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CoupleVerdict,
  subject: (d: Record<string, any>) => {
    const lang = d.language === 'en' ? 'en' : 'ro'
    const kind = (d.kind || 'verdict') as Kind
    const s = {
      ro: { verdict: 'Verdictul tău: cine are dreptate?', followup1: 'Verdictul e doar începutul', followup3: 'De ce revine aceeași ceartă', plan: 'Planul tău de 7 zile e deblocat' },
      en: { verdict: 'Your verdict: who is right?', followup1: 'The verdict is just the beginning', followup3: 'Why the same fight keeps coming back', plan: 'Your 7-day plan is unlocked' },
    }
    return s[lang][kind]
  },
  displayName: 'Couple verdict (lead magnet)',
  previewData: { kind: 'verdict', firstName: 'Ana', language: 'ro', headline: 'Amândoi aveți dreptate pe jumătate.', summary: 'Faptele arată o întârziere; nevoia ta e respect, a lui e autonomie.', reconnectPhrase: 'Îmi pasă mai mult de noi decât de cine a avut dreptate.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0 0 24px' }
const band = { background: '#10172d', padding: '22px 28px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0 }
const h1 = { color: '#0f172a', fontSize: '22px', margin: '24px 28px 8px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '1.6', margin: '0 28px 12px' }
const quote = { color: '#0f172a', fontSize: '17px', fontWeight: 700, margin: '8px 28px 12px', borderLeft: '4px solid #e11d48', paddingLeft: '12px' }
const box = { background: '#fff1f2', borderLeft: '4px solid #e11d48', padding: '14px 16px', borderRadius: '6px', margin: '16px 28px' }
const boxLabel = { color: '#be123c', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, margin: 0 }
const boxText = { color: '#0f172a', fontSize: '15px', margin: '4px 0 0' }
const button = { background: '#e11d48', color: '#ffffff', padding: '14px 26px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'inline-block', marginTop: '8px' }
const footer = { color: '#94a3b8', fontSize: '12px', textAlign: 'center' as const, margin: '24px 0 0' }
