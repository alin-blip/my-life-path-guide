import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { getCopy, CTA_LABEL, SIGN_OFF, type Lang } from '../burnout-story/copy.ts'

interface Props {
  name?: string
  language?: Lang
  dayNumber?: number
  trackingId?: string
}

const FN = 'https://exsbnfmaadjyfblperas.supabase.co/functions/v1'
const trackUrl = (u: string, t?: string) => (t ? `${FN}/track-email-click?t=${t}&u=${encodeURIComponent(u)}` : u)
const pixelUrl = (t?: string) => (t ? `${FN}/track-email-open?t=${t}` : '')

const CTA_BASE = 'https://www.ceomindos.com/challenge-7-zile'

// Tiny inline markdown parser: **bold**, *italic*
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Combined regex for ** and *
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  parts.forEach((part, i) => {
    if (!part) return
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={i} style={{ color: '#10172d', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>,
      )
    } else if (part.startsWith('*') && part.endsWith('*')) {
      nodes.push(
        <em key={i} style={{ fontStyle: 'italic', color: '#4b5563' }}>
          {part.slice(1, -1)}
        </em>,
      )
    } else {
      nodes.push(part)
    }
  })
  return nodes
}

function renderBody(body: string): React.ReactNode[] {
  const blocks = body.trim().split(/\n\n+/)
  return blocks.map((block, i) => {
    if (block.startsWith('PS:')) {
      const rest = block.slice(3).trim()
      return (
        <Text key={i} style={psText}>
          <strong>P.S.</strong> {renderInline(rest)}
        </Text>
      )
    }
    if (block.startsWith('H2:')) {
      return (
        <Heading key={i} as="h2" style={h2}>
          {block.slice(3).trim()}
        </Heading>
      )
    }
    return (
      <Text key={i} style={text}>
        {renderInline(block)}
      </Text>
    )
  })
}

const Email = ({ name, language = 'ro', dayNumber = 1, trackingId }: Props) => {
  const lang: Lang = language === 'en' ? 'en' : 'ro'
  const copy = getCopy(dayNumber, lang)
  const url = trackUrl(`${CTA_BASE}?utm_source=email&utm_medium=burnout-story&utm_campaign=day-${dayNumber}&utm_content=${lang}`, trackingId)
  const greeting = name ? (lang === 'ro' ? `${name},` : `${name},`) : null

  return (
    <Html lang={lang}>
      <Head />
      <Preview>{copy.preheader}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>

          <Section style={{ padding: '32px 25px 8px' }}>
            <Heading style={h1}>{copy.subject}</Heading>
            {greeting && <Text style={{ ...text, marginBottom: '8px', fontWeight: 600 }}>{greeting}</Text>}
          </Section>

          <Section style={{ padding: '0' }}>{renderBody(copy.body)}</Section>

          <Section style={{ textAlign: 'center' as const, padding: '16px 25px 8px' }}>
            <Button href={url} style={btn}>
              {CTA_LABEL[lang]}
            </Button>
          </Section>

          <Section style={{ padding: '16px 25px 32px' }}>
            <Text style={signOff}>{SIGN_OFF[lang]}</Text>
          </Section>

          {trackingId && <Img src={pixelUrl(trackingId)} width="1" height="1" alt="" style={{ display: 'none' }} />}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: any) => {
    const day = Math.max(1, Math.min(10, Number(d?.dayNumber) || 1))
    const lang: Lang = d?.language === 'en' ? 'en' : 'ro'
    return getCopy(day, lang).subject
  },
  displayName: 'Burnout story (10-day sequence)',
  previewData: { name: 'Alex', language: 'ro', dayNumber: 1 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '620px', margin: '0 auto' }
const header = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', margin: 0, letterSpacing: '2px', fontWeight: 700 as const }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#10172d', margin: '0 0 12px', lineHeight: '1.25' }
const h2 = { fontSize: '18px', fontWeight: 700 as const, color: '#10172d', margin: '20px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 25px 14px' }
const psText = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '20px 25px 8px', padding: '14px 16px', backgroundColor: '#f9fafb', borderLeft: '3px solid #fbbf24', fontStyle: 'italic' as const }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '16px 32px', borderRadius: '10px', fontWeight: 700 as const, fontSize: '16px', textDecoration: 'none', display: 'inline-block' }
const signOff = { fontSize: '14px', color: '#6b7280', margin: 0, whiteSpace: 'pre-line' as const }
