import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AxisScores {
  cognitiva?: number
  afectiva?: number
  comportamentala?: number
  volitiva?: number
  profesionala?: number
  spirituala?: number
}

interface PlanItem {
  week: number
  focus: string
  action: string
}

interface Props {
  firstName?: string
  language?: 'ro' | 'en'
  overallScore?: number
  band?: string
  axisScores?: AxisScores
  diagnosis?: string
  strengths?: string[]
  risks?: string[]
  plan?: PlanItem[]
  firstStepToday?: string
}

const LABELS = {
  ro: {
    cognitiva: 'Cognitivă (gânduri, narațiuni)',
    afectiva: 'Afectivă (emoții, intimitate)',
    comportamentala: 'Comportamentală (ritualuri, prezență)',
    volitiva: 'Volitivă (decizii, angajament)',
    profesionala: 'Profesională (echilibrul muncă-familie)',
    spirituala: 'Spirituală (valori, sens comun)',
    headline: (n?: string) => `Raportul tău, ${n || 'antreprenor'}`,
    sub: 'Iată radiografia relației tale pe 6 axe + planul personalizat pentru următoarele 30 de zile.',
    overall: 'Scor general',
    axes: 'Scoruri pe cele 6 axe',
    diagnosis: 'Diagnoză',
    strengths: 'Puncte forte',
    risks: 'Atenție la',
    plan: 'Plan 30 de zile',
    today: 'Primul pas — astăzi',
    week: 'Săpt.',
    cta: 'Deschide Marriage Stack',
    ctaSub: 'Analizează screenshots WhatsApp, audio sau text și primește Triunghiul Realității (ce zice ea, ce zici tu, ce vede coach-ul).',
    footer: 'CEO Mind OS · Executive Marriage Audit',
  },
  en: {
    cognitiva: 'Cognitive (thoughts, narratives)',
    afectiva: 'Affective (emotions, intimacy)',
    comportamentala: 'Behavioral (rituals, presence)',
    volitiva: 'Volitional (decisions, commitment)',
    profesionala: 'Professional (work-family balance)',
    spirituala: 'Spiritual (values, shared meaning)',
    headline: (n?: string) => `Your report, ${n || 'founder'}`,
    sub: 'Here is the snapshot of your relationship across 6 axes + your personalized 30-day plan.',
    overall: 'Overall score',
    axes: 'Scores across the 6 axes',
    diagnosis: 'Diagnosis',
    strengths: 'Strengths',
    risks: 'Watch out for',
    plan: '30-day plan',
    today: 'First step — today',
    week: 'Week',
    cta: 'Open Marriage Stack',
    ctaSub: 'Analyzes WhatsApp screenshots, audio or text and gives you the Reality Triangle (what she says, what you say, what the coach sees).',
    footer: 'CEO Mind OS · Executive Marriage Audit',
  },
} as const

