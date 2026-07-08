import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  language?: 'ro' | 'en'
  achievementTitle?: string
  achievementDescription?: string
  achievementIcon?: string
  reward?: string
  dashboardUrl?: string
}

const AchievementUnlockedEmail = ({
  name,
  language = 'ro',
  achievementTitle = '',
  achievementDescription = '',
  achievementIcon = '🏆',
  reward,
  dashboardUrl = 'https://ceomindos.com/achievements',
}: Props) => {
  const ro = language === 'ro'
  return (
    <Html lang={language}>
      <Head />
      <Preview>{ro ? `${achievementIcon} Ai deblocat: ${achievementTitle}` : `${achievementIcon} You unlocked: ${achievementTitle}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={brand}>CEO MIND OS</Heading>
          </Section>
          <Heading style={h1}>{achievementIcon} {ro ? 'Achievement deblocat' : 'Achievement unlocked'}</Heading>
          <Text style={text}>
            {ro
              ? `${name || 'Războinicule'}, tocmai ai deblocat un nou nivel:`
              : `${name || 'Warrior'}, you just unlocked a new level:`}
          </Text>
          <Section style={box}>
            <Text style={boxTitle}>{achievementIcon} {achievementTitle}</Text>
            <Text style={boxItem}>{achievementDescription}</Text>
            {reward && <Text style={{ ...boxItem, fontWeight: 'bold', color: '#10172d', marginTop: '8px' }}>{ro ? '🎁 Recompensă: ' : '🎁 Reward: '}{reward}</Text>}
          </Section>
          <Button href={dashboardUrl} style={btn}>{ro ? '👉 Vezi toate badge-urile' : '👉 See all badges'}</Button>
          <Hr style={hr} />
          <Text style={footerText}>{ro ? '— Alin F. Radu, Fondator CEO Mind OS' : '— Alin F. Radu, Founder CEO Mind OS'}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AchievementUnlockedEmail,
  subject: (d: any) => d?.language === 'en'
    ? `${d?.achievementIcon || '🏆'} Achievement unlocked: ${d?.achievementTitle || ''}`
    : `${d?.achievementIcon || '🏆'} Achievement deblocat: ${d?.achievementTitle || ''}`,
  displayName: 'Achievement unlocked (action-based)',
  previewData: { name: 'Alex', language: 'ro', achievementTitle: 'Primul Plan Strategic', achievementDescription: 'Ai creat primul tău Master Plan.', achievementIcon: '🗺️' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBand = { backgroundColor: '#10172d', padding: '24px', textAlign: 'center' as const }
const brand = { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', margin: '0', letterSpacing: '2px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#10172d', margin: '32px 25px 8px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 25px 16px' }
const box = { backgroundColor: '#fef3c7', padding: '20px', margin: '16px 25px', borderRadius: '12px', border: '1px solid #fbbf24' }
const boxTitle = { fontSize: '17px', fontWeight: 'bold', color: '#10172d', margin: '0 0 8px' }
const boxItem = { fontSize: '14px', color: '#374151', margin: '4px 0', lineHeight: '1.5' }
const btn = { backgroundColor: '#fbbf24', color: '#10172d', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'inline-block', margin: '8px 25px 24px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 25px' }
const footerText = { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', margin: '24px 25px' }
