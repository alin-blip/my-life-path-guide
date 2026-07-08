import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  streakDays?: number
  achievementTitle?: string
  achievementIcon?: string
  reward?: string
  dashboardUrl?: string
}

const StreakMilestoneEmail = ({
  name,
  language = 'ro',
  streakDays = 7,
  achievementTitle,
  achievementIcon = '🔥',
  reward,
  dashboardUrl = 'https://ceomindos.com/achievements',
}: Props) => {
  const ro = language === 'ro'
  const title = achievementTitle || (ro ? `${streakDays} zile consecutive!` : `${streakDays} days in a row!`)
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? `${achievementIcon} ${streakDays} zile de disciplină — recompensă deblocată` : `${achievementIcon} ${streakDays} days of discipline — reward unlocked`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{achievementIcon} {title}</Heading>
          <Text style={text}>
            {ro
              ? `${name || 'Războinicule'}, ai executat rutina ${streakDays} zile la rând. Asta nu e noroc — e sistem. Creierul tău începe deja să opereze pe pilot automat de CEO.`
              : `${name || 'Warrior'}, you've executed the routine ${streakDays} days in a row. That's not luck — it's a system. Your brain is starting to run on CEO autopilot.`}
          </Text>
          {reward && (
            <Section style={box}>
              <Text style={boxTitle}>{ro ? '🎁 Recompensă deblocată:' : '🎁 Reward unlocked:'}</Text>
              <Text style={boxItem}>{reward}</Text>
            </Section>
          )}
          <Text style={text}>
            {ro
              ? 'Nu te opri acum. Următorul prag te așteaptă.'
              : "Don't stop now. The next milestone is waiting."}
          </Text>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 Vezi progresul' : '👉 See progress'}</Button>
          <Hr style={hr} />
          <Text style={footerText}>{ro ? '— Alin F. Radu, Fondator CEO Mind OS' : '— Alin F. Radu, Founder CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: StreakMilestoneEmail,
  subject: (d: any) => d?.language === 'en'
    ? `${d?.achievementIcon || '🔥'} ${d?.streakDays || 7} days — reward unlocked`
    : `${d?.achievementIcon || '🔥'} ${d?.streakDays || 7} zile — recompensă deblocată`,
  displayName: 'Streak milestone (3/7/14/30)',
  previewData: { name: 'Alex', language: 'ro', streakDays: 7, achievementIcon: '⚡', achievementTitle: 'O Săptămână de Disciplină', reward: '+2 sesiuni Mind Coach / lună' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBand = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const box = { backgroundColor: '#fef3c7', padding: '20px', margin: '16px 25px', borderRadius: '12px', border: '1px solid #fbbf24' }
const boxTitle = { fontSize: '15px', fontWeight: 'bold', color: '#10172d', margin: '0 0 8px' }
const boxItem = { fontSize: '14px', color: '#374151', margin: '4px 0', lineHeight: '1.5' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