const scoreColor = (s: number) => (s >= 65 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444')

const MarriageQuizReport = ({
  firstName,
  language = 'ro',
  overallScore = 0,
  band = '',
  axisScores = {},
  diagnosis = '',
  strengths = [],
  risks = [],
  plan = [],
  firstStepToday = '',
}: Props) => {
  const t = LABELS[language]
  const axes: Array<keyof AxisScores> = [
    'cognitiva', 'afectiva', 'comportamentala', 'volitiva', 'profesionala', 'spirituala',
  ]
  const ctaUrl = 'https://www.ceomindos.com/marriage'

  return (
    <Html lang={language}>
      <Head />
      <Preview>
        {language === 'ro'
          ? `Scorul tău: ${overallScore}/100 · Plan 30 zile inclus`
          : `Your score: ${overallScore}/100 · 30-day plan included`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
            <Text style={tagline}>Executive Marriage Audit</Text>
          </Section>

          <Heading style={h1}>{t.headline(firstName)}</Heading>
          <Text style={text}>{t.sub}</Text>

          {/* Overall */}
          <Section style={scoreBox}>
            <Text style={scoreLabel}>{t.overall}</Text>
            <Text style={{ ...scoreValue, color: scoreColor(overallScore) }}>
              {overallScore}<span style={scoreOf}>/100</span>
            </Text>
            <Text style={bandLabel}>{band}</Text>
          </Section>

          {/* Axes */}
          <Heading style={h2}>{t.axes}</Heading>
          <Section style={tableWrap}>
            {axes.map((a) => {
              const v = axisScores[a] ?? 0
              return (
                <Section key={a} style={row}>
                  <Text style={rowLabel}>{(t as any)[a]}</Text>
                  <Text style={{ ...rowValue, color: scoreColor(v) }}>{v}/100</Text>
                </Section>
              )
            })}
          </Section>

          {/* Diagnosis */}
          {diagnosis ? (
            <>
              <Heading style={h2}>{t.diagnosis}</Heading>
              <Text style={text}>{diagnosis}</Text>
            </>
          ) : null}

          {/* Strengths & Risks */}
          {strengths.length > 0 ? (
            <>
              <Heading style={h3Good}>{t.strengths}</Heading>
              {strengths.map((s, i) => (
                <Text key={i} style={listGood}>• {s}</Text>
              ))}
            </>
          ) : null}

          {risks.length > 0 ? (
            <>
              <Heading style={h3Bad}>{t.risks}</Heading>
              {risks.map((s, i) => (
                <Text key={i} style={listBad}>• {s}</Text>
              ))}
            </>
          ) : null}

          {/* Plan */}
          {plan.length > 0 ? (
            <>
              <Heading style={h2}>{t.plan}</Heading>
              {plan.map((p, i) => (
                <Section key={i} style={planRow}>
                  <Text style={planWeek}>{t.week} {p.week}</Text>
                  <Text style={planFocus}>{p.focus}</Text>
                  <Text style={planAction}>{p.action}</Text>
                </Section>
              ))}
            </>
          ) : null}

          {firstStepToday ? (
            <Section style={todayBox}>
              <Text style={todayLabel}>{t.today}</Text>
              <Text style={todayText}>{firstStepToday}</Text>
            </Section>
          ) : null}

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaBox}>
            <Heading style={h2}>{t.cta}</Heading>
            <Text style={text}>{t.ctaSub}</Text>
            <Button href={ctaUrl} style={button}>{t.cta} →</Button>
          </Section>

          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: MarriageQuizReport,
  subject: (data: Record<string, any>) =>
    data.language === 'en'
      ? `Your Marriage Audit Report · ${data.overallScore ?? 0}/100`
      : `Raportul tău Marriage Audit · ${data.overallScore ?? 0}/100`,
  displayName: 'Marriage Quiz Report',
  previewData: {
    firstName: 'Alin',
    language: 'ro',
    overallScore: 62,
    band: 'atenție',
    axisScores: {
      cognitiva: 70, afectiva: 55, comportamentala: 60,
      volitiva: 75, profesionala: 45, spirituala: 65,
    },
    diagnosis: 'Relația ta are fundație solidă pe valori și angajament, dar presiunea business-ului tău erodează prezența zilnică și intimitatea emoțională.',
    strengths: ['Angajament clar pe termen lung', 'Valori comune solide', 'Asumare în conflict'],
    risks: ['Stresul de business descărcat acasă', 'Intimitate emoțională în scădere', 'Prea puține ritualuri doar pentru voi'],
    plan: [
      { week: 1, focus: 'Decompresie zilnică', action: 'Ritual de 10 min între birou și ușa casei' },
      { week: 2, focus: 'Prezență', action: '20 min/zi fără telefon, cu ea' },
      { week: 3, focus: 'Conversație business-familie', action: '1 conversație lunară de aliniat' },
      { week: 4, focus: 'Reconectare emoțională', action: 'Un weekend doar voi doi' },
    ],
    firstStepToday: 'Trimite-i un mesaj de 1 frază: ce apreciezi la ea săptămâna asta.',
  },
} satisfies TemplateEntry

// ===== Styles =====
const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { maxWidth: '640px', margin: '0 auto', padding: '0 0 24px' }
const headerBand = { background: '#10172d', padding: '24px 28px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const brand = { color: '#ffffff', fontSize: '20px', letterSpacing: '3px', margin: 0 }
const tagline = { color: '#f59e0b', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: '6px 0 0' }

const h1 = { color: '#0f172a', fontSize: '24px', margin: '24px 28px 8px' }
const h2 = { color: '#0f172a', fontSize: '18px', margin: '24px 28px 8px' }
const h3Good = { color: '#059669', fontSize: '14px', margin: '20px 28px 6px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const h3Bad = { color: '#dc2626', fontSize: '14px', margin: '20px 28px 6px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '1.6', margin: '0 28px 12px' }

const scoreBox = { background: '#10172d', borderRadius: '10px', padding: '24px', margin: '20px 28px', textAlign: 'center' as const }
const scoreLabel = { color: '#94a3b8', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, margin: 0 }
const scoreValue = { fontSize: '52px', fontWeight: 800, lineHeight: 1, margin: '8px 0 4px' }
const scoreOf = { fontSize: '18px', color: '#64748b', fontWeight: 400 }
const bandLabel = { color: '#cbd5e1', fontSize: '14px', textTransform: 'capitalize' as const, margin: 0 }

const tableWrap = { margin: '0 28px', background: '#f8fafc', borderRadius: '8px', padding: '6px 12px' }
const row = { display: 'block', padding: '8px 4px', borderBottom: '1px solid #e2e8f0' }
const rowLabel = { color: '#475569', fontSize: '13px', display: 'inline-block', margin: 0 }
const rowValue = { fontSize: '14px', fontWeight: 700, display: 'inline-block', float: 'right' as const, margin: 0 }

const listGood = { color: '#065f46', fontSize: '14px', margin: '0 28px 6px' }
const listBad = { color: '#991b1b', fontSize: '14px', margin: '0 28px 6px' }

const planRow = { background: '#f8fafc', borderLeft: '3px solid #f59e0b', borderRadius: '6px', padding: '12px 14px', margin: '0 28px 10px' }
const planWeek = { color: '#f59e0b', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: 0 }
const planFocus = { color: '#0f172a', fontSize: '15px', fontWeight: 600, margin: '4px 0 2px' }
const planAction = { color: '#475569', fontSize: '14px', margin: 0 }

const todayBox = { background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '14px 16px', borderRadius: '6px', margin: '20px 28px' }
const todayLabel = { color: '#b45309', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, margin: 0 }
const todayText = { color: '#0f172a', fontSize: '15px', margin: '4px 0 0' }

const hr = { borderColor: '#e2e8f0', margin: '28px 28px' }
const ctaBox = { textAlign: 'center' as const, padding: '0 28px' }
const button = { background: '#f59e0b', color: '#10172d', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'inline-block', marginTop: '8px' }
const footer = { color: '#94a3b8', fontSize: '12px', textAlign: 'center' as const, margin: '24px 0 0' }
